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

type Category = {
  id: string; // The slug-like ID
  name: string;
  description?: string;
  image?: string;
  _id?: string; // Mongoose ID
};

// Helper for slug generation
const slugify = (text: string) => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.get<Category[]>('/categories');
      if (data) setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load categories.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleOpenForm = (category: Category | null = null) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingCategory(null);
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

  const handleSaveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File;

    if (!name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Category name is required.' });
      return;
    }

    try {
      let imageUrl = editingCategory?.image;
      if (imageFile && imageFile.size > 0) {
        toast({ title: 'Uploading...', description: 'Uploading category image...' });
        imageUrl = await uploadFile(imageFile);
      }

      if (editingCategory) {
        // Update
        const updated = await apiClient.put<Category>(`/categories/${editingCategory.id}`, { name, description, image: imageUrl });
        setCategories(categories.map(c => c.id === editingCategory.id ? updated : c));
        toast({ title: 'Success', description: 'Category updated successfully.' });
      } else {
        // Create
        const newCat = await apiClient.post<Category>('/categories', { name, description, image: imageUrl });
        setCategories([...categories, newCat]);
        toast({ title: 'Success', description: 'Category added successfully.' });
      }
      handleCloseForm();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Operation failed' });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await apiClient.delete(`/categories/${categoryId}`);
      setCategories(categories.filter(c => c.id !== categoryId));
      toast({ variant: 'destructive', title: 'Deleted', description: 'Category has been deleted.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete category.' });
    } finally {
      setCategoryToDelete(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Category Management</h1>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage your product categories.
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by category name..."
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
                    <TableHead>Slug (ID)</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No categories found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map(category => (
                      <TableRow key={category.id}>
                        <TableCell className="hidden sm:table-cell">
                          {category.image ? (
                            <Image
                              alt={category.name}
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={category.image}
                              width="64"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                              No Img
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.id}</TableCell>
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
                              <DropdownMenuItem onSelect={() => setTimeout(() => handleOpenForm(category), 100)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setCategoryToDelete(category)} className="text-red-600">
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

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveCategory}>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update the details of your category.' : 'Fill in the details for your new category.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" defaultValue={editingCategory?.name} className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image
                </Label>
                <div className="col-span-3">
                  {editingCategory?.image && (
                    <div className="mb-2">
                      <img src={editingCategory.image} alt="Current" className="h-16 w-16 object-cover rounded-md" />
                    </div>
                  )}
                  <Input id="image" name="image" type="file" accept="image/*" />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea id="description" name="description" defaultValue={editingCategory?.description} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit">Save Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              "{categoryToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete.id)}>
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
