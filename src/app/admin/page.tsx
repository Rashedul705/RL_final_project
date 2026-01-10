'use client';

import {
  Activity,
  AlertOctagon,
  ArrowUpRight,
  CircleDollarSign,
  ClipboardList,
  Mail,
  PackageX,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';
import type { IOrder, IProduct } from '@/lib/models';

type DashboardData = {
  orders: IOrder[];
  products: IProduct[];
  newInquiriesCount: number;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>({ orders: [], products: [], newInquiriesCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiClient.get<DashboardData>('/dashboard');
        setData(res);
      } catch (e) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const orders = data.orders;
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todaysOrders = orders.filter(
      (order) => new Date(order.date) >= startOfToday
    );
    const monthlyOrders = orders.filter(
      (order) => new Date(order.date) >= startOfMonth
    );

    const totalRevenue = orders
      .filter((o) => o.status === 'Delivered')
      .reduce((acc, order) => acc + parseFloat(order.amount), 0);

    return {
      todaysOrdersCount: todaysOrders.length,
      monthlyOrdersCount: monthlyOrders.length,
      totalRevenue: totalRevenue,
      newInquiries: data.newInquiriesCount,
    };
  }, [data.orders, data.newInquiriesCount]);

  const lastFiveOrders = useMemo(() => {
    return [...data.orders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [data.orders]);

  const { lowStockProducts, outOfStockProducts } = useMemo(() => {
    const products = data.products;
    return {
      lowStockProducts: products
        .filter((p) => p.stock > 0 && p.stock <= 5)
        .sort((a, b) => a.stock - b.stock),
      outOfStockProducts: products.filter((p) => p.stock === 0),
    };
  }, [data.products]);

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              BDT {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total from all delivered orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.todaysOrdersCount}
            </div>
            <p className="text-xs text-muted-foreground">
              New orders received today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Performance
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.monthlyOrdersCount} Orders
            </div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <Link href="/admin/inquiries">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newInquiries}</div>
              <p className="text-xs text-muted-foreground">
                Unread messages from customers
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-2">
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                A quick look at the latest customer orders.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/admin/orders">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastFiveOrders.length > 0 ? (
                    lastFiveOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === 'Delivered'
                                ? 'default'
                                : order.status === 'Cancelled'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          BDT {parseInt(order.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="text-center">No orders found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <CardDescription>
              Manage inventory for products running low or out of stock.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertOctagon className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold">Low Stock Items</h3>
              </div>
              <ul className="space-y-2">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <li key={product.id} className="flex items-center justify-between text-sm">
                      <Link
                        href={`/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="hover:underline"
                        target="_blank"
                      >
                        <span>{product.name}</span>
                      </Link>
                      <Badge variant="secondary">Qty: {product.stock}</Badge>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No items are low on stock.</p>
                )}
              </ul>
            </div>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PackageX className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Out of Stock Items</h3>
              </div>
              <ul className="space-y-2">
                {outOfStockProducts.length > 0 ? (
                  outOfStockProducts.map((product) => (
                    <li key={product.id} className="flex items-center justify-between text-sm">
                      <Link
                        href={`/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="hover:underline"
                        target="_blank"
                      >
                        <span>{product.name}</span>
                      </Link>
                      <Badge variant="destructive">Out of Stock</Badge>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No items are out of stock.</p>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
