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

    // Facebook Pixel AddToCart
    // @ts-ignore
    if (typeof window !== 'undefined' && window.fbq) {
      // @ts-ignore
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_id: product.id,
        content_type: 'product',
        value: product.price * quantity,
        currency: 'BDT',
      });
    }

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
