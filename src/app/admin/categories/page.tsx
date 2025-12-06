
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { categories as initialCategories, type Category } from '@/lib/data';

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Category name cannot be empty.',
      });
      return;
    }
    const newCategory: Category = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      name: newCategoryName,
    };
    setCategories((prev) => [...prev, newCategory]);
    setNewCategoryName('');
    setIsNewCategoryDialogOpen(false);
    toast({
      title: 'Success',
      description: `Category "${newCategory.name}" has been added.`,
    });
  };

  const handleEditCategory = () => {
    if (!editingCategory || editingCategory.name.trim() === '') {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Category name cannot be empty.',
      });
      return;
    }
    setCategories(prev => prev.map(c => c.id === editingCategory.id ? editingCategory : c));
    setEditingCategory(null);
    toast({
      title: 'Success',
      description: 'Category has been updated.',
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
     toast({
      title: 'Success',
      description: 'Category has been deleted.',
    });
  };

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0">
        <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
         <Dialog open={isNewCategoryDialogOpen} onOpenChange={setIsNewCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Enter the name for the new category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. Abayas"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddCategory}>Save Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>
              Manage your product categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.id}</TableCell>
                    <TableCell className="text-right">
                       <Dialog open={!!editingCategory && editingCategory.id === category.id} onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}>
                            <DialogTrigger asChild>
                               <Button variant="ghost" size="icon" onClick={() => setEditingCategory(category)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                            </DialogTrigger>
                             <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteCategory(category.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                            <DialogDescription>
                                Update the name for the category.
                            </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                Name
                                </Label>
                                <Input
                                id="edit-name"
                                value={editingCategory?.name || ''}
                                onChange={(e) =>
                                    setEditingCategory(
                                    (prev) => prev ? { ...prev, name: e.target.value } : null
                                    )
                                }
                                className="col-span-3"
                                />
                            </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                                <Button onClick={handleEditCategory}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                       </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
