"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "./cart-context";
import { CartItem } from "./cart-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export function CartSheet({ children }: { children?: React.ReactNode }) {
  const { cart, clearCart } = useCart();
  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <Sheet>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <Separator />
        {cart.length > 0 ? (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="flex flex-col gap-4">
                {cart.map((item) => (
                  <CartItem key={item.product.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="px-6 py-4">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>BDT {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Clear Cart
                  </Button>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some products to get started.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

