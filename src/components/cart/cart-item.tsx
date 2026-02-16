"use client";

import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
import type { CartItem as CartItemType } from "./cart-context";
import { useCart } from "./cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type CartItemProps = {
  item: CartItemType;
};

export function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart();
  const { product, quantity, variantId, variantName, attributes } = item;

  // Resolve image: Variant Image > Product Image
  const variant = product.variants?.find((v: any) => v.id === variantId);
  const displayImage = variant?.image || product.image;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold leading-tight">{product.name}</h3>

          {variantName && (
            <p className="text-sm text-muted-foreground">
              Variant: {variantName}
            </p>
          )}
          {attributes && Object.keys(attributes).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(attributes).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-1">
            BDT {product.price.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => updateQuantity(product.id, quantity - 1, variantId)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value > 0) {
                  updateQuantity(product.id, value, variantId)
                }
              }}
              className="h-8 w-14 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-[#00846E] hover:bg-[#00846E] hover:text-white"
              onClick={() => updateQuantity(product.id, quantity + 1, variantId)}
              disabled={quantity >= product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-8 w-8"
          onClick={() => removeFromCart(product.id, variantId)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove item</span>
        </Button>
        <p className="font-semibold text-sm mt-auto">
          {(product.price * quantity).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
