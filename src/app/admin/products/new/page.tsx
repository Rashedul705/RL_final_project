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
import { Trash2, Loader2, Plus, X } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required.'),
  highlights: z.string().min(1, 'Product highlights are required.'),
  description: z.string().min(1, 'Product description is required.'),
  price: z.coerce.number().min(0, 'Price must be a non-negative number.'),
  discountPrice: z.coerce.number().min(0, 'Discount price must be a non-negative number.'),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer.'),
  category: z.string().min(1, 'Please select a category.'),
  brand: z.string().optional(),
  productImage: z.any().optional(),
  galleryImages: z.any().optional(),
});

interface SizeVariant {
  id: string; // purely for local key mapping
  name: string;
  price: number;
  discountPrice: number;
  stock: number;
}

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size', '40', '42', '44'];

export default function AdminNewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string, name: string }[]>([]);

  const [productType, setProductType] = useState<'simple' | 'variant'>('simple');
  const [sizes, setSizes] = useState<SizeVariant[]>([]);

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
      price: 0,
      discountPrice: 0,
      stock: 0,
      category: '',
      brand: '',
      productImage: undefined,
      galleryImages: undefined,
    },
  });

  const addSizeRow = () => {
    setSizes([...sizes, { id: crypto.randomUUID(), name: '', price: 0, discountPrice: 0, stock: 0 }]);
  };

  const removeSizeRow = (id: string) => {
    setSizes(sizes.filter(s => s.id !== id));
  };

  const updateSizeRow = (id: string, field: keyof SizeVariant, value: any) => {
    setSizes(sizes.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

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
    // Validation for variant product
    if (productType === 'variant') {
      if (sizes.length === 0) {
        toast({ title: "Error", description: "Please add at least one size variant.", variant: "destructive" });
        return;
      }
      for (const size of sizes) {
        if (!size.name) {
          toast({ title: "Error", description: "Please select a size for all rows.", variant: "destructive" });
          return;
        }
      }
    }

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

      // 3. Build product payload
      let productData: any = {
        name: values.name,
        highlights: values.highlights,
        description: values.description,
        category: values.category,
        brand: values.brand,
        image: mainImageUrl,
        images: galleryImageUrls,
        productType: productType
      };

      if (productType === 'simple') {
        productData.price = Number(values.price);
        productData.discountPrice = Number(values.discountPrice);
        productData.stock = Number(values.stock);
      } else {
        // Calculate fallback global minimum price and total stock
        const totalStock = sizes.reduce((acc, curr) => acc + Number(curr.stock), 0);
        const minPrice = Math.min(...sizes.map(s => Number(s.price)));
        productData.price = sizes.length > 0 ? minPrice : Number(values.price);
        productData.stock = totalStock;
        productData.sizes = sizes.map(s => ({
          name: s.name,
          price: Number(s.price),
          discountPrice: Number(s.discountPrice),
          stock: Number(s.stock)
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
           <p className="text-muted-foreground mt-1">Create a new product by filling out the form below.</p>
        </div>
        <div className="flex items-center gap-4 bg-muted p-1 rounded-md">
          <Button
            type="button"
            variant={productType === 'simple' ? 'default' : 'ghost'}
            className={cn("px-8", productType === 'simple' && "shadow-sm")}
            onClick={() => setProductType('simple')}
          >
            Simple Product
          </Button>
          <Button
            type="button"
            variant={productType === 'variant' ? 'default' : 'ghost'}
            className={cn("px-8", productType === 'variant' && "shadow-sm")}
            onClick={() => setProductType('variant')}
          >
            Size Variant Product
          </Button>
        </div>
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
                      Fill in the basic information for your new product.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name" {...field} />
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
                    </div>
                  </CardContent>
                </Card>

                {productType === 'simple' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing & Inventory</CardTitle>
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
                                  <Input type="number" step="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="discountPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Discount Price (BDT)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Size Variants</CardTitle>
                      <CardDescription>
                        Define available sizes, their individual prices, and stock quantities.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-[150px]">Size</TableHead>
                              <TableHead>Price (BDT)</TableHead>
                              <TableHead>Discount (BDT)</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sizes.map((size) => (
                              <TableRow key={size.id}>
                                <TableCell>
                                  <Input
                                    type="text"
                                    value={size.name}
                                    onChange={(e) => updateSizeRow(size.id, 'name', e.target.value)}
                                    className="h-9 w-full"
                                    placeholder="e.g. XL, 42"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={size.price}
                                    onChange={(e) => updateSizeRow(size.id, 'price', e.target.value)}
                                    className="h-9 w-full"
                                    placeholder="0"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={size.discountPrice}
                                    onChange={(e) => updateSizeRow(size.id, 'discountPrice', e.target.value)}
                                    className="h-9 w-full"
                                    placeholder="0"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={size.stock}
                                    onChange={(e) => updateSizeRow(size.id, 'stock', e.target.value)}
                                    className={cn("h-9 w-full", (size.stock === 0 || String(size.stock) === '0') ? "border-red-500 focus-visible:ring-red-500" : "")}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeSizeRow(size.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {sizes.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                  No sizes added. Click "+ Add Size" below.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <Button type="button" variant="outline" onClick={addSizeRow} className="w-full border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Size
                      </Button>
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
              <Button variant="outline" type="button" asChild>
                <Link href="/admin/products">Discard</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="px-8">
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
