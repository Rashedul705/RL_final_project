
'use client';

import { useState } from "react";
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
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { products as initialProducts, categories, type Product } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type StockStatus = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

export default function AdminProductsPage() {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [stockStatus, setStockStatus] = useState<StockStatus>('all');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);


    const getCategoryName = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'N/A';
    }

    const filteredProducts = products.filter(product => {
        const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
        
        const stockMatch = stockStatus === 'all' ||
            (stockStatus === 'in-stock' && product.stock > 5) ||
            (stockStatus === 'low-stock' && product.stock > 0 && product.stock <= 5) ||
            (stockStatus === 'out-of-stock' && product.stock === 0);

        return categoryMatch && stockMatch;
    });

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedProducts(filteredProducts.map(p => p.id));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleSelectProduct = (productId: string, checked: boolean) => {
        if (checked) {
            setSelectedProducts(prev => [...prev, productId]);
        } else {
            setSelectedProducts(prev => prev.filter(id => id !== productId));
        }
    };

    const handleDeleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast({
            title: "Product Deleted",
            description: "The product has been removed from the list.",
        });
    };
    
    const handleDeleteSelected = () => {
        setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
        toast({
            title: `${selectedProducts.length} Product(s) Deleted`,
            description: "The selected products have been removed.",
        });
        setSelectedProducts([]);
    };


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
                        
                        <CardTitle>All Products</CardTitle>
                        <CardDescription>Manage your products and view their sales performance.</CardDescription>
                       
                    </CardHeader>
                    <CardContent>
                         <div className="flex flex-wrap items-center gap-2 mb-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-auto">
                                        Bulk actions
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Actions for {selectedProducts.length} selected items</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                disabled={selectedProducts.length === 0}
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Selected
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete {selectedProducts.length} product(s).
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteSelected}>
                                                    Yes, delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-auto">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <Select value={stockStatus} onValueChange={(value) => setStockStatus(value as StockStatus)}>
                                <SelectTrigger className="w-auto">
                                    <SelectValue placeholder="Filter by stock status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stock Statuses</SelectItem>
                                    <SelectItem value="in-stock">In Stock</SelectItem>
                                    <SelectItem value="low-stock">Low Stock</SelectItem>
                                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox 
                                            onCheckedChange={handleSelectAll}
                                            checked={
                                                selectedProducts.length > 0 &&
                                                selectedProducts.length === filteredProducts.length
                                            }
                                            aria-label="Select all rows"
                                        />
                                    </TableHead>
                                    <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map(product => (
                                     <TableRow key={product.id} data-state={selectedProducts.includes(product.id) ? 'selected' : undefined}>
                                        <TableCell>
                                            <Checkbox 
                                                checked={selectedProducts.includes(product.id)}
                                                onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                                                aria-label={`Select row for ${product.name}`}
                                            />
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image src={product.image} alt={product.name} width={60} height={60} className="rounded-md object-cover" />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{getCategoryName(product.category)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {product.stock > 0 ? (
                                                <Badge variant={product.stock < 5 ? 'destructive' : 'secondary'}>{product.stock} in stock</Badge>
                                            ) : (
                                                <Badge variant="destructive">Out of stock</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">BDT {product.price.toLocaleString()}</TableCell>
                                        <TableCell>
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onSelect={(e) => e.preventDefault()}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                             <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the product "{product.name}".
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                                    Yes, delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                         </AlertDialog>
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
