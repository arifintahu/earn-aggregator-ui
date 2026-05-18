'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AssetSymbol } from '@/types';

export type PriceMap = Partial<Record<AssetSymbol, number>>;

interface PriceContextType {
    prices: PriceMap;
    pricesLoading: boolean;
}

const PriceContext = createContext<PriceContextType>({ prices: {}, pricesLoading: true });

const COINGECKO_IDS: Partial<Record<AssetSymbol, string>> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    SOL: 'solana',
};

const CACHE_KEY = 'earn_agg_prices';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface PriceCache {
    prices: PriceMap;
    fetchedAt: number;
}

function readCache(): PriceMap | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const cached: PriceCache = JSON.parse(raw);
        if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
        return cached.prices;
    } catch {
        return null;
    }
}

function writeCache(prices: PriceMap) {
    try {
        const entry: PriceCache = { prices, fetchedAt: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
        // localStorage unavailable (SSR, private mode) — silently skip
    }
}

export function PriceProvider({ children }: { children: React.ReactNode }) {
    const [prices, setPrices] = useState<PriceMap>({});
    const [pricesLoading, setPricesLoading] = useState(true);

    useEffect(() => {
        const cached = readCache();
        if (cached) {
            setPrices(cached);
            setPricesLoading(false);
            return;
        }

        const ids = Object.values(COINGECKO_IDS).join(',');
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
            .then(r => r.json())
            .then(data => {
                const fresh: PriceMap = {
                    BTC: data.bitcoin?.usd,
                    ETH: data.ethereum?.usd,
                    SOL: data.solana?.usd,
                };
                writeCache(fresh);
                setPrices(fresh);
            })
            .catch(() => {})
            .finally(() => setPricesLoading(false));
    }, []);

    return (
        <PriceContext.Provider value={{ prices, pricesLoading }}>
            {children}
        </PriceContext.Provider>
    );
}

export function usePrices() {
    return useContext(PriceContext);
}
