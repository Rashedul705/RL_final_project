import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { IProduct } from '@/lib/models';

export function useProducts() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient.get<IProduct[]>('/products');
            setProducts(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    return { products, loading, error, refetch: fetchProducts };
}
