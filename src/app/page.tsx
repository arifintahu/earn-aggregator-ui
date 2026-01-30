'use client';

import { useEarnProducts } from '@/hooks/useEarnProducts';
import { getRelativeTime } from '@/lib/calculations';
import MarketOverview from '@/components/MarketOverview';
import YieldSimulator from '@/components/YieldSimulator';
import PortfolioTracker from '@/components/PortfolioTracker';

export default function Home() {
  const { products, loading, error, refetch } = useEarnProducts();

  // Get the most recent update time
  const latestUpdate = products.length > 0
    ? products.reduce((latest, product) => {
      const productDate = new Date(product.updatedAt);
      return productDate > latest ? productDate : latest;
    }, new Date(0))
    : null;

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

            <div className="flex items-center gap-4">
              {latestUpdate && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-crypto-green animate-pulse"></div>
                  <span>Updated {getRelativeTime(latestUpdate.toISOString())}</span>
                </div>
              )}
              <button
                onClick={refetch}
                disabled={loading}
                className="btn-secondary text-sm"
              >
                <svg
                  className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Overview - Full width on mobile, 2 cols on desktop */}
          <div className="lg:col-span-2">
            <MarketOverview products={products} loading={loading} error={error} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <YieldSimulator products={products} />
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
