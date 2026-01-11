"use client";

import { CategorySection } from "./category-section";
import { useProducts } from "@/hooks/useProducts";
import { Loader2, AlertCircle } from "lucide-react";
import { Product } from "@/lib/data";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export function ProductCatalog({ initialProducts }: { initialProducts?: Product[] }) {
  const { products: fetchedProducts, loading, error } = useProducts();
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  // Prefer initialProducts if available, otherwise fall back to fetchedProducts
  const products = initialProducts || fetchedProducts;
  const isUsingSSR = !!initialProducts;

  // If we have initial products, we are not loading (unless we want to re-fetch, but for now let's assume SSR is enough)
  const displayLoading = isUsingSSR ? false : loading;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.get<{ id: string, name: string }[]>('/categories');
        if (data) setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  if (displayLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive gap-2">
        <AlertCircle className="h-8 w-8" />
        <p className="text-lg font-medium">Failed to load products</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container pt-4 pb-16 md:pt-6 md:pb-24 space-y-16">
        {categories.map((category) => {
          const categoryProducts = (products as unknown as Product[])
            .filter((product) => product.category === category.id)
            .sort((a, b) => {
              // Out of stock items should go to the bottom
              const aStock = a.stock > 0;
              const bStock = b.stock > 0;
              if (aStock && !bStock) return -1;
              if (!aStock && bStock) return 1;
              return 0;
            });

          if (categoryProducts.length === 0) return null;

          return (
            <CategorySection
              key={category.id}
              category={category}
              products={categoryProducts}
            />
          );
        })}
      </div>
    </div>
  );
}
