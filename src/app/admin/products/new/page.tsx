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
import { Trash2, Loader2 } from 'lucide-react';
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

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required.'),
  highlights: z.string().min(1, 'Product highlights are required.'),
  description: z.string().min(1, 'Product description is required.'),
  sizeGuide: z.string().optional(),
  size: z.string().optional(),
  price: z.coerce.number().positive('Price must be a positive number.'),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative integer.'),
  category: z.string().min(1, 'Please select a category.'),
  productImage: z.any().optional(),
  galleryImages: z.any().optional(),
});

export default function AdminNewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.get<{ id: string, name: string }[]>('/categories');
        if (data) setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
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
    },
  });

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

      // 3. Save Product
      const productData = {
        ...values,
        image: mainImageUrl, // ImgBB URL
        images: galleryImageUrls, // ImgBB URLs
        price: Number(values.price),
        stock: Number(values.stock),
      };

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
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory</CardTitle>
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
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Category</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                                  onChange(Array.from(e.target.files));
                                }
                              }}
                              {...rest}
                              value={undefined}
                            />
                          </FormControl>
                          <FormMessage />
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
