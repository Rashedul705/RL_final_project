
'use client';

import { useState, useMemo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { recentOrders, type Order } from '@/lib/data';
import { Label } from '@/components/ui/label';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(recentOrders);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
        case 'Delivered':
            return 'default';
        case 'Shipped':
            return 'secondary';
        case 'Processing':
            return 'secondary';
        case 'Pending':
            return 'outline';
        case 'Cancelled':
            return 'destructive';
        default:
            return 'outline';
    }
  }

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(currentOrders => 
        currentOrders.map(o => 
            o.id === orderId ? { ...o, status: newStatus } : o
        )
    );
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>
              View and manage all customer orders.
            </CardDescription>
            <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger id="status-filter" aria-label="Select status">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(newStatus: Order['status']) => handleStatusChange(order.id, newStatus)}>
                        <SelectTrigger className="w-32">
                           <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="Pending">Pending</SelectItem>
                           <SelectItem value="Processing">Processing</SelectItem>
                           <SelectItem value="Shipped">Shipped</SelectItem>
                           <SelectItem value="Delivered">Delivered</SelectItem>
                           <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      BDT {parseInt(order.amount).toLocaleString()}
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
