'use client';

import React, { useState } from 'react';
import { Subscription } from '@/types';
import { formatAPR, formatUSD } from '@/lib/calculations';

interface TierBreakdownProps {
    subscriptions: Subscription[];
}

export default function TierBreakdown({ subscriptions }: TierBreakdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    const sortedTiers = [...subscriptions].sort((a, b) => a.tier.min - b.tier.min);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
                <span>{sortedTiers.length} tier{sortedTiers.length > 1 ? 's' : ''}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-20 top-full left-0 mt-2 w-64 glass-card-hover p-4 shadow-xl">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">APR by Tier</h4>
                    <div className="space-y-2">
                        {sortedTiers.map((sub, index) => {
                            const maxDisplay = sub.tier.max === -1
                                ? '∞'
                                : sub.tier.max >= 1000000
                                    ? `${(sub.tier.max / 1000000).toFixed(0)}M`
                                    : formatUSD(sub.tier.max).replace('$', '').replace('.00', '');

                            const minDisplay = sub.tier.min >= 1000000
                                ? `${(sub.tier.min / 1000000).toFixed(0)}M`
                                : formatUSD(sub.tier.min).replace('$', '').replace('.00', '');

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${sub.type === 'bonus'
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {sub.type}
                                        </span>
                                        <span className="text-sm text-gray-300">
                                            ${minDisplay} - ${maxDisplay}
                                        </span>
                                    </div>
                                    <span className="text-crypto-green font-medium">
                                        {formatAPR(sub.apr * 100)}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
