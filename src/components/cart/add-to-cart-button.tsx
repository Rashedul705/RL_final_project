"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { useCart } from "./cart-context";
import { useRouter } from "next/navigation";
import { sendGTMEvent } from "@/lib/gtm";

type AddToCartButtonProps = ButtonProps & {
  product: Product;
  quantity?: number;
  redirectToCheckout?: boolean;
  variantId?: string;
  variantName?: string;
  attributes?: Record<string, string>;
};

export function AddToCartButton({
  product,
  quantity = 1,
  redirectToCheckout = false,
  variantId,
  variantName,
  attributes,
  ...props
}: AddToCartButtonProps) {
  const { addToCart, getItem } = useCart();
  const router = useRouter();

  const cartItem = getItem(product.id, variantId);
  // Check specific variant stock if variant is selected, otherwise product global stock
  // Note: This logic depends on how 'product.stock' is handled. If variants exist, product.stock might be sum or just a placeholder.
  // Ideally, the parent component passes the correct 'stock' limit for the selected variant.
  // But here we might just need to disable if max reached.

  // Actually, keeping it simple: The parent component handles the "Out of Stock" UI. 
  // Here we just check if we are adding more than available.
  // For now, let's assume valid quantity is passed.

  const isOutOfStock = product.stock === 0; // Global check, might need refinement 

  const handleClick = () => {
    if (isOutOfStock) return;

    // We need to extend addToCart type in context to accept variant info
    addToCart(product, quantity, variantId, variantName, attributes);

    sendGTMEvent({
      event: 'add_to_cart',
      content_name: variantName ? `${product.name} - ${variantName}` : product.name,
      content_ids: [variantId || product.id],
      content_type: 'product',
      value: product.price, // Should ideally be variant price if different
      currency: 'BDT',
    });

    if (redirectToCheckout) {
      router.push('/checkout');
    }
  };

  // Logic to disable button if max stock in cart
  // Since we don't strictly know the limit here (it's in the product object, but variant stock is separate),
  // we rely on the parent to disable or we'd need to pass 'maxStock' prop.
  // For now, we'll trust the parent or simple check.

  return (
    <Button onClick={handleClick} disabled={isOutOfStock} {...props}>
      {props.children || "Add to Cart"}
    </Button>
  );
}
