"use client";

import type { Product } from "@/lib/data";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export type CartItem = {
  product: Product;
  quantity: number;
  variantId?: string;
  variantName?: string;
  attributes?: Record<string, string>;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variantId?: string, variantName?: string, attributes?: Record<string, string>) => void;
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

  const addToCart = (product: Product, quantity = 1, variantId?: string, variantName?: string, attributes?: Record<string, string>) => {
    // Basic stock check (global product stock) - simplistic
    if (product.stock === 0) {
      setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Out of Stock",
          description: `${product.name} is currently out of stock.`,
        });
      }, 0);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id && item.variantId === variantId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        // Check stock limit if possible. For now checking global stock as proxy or strict limit.
        // If variants have specific stock, we should ideally check that. 
        // But 'product' object passed here might be the base product.
        // Assuming optimistic add for now, or relying on parent to check variant stock.

        if (newQuantity > product.stock) {
          setTimeout(() => {
            toast({
              variant: "destructive",
              title: "Stock limit reached",
              description: `You can only add up to ${product.stock} of ${product.name}.`,
            });
          }, 0);
          return prevCart.map((item) =>
            item.product.id === product.id && item.variantId === variantId
              ? { ...item, quantity: product.stock }
              : item
          );
        }

        return prevCart.map((item) =>
          item.product.id === product.id && item.variantId === variantId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // New item
      if (quantity > product.stock) {
        setTimeout(() => {
          toast({
            variant: "destructive",
            title: "Stock limit reached",
            description: `You can only add up to ${product.stock} of ${product.name}.`,
          });
        }, 0);
        return [...prevCart, { product, quantity: product.stock, variantId, variantName, attributes }];
      }

      setTimeout(() => {
        toast({
          title: "Added to cart",
          description: `${product.name} ${variantName ? `(${variantName})` : ''} has been added to your cart.`,
        });
      }, 0);
      return [...prevCart, { product, quantity, variantId, variantName, attributes }];
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

    if (quantity > item.product.stock) {
      setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Stock limit reached",
          description: `You can only add up to ${item.product.stock} of ${item.product.name}.`,
        });
      }, 0);
      setCart((prevCart) =>
        prevCart.map((cartItem) =>
          cartItem.product.id === productId && cartItem.variantId === variantId
            ? { ...cartItem, quantity: item.product.stock }
            : cartItem
        )
      );
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.product.id === productId && cartItem.variantId === variantId
          ? { ...cartItem, quantity }
          : cartItem
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
