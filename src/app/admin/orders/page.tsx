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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Printer, Search, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import type { IOrder } from '@/lib/models'; // Use Interface

// Update type definition to handle undefined shippingCharge for legacy orders and Consignment fields
type Order = IOrder & { shippingCharge?: number; consignment_id?: string; tracking_code?: string };

const ProductLink = ({ productId, name, quantity }: { productId: string, name: string, quantity: number }) => {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlug = async () => {
      try {
        const product = await apiClient.get<any>(`/products/${productId}`);
        if (product && product.slug) {
          setSlug(product.slug);
        }
      } catch (e) {
        // Fallback or silence
      }
    };
    if (productId) fetchSlug();
  }, [productId]);

  if (!slug) {
    return <span>{name} (x{quantity})</span>;
  }

  return (
    <Link href={`/product/${slug}`} className="hover:underline" target="_blank" rel="noopener noreferrer">
      <span>{name} (x{quantity})</span>
    </Link>
  );
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Order[]>('/orders');
      setOrders(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch orders' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return orders.filter(order => {
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;
      const searchMatch = !lowercasedQuery ||
        order.id.toLowerCase().includes(lowercasedQuery) ||
        order.phone.replace(/[\s-]/g, '').includes(lowercasedQuery.replace(/[\s-]/g, ''));
      return statusMatch && searchMatch;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Optimistic update
    const originalOrders = [...orders];
    setOrders(current => current.map(o => o.id === orderId ? { ...o, status: newStatus as any } as any : o));

    try {
      await apiClient.put(`/orders/${orderId}`, { status: newStatus });
      toast({ title: 'Success', description: `Order status updated to ${newStatus}` });
    } catch (error) {
      setOrders(originalOrders); // Revert
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status' });
    }
  };

  const handleUpdateOrderDetails = async (orderId: string, updates: Partial<Order>) => {
    try {
      const updatedOrder = await apiClient.put<Order>(`/orders/${orderId}`, updates);
      setOrders(current => current.map(o => o.id === orderId ? updatedOrder : o));
      setSelectedOrder(updatedOrder); // Update the modal view
      toast({ title: 'Success', description: 'Order details updated.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update order details.' });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/orders/${orderId}`);
      toast({ title: 'Success', description: 'Order deleted' });
      setOrders(current => current.filter(o => o.id !== orderId));
      setOrderToDelete(null); // Close dialog on success
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete order' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      // Use stored shipping charge
      const shippingCharge = order.shippingCharge || 0;
      const subTotal = parseInt(order.amount) - shippingCharge; // Assuming amount is Grand Total
      const grandTotal = parseInt(order.amount).toLocaleString();
      const formattedSubTotal = subTotal.toLocaleString();
      const orderDate = new Date(order.date).toLocaleDateString();

      const invoiceHtml = `
        <html>
          <head>
            <title>Invoice - ${order.id}</title>
            <style>
              body { 
                font-family: 'monospace', sans-serif; 
                width: 80mm; 
                margin: 0 auto;
                padding: 10px;
                font-size: 12px;
              }
              .header { text-align: center; margin-bottom: 20px; }
              .header h2 { margin: 0; font-size: 16px; font-weight: bold; }
              .header p { margin: 5px 0 0; font-size: 12px; }
              .section { margin-bottom: 15px; }
              .section-title { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; }
              th, td { text-align: left; padding: 4px 0; }
              .text-right { text-align: right; }
              .totals-table td { padding: 2px 0; }
              .footer { text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px;}
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Rodelas lifestyle</h2>
              <p>Your destination for premium apparel</p>
            </div>
            <div class="section">
              <p><strong>Order ID:</strong> ${order.id}</p>
              ${order.consignment_id ? `<div style="border: 1px solid #000; padding: 5px; margin: 5px 0; font-size: 15px; font-weight: bold; display: inline-block; border-radius: 4px;">SF Id: ${order.consignment_id}</div>` : ''}
              <p><strong>Date:</strong> ${orderDate}</p>
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
                      <span style="font-size: 10px; color: #555;">@ ${p.price.toLocaleString()}</span>
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
                        <td class="text-right">${formattedSubTotal}</td>
                    </tr>
                    <tr>
                        <td>Shipping:</td>
                        <td class="text-right">${shippingCharge}</td>
                    </tr>
                     <tr>
                        <td><strong>Total:</strong></td>
                        <td class="text-right"><strong>BDT ${grandTotal}</strong></td>
                    </tr>
                </tbody>
            </table>
            <div class="footer">
              <p>Thank you for your purchase!</p>
              <p>www.rodelaslifestyle.com</p>
            </div>
            <script>
              setTimeout(function() {
                window.print();
              }, 500);
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const handleSendToSteadfast = async (orderId: string) => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: any }>('/admin/steadfast/create-order', { orderId });

      if (response.success) {
        toast({ title: 'Success', description: response.message });
        // Update local state to reflect status change and saved consignment info
        const { consignment_id, tracking_code } = response.data.consignment || {};

        setOrders(current => current.map(o => o.id === orderId ? {
          ...o,
          status: 'Handed Over to Courier',
          consignment_id: consignment_id,
          tracking_code: tracking_code
        } as any : o));

        // Also update selectedOrder if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(curr => curr ? {
            ...curr,
            status: 'Handed Over to Courier' as any,
            consignment_id: consignment_id,
            tracking_code: tracking_code
          } as any : null);
        }

      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to send to Steadfast' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to send to Steadfast' });
    }
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            View and manage all customer orders.
          </CardDescription>
          <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by Order ID or Phone Number..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
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
                  <SelectItem value="Packaging">Packaging</SelectItem>
                  <SelectItem value="Handed Over to Courier">Handed Over to Courier</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell className="hidden sm:table-cell">{order.customer}</TableCell>
                      <TableCell className="hidden md:table-cell">{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Packaging">Packaging</SelectItem>
                            <SelectItem value="Handed Over to Courier">Handed Over to Courier</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            <SelectItem value="Returned">Returned</SelectItem>
                          </SelectContent>
                        </Select>
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

                            {order.consignment_id ? (
                              <DropdownMenuItem asChild>
                                <Link href={`https://steadfast.com.bd/t/${order.tracking_code}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 font-medium">
                                  Track: {order.tracking_code}
                                </Link>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onSelect={() => handleSendToSteadfast(order.id)}>
                                Send to Steadfast
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem onSelect={() => setTimeout(() => setSelectedOrder(order), 100)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onSelect={() => setTimeout(() => setOrderToDelete(order.id), 100)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details: {selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  Full details for the order placed on {new Date(selectedOrder.date).toLocaleDateString()}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Customer Information</h4>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Name:</strong> {selectedOrder.customer}</p>
                    <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                    <p><strong>Address:</strong> {selectedOrder.address}</p>
                    {selectedOrder.consignment_id && (
                      <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-100">
                        <p className="text-blue-700 font-medium">Couier Info:</p>
                        <p>CID: {selectedOrder.consignment_id}</p>
                        <Link href={`https://steadfast.com.bd/t/${selectedOrder.tracking_code}`} target="_blank" className="text-blue-600 underline">
                          Track: {selectedOrder.tracking_code}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold">Ordered Items</h4>
                  <ul className="space-y-2 text-sm">

                    {selectedOrder.products.map((product, index) => {
                      return (
                        <li key={index} className="flex justify-between items-center">
                          <ProductLink productId={product.productId} name={product.name} quantity={product.quantity} />
                          <span className="font-medium">BDT {(product.price * product.quantity).toLocaleString()}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                <Separator />
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-end gap-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="shippingCharge">Shipping Charge (BDT)</Label>
                      <Input
                        id="shippingCharge"
                        type="number"
                        defaultValue={selectedOrder.shippingCharge || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            // Update local state is tricky without a form state, relying on onBlur or Save button
                          }
                        }}
                        onBlur={(e) => {
                          // Calculate new Total
                          const newShipping = parseInt(e.target.value) || 0;
                          const oldShipping = selectedOrder.shippingCharge || 0;
                          const oldTotal = parseInt(selectedOrder.amount);
                          // Logic: Amount = Subtotal + Shipping. Subtotal = Amount - OldShipping
                          const subtotal = oldTotal - oldShipping;
                          const newTotal = subtotal + newShipping;

                          handleUpdateOrderDetails(selectedOrder.id, {
                            shippingCharge: newShipping,
                            amount: newTotal.toString()
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">Change value to update Order Total automatically.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-base mt-4">
                  <span>Total Amount</span>
                  <span>BDT {parseInt(selectedOrder.amount).toLocaleString()}</span>
                </div>
              </div>
              <DialogFooter>
                <div className="flex gap-2 w-full justify-between">
                  {selectedOrder.consignment_id ? (
                    <Button variant="outline" asChild>
                      <Link href={`https://steadfast.com.bd/t/${selectedOrder.tracking_code}`} target="_blank">
                        Track Order
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => handleSendToSteadfast(selectedOrder.id)}>
                      Send to Steadfast
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => handlePrintInvoice(selectedOrder)}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print Invoice
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToDelete(null)}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => orderToDelete && handleDeleteOrder(orderToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Yes, delete order'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
