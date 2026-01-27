"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export function CategoryNav() {
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

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

  if (categories.length === 0) return null;

  return (
    <section id="categories" className="pt-12 pb-6 md:pt-16 md:pb-8 bg-background">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {categories.map((category) => (
            <Button asChild key={category.id} variant="outline" size="lg" className="text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href={`#${category.id}`}>{category.name}</Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
