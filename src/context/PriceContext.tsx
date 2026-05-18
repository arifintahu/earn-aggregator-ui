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

export function PriceProvider({ children }: { children: React.ReactNode }) {
    const [prices, setPrices] = useState<PriceMap>({});
    const [pricesLoading, setPricesLoading] = useState(true);

    useEffect(() => {
        const ids = Object.values(COINGECKO_IDS).join(',');
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
            .then(r => r.json())
            .then(data => {
                setPrices({
                    BTC: data.bitcoin?.usd,
                    ETH: data.ethereum?.usd,
                    SOL: data.solana?.usd,
                });
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
