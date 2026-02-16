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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Loader2, Plus, X, Settings2, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { useAuth } from '@/components/providers/auth-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required.'),
  highlights: z.string().min(1, 'Product highlights are required.'),
  description: z.string().min(1, 'Product description is required.'),
  sizeGuide: z.string().optional(),
  size: z.string().optional(), // Legal field, kept for simple products
  price: z.coerce.number().positive('Price must be a positive number.'),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative integer.'),
  category: z.string().min(1, 'Please select a category.'),
  brand: z.string().optional(),
  productImage: z.any().optional(),
  galleryImages: z.any().optional(),
});

// Types for Attributes and Variants
interface Attribute {
  id: string;
  name: string;
  options: string[];
  currentOption: string; // Helper for input
}

interface OptionSetting {
  image?: File | null;
  stock?: number;
}

interface Variant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  sku: string;
  image?: File | null;
  imageUrl?: string;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string, name: string }[]>([]);

  // Variants State
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [optionSettings, setOptionSettings] = useState<Record<string, OptionSetting>>({}); // Key: `${attrId}:${optionName}`

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brds] = await Promise.all([
          apiClient.get<{ id: string, name: string }[]>('/categories'),
          apiClient.get<{ id: string, name: string }[]>('/brands')
        ]);
        if (cats) setCategories(cats);
        if (brds) setBrands(brds);
      } catch (error) {
        console.error("Failed to fetch data");
      }
    };
    fetchData();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      highlights: '',
      description: '',
      sizeGuide: '',
      size: '',
      price: 0,
      stock: 0,
      category: '',
      brand: '',
      productImage: undefined,
      galleryImages: undefined,
    },
  });

  // Watch price and stock to update variants if needed (optional, or just init variants with these)
  const basePrice = form.watch('price');
  const baseStock = form.watch('stock');

  // Attribute Management
  const addAttribute = () => {
    setAttributes([...attributes, { id: crypto.randomUUID(), name: '', options: [], currentOption: '' }]);
  };

  const removeAttribute = (id: string) => {
    setAttributes(attributes.filter(attr => attr.id !== id));
  };

  const updateAttributeName = (id: string, name: string) => {
    setAttributes(attributes.map(attr => attr.id === id ? { ...attr, name } : attr));
  };

  const addOption = (id: string) => {
    setAttributes(attributes.map(attr => {
      if (attr.id === id && attr.currentOption.trim()) {
        if (attr.options.includes(attr.currentOption.trim())) return attr;
        return { ...attr, options: [...attr.options, attr.currentOption.trim()], currentOption: '' };
      }
      return attr;
    }));
  };

  const removeOption = (attrId: string, option: string) => {
    setAttributes(attributes.map(attr => {
      if (attr.id === attrId) {
        return { ...attr, options: attr.options.filter(o => o !== option) };
      }
      return attr;
    }));
    // Clean up settings
    const settingKey = `${attrId}:${option}`;
    const newSettings = { ...optionSettings };
    delete newSettings[settingKey];
    setOptionSettings(newSettings);
  };

  const updateOptionSetting = (attrId: string, option: string, field: keyof OptionSetting, value: any) => {
    const key = `${attrId}:${option}`;
    setOptionSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const updateOptionInput = (id: string, value: string) => {
    setAttributes(attributes.map(attr => attr.id === id ? { ...attr, currentOption: value } : attr));
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption(id);
    }
  };


  // Variant Generation
  const generateVariants = () => {
    if (attributes.length === 0 || attributes.some(a => a.options.length === 0)) {
      toast({ title: "Error", description: "Please add attributes and options first.", variant: "destructive" });
      return;
    }

    const cartesian = (...a: any[][]) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

    const optionsArrays = attributes.map(a => a.options);
    const combinations = cartesian(...optionsArrays); // returns array of arrays of options

    // Check if single attribute, implementation differs slightly for cartesian check
    const generated: Variant[] = [];

    if (attributes.length === 1) {
      attributes[0].options.forEach(opt => {
        // Single attribute case
        const key = `${attributes[0].id}:${opt}`;
        const settings = optionSettings[key];
        const defaultImage = settings?.image || null;
        const defaultStock = (settings?.stock !== undefined && settings.stock > 0) ? settings.stock : (Number(baseStock) || 0);

        generated.push({
          id: crypto.randomUUID(),
          name: opt,
          attributes: { [attributes[0].name]: opt },
          price: Number(basePrice) || 0,
          stock: defaultStock,
          sku: '',
          image: defaultImage // New file
        });
      });
    } else {
      combinations.forEach((combo: string[]) => {
        const variantParams: Record<string, string> = {};
        let name = "";
        attributes.forEach((attr, idx) => {
          variantParams[attr.name] = combo[idx];
          name += (name ? " - " : "") + combo[idx];
        });

        // Determine default values from Option Settings
        let defaultImage = null;
        let defaultStock = Number(baseStock) || 0;

        // Check settings for each attribute option in this combo
        attributes.forEach((attr, idx) => {
          const key = `${attr.id}:${combo[idx]}`;
          const settings = optionSettings[key];
          if (settings) {
            if (settings.image) defaultImage = settings.image;
            if (settings.stock !== undefined && settings.stock > 0) defaultStock = settings.stock;
          }
        });

        generated.push({
          id: crypto.randomUUID(),
          name: name,
          attributes: variantParams,
          price: Number(basePrice) || 0,
          stock: defaultStock,
          sku: '',
          image: defaultImage
        });
      });
    }

    setVariants(generated);
    setHasVariants(true);
  };

  // Variant Updates
  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };


  // File Upload Helper
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
    setIsLoading(true);
    try {
      // 1. Upload Main Image
      let mainImageUrl = '';
      if (values.productImage && values.productImage.length > 0) {
        mainImageUrl = await uploadFile(values.productImage[0]);
      } else {
        throw new Error("Main image is required.");
      }

      // 2. Upload Gallery Images
      const galleryImageUrls: string[] = [];
      if (values.galleryImages && values.galleryImages.length > 0) {
        for (const file of Array.from(values.galleryImages)) {
          const url = await uploadFile(file as File);
          if (url) galleryImageUrls.push(url);
        }
      }

      // 3. Upload Variant Images
      const uploadedVariants = await Promise.all(variants.map(async (v) => {
        let vImageUrl = '';
        if (v.image) {
          vImageUrl = await uploadFile(v.image);
        }
        return { ...v, image: vImageUrl };
      }));


      // 4. Save Product
      const productData: any = {
        ...values,
        image: mainImageUrl, // ImgBB URL
        images: galleryImageUrls, // ImgBB URLs
        price: Number(values.price),
        stock: Number(values.stock),
      };

      if (hasVariants && uploadedVariants.length > 0) {
        productData.attributes = attributes.map(a => ({ name: a.name, options: a.options }));
        productData.variants = uploadedVariants.map(v => ({
          name: v.name, // "Red - S"
          attributes: v.attributes, // { Color: "Red", Size: "S" }
          price: v.price,
          stock: v.stock,
          sku: v.sku,
          image: v.image
        }));
      }

      await apiClient.post('/products', productData);

      toast({
        title: 'Success!',
        description: 'Product created successfully.',
      });
      router.push('/admin/products');
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast({
        variant: "destructive",
        title: "Error Creating Product",
        description: error.message || "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Add New Product</h1>
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
                      Fill in the information for your new product.
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
                              <Input placeholder="New Product Name" {...field} />
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
                                placeholder="A great description for a new product."
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

                {/* Attributes & Variants Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Variants</CardTitle>
                    <CardDescription>
                      Define attributes like Size and Color to generate variants.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {attributes.map((attr, index) => (
                        <div key={attr.id} className="relative p-4 border rounded-md bg-muted/20">
                          <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => removeAttribute(attr.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <FormLabel>Attribute Name</FormLabel>
                              <Input
                                placeholder="e.g. Size, Color"
                                value={attr.name}
                                onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <FormLabel>Options</FormLabel>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {attr.options.map(opt => (
                                  <Badge key={opt} variant="secondary" className="px-2 py-1 gap-1 pr-1">
                                    {opt}
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0 hover:bg-transparent">
                                          <Settings2 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-80">
                                        <div className="grid gap-4">
                                          <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Option Settings</h4>
                                            <p className="text-sm text-muted-foreground">
                                              Set defaults for <strong>{opt}</strong> variants.
                                            </p>
                                          </div>
                                          <div className="grid gap-2">
                                            <div className="grid grid-cols-3 items-center gap-4">
                                              <Label htmlFor={`stock-${attr.id}-${opt}`}>Stock</Label>
                                              <Input
                                                id={`stock-${attr.id}-${opt}`}
                                                type="number"
                                                className="col-span-2 h-8"
                                                placeholder="Default Stock"
                                                value={optionSettings[`${attr.id}:${opt}`]?.stock || ''}
                                                onChange={(e) => updateOptionSetting(attr.id, opt, 'stock', e.target.value ? Number(e.target.value) : undefined)}
                                              />
                                            </div>
                                            <div className="grid grid-cols-3 items-start gap-4">
                                              <Label className="mt-2">Image</Label>
                                              <div className="col-span-2">
                                                {optionSettings[`${attr.id}:${opt}`]?.image && (
                                                  <div className="relative w-16 h-16 mb-2 rounded border overflow-hidden">
                                                    <img
                                                      src={URL.createObjectURL(optionSettings[`${attr.id}:${opt}`]?.image!)}
                                                      alt="Option Value"
                                                      className="w-full h-full object-cover"
                                                    />
                                                    <Button
                                                      type="button"
                                                      variant="destructive"
                                                      size="icon"
                                                      className="absolute top-0 right-0 h-4 w-4 rounded-none"
                                                      onClick={() => updateOptionSetting(attr.id, opt, 'image', null)}
                                                    >
                                                      <X className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                  <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="h-8 text-[10px] file:text-[10px]"
                                                    onChange={(e) => {
                                                      if (e.target.files?.[0]) {
                                                        updateOptionSetting(attr.id, opt, 'image', e.target.files[0]);
                                                      }
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    <span className="cursor-pointer ml-1 text-muted-foreground hover:text-foreground" onClick={() => removeOption(attr.id, opt)}><X className="w-3 h-3" /></span>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add option (e.g. 'Red', 'S')"
                                  value={attr.currentOption}
                                  onChange={(e) => updateOptionInput(attr.id, e.target.value)}
                                  onKeyDown={(e) => handleOptionKeyDown(e, attr.id)}
                                />
                                <Button type="button" variant="secondary" onClick={() => addOption(attr.id)}>Add</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button type="button" variant="outline" onClick={addAttribute} className="w-full border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Attribute
                      </Button>
                    </div>

                    {attributes.length > 0 && (
                      <div className="pt-4 border-t">
                        <Button type="button" onClick={generateVariants} disabled={attributes.length === 0}>
                          Generate Variants
                        </Button>
                      </div>
                    )}

                    {variants.length > 0 && (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[180px]">Variant</TableHead>
                              <TableHead className="w-[100px]">Price</TableHead>
                              <TableHead className="w-[100px]">Stock</TableHead>
                              <TableHead className="w-[120px]">SKU</TableHead>
                              <TableHead>Image</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {variants.map(variant => (
                              <TableRow key={variant.id}>
                                <TableCell className="font-medium">{variant.name}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={variant.price}
                                    onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                                    className="h-8 w-full"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                                    className="h-8 w-full"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={variant.sku}
                                    onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                    className="h-8 w-full"
                                    placeholder="SKU-123"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {variant.image && (
                                      <div className="relative w-8 h-8 rounded overflow-hidden border">
                                        <img src={URL.createObjectURL(variant.image)} alt={variant.name} className="object-cover w-full h-full" />
                                      </div>
                                    )}
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                          updateVariant(variant.id, 'image', e.target.files[0]);
                                        }
                                      }}
                                      className="h-8 text-xs file:text-xs file:h-full file:border-0 file:bg-secondary file:text-secondary-foreground"
                                    />
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                  </CardContent>
                </Card>


                <Card>
                  <CardHeader>
                    <CardTitle>Inventory (Global / Fallback)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
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
                      {!hasVariants && (
                        <FormField
                          control={form.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Size / Variant (Simple Product)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Free Size, or S, M, L" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
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
                      This is the main image for the product.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                                  const newFiles = Array.from(e.target.files);
                                  const currentFiles = value || [];
                                  onChange([...currentFiles, ...newFiles]);
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
                <Link href="/admin/products">Discard</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Product
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
