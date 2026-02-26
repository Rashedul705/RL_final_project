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
  updateItemVariant: (productId: string, oldVariantId: string | undefined, newVariantId: string, newVariantName: string, newAttributes: Record<string, string>) => void;
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

    let targetStock = product.stock;
    if (variantId && product.variants && product.variants.length > 0) {
      const v = product.variants.find((v: any) => (v.id || v._id) === variantId);
      if (v) targetStock = v.stock;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id && item.variantId === variantId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > targetStock) {
          setTimeout(() => {
            toast({
              variant: "destructive",
              title: "Stock limit reached",
              description: `You can only add up to ${targetStock} of ${product.name}${variantName ? ` (${variantName})` : ''}.`,
            });
          }, 0);
          return prevCart.map((item) =>
            item.product.id === product.id && item.variantId === variantId
              ? { ...item, quantity: targetStock }
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
      if (quantity > targetStock) {
        setTimeout(() => {
          toast({
            variant: "destructive",
            title: "Stock limit reached",
            description: `You can only add up to ${targetStock} of ${product.name}${variantName ? ` (${variantName})` : ''}.`,
          });
        }, 0);
        return [...prevCart, { product, quantity: targetStock, variantId, variantName, attributes }];
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

    let targetStock = item.product.stock;
    if (variantId && item.product.variants && item.product.variants.length > 0) {
      const v = item.product.variants.find((v: any) => (v.id || v._id) === variantId);
      if (v) targetStock = v.stock;
    }

    if (quantity > targetStock) {
      setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Stock limit reached",
          description: `You can only add up to ${targetStock} of ${item.product.name}${item.variantName ? ` (${item.variantName})` : ''}.`,
        });
      }, 0);
      setCart((prevCart) =>
        prevCart.map((cartItem) =>
          cartItem.product.id === productId && cartItem.variantId === variantId
            ? { ...cartItem, quantity: targetStock }
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

  const updateItemVariant = (productId: string, oldVariantId: string | undefined, newVariantId: string, newVariantName: string, newAttributes: Record<string, string>) => {
    setCart((prevCart) => {
      // Find the item being modified
      const itemToModify = prevCart.find(item => item.product.id === productId && item.variantId === oldVariantId);
      if (!itemToModify) return prevCart;

      // Check if the NEW variant already exists in the cart for this product
      const existingNewVariantItem = prevCart.find(item => item.product.id === productId && item.variantId === newVariantId);

      if (existingNewVariantItem) {
        // If it exists, merge quantities into the existing one and remove the old one
        const mergedQuantity = existingNewVariantItem.quantity + itemToModify.quantity;

        let targetStock = existingNewVariantItem.product.stock;

        // Detailed specific variant stock check
        if (existingNewVariantItem.product.variants && existingNewVariantItem.product.variants.length > 0) {
          const v = existingNewVariantItem.product.variants.find((v: any) => (v.id || v._id) === newVariantId);
          if (v) targetStock = v.stock;
        }

        const cappedQuantity = Math.min(mergedQuantity, targetStock);

        if (mergedQuantity > targetStock) {
          setTimeout(() => {
            toast({
              variant: "destructive",
              title: "Stock limit reached",
              description: `You can only add up to ${targetStock} of this variant.`,
            });
          }, 0);
        }

        return prevCart
          .map(item =>
            item.product.id === productId && item.variantId === newVariantId
              ? { ...item, quantity: cappedQuantity }
              : item
          )
          .filter(item => !(item.product.id === productId && item.variantId === oldVariantId));
      }

      // If it doesn't exist, just update the variant info on the existing item
      return prevCart.map(item => {
        if (item.product.id === productId && item.variantId === oldVariantId) {
          let targetStock = item.product.stock;
          const v = item.product.variants?.find((v: any) => (v.id || v._id) === newVariantId);
          if (v) targetStock = v.stock;

          let newQuantity = item.quantity;
          if (newQuantity > targetStock) {
            newQuantity = targetStock;
            setTimeout(() => {
              toast({
                variant: "destructive",
                title: "Stock limit reached",
                description: `Quantity reduced to ${targetStock} to match available stock for this variant.`,
              });
            }, 0);
          }

          return {
            ...item,
            variantId: newVariantId,
            variantName: newVariantName,
            attributes: newAttributes,
            quantity: newQuantity
          };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, updateItemVariant, clearCart, getItem }}>
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
