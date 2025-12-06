
'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { products, type Product } from '@/lib/data';
import { FileText, Search } from 'lucide-react';
import Link from 'next/link';

export function SearchDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (query.length > 1) {
      const lowerCaseQuery = query.toLowerCase();
      const filteredProducts = products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerCaseQuery) ||
          product.description.toLowerCase().includes(lowerCaseQuery) ||
          product.category.toLowerCase().includes(lowerCaseQuery)
      );
      setResults(filteredProducts);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleLinkClick = () => {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Products</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, categories, or descriptions..."
            className="pl-10 text-lg"
          />
        </div>
        <div className="mt-4">
          {results.length > 0 ? (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center gap-4 p-2 -mx-2 rounded-md hover:bg-accent"
                  onClick={handleLinkClick}
                >
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">BDT {product.price.toLocaleString()}</p>
                    </div>
                </Link>
              ))}
            </div>
          ) : query.length > 1 ? (
            <p className="text-center text-muted-foreground py-8">No results found for "{query}"</p>
          ) : (
            <p className="text-center text-muted-foreground py-8">Start typing to search for products.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
