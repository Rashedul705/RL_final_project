"use client";

import type { Product } from "@/lib/data";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export type CartItem = {
  product: Product;
  quantity: number;
  variantId?: string; // unique ID for the specific variant size
  color?: string;
  size?: string;
  image?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: { variantId: string, color: string, size: string }) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getItem: (productId: string, variantId?: string) => CartItem | undefined;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from local storage:", error);
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const getItem = (productId: string, variantId?: string) => {
    return cart.find((item) => item.product.id === productId && item.variantId === variantId);
  }

  const addToCart = (product: Product, quantity = 1, variant?: { variantId: string, color: string, size: string }) => {
    // Determine stock limit
    let stockLimit = product.stock;
    if (variant && product.variants) {
      // Find the specific size stock
      // This assumes product.variants is populated.
      // We might need to look it up.
      // For now, let's assume the caller ensures quantity <= stock,
      // BUT we need to know stock for max cap.
      // We can traverse product.variants to find the stock for this variantId.
      const v = product.variants.find(v => v.color === variant.color);
      const s = v?.sizes.find(s => s._id === variant.variantId);
      if (s) stockLimit = s.stock;
    }

    if (stockLimit === 0) {
      setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Out of Stock",
          description: `${product.name} ${variant ? `(${variant.size})` : ''} is currently out of stock.`,
        });
      }, 0);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id && item.variantId === variant?.variantId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > stockLimit) {
          setTimeout(() => {
            toast({
              variant: "destructive",
              title: "Stock limit reached",
              description: `You can only add up to ${stockLimit} of ${product.name}.`,
            });
          }, 0);
          return prevCart.map((item) =>
            (item.product.id === product.id && item.variantId === variant?.variantId)
              ? { ...item, quantity: stockLimit }
              : item
          );
        }
        return prevCart.map((item) =>
          (item.product.id === product.id && item.variantId === variant?.variantId)
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      if (quantity > stockLimit) {
        setTimeout(() => {
          toast({
            variant: "destructive",
            title: "Stock limit reached",
            description: `You can only add up to ${stockLimit} of ${product.name}.`,
          });
        }, 0);
        return [...prevCart, { product, quantity: stockLimit, ...variant }];
      }

      setTimeout(() => {
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });
      }, 0);
      return [...prevCart, { product, quantity, ...variant }];
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.product.id === productId && item.variantId === variantId)));
    setTimeout(() => {
      toast({
        title: "Removed from cart",
        variant: "destructive",
      });
    }, 0);
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    const item = getItem(productId, variantId);
    if (!item) return;

    // Determine stock limit for this specific item
    let stockLimit = item.product.stock;
    if (variantId && item.product.variants) {
      // Find the specific size stock
      // We iterate over all variants to find the one containing this size ID
      for (const v of item.product.variants) {
        const s = v.sizes.find(sz => sz._id === variantId);
        if (s) {
          stockLimit = s.stock;
          break;
        }
      }
    }

    if (quantity > stockLimit) {
      setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Stock limit reached",
          description: `You can only add up to ${stockLimit} of ${item.product.name}.`,
        });
      }, 0);
      setCart((prevCart) =>
        prevCart.map((cartItem) =>
          (cartItem.product.id === productId && cartItem.variantId === variantId) ? { ...cartItem, quantity: stockLimit } : cartItem
        )
      );
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.product.id === productId && item.variantId === variantId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
