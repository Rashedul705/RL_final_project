import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function NewProductPage() {
  return (
    <div className="flex flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Products</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">Add New Product</h1>
        </div>
        <Button>Save Product</Button>
      </header>
      <main className="flex-1 p-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Fill out the form below to add a new product to your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" type="text" placeholder="e.g. Elegant Floral Three-Piece" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="A beautifully crafted three-piece suit..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="price">Price (BDT)</Label>
                  <Input id="price" type="number" placeholder="e.g. 3200" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="grid gap-3">
                    <Label htmlFor="picture">Featured Image</Label>
                    <Input id="picture" type="file" />
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="gallery">Product Gallery</Label>
                    <Input id="gallery" type="file" multiple />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" type="number" placeholder="e.g. 25" defaultValue="10" />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
