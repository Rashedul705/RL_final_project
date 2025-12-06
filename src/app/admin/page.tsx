
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, ShoppingBag, Users, Activity, Printer, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { recentOrders as allOrders, products as allProducts } from "@/lib/data";
import Link from "next/link";


export default function AdminDashboardPage() {

  // Use the first 5 for "Recent Orders" card
  const recentOrders = allOrders.slice(0, 5);

  const getProductSlug = (productName: string) => {
    const product = allProducts.find(p => p.name === productName);
    if (!product) return '#';
    return `/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`;
  };

  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center border-b bg-background px-6 shrink-0">
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      </header>
      <main className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">BDT 12,540</div>
              <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+7</div>
              <p className="text-xs text-muted-foreground">+10% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>
           <Link href="/admin/inquiries">
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Waiting for a response</p>
                </CardContent>
            </Card>
           </Link>
        </div>
        <div className="grid gap-6 mt-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>A list of the last 5 orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Amount (BDT)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.map(order => (
                                <Dialog key={order.id}>
                                    <TableRow>
                                        <TableCell>
                                             <DialogTrigger asChild>
                                                <Button variant="link" className="font-medium px-0">
                                                    {order.id}
                                                </Button>
                                             </DialogTrigger>
                                        </TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell className="text-right">{order.amount}</TableCell>
                                    </TableRow>
                                     <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Order {order.id}</DialogTitle>
                                            <DialogDescription>
                                                Products ordered by {order.customer}.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            {order.products.map((product, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">
                                                            <Link href={getProductSlug(product.name)} className="hover:underline" target="_blank">
                                                                {product.name}
                                                            </Link>
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">Quantity: {product.quantity}</p>
                                                    </div>
                                                    <p className="text-sm font-medium">BDT {(product.price * product.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                         <div className="flex justify-between items-center font-bold border-t pt-4">
                                            <p>Total</p>
                                            <p>BDT {order.amount}</p>
                                        </div>
                                        <DialogFooter>
                                            <Button asChild>
                                                <Link href={`/admin/invoice/${order.id}`}>
                                                    <Printer className="mr-2 h-4 w-4" />
                                                    Print Invoice
                                                </Link>
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="text-sm mt-4 text-center">
                        <Link href="/admin/orders" className="text-primary hover:underline">
                            View All Orders
                        </Link>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Stock Alerts</CardTitle>
                    <CardDescription>Items that are running low on stock.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Placeholder for stock alerts */}
                    <p className="text-muted-foreground">No low stock items at the moment.</p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
