"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { useCart } from "./cart-context";
import { useRouter } from "next/navigation";

type AddToCartButtonProps = ButtonProps & {
  product: Product;
  redirectToCheckout?: boolean;
};

export function AddToCartButton({ product, redirectToCheckout = false, ...props }: AddToCartButtonProps) {
  const { addToCart, getItem } = useCart();
  const router = useRouter();

  const cartItem = getItem(product.id);
  const isAtMaxStock = cartItem && cartItem.quantity >= product.stock;
  const isOutOfStock = product.stock === 0;

  const handleClick = () => {
    if (isAtMaxStock || isOutOfStock) return;
    addToCart(product);
    if (redirectToCheckout) {
      router.push('/checkout');
    }
  };

  return (
    <Button onClick={handleClick} disabled={isAtMaxStock || isOutOfStock} {...props}>
      {isOutOfStock ? "Out of Stock" : isAtMaxStock ? "Max Stock Reached" : props.children || "Add to Cart"}
    </Button>
  );
}
