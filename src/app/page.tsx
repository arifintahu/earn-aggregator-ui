'use client';

import { useState, useEffect, useMemo } from 'react';
import { useEarnProducts } from '@/hooks/useEarnProducts';
import { useApiHealth } from '@/hooks/useApiHealth';
import MarketOverview from '@/components/MarketOverview';
import YieldSimulator from '@/components/YieldSimulator';
import PortfolioTracker from '@/components/PortfolioTracker';

export default function Home() {
  const { products, loading, error } = useEarnProducts();
  const apiHealth = useApiHealth();

  // Track selected product keys for yield simulator (default: all selected)
  const [selectedProductKeys, setSelectedProductKeys] = useState<Set<string>>(new Set());

  // Generate a unique key for each product
  const getProductKey = (product: { name: string; asset: string }) =>
    `${product.name}-${product.asset}`;

  // Initialize all products as selected when products load
  useEffect(() => {
    if (products.length > 0 && selectedProductKeys.size === 0) {
      const allKeys = new Set(products.map(getProductKey));
      setSelectedProductKeys(allKeys);
    }
  }, [products]);

  // Toggle a single product's selection
  const toggleProductSelection = (productKey: string) => {
    setSelectedProductKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productKey)) {
        newSet.delete(productKey);
      } else {
        newSet.add(productKey);
      }
      return newSet;
    });
  };

  // Select/Deselect all products
  const toggleAllProducts = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedProductKeys(new Set(products.map(getProductKey)));
    } else {
      setSelectedProductKeys(new Set());
    }
  };

  // Filter products for yield simulator based on selection
  const selectedProducts = useMemo(() => {
    return products.filter(p => selectedProductKeys.has(getProductKey(p)));
  }, [products, selectedProductKeys]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">Earn</span> Aggregator
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Compare Simple Earn yields across top exchanges
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${apiHealth.loading
                ? 'bg-yellow-400 animate-pulse'
                : apiHealth.healthy
                  ? 'bg-crypto-green animate-pulse'
                  : 'bg-red-400'
                }`}></div>
              <span className={`${apiHealth.loading
                ? 'text-yellow-400'
                : apiHealth.healthy
                  ? 'text-gray-400'
                  : 'text-red-400'
                }`}>
                {apiHealth.loading
                  ? 'Connecting...'
                  : apiHealth.healthy
                    ? 'API Online'
                    : 'API Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Overview - Full width on mobile, 2 cols on desktop */}
          <div className="lg:col-span-2">
            <MarketOverview
              products={products}
              loading={loading}
              error={error}
              selectedProductKeys={selectedProductKeys}
              onToggleProduct={toggleProductSelection}
              onToggleAll={toggleAllProducts}
              getProductKey={getProductKey}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <YieldSimulator products={selectedProducts} />
            <PortfolioTracker products={products} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-500">
              Data sourced from Binance, Bybit, Bitget APIs
            </p>
            <p className="text-sm text-gray-500">
              Portfolio data stored locally in your browser
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
