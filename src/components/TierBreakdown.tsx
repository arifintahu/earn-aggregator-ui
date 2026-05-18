'use client';

import React, { useState } from 'react';
import { Subscription, AssetSymbol } from '@/types';
import { formatAPR, formatUSD } from '@/lib/calculations';

const CRYPTO_ASSETS = new Set<AssetSymbol>(['BTC', 'ETH', 'SOL']);

interface TierBreakdownProps {
    subscriptions: Subscription[];
    asset: AssetSymbol;
}

export default function TierBreakdown({ subscriptions, asset }: TierBreakdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const isCrypto = CRYPTO_ASSETS.has(asset);
    const sortedTiers = [...subscriptions].sort((a, b) => a.tier.min - b.tier.min);

    const formatAmount = (value: number): string => {
        if (isCrypto) {
            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return value % 1 === 0 ? value.toString() : value.toFixed(4).replace(/\.?0+$/, '');
        }
        if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
        return formatUSD(value).replace('$', '').replace('.00', '');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
                <span>{sortedTiers.length} tier{sortedTiers.length > 1 ? 's' : ''}</span>
                <svg
                    className={`cursor-pointer w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-20 top-full left-0 mt-2 w-80 glass-card-hover p-4 shadow-xl">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">APR by Tier</h4>
                    <div className="space-y-2">
                        {sortedTiers.map((sub, index) => {
                            const maxDisplay = sub.tier.max === -1
                                ? '∞'
                                : formatAmount(sub.tier.max);
                            const minDisplay = formatAmount(sub.tier.min);
                            const prefix = isCrypto ? '' : '$';
                            const suffix = isCrypto ? ` ${asset}` : '';

                            return (
                                <div
                                    key={index}
                                    className="py-2 px-3 rounded-lg bg-white/5"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${sub.type === 'bonus'
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {sub.type}
                                            </span>
                                            <span className="text-sm text-gray-300 whitespace-nowrap">
                                                {prefix}{minDisplay} - {prefix}{maxDisplay}{suffix}
                                            </span>
                                        </div>
                                        <span className="text-crypto-green font-medium whitespace-nowrap flex-shrink-0">
                                            {formatAPR(sub.apr * 100)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
