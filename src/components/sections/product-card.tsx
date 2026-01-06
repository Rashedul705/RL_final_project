import Image from "next/image";
import type { Product } from "@/lib/data";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";


interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const productSlug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return (
    <Card className="overflow-hidden flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/product/${productSlug}`} className="block relative aspect-[3/4] w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product.imageHint}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg bg-black/50 px-4 py-2 rounded-md">Out of Stock</span>
            </div>
          )}
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <CardTitle className="text-lg font-bold leading-tight tracking-normal">
          <Link href={`/product/${productSlug}`} className="hover:underline">
            {product.name}
          </Link>
        </CardTitle>
        <p className="mt-2 text-lg font-semibold text-primary">BDT {product.price.toLocaleString()}</p>
        {product.size && (
          <div className="mt-2">
            <Badge variant="secondary" className="font-normal text-xs">
              Size: {product.size}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2 justify-center">
        <AddToCartButton product={product} variant="outline" className="w-full flex-1">
          Add to Cart
        </AddToCartButton>
        <AddToCartButton product={product} redirectToCheckout className="w-full flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
          Order Now
        </AddToCartButton>
      </CardFooter>
    </Card>
  );
}
