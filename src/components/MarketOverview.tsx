'use client';

import React, { useState, useMemo } from 'react';
import { EarnProduct } from '@/types';
import { getMaxApr, formatAPR, getRelativeTime, capitalizeExchange } from '@/lib/calculations';
import { usePortfolio } from '@/context/PortfolioContext';
import AddToPortfolioModal from './AddToPortfolioModal';
import TierBreakdown from './TierBreakdown';

interface MarketOverviewProps {
    products: EarnProduct[];
    loading: boolean;
    error: string | null;
}

type AssetFilter = 'ALL' | 'USDT' | 'USDC';
type SortBy = 'exchange' | 'apr';
type SortOrder = 'asc' | 'desc';

export default function MarketOverview({ products, loading, error }: MarketOverviewProps) {
    const [assetFilter, setAssetFilter] = useState<AssetFilter>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('apr');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [selectedProduct, setSelectedProduct] = useState<EarnProduct | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Filter by asset
        if (assetFilter !== 'ALL') {
            filtered = filtered.filter(p => p.asset === assetFilter);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'exchange') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'apr') {
                comparison = getMaxApr(a.subscriptions) - getMaxApr(b.subscriptions);
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });

        return filtered;
    }, [products, assetFilter, searchQuery, sortBy, sortOrder]);

    const handleSort = (column: SortBy) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const handleAddToPortfolio = (product: EarnProduct) => {
        setSelectedProduct(product);
        setShowAddModal(true);
    };

    if (loading) {
        return (
            <div className="glass-card p-8">
                <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin h-6 w-6 border-2 border-crypto-green border-t-transparent rounded-full"></div>
                    <span className="text-gray-400">Loading market data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-8">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="glass-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <h2 className="text-xl font-semibold">Market Overview</h2>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search exchange..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-10 w-full sm:w-48"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        {/* Asset Filter */}
                        <div className="flex rounded-lg overflow-hidden border border-white/10">
                            {(['ALL', 'USDT', 'USDC'] as AssetFilter[]).map((asset) => (
                                <button
                                    key={asset}
                                    onClick={() => setAssetFilter(asset)}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${assetFilter === asset
                                            ? 'bg-crypto-green/20 text-crypto-green'
                                            : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {asset}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th
                                    className="text-left py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                                    onClick={() => handleSort('exchange')}
                                >
                                    <div className="flex items-center gap-2">
                                        Exchange
                                        {sortBy === 'exchange' && (
                                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                                    Asset
                                </th>
                                <th
                                    className="text-left py-3 px-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                                    onClick={() => handleSort('apr')}
                                >
                                    <div className="flex items-center gap-2">
                                        Max APR
                                        {sortBy === 'apr' && (
                                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                                    Tier Details
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                                    Updated
                                </th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product, index) => (
                                <tr
                                    key={`${product.name}-${product.asset}`}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crypto-green/30 to-crypto-green/10 flex items-center justify-center text-sm font-bold text-crypto-green">
                                                {product.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{capitalizeExchange(product.name)}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${product.asset === 'USDT'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {product.asset}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-crypto-green font-semibold text-lg">
                                            {formatAPR(getMaxApr(product.subscriptions))}%
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <TierBreakdown subscriptions={product.subscriptions} />
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-400">
                                        {getRelativeTime(product.updatedAt)}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button
                                            onClick={() => handleAddToPortfolio(product)}
                                            className="btn-secondary text-sm"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        No products found matching your criteria
                    </div>
                )}
            </div>

            {/* Add to Portfolio Modal */}
            {showAddModal && selectedProduct && (
                <AddToPortfolioModal
                    product={selectedProduct}
                    onClose={() => {
                        setShowAddModal(false);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </>
    );
}
