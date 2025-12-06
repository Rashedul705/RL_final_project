
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown, Printer } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { recentOrders as allOrders, products as allProducts } from "@/lib/data";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


export default function AdminOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = allOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(allOrders.length / ordersPerPage);

  const getProductSlug = (productName: string) => {
    const product = allProducts.find(p => p.name === productName);
    if (!product) return '#';
    return `/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`;
  };

    return (
        <div className="flex flex-col">
            <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0">
                <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
                <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </header>
            <main className="flex-1 p-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>All Orders</CardTitle>
                        <CardDescription>View and manage all customer orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentOrders.map(order => (
                                     <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{order.customer}</div>
                                            <div className="text-sm text-muted-foreground">{order.address}</div>
                                        </TableCell>
                                        <TableCell>{order.phone}</TableCell>
                                        <TableCell>
                                            <Select defaultValue={order.status}>
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder="Status" />
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
                                             <Dialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>View Details</DropdownMenuItem>
                                                        </DialogTrigger>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/invoice/${order.id}`}>Print Invoice</Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage((prev) => Math.max(prev - 1, 1));
                                    }}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                                </PaginationItem>
                                <PaginationItem>
                                    <span className="p-2 text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </PaginationItem>
                                <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                                    }}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity_50' : ''}
                                />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
