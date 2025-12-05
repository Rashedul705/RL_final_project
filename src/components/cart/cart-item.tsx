"use client";

import Image from "next/image";
import { X, Plus, Minus } from "lucide-react";
import type { CartItem as CartItemType } from "./cart-context";
import { useCart } from "./cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CartItemProps = {
  item: CartItemType;
};

export function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold leading-tight">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            BDT {product.price.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => updateQuantity(product.id, quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value > 0) {
                      updateQuantity(product.id, value)
                  }
              }}
              className="h-8 w-14 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-[#00846E] hover:bg-[#00846E] hover:text-white"
              onClick={() => updateQuantity(product.id, quantity + 1)}
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
            onClick={() => removeFromCart(product.id)}
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
