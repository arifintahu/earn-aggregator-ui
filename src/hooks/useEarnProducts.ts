'use client';

import { useState, useEffect } from 'react';
import { EarnProduct } from '@/types';

const API_URL = '/api/earn-products';

interface UseEarnProductsResult {
    products: EarnProduct[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useEarnProducts(): UseEarnProductsResult {
    const [products, setProducts] = useState<EarnProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }

            const data: EarnProduct[] = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        loading,
        error,
        refetch: fetchProducts,
    };
}
