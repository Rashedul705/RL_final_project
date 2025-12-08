
'use client';

import {
  Activity,
  AlertOctagon,
  ArrowUpRight,
  CircleDollarSign,
  ClipboardList,
  Mail,
  PackageX,
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
import { useMemo } from 'react';
import { recentOrders, products } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboardPage() {
  const stats = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todaysOrders = recentOrders.filter(
      (order) => new Date(order.date) >= startOfToday
    );
    const monthlyOrders = recentOrders.filter(
      (order) => new Date(order.date) >= startOfMonth
    );

    const totalRevenue = recentOrders
      .filter((o) => o.status === 'Delivered')
      .reduce((acc, order) => acc + parseFloat(order.amount), 0);

    return {
      todaysOrdersCount: todaysOrders.length,
      monthlyOrdersCount: monthlyOrders.length,
      totalRevenue: totalRevenue,
      newInquiries: 5, // Placeholder
    };
  }, []);

  const lastFiveOrders = useMemo(() => {
    return [...recentOrders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, []);

  const { lowStockProducts, outOfStockProducts } = useMemo(() => {
    return {
      lowStockProducts: products
        .filter((p) => p.stock > 0 && p.stock <= 5)
        .sort((a, b) => a.stock - b.stock),
      outOfStockProducts: products.filter((p) => p.stock === 0),
    };
  }, []);

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
                  {lastFiveOrders.map((order) => (
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
                  ))}
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
                      <span>{product.name}</span>
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
                      <span>{product.name}</span>
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
