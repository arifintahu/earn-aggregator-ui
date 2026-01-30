'use client';

import React, { useState, useMemo } from 'react';
import { EarnProduct, ExchangeYieldResult } from '@/types';
import { calculateEffectiveYield, getMaxApr, formatAPR, formatUSD, capitalizeExchange } from '@/lib/calculations';

interface YieldSimulatorProps {
    products: EarnProduct[];
}

export default function YieldSimulator({ products }: YieldSimulatorProps) {
    const [amount, setAmount] = useState<string>('1000');

    const results = useMemo(() => {
        const numAmount = parseFloat(amount) || 0;
        if (numAmount <= 0) return [];

        const calculated: ExchangeYieldResult[] = products.map(product => {
            const yield_ = calculateEffectiveYield(numAmount, product.subscriptions);
            return {
                exchange: product.name,
                asset: product.asset,
                maxApr: getMaxApr(product.subscriptions),
                ...yield_,
            };
        });

        // Sort by effective APR descending
        return calculated.sort((a, b) => b.effectiveApr - a.effectiveApr);
    }, [amount, products]);

    const bestResult = results[0];

    const numAmount = parseFloat(amount) || 0;

    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-crypto-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Yield Simulator
            </h2>

            {/* Input Section */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Investment Amount
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="input-field pl-8 text-xl font-semibold w-full"
                        min="0"
                        step="100"
                    />
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {[100, 500, 1000, 5000, 10000].map((preset) => (
                        <button
                            key={preset}
                            onClick={() => setAmount(preset.toString())}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${amount === preset.toString()
                                    ? 'bg-crypto-green/20 text-crypto-green border border-crypto-green/30'
                                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                                }`}
                        >
                            ${preset.toLocaleString()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Best Result Highlight */}
            {bestResult && numAmount > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-crypto-green/20 to-transparent border border-crypto-green/30">
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-300">Best Option</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-crypto-green/30 to-crypto-green/10 flex items-center justify-center text-xl font-bold text-crypto-green">
                                {bestResult.exchange.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{capitalizeExchange(bestResult.exchange)}</p>
                                <p className={`text-sm ${bestResult.asset === 'USDT' ? 'text-emerald-400' : 'text-blue-400'
                                    }`}>
                                    {bestResult.asset}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-crypto-green">
                                {formatAPR(bestResult.effectiveApr)}%
                            </p>
                            <p className="text-sm text-gray-400">Effective APR</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Daily Reward</p>
                            <p className="font-semibold text-crypto-green">{formatUSD(bestResult.dailyReward)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Monthly Reward</p>
                            <p className="font-semibold text-crypto-green">{formatUSD(bestResult.monthlyReward)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Annual Reward</p>
                            <p className="font-semibold text-crypto-green">{formatUSD(bestResult.annualReturn)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* All Results */}
            {numAmount > 0 && results.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">All Options (Ranked)</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {results.map((result, index) => (
                            <div
                                key={`${result.exchange}-${result.asset}`}
                                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${index === 0
                                        ? 'bg-crypto-green/10 border border-crypto-green/20'
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500 w-6">#{index + 1}</span>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crypto-green/30 to-crypto-green/10 flex items-center justify-center text-sm font-bold text-crypto-green">
                                        {result.exchange.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{capitalizeExchange(result.exchange)}</p>
                                        <p className={`text-xs ${result.asset === 'USDT' ? 'text-emerald-400' : 'text-blue-400'
                                            }`}>
                                            {result.asset}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-crypto-green">
                                        {formatAPR(result.effectiveApr)}%
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatUSD(result.dailyReward)}/day
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {numAmount <= 0 && (
                <div className="text-center py-8 text-gray-400">
                    Enter an investment amount to see projected yields
                </div>
            )}
        </div>
    );
}
