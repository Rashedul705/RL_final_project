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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import Link from "next/link";

const products = [
    { id: '1', name: 'Elegant Floral Three-Piece', price: 3200, stock: true, category: 'Three-Piece', image: 'https://picsum.photos/seed/suit1/40/40' },
    { id: '2', name: 'Modern Silk Three-Piece', price: 4500, stock: true, category: 'Three-Piece', image: 'https://picsum.photos/seed/suit2/40/40' },
    { id: '4', name: 'Premium Silk Hijab', price: 1200, stock: false, category: 'Hijab', image: 'https://picsum.photos/seed/hijab1/40/40' },
    { id: '7', name: 'Luxury King Size Bedsheet', price: 5500, stock: true, category: 'Bedsheet', image: 'https://picsum.photos/seed/bedsheet1/40/40' },
];

export default function AdminProductsPage() {
    return (
        <div className="flex flex-col">
            <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0">
                <h1 className="text-xl font-semibold tracking-tight">Products</h1>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </header>
            <main className="flex-1 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Catalog</CardTitle>
                        <CardDescription>Manage your products and view their sales performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>In Stock</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(product => (
                                     <TableRow key={product.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{product.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Switch checked={product.stock} aria-label="In Stock" />
                                        </TableCell>
                                        <TableCell className="text-right">BDT {product.price.toLocaleString()}</TableCell>
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
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Delete</DropdownMenuItem>
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
