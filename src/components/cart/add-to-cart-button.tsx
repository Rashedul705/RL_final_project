"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { useCart } from "./cart-context";
import { useRouter } from "next/navigation";

type AddToCartButtonProps = ButtonProps & {
  product: Product;
  quantity?: number;
  redirectToCheckout?: boolean;
};

export function AddToCartButton({ product, quantity = 1, redirectToCheckout = false, ...props }: AddToCartButtonProps) {
  const { addToCart, getItem } = useCart();
  const router = useRouter();

  const cartItem = getItem(product.id);
  const isAtMaxStock = cartItem && (cartItem.quantity + quantity > product.stock);
  const isOutOfStock = product.stock === 0;

  const handleClick = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    if (redirectToCheckout) {
      router.push('/checkout');
    }
  };

  const isDisabled = isOutOfStock || (cartItem && cartItem.quantity >= product.stock);


  return (
    <Button onClick={handleClick} disabled={isDisabled} {...props}>
      {isOutOfStock ? "Out of Stock" : (cartItem && cartItem.quantity >= product.stock) ? "Max Stock Reached" : props.children || "Add to Cart"}
    </Button>
  );
}
