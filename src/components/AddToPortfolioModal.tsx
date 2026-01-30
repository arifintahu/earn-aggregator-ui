'use client';

import React, { useState } from 'react';
import { EarnProduct } from '@/types';
import { usePortfolio } from '@/context/PortfolioContext';
import { capitalizeExchange } from '@/lib/calculations';
import { EXCHANGE_ICONS } from '@/constants';

interface AddToPortfolioModalProps {
    product: EarnProduct;
    onClose: () => void;
}

export default function AddToPortfolioModal({ product, onClose }: AddToPortfolioModalProps) {
    const [amount, setAmount] = useState('');
    const { addPosition } = usePortfolio();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        addPosition({
            exchange: product.name,
            asset: product.asset,
            amount: numAmount,
        });

        onClose();
    };

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
                            <p className={`text-sm ${product.asset === 'USDT' ? 'text-emerald-400' : 'text-blue-400'
                                }`}>
                                {product.asset}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Deposit Amount ($)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="input-field pl-8 w-full"
                                min="0"
                                step="0.01"
                                autoFocus
                            />
                        </div>
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
                            disabled={!amount || parseFloat(amount) <= 0}
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
