'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useRouter, notFound, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Loader2, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { apiClient } from '@/lib/api-client';
import type { IProduct } from '@/lib/models';

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required.'),
  highlights: z.string().optional(),
  description: z.string().min(1, 'Product description is required.'),
  price: z.coerce.number().nonnegative('Price must be a non-negative number.'),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative integer.'),
  category: z.string().min(1, 'Please select a category.'),
  brand: z.string().optional(),
  productImage: z.any().optional(),
  galleryImages: z.any().optional(),


  size: z.string().optional(),
  sizeGuide: z.string().optional(),
  type: z.enum(['simple', 'variable']).default('simple'),
  variants: z.array(z.object({
    color: z.string().min(1, "Color is required"),
    variantImage: z.any().optional(), // Can be string (URL) or File[]
    variantGallery: z.any().optional(), // Can be string[] (URLs) or File[]
    sizes: z.array(z.object({
      size: z.string().min(1, "Size is required"),
      stock: z.coerce.number().min(0),
      price: z.coerce.number().min(0),
    })).min(1, "At least one size is required"),
  })).optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'simple') {
    if (data.price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price must be a positive number.",
        path: ["price"]
      });
    }
  }
});

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string, name: string }[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      highlights: '',
      price: 0,
      stock: 0,
      category: '',
      brand: '',
      size: '',
      sizeGuide: '',
      type: 'simple',
      variants: [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch categories and brands first or parallel
        const [cats, brds] = await Promise.all([
          apiClient.get<{ id: string, name: string }[]>('/categories'),
          apiClient.get<{ id: string, name: string }[]>('/brands')
        ]);
        if (cats) setCategories(cats);
        if (brds) setBrands(brds);

        // Fetch product
        if (id) {
          const data = await apiClient.get<IProduct>(`/products/${id}`);
          setProduct(data);
          form.reset({
            name: data.name,
            description: data.description,
            highlights: data.highlights || '',
            price: data.price,
            stock: data.stock,
            category: data.category,
            brand: data.brand || '',
            size: data.size || '',
            sizeGuide: data.sizeGuide || '',
            type: (data.variants && data.variants.length > 0) ? 'variable' : 'simple',
            variants: data.variants ? data.variants.map(v => ({
              color: v.color,
              variantImage: v.image, // URL
              variantGallery: v.images, // URLs
              sizes: v.sizes
            })) : [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Product not found or failed to load.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, form, toast]);

  async function uploadFile(file: File) {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Upload failed');
    return result.data.url;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    try {
      let mainImageUrl = product?.image;
      if (deletedImages.includes(product?.image || '')) {
        mainImageUrl = '';
      }
      if (values.productImage && values.productImage.length > 0) {
        mainImageUrl = await uploadFile(values.productImage[0]);
      }

      let galleryImageUrls = product?.images || [];
      // Filter out deleted existing images
      galleryImageUrls = galleryImageUrls.filter(url => !deletedImages.includes(url));

      if (values.galleryImages && values.galleryImages.length > 0) {
        for (const file of Array.from(values.galleryImages)) {
          const url = await uploadFile(file as File);
          if (url) galleryImageUrls.push(url);
        }
      }

      // Construct Payload
      const payload = {
        ...values,
        image: mainImageUrl,
        images: galleryImageUrls,
      };

      // Handle Variants
      let processedVariants: any[] = [];
      if (values.type === 'variable' && values.variants) {
        for (const variant of values.variants) {
          // 1. Handle Main Image
          let variantImageUrl = '';
          if (Array.isArray(variant.variantImage) && variant.variantImage.length > 0 && variant.variantImage[0] instanceof File) {
            variantImageUrl = await uploadFile(variant.variantImage[0]);
          } else if (typeof variant.variantImage === 'string') {
            variantImageUrl = variant.variantImage;
          }

          // 2. Handle Gallery
          let variantGalleryUrls: string[] = [];
          // Check if it's existing URLs (array of strings) or new Files (array or list)
          // If user added new files to existing?
          // The form control for multiple files usually replaces or appends.
          // My current UI implementation for new/page replaced.
          // Here we need to handle mixed? Or just simple replace for now.
          // Let's assume if it is array of strings, it is existing.
          // If array of Files, it is new.
          // Ideally we should allow appending. behavior depends on the input onChange.
          // For simplicity in this edit:
          if (Array.isArray(variant.variantGallery)) {
            for (const item of variant.variantGallery) {
              if (item instanceof File) {
                const url = await uploadFile(item);
                if (url) variantGalleryUrls.push(url);
              } else if (typeof item === 'string') {
                variantGalleryUrls.push(item);
              }
            }
          }

          processedVariants.push({
            color: variant.color,
            image: variantImageUrl,
            images: variantGalleryUrls,
            sizes: variant.sizes,
          });
        }
        // Update payload
        payload.variants = processedVariants;
      } else {
        payload.variants = [];
      }

      await apiClient.put(`/products/${id}`, payload);

      toast({
        title: 'Product Updated',
        description: 'The product has been successfully updated.',
      });
      router.push('/admin/products');
    } catch (error) {
      console.error("Update failed", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Edit Product</h1>
      </div>
      <div className="mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>
                      Update the information for your product.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Product Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="highlights"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Highlights</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter key features, one per line..."
                                className="min-h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="A great description for the product."
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sizeGuide"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size Guide (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter size guide details..."
                                className="min-h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>


                {/* Product Type Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="simple">Simple Product</SelectItem>
                              <SelectItem value="variable">Variable Product (Colors/Sizes)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Variants Section - Only if Variable */}
                {form.watch('type') === 'variable' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Variants</h2>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendVariant({
                          color: '',
                          sizes: [{ size: '', stock: 0, price: 0 }]
                        })}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Variant (Color)
                      </Button>
                    </div>

                    {variantFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Variant {index + 1}</CardTitle>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Color Name */}
                          <FormField
                            control={form.control}
                            name={`variants.${index}.color`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Color Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Red, Forest Green" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Variant Image (Swatch) */}
                          <FormField
                            control={form.control}
                            name={`variants.${index}.variantImage`}
                            render={({ field: { onChange, value, ...rest } }) => (
                              <FormItem>
                                <FormLabel>Variant Image (Swatch)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files) onChange(Array.from(e.target.files));
                                    }}
                                    {...rest}
                                    value={undefined}
                                  />
                                </FormControl>
                                <FormMessage />
                                {value && (
                                  <div className="mt-2">
                                    {typeof value === 'string' ? (
                                      <img src={value} alt="Preview" className="h-16 w-16 object-cover rounded" />
                                    ) : value instanceof FileList || Array.isArray(value) ? (
                                      <p className="text-xs text-muted-foreground">{value.length} file selected</p>
                                    ) : null}
                                  </div>
                                )}
                              </FormItem>
                            )}
                          />

                          {/* Variant Gallery */}
                          <FormField
                            control={form.control}
                            name={`variants.${index}.variantGallery`}
                            render={({ field: { onChange, value, ...rest } }) => (
                              <FormItem>
                                <FormLabel>Variant Gallery (Optional)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files) {
                                        const newFiles = Array.from(e.target.files);
                                        const currentFiles = value || [];
                                        // Basic append logic for now, or replace
                                        // Checking if currentFiles is array
                                        const files = Array.isArray(currentFiles) ? [...currentFiles, ...newFiles] : newFiles;
                                        onChange(files);
                                      }
                                    }}
                                    {...rest}
                                    value={undefined}
                                  />
                                </FormControl>
                                <FormMessage />
                                {value && Array.isArray(value) && (
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {value.map((item: any, i: number) => (
                                      typeof item === 'string' ? (
                                        <img key={i} src={item} alt={`Gallery ${i}`} className="h-16 w-16 object-cover rounded" />
                                      ) : (
                                        <div key={i} className="h-16 w-16 bg-gray-100 flex items-center justify-center text-xs">New</div>
                                      )
                                    ))}
                                  </div>
                                )}
                              </FormItem>
                            )}
                          />

                          {/* Sizes for this Variant */}
                          <div className="border rounded-md p-3 bg-muted/20">
                            <FormLabel className="mb-2 block">Sizes & Stock</FormLabel>
                            <SizesField
                              control={form.control}
                              nestIndex={index}
                            />
                          </div>

                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}


                {form.watch('type') === 'simple' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Inventory</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (BDT)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="mt-6">
                        <FormField
                          control={form.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Size / Variant</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Free Size, or S, M, L" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Category & Brand</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.length > 0 ? (
                                categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>No categories found</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands.length > 0 ? (
                                brands.map((brand) => (
                                  <SelectItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>No brands found</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Product Image</CardTitle>
                    <CardDescription>
                      Update the main image for the product.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {product.image && !form.watch('productImage')?.[0] && !deletedImages.includes(product.image) && (
                      <div className="relative aspect-square w-full mb-4 group">
                        <img src={product.image} alt={product.name} className="object-cover rounded-md w-full h-full bg-gray-100" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setDeletedImages(prev => [...prev, product.image as string])}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name="productImage"
                      render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Main Image</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files) {
                                  onChange(Array.from(e.target.files));
                                }
                              }}
                              {...rest}
                              value={undefined}
                            />
                          </FormControl>
                          <FormMessage />
                          {value && value.length > 0 && (
                            <div className="relative aspect-square w-full mt-4 group">
                              <img
                                src={URL.createObjectURL(value[0])}
                                alt="Main preview"
                                className="w-full h-full object-cover rounded-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onChange([])}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Product Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {product.images && product.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {product.images.filter(img => !deletedImages.includes(img)).map((img, i) => (
                          <div key={i} className="relative aspect-square group">
                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full aspect-square object-cover rounded-md bg-gray-100" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setDeletedImages(prev => [...prev, img])}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name="galleryImages"
                      render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files) {
                                  onChange(Array.from(e.target.files));
                                }
                              }}
                              {...rest}
                              value={undefined}
                            />
                          </FormControl>
                          <FormMessage />
                          {value && value.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-4">
                              {Array.from(value as File[]).map((file, index) => (
                                <div key={index} className="relative aspect-square group">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Gallery preview ${index}`}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      const newFiles = [...value];
                                      newFiles.splice(index, 1);
                                      onChange(newFiles);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-8">
              <Button variant="outline" asChild>
                <Link href="/admin/products">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form >
        </Form >
      </div >
    </>
  );
}

function SizesField({ control, nestIndex }: { control: any, nestIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${nestIndex}.sizes`,
  });

  return (
    <div className="space-y-2">
      {fields.map((item, k) => (
        <div key={item.id} className="flex items-end gap-2">
          <FormField
            control={control}
            name={`variants.${nestIndex}.sizes.${k}.size`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className={k === 0 ? "" : "sr-only"}>Size</FormLabel>
                <FormControl>
                  <Input placeholder="Size" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${nestIndex}.sizes.${k}.stock`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className={k === 0 ? "" : "sr-only"}>Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Stock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${nestIndex}.sizes.${k}.price`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className={k === 0 ? "" : "sr-only"}>Price (Opt)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(k)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ size: '', stock: 0, price: 0 })}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Size
      </Button>
    </div>
  );
}


