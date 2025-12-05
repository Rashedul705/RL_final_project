"use client";

import type { Product } from "@/lib/data";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItem: (productId: string) => CartItem | undefined;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const getItem = (productId: string) => {
    return cart.find((item) => item.product.id === productId);
  }

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock === 0) {
      toast({
        variant: "destructive",
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
      });
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast({
            variant: "destructive",
            title: "Stock limit reached",
            description: `You can only add up to ${product.stock} of ${product.name}.`,
          });
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: product.stock }
              : item
          );
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      if (quantity > product.stock) {
        toast({
            variant: "destructive",
            title: "Stock limit reached",
            description: `You can only add up to ${product.stock} of ${product.name}.`,
        });
        return [...prevCart, { product, quantity: product.stock }];
      }

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
     toast({
      title: "Removed from cart",
      variant: "destructive",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = getItem(productId);
    if (!item) return;

    if (quantity > item.product.stock) {
      toast({
        variant: "destructive",
        title: "Stock limit reached",
        description: `You can only add up to ${item.product.stock} of ${item.product.name}.`,
      });
      setCart((prevCart) =>
        prevCart.map((cartItem) =>
          cartItem.product.id === productId ? { ...cartItem, quantity: item.product.stock } : cartItem
        )
      );
      return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
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
