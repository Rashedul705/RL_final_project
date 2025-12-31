'use client';

import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

type ShippingMethod = {
  _id: string;
  name: string;
  cost: number;
  estimatedTime: string;
  status: 'active' | 'inactive';
};

export default function AdminShippingPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<ShippingMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const data = await apiClient.get<ShippingMethod[]>('/shipping');
      if (data) setMethods(data);
    } catch (error) {
      console.error("Failed to fetch shipping methods", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load shipping methods.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (method: ShippingMethod | null = null) => {
    setEditingMethod(method);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingMethod(null);
    setIsFormOpen(false);
  };

  const handleSaveMethod = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const cost = parseFloat(formData.get('cost') as string);
    const estimatedTime = formData.get('estimatedTime') as string;
    const isActive = formData.get('isActive') === 'on';
    const status = isActive ? 'active' : 'inactive';

    if (!name || isNaN(cost)) {
      toast({ variant: 'destructive', title: 'Error', description: 'Method name and a valid cost are required.' });
      return;
    }

    try {
      if (editingMethod) {
        const updated = await apiClient.put<ShippingMethod>(`/shipping/${editingMethod._id}`, { name, cost, estimatedTime, status });
        setMethods(methods.map(m => m._id === editingMethod._id ? updated : m));
        toast({ title: 'Success', description: 'Shipping method updated successfully.' });
      } else {
        const newMethod = await apiClient.post<ShippingMethod>('/shipping', { name, cost, estimatedTime, status });
        setMethods([...methods, newMethod]);
        toast({ title: 'Success', description: 'New shipping method added.' });
      }
      handleCloseForm();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Operation failed' });
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    try {
      await apiClient.delete(`/shipping/${methodId}`);
      setMethods(methods.filter(m => m._id !== methodId));
      toast({ variant: 'destructive', title: 'Deleted', description: 'Shipping method has been removed.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete method.' });
    } finally {
      setMethodToDelete(null);
    }
  }

  const handleStatusToggle = async (method: ShippingMethod, isActive: boolean) => {
    const status = isActive ? 'active' : 'inactive';
    // Optimistic update
    setMethods(methods.map(m => m._id === method._id ? { ...m, status } : m));

    try {
      await apiClient.put(`/shipping/${method._id}`, { ...method, status });
    } catch (error) {
      // Revert on failure
      setMethods(methods.map(m => m._id === method._id ? method : m));
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Shipping Methods</h1>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Shipping Method
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Shipping Options</CardTitle>
          <CardDescription>
            Configure delivery methods and charges for your store.
          </CardDescription>
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
                    <TableHead>Method Name</TableHead>
                    <TableHead>Cost/Charge</TableHead>
                    <TableHead>Estimated Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No shipping methods found.</TableCell>
                    </TableRow>
                  ) : (
                    methods.map(method => (
                      <TableRow key={method._id}>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell>BDT {method.cost.toLocaleString()}</TableCell>
                        <TableCell>{method.estimatedTime}</TableCell>
                        <TableCell>
                          <Switch
                            checked={method.status === 'active'}
                            onCheckedChange={(checked) => handleStatusToggle(method, checked)}
                            aria-label="Toggle method status"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenForm(method)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setMethodToDelete(method)}>
                            <Trash className="h-4 w-4" />
                          </Button>
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
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSaveMethod}>
            <DialogHeader>
              <DialogTitle>{editingMethod ? 'Edit Shipping Method' : 'Add New Shipping Method'}</DialogTitle>
              <DialogDescription>
                {editingMethod ? 'Update the details of this shipping option.' : 'Fill in the details for a new shipping option.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" defaultValue={editingMethod?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">
                  Cost (BDT)
                </Label>
                <Input id="cost" name="cost" type="number" defaultValue={editingMethod?.cost} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimatedTime" className="text-right">
                  Est. Time
                </Label>
                <Input id="estimatedTime" name="estimatedTime" defaultValue={editingMethod?.estimatedTime} className="col-span-3" placeholder="e.g., 2-3 Days" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Is Active
                </Label>
                <div className="col-span-3">
                  <Switch id="isActive" name="isActive" defaultChecked={editingMethod?.status === 'active' ?? true} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit">Save Method</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!methodToDelete} onOpenChange={() => setMethodToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shipping method
              "{methodToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMethodToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => methodToDelete && handleDeleteMethod(methodToDelete._id)}>
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
