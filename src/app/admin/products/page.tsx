"use client";

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { IProduct } from '@/lib/models';

type Product = IProduct;

export default function AdminProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Product[]>('/products');
      if (data) setAllProducts(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch products',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiClient.get<{ id: string, name: string }[]>('/categories');
      if (data) setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const categoryMatch =
        categoryFilter === 'all' || product.category === categoryFilter;
      const stockMatch =
        stockFilter === 'all' ||
        (stockFilter === 'in-stock' && (product.stock || 0) > 0) ||
        (stockFilter === 'out-of-stock' && (product.stock || 0) === 0) ||
        (stockFilter === 'low-stock' && (product.stock || 0) > 0 && (product.stock || 0) <= 5);
      return categoryMatch && stockMatch;
    });
  }, [allProducts, categoryFilter, stockFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectRow = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds((prev) => [...prev, productId]);
    } else {
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      toast({ title: 'Success', description: 'Product deleted' });
      fetchProducts();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete' });
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedProductIds.length} products?`)) return;
    for (const id of selectedProductIds) {
      try {
        await apiClient.delete(`/products/${id}`);
      } catch (e) {
        console.error(e);
      }
    }
    toast({ title: 'Batch Action', description: 'Selected products processed' });
    fetchProducts();
    setSelectedProductIds([]);
  };

  const isAllSelected =
    filteredProducts.length > 0 &&
    selectedProductIds.length === filteredProducts.length;

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                View and manage your store products.
              </CardDescription>
            </div>

            {selectedProductIds.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    Bulk Actions ({selectedProductIds.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={handleDeleteSelected}
                  >
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category-filter">Filter by Category</Label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger id="category-filter" aria-label="Select category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock-filter">Filter by Stock</Label>
              <Select
                value={stockFilter}
                onValueChange={setStockFilter}
              >
                <SelectTrigger id="stock-filter" aria-label="Select stock status">
                  <SelectValue placeholder="Select Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
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
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) =>
                        handleSelectAll(checked as boolean)
                      }
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">No products found.</TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      data-state={
                        selectedProductIds.includes(product.id) && 'selected'
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(product.id, checked as boolean)
                          }
                          aria-label="Select row"
                        />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.image || '/placeholder.svg'}
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant={(product.stock || 0) > 0 ? ((product.stock || 0) <= 5 ? 'secondary' : 'default') : 'destructive'}>
                          {(product.stock || 0) > 0 ? ((product.stock || 0) <= 5 ? 'Low Stock' : 'In Stock') : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        BDT {product.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.stock || 0}
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
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(product.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
