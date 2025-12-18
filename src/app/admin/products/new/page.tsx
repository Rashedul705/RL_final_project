
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
import { categories } from '@/lib/data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Loader2 } from 'lucide-react';
import { db, storage, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthState } from 'react-firebase-hooks/auth';
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
  highlights: z.string().min(1, 'Product highlights are required.'),
  description: z.string().min(1, 'Product description is required.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative integer.'),
  category: z.string().min(1, 'Please select a category.'),
  productImage: z.any().optional(),
  galleryImages: z.any()
    .refine((files) => {
      if (!files) return true;
      return Array.from(files).every((file: any) => file?.size <= 5000000);
    }, `Max file size is 5MB.`)
    .refine((files) => {
      if (!files) return true;
      return Array.from(files).every((file: any) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file?.type));
    }, ".jpg, .jpeg, .png and .webp files are accepted.")
    .optional(),
});

export default function AdminNewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      highlights: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
    },
  });

  const galleryFiles = form.watch('galleryImages');

  // Ensure auth import at the top if not already there, but here we assume it's imported or available via context.
  // Actually, I need to check imports. `auth` is imported from '@/lib/firebase' in the file already.

  const [user, authLoading] = useAuthState(auth);

  async function uploadImage(file: File, path: string) {
    if (!user) throw new Error("User not authenticated. Please log in.");

    console.log(`[Upload] Starting resumable upload for ${file.name} to ${path}`);
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise<string>((resolve, reject) => {
      // Timeout after 300 seconds (5 minutes)
      const timeoutId = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error("Upload timed out after 300 seconds. Internet may be too slow."));
      }, 300000);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`[Upload] ${file.name}: ${progress.toFixed(2)}% done`);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error(`[Upload] Error uploading ${file.name}:`, error);
          reject(error);
        },
        () => {
          clearTimeout(timeoutId);
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log(`[Upload] Finished: ${downloadURL}`);
            resolve(downloadURL);
          }).catch(reject);
        }
      );
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Starting product submission flow", values);

    if (authLoading) {
      toast({ title: "Please wait", description: "Checking authentication status...", variant: "default" });
      return;
    }

    if (!user) {
      toast({ title: "Authentication Error", description: "You seem to be logged out. Please refresh and log in.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Upload Main Image
      if (!values.productImage || values.productImage.length === 0) {
        throw new Error("Main image is missing in form data.");
      }

      toast({ title: "Uploading...", description: "Uploading main product image." });
      console.log("Uploading main image...");

      const mainImageFile = values.productImage[0];
      const mainImagePath = `products/${Date.now()}-${mainImageFile.name}`;
      const mainImageUrl = await uploadImage(mainImageFile, mainImagePath);
      console.log("Main image uploaded:", mainImageUrl);

      // 2. Upload Gallery Images
      const galleryImageUrls = [];
      if (values.galleryImages && values.galleryImages.length > 0) {
        toast({ title: "Uploading...", description: `Uploading ${values.galleryImages.length} gallery images.` });
        console.log("Uploading gallery images...");

        const files = Array.isArray(values.galleryImages) ? values.galleryImages : Array.from(values.galleryImages);
        for (const file of files as File[]) {
          const galleryPath = `products/gallery/${Date.now()}-${file.name}`;
          const url = await uploadImage(file, galleryPath);
          galleryImageUrls.push(url);
        }
        console.log("Gallery images uploaded:", galleryImageUrls);
      }

      // 3. Save Product Data to Firestore
      toast({ title: "Saving...", description: "Saving product details to database." });
      console.log("Saving to Firestore...");

      const productData = {
        name: values.name,
        highlights: values.highlights,
        description: values.description,
        price: Number(values.price),
        stock: Number(values.stock),
        category: values.category,
        image: mainImageUrl,
        gallery: galleryImageUrls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.email, // Track who created it
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log("Product saved with ID:", docRef.id);

      toast({
        title: 'Success!',
        description: 'Product created successfully.',
      });
      router.push('/admin/products');
    } catch (error: any) {
      console.error("FATAL ERROR in onSubmit:", error);
      toast({
        variant: "destructive",
        title: "Error Creating Product",
        description: error.message || "Unknown error occurred. Check console.",
      });
    } finally {
      setIsLoading(false);
      console.log("Submission process finished.");
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
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onChange([])}
                              >
                                <Trash2 className="h-3 w-3" />
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
                    <CardDescription>
                      Add additional images for the product. (Optional)
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
                          {value && Array.from(value).length > 0 && (
                            <div className="grid grid-cols-3 gap-2 pt-4">
                              {Array.from(value).map((file: any, index: number) => (
                                <div key={index} className="relative aspect-square group">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`preview ${index}`}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      const newFiles = Array.from(value).filter((_, i) => i !== index);
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

