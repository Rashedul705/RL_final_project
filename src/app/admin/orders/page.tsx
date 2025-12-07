'use client';

import { useState, useMemo, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Printer } from 'lucide-react';
import { recentOrders, type Order } from '@/lib/data';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    setOrders(recentOrders);
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(currentOrders => 
        currentOrders.map(o => 
            o.id === orderId ? { ...o, status: newStatus } : o
        )
    );
  };
  
  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const totalAmount = parseInt(order.amount).toLocaleString();
      const orderDate = new Date(order.date).toLocaleDateString();

      const invoiceHtml = `
        <html>
          <head>
            <title>Invoice - ${order.id}</title>
            <style>
              body { 
                font-family: 'monospace', sans-serif; 
                width: 80mm; 
                margin: 0;
                padding: 10px;
                font-size: 10px;
              }
              .header { text-align: center; margin-bottom: 10px; }
              .header h2 { margin: 0; font-size: 14px; }
              .header p { margin: 0; font-size: 10px; }
              .section { margin-bottom: 10px; }
              .section-title { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 5px 0; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; }
              th, td { text-align: left; padding: 2px 0; }
              .text-right { text-align: right; }
              .totals-table td { padding: 1px 0; }
              .footer { text-align: center; margin-top: 15px; border-top: 1px dashed #000; padding-top: 5px;}
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Rodelas lifestyle</h2>
              <p>Your destination for premium apparel</p>
            </div>
            <div class="section">
              <p>Order ID: ${order.id}</p>
              <p>Date: ${orderDate}</p>
            </div>
            <div class="section">
                <p><strong>Customer:</strong> ${order.customer}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Address:</strong> ${order.address}</p>
            </div>
            <div class="section-title">ITEMS</div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.products.map(p => `
                  <tr>
                    <td>
                      ${p.quantity} x ${p.name}<br/>
                      &nbsp;&nbsp;&nbsp;@ ${p.price.toLocaleString()}
                    </td>
                    <td class="text-right">${(p.quantity * p.price).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="section-title">TOTALS</div>
             <table class="totals-table">
                <tbody>
                    <tr>
                        <td>Subtotal:</td>
                        <td class="text-right">${totalAmount}</td>
                    </tr>
                    <tr>
                        <td>Shipping:</td>
                        <td class="text-right">0</td>
                    </tr>
                     <tr>
                        <td><strong>Total:</strong></td>
                        <td class="text-right"><strong>BDT ${totalAmount}</strong></td>
                    </tr>
                </tbody>
            </table>
            <div class="footer">
              <p>Thank you for your purchase!</p>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
    }
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
                          <DropdownMenuItem onSelect={() => setSelectedOrder(order)}>
                            View Details
                          </DropdownMenuItem>
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

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-lg">
              {selectedOrder && (
                  <>
                      <DialogHeader>
                          <DialogTitle>Order Details: {selectedOrder.id}</DialogTitle>
                          <DialogDescription>
                              Full details for the order placed on {selectedOrder.date}.
                          </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                              <h4 className="font-semibold">Customer Information</h4>
                              <div className="text-sm text-muted-foreground">
                                  <p><strong>Name:</strong> {selectedOrder.customer}</p>
                                  <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                                  <p><strong>Address:</strong> {selectedOrder.address}</p>
                              </div>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                              <h4 className="font-semibold">Ordered Items</h4>
                               <ul className="space-y-2 text-sm">
                                  {selectedOrder.products.map((product, index) => {
                                      const productSlug = product.name.toLowerCase().replace(/\s+/g, '-');
                                      return (
                                        <li key={index} className="flex justify-between items-center">
                                            <Link href={`/product/${productSlug}`} className="hover:underline" target="_blank" rel="noopener noreferrer">
                                                <span>{product.name} (x{product.quantity})</span>
                                            </Link>
                                            <span className="font-medium">BDT {(product.price * product.quantity).toLocaleString()}</span>
                                        </li>
                                      )
                                  })}
                              </ul>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-base">
                              <span>Total Amount</span>
                              <span>BDT {parseInt(selectedOrder.amount).toLocaleString()}</span>
                          </div>
                      </div>
                      <DialogFooter>
                          <Button variant="secondary" onClick={() => handlePrintInvoice(selectedOrder)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Invoice
                          </Button>
                          <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                      </DialogFooter>
                  </>
              )}
          </DialogContent>
      </Dialog>
    </>
  );
}
