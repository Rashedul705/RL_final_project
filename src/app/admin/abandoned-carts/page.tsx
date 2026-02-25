"use client";

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
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

interface IAbandonedCart {
    _id: string;
    phone: string;
    name: string;
    products: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
        image?: string;
        variantName?: string;
    }[];
    updatedAt: string;
}

export default function AbandonedCartsPage() {
    const [carts, setCarts] = useState<IAbandonedCart[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchCarts = async () => {
        try {
            setLoading(true);
            const data = await apiClient.get<IAbandonedCart[]>('/abandoned-carts/get');
            if (data) setCarts(data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to fetch abandoned carts',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarts();
    }, []);

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold tracking-tight">Abandoned Carts</h1>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle>Incomplete Orders</CardTitle>
                            <CardDescription>
                                View customers who started checkout but did not complete OTP verification.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Cart Items</TableHead>
                                    <TableHead>Total Value</TableHead>
                                    <TableHead>Last Active</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {carts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">No abandoned carts found.</TableCell>
                                    </TableRow>
                                ) : (
                                    carts.map((cart) => {
                                        const totalValue = cart.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                        return (
                                            <TableRow key={cart._id}>
                                                <TableCell className="font-medium">{cart.name}</TableCell>
                                                <TableCell>
                                                    <a href={`tel:${cart.phone}`} className="text-blue-600 hover:underline">{cart.phone}</a>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-2">
                                                        {cart.products.map((item, index) => (
                                                            <Link href={`/product/${item.productId}`} target="_blank" key={index} className="flex items-center gap-2 hover:bg-muted p-1 rounded transition-colors group">
                                                                <Image
                                                                    alt={item.name}
                                                                    className="h-8 w-8 rounded-md object-cover"
                                                                    height={32}
                                                                    src={item.image || '/placeholder.svg'}
                                                                    width={32}
                                                                />
                                                                <span className="text-sm group-hover:text-blue-600 group-hover:underline">
                                                                    {item.quantity}x {item.name} {item.variantName ? `(${item.variantName})` : ''}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    BDT {totalValue.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDistanceToNow(new Date(cart.updatedAt), { addSuffix: true })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
