'use client';

import React, { useState } from 'react';
import { EarnProduct } from '@/types';
import { usePortfolio } from '@/context/PortfolioContext';
import { usePrices } from '@/context/PriceContext';
import { capitalizeExchange, formatUSD, nativeToUsd } from '@/lib/calculations';
import { EXCHANGE_ICONS } from '@/constants';
import { isStablecoin } from '@/types';

interface AddToPortfolioModalProps {
    product: EarnProduct;
    onClose: () => void;
}

export default function AddToPortfolioModal({ product, onClose }: AddToPortfolioModalProps) {
    const [amount, setAmount] = useState('');
    const { addPosition } = usePortfolio();
    const { prices } = usePrices();

    const isCrypto = !isStablecoin(product.asset);
    const numAmount = parseFloat(amount) || 0;
    const usdValue = isCrypto ? nativeToUsd(numAmount, product.asset, prices) : numAmount;
    const price = prices[product.asset];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isNaN(numAmount) || numAmount <= 0) return;
        // For non-stablecoins, amount is stored in native tokens
        addPosition({
            exchange: product.name,
            asset: product.asset,
            amount: numAmount,
        });
        onClose();
    };

    const assetColor = product.asset === 'BTC' ? 'text-orange-400'
        : product.asset === 'ETH' ? 'text-gray-300'
        : product.asset === 'SOL' ? 'text-purple-400'
        : product.asset === 'USDT' ? 'text-emerald-400'
        : 'text-blue-400';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass-card p-6 w-full max-w-md animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-xl font-semibold mb-4">Add to Portfolio</h3>

                <div className="mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                        {EXCHANGE_ICONS[product.name.toLowerCase() as keyof typeof EXCHANGE_ICONS] ? (
                            <img
                                src={EXCHANGE_ICONS[product.name.toLowerCase() as keyof typeof EXCHANGE_ICONS]}
                                alt={product.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-crypto-green/30 to-crypto-green/10 flex items-center justify-center text-lg font-bold text-crypto-green">
                                {product.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{capitalizeExchange(product.name)}</p>
                            <p className={`text-sm ${assetColor}`}>{product.asset}</p>
                        </div>
                        {isCrypto && price && (
                            <div className="ml-auto text-right">
                                <p className="text-xs text-gray-500">Current price</p>
                                <p className="text-sm font-medium">{formatUSD(price)}</p>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {isCrypto ? `Deposit Amount (${product.asset})` : 'Deposit Amount ($)'}
                        </label>
                        <div className="relative">
                            {!isCrypto && (
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            )}
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={isCrypto ? `0.00 ${product.asset}` : 'Enter amount'}
                                className={`input-field ${!isCrypto ? 'pl-8' : 'pl-4'} w-full`}
                                min="0"
                                step={isCrypto ? '0.000001' : '0.01'}
                                autoFocus
                            />
                            {isCrypto && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                                    {product.asset}
                                </span>
                            )}
                        </div>

                        {/* USD equivalent for crypto */}
                        {isCrypto && numAmount > 0 && (
                            <p className="mt-1.5 text-sm text-gray-400">
                                ≈ {price ? formatUSD(usdValue) : 'Price unavailable'}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!amount || numAmount <= 0}
                            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Position
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
