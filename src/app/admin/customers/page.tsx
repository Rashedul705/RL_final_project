
'use client';

import { useMemo, useState } from 'react';
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
import { recentOrders } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

type Customer = {
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
};

export default function AdminCustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    recentOrders.forEach((order) => {
      const customerKey = `${order.customer}-${order.phone}`;
      const existingCustomer = customerMap.get(customerKey);

      if (existingCustomer) {
        existingCustomer.totalOrders += 1;
        existingCustomer.totalSpent += parseFloat(order.amount);
      } else {
        customerMap.set(customerKey, {
          name: order.customer,
          phone: order.phone,
          totalOrders: 1,
          totalSpent: parseFloat(order.amount),
        });
      }
    });

    return Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );
  }, []);

  const getCustomerOrders = (customer: Customer) => {
    return recentOrders.filter(
      (order) =>
        order.customer === customer.name && order.phone === customer.phone
    );
  };

  const handleViewDetails = (customer: Customer) => {
    // Add a small delay to ensure the DropdownMenu closes properly before opening the Dialog.
    // This prevents focus and pointer-event conflicts that can freeze the UI.
    setTimeout(() => {
      setSelectedCustomer(customer);
      setIsDialogOpen(true);
    }, 100);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            View and manage your customer data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
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
                {customers.map((customer) => (
                  <TableRow key={`${customer.name}-${customer.phone}`}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
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
                ))}
              </TableBody>
            </Table>
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
