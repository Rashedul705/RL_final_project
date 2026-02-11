"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { useCart } from "./cart-context";
import { useRouter } from "next/navigation";
import { sendGTMEvent } from "@/lib/gtm";
import { useToast } from "@/hooks/use-toast";

type AddToCartButtonProps = ButtonProps & {
  product: Product;
  quantity?: number;
  redirectToCheckout?: boolean;
  color?: string;
  size?: string;
  variantId?: string;
  image?: string;
};

export function AddToCartButton({ product, quantity = 1, redirectToCheckout = false, color, size, variantId, image, ...props }: AddToCartButtonProps) {
  const { addToCart, getItem } = useCart();
  const router = useRouter();

  const cartItem = getItem(product.id, variantId);

  // Determine effective stock
  let effectiveStock = product.stock;
  if (variantId && product.variants) {
    // Find stock for this variantId
    for (const v of product.variants) {
      const s = v.sizes.find(sz => sz._id === variantId);
      if (s) {
        effectiveStock = s.stock;
        break;
      }
    }
  }

  const isAtMaxStock = cartItem && (cartItem.quantity + quantity > effectiveStock);
  const isOutOfStock = effectiveStock === 0;

  const { toast } = useToast();

  const handleClick = () => {
    // Check for variant selection for variable products
    if (product.variants && product.variants.length > 0 && !variantId) {
      toast({
        variant: "destructive",
        title: "Selection Required",
        description: "Please select a color and size.",
      });
      return;
    }

    if (isOutOfStock) return;

    // Construct variant object if all details are present
    const variant = (color && size && variantId) ? { color, size, variantId, image } : undefined;

    addToCart(product, quantity, variant);

    sendGTMEvent({
      event: 'add_to_cart',
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price, // Note: Price might need to be variant specific too, but kept simple for GTM for now
      currency: 'BDT',
    });

    if (redirectToCheckout) {
      router.push('/checkout');
    }
  };

  const isDisabled = isOutOfStock || (cartItem && cartItem.quantity >= effectiveStock);


  return (
    <Button onClick={handleClick} disabled={isDisabled} {...props}>
      {isOutOfStock ? "Out of Stock" : (cartItem && cartItem.quantity >= effectiveStock) ? "Max Stock Reached" : props.children || "Add to Cart"}
    </Button>
  );
}
