
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { categories, products } from '@/lib/data';
import Link from 'next/link';
import { useRouter, notFound, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
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

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required.'),
  highlights: z.string().optional(),
  description: z.string().min(1, 'Product description is required.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative integer.'),
  category: z.string().min(1, 'Please select a category.'),
  productImage: z.any().optional(),
  galleryImages: z.any().optional(),
});

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { id } = params;

  const product = products.find((p) => p.id === id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Use product data for defaultValues, or empty strings if not found
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      highlights: product?.description || '', // Assuming highlights are same as description for mock
      price: product?.price || 0,
      stock: product?.stock || 0,
      category: product?.category || '',
    },
  });
  
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        highlights: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
      });
    }
  }, [product, form]);

  if (!product) {
    notFound();
  }

  const galleryFiles = form.watch('galleryImages');

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would handle form submission to your backend here.
    console.log('Updated product values:', values);
    toast({
      title: 'Product Updated',
      description: 'The product has been successfully updated.',
    });
    router.push('/admin/products');
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
                    </div>
                  </CardContent>
                </Card>
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
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Product Gallery</CardTitle>
                    <CardDescription>
                      Add or replace images for the product. (Optional)
                    </CardDescription>
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
                                onChange={(e) => onChange(e.target.files)} 
                                {...rest}
                            />
                          </FormControl>
                          <FormMessage />
                          {galleryFiles && galleryFiles.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 pt-4">
                              {Array.from(galleryFiles).map((file, index) => (
                                <div key={index} className="relative aspect-square">
                                  <img
                                    src={URL.createObjectURL(file as Blob)}
                                    alt={`preview ${index}`}
                                    className="w-full h-full object-cover rounded-md"
                                  />
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
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
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
                     {product.image && !form.watch('productImage')?.[0] && (
                        <div className="relative aspect-square w-full mb-4">
                            <img src={product.image} alt={product.name} className="object-cover rounded-md w-full h-full" />
                        </div>
                     )}
                    <FormField
                      control={form.control}
                      name="productImage"
                      render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                           <FormControl>
                             <Input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => onChange(e.target.files)} 
                                {...rest}
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
                <Link href="/admin/products">Cancel</Link>
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
