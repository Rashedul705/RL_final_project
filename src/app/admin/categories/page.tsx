'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Loader2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Category = {
  id: string; // The slug-like ID
  name: string;
  description?: string;
  image?: string;
  order?: number;
  _id?: string; // Mongoose ID
};

type Brand = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  _id?: string;
};

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // generic form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | Brand | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Category | Brand | null>(null);

  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, brds] = await Promise.all([
        apiClient.get<Category[]>('/categories'),
        apiClient.get<Brand[]>('/brands')
      ]);
      if (cats) setCategories(cats);
      if (brds) setBrands(brds);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const items = activeTab === 'categories' ? categories : brands;
    if (!searchQuery) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, brands, searchQuery, activeTab]);

  const handleOpenForm = (item: Category | Brand | null = null) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const uploadFile = async (file: File) => {
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

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const orderStr = formData.get('order') as string;
    const order = orderStr ? parseInt(orderStr, 10) : 0;
    const imageFile = formData.get('image') as File;

    if (!name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Name is required.' });
      return;
    }

    try {
      let imageUrl = editingItem?.image;
      if (imageFile && imageFile.size > 0) {
        toast({ title: 'Uploading...', description: 'Uploading image...' });
        imageUrl = await uploadFile(imageFile);
      }

      const endpoint = activeTab === 'categories' ? '/categories' : '/brands';
      const payload: any = { name, description, image: imageUrl };

      if (activeTab === 'categories') {
        payload.order = order;
      }

      if (editingItem) {
        // Update
        const updated = await apiClient.put<Category | Brand>(`${endpoint}/${editingItem.id}`, payload);
        if (activeTab === 'categories') {
          setCategories(categories.map(c => c.id === editingItem.id ? updated as Category : c));
        } else {
          setBrands(brands.map(b => b.id === editingItem.id ? updated as Brand : b));
        }
        toast({ title: 'Success', description: `${activeTab === 'categories' ? 'Category' : 'Brand'} updated successfully.` });
      } else {
        // Create
        const newItem = await apiClient.post<Category | Brand>(endpoint, payload);
        if (activeTab === 'categories') {
          setCategories([...categories, newItem as Category]);
        } else {
          setBrands([...brands, newItem as Brand]);
        }
        toast({ title: 'Success', description: `${activeTab === 'categories' ? 'Category' : 'Brand'} added successfully.` });
      }
      handleCloseForm();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Operation failed' });
    }
  };

  const handleDelete = async (itemId: string) => {
    setIsDeleting(true);
    try {
      const endpoint = activeTab === 'categories' ? '/categories' : '/brands';
      await apiClient.delete(`${endpoint}/${itemId}`);

      if (activeTab === 'categories') {
        setCategories(prev => prev.filter(c => c.id !== itemId));
      } else {
        setBrands(prev => prev.filter(b => b.id !== itemId));
      }

      toast({ variant: 'destructive', title: 'Deleted', description: 'Item has been deleted.' });
      setItemToDelete(null); // Close dialog on success
    } catch (error: any) {
      console.error("Delete failed", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete item.' });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Category & Brand Management</h1>
        <Button id="add-item-btn" onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New {activeTab === 'categories' ? 'Category' : 'Brand'}
        </Button>
      </div>

      <Tabs defaultValue="categories" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{activeTab === 'categories' ? 'Categories' : 'Brands'}</CardTitle>
            <CardDescription>
              Manage your product {activeTab}.
            </CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={`Search by ${activeTab === 'categories' ? 'category' : 'brand'} name...`}
                className="pl-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Image</span>
                      </TableHead>
                      <TableHead>Name</TableHead>
                      {activeTab === 'categories' && <TableHead>Order</TableHead>}
                      <TableHead>Slug (ID)</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No {activeTab} found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="hidden sm:table-cell">
                            {item.image ? (
                              <Image
                                alt={item.name}
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={item.image}
                                width="64"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                                No Img
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          {activeTab === 'categories' && (
                            <TableCell>{(item as Category).order ?? 0}</TableCell>
                          )}
                          <TableCell>
                            <a
                              href={`/${activeTab === 'categories' ? 'category' : 'brand'}/${item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {item.id}
                              <Search className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => setTimeout(() => handleOpenForm(item), 100)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setItemToDelete(item)} className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingItem ? `Edit ${activeTab === 'categories' ? 'Category' : 'Brand'}` : `Add New ${activeTab === 'categories' ? 'Category' : 'Brand'}`}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the details.' : 'Fill in the details for your new item.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" defaultValue={editingItem?.name} className="col-span-3" required />
              </div>

              {activeTab === 'categories' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="order" className="text-right">
                    Order
                  </Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    defaultValue={(editingItem as Category)?.order ?? 0}
                    className="col-span-3"
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image
                </Label>
                <div className="col-span-3">
                  {editingItem?.image && (
                    <div className="mb-2">
                      <img src={editingItem.image} alt="Current" className="h-16 w-16 object-cover rounded-md" />
                    </div>
                  )}
                  <Input id="image" name="image" type="file" accept="image/*" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea id="description" name="description" defaultValue={editingItem?.description} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {activeTab === 'categories' ? 'category' : 'brand'}
              "{itemToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => itemToDelete && handleDelete(itemToDelete.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Yes, delete'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
