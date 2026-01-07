'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Search, Loader2, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

type Customer = {
  _id: string; // Mongoose ID
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string; // Date string from JSON
  joinedAt: string;
};

type Order = {
  id: string;
  customer: string;
  phone: string;
  email?: string;
  amount: string;
  status: string;
  products: any[];
  date: string;
};

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]); // Keep orders for details view

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchCustomers = async () => {
    try {
      const data = await apiClient.get<Customer[]>('/customers');
      if (data) setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers");
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiClient.get<Order[]>('/orders');
      if (data) setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchCustomers(), fetchOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/customers/sync', {});
      toast({
        title: "Success",
        description: "Customer database synced with orders successfully."
      });
      fetchCustomers(); // Refresh list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sync database."
      });
    } finally {
      setSyncing(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      customer.phone.includes(searchQuery) || customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const getCustomerOrders = (customer: Customer) => {
    return orders.filter(
      (order) =>
        (order.phone === customer.phone)
    );
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
        <Button onClick={handleSync} disabled={syncing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          Sync Database
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            View and manage your customer data (stored in dedicated database).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone/name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="relative w-full overflow-auto">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No customers found.</TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer._id || customer.id}>
                        <TableCell>
                          <div className="font-medium">{customer.name}</div>
                          {customer.email && <div className="text-xs text-muted-foreground">{customer.email}</div>}
                        </TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="text-center">
                          {customer.totalOrders}
                        </TableCell>
                        <TableCell className="text-right">
                          BDT {customer.totalSpent.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                                View Details
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Order history for {selectedCustomer?.name} ({selectedCustomer?.phone})
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {selectedCustomer && (
              <div className="space-y-6">
                {getCustomerOrders(selectedCustomer).map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">Order #{order.id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Items:</p>
                      <ul className="text-sm space-y-1">
                        {order.products.map((product, idx) => (
                          <li key={idx} className="flex justify-between text-muted-foreground">
                            <span>• {product.name} (x{product.quantity})</span>
                            <span>BDT {product.price.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Total Amount</span>
                      <span className="text-sm font-bold">BDT {parseFloat(order.amount).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
