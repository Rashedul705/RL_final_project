import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const orders = [
    { id: 'ORD001', customer: 'Sadia Islam', phone: '017********', address: 'Rajshahi', products: 'Classic Cotton Three-Piece', amount: '2,800', status: 'Delivered' },
    { id: 'ORD002', customer: 'Karim Ahmed', phone: '018********', address: 'Dhaka', products: 'Premium Silk Hijab', amount: '1,200', status: 'Shipped' },
    { id: 'ORD003', customer: 'Nusrat Jahan', phone: '019********', address: 'Chittagong', products: 'Modern Silk Three-Piece', amount: '4,500', status: 'Processing' },
    { id: 'ORD004', customer: 'Rahim Sheikh', phone: '016********', address: 'Sylhet', products: 'Floral Print Bedsheet', amount: '3,500', status: 'Pending' },
    { id: 'ORD005', customer: 'Farhana Begum', phone: '015********', address: 'Rajshahi', products: 'Soft Cotton Hijab', amount: '800', status: 'Cancelled' },
];

export default function AdminOrdersPage() {
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
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                     <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{order.customer}</div>
                                            <div className="text-sm text-muted-foreground">{order.address}</div>
                                        </TableCell>
                                        <TableCell>{order.phone}</TableCell>
                                        <TableCell>{order.products}</TableCell>
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
                                        <TableCell className="text-right">BDT {order.amount}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
