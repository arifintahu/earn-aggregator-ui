'use client';

import React, { useState, useMemo } from 'react';
import { EarnProduct, ExchangeYieldResult } from '@/types';
import { EXCHANGE_ICONS } from '@/constants';
import { calculateEffectiveYield, calculateOptimalAllocation, getMaxApr, formatAPR, formatUSD, capitalizeExchange } from '@/lib/calculations';

interface YieldSimulatorProps {
    products: EarnProduct[];
}

export default function YieldSimulator({ products }: YieldSimulatorProps) {
    const [amount, setAmount] = useState<string>('1000');
    const [showAllOptions, setShowAllOptions] = useState(false);

    const numAmount = parseFloat(amount) || 0;

    // Calculate optimal allocation across all exchanges
    const optimalAllocation = useMemo(() => {
        return calculateOptimalAllocation(numAmount, products);
    }, [numAmount, products]);

    // Single exchange results for comparison
    const singleExchangeResults = useMemo(() => {
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

        return calculated.sort((a, b) => b.effectiveApr - a.effectiveApr);
    }, [numAmount, products]);

    const bestSingleResult = singleExchangeResults[0];

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
                        className="input-field pl-10 text-xl font-semibold w-full"
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

            {/* Optimal Strategy Section */}
            {numAmount > 0 && optimalAllocation.allocations.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-crypto-green/20 to-transparent border border-crypto-green/30">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-300">Optimal Strategy</span>
                        <span className="text-xs text-gray-500 ml-auto">
                            {optimalAllocation.allocations.length} tier{optimalAllocation.allocations.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* APR Display */}
                    <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-1">Combined Effective APR</p>
                        <p className="text-2xl font-bold text-crypto-green">
                            {formatAPR(optimalAllocation.effectiveApr)}%
                        </p>
                    </div>

                    {/* Comparison with Best Single */}
                    {bestSingleResult && (
                        <div className="mb-4 p-2 rounded-lg bg-white/5">
                            <p className="text-xs text-gray-500 mb-1">vs Best Single Exchange</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                    {capitalizeExchange(bestSingleResult.exchange)} {bestSingleResult.asset}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {formatAPR(bestSingleResult.effectiveApr)}%
                                </span>
                            </div>
                            {optimalAllocation.effectiveApr > bestSingleResult.effectiveApr && (
                                <p className="text-xs text-crypto-green mt-1">
                                    +{formatAPR(optimalAllocation.effectiveApr - bestSingleResult.effectiveApr)}% better
                                </p>
                            )}
                        </div>
                    )}

                    {/* Rewards Summary - 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4 pt-3 border-t border-white/10">
                        <div className="p-2 rounded-lg bg-white/5">
                            <p className="text-xs text-gray-400 mb-1">Daily</p>
                            <p className="font-semibold text-sm text-crypto-green">{formatUSD(optimalAllocation.dailyReward)}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5">
                            <p className="text-xs text-gray-400 mb-1">Monthly</p>
                            <p className="font-semibold text-sm text-crypto-green">{formatUSD(optimalAllocation.monthlyReward)}</p>
                        </div>
                        <div className="col-span-2 p-2 rounded-lg bg-white/5">
                            <p className="text-xs text-gray-400 mb-1">Annual Reward</p>
                            <p className="font-semibold text-crypto-green">{formatUSD(optimalAllocation.totalAnnualReturn)}</p>
                        </div>
                    </div>

                    {/* Allocation Breakdown */}
                    <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-3">Allocation Breakdown</p>
                        <div className="space-y-2">
                            {optimalAllocation.allocations.map((alloc, index) => (
                                <div
                                    key={`${alloc.exchange}-${alloc.asset}-${alloc.tierType}-${index}`}
                                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        {EXCHANGE_ICONS[alloc.exchange.toLowerCase() as keyof typeof EXCHANGE_ICONS] ? (
                                            <img
                                                src={EXCHANGE_ICONS[alloc.exchange.toLowerCase() as keyof typeof EXCHANGE_ICONS]}
                                                alt={alloc.exchange}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crypto-green/30 to-crypto-green/10 flex items-center justify-center text-sm font-bold text-crypto-green">
                                                {alloc.exchange.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{capitalizeExchange(alloc.exchange)}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs ${alloc.asset === 'USDT' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                                    {alloc.asset}
                                                </span>
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${alloc.tierType === 'bonus'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {alloc.tierType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatUSD(alloc.amount)}</p>
                                        <p className="text-xs text-crypto-green">{formatAPR(alloc.apr * 100)}% APR</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle for Single Exchange Options */}
            {numAmount > 0 && singleExchangeResults.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowAllOptions(!showAllOptions)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-3"
                    >
                        <svg
                            className={`w-4 h-4 transition-transform ${showAllOptions ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Single Exchange Options (Ranked)
                    </button>

                    {showAllOptions && (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {singleExchangeResults.map((result, index) => (
                                <div
                                    key={`${result.exchange}-${result.asset}`}
                                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${index === 0
                                        ? 'bg-crypto-green/10 border border-crypto-green/20'
                                        : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500 w-6">#{index + 1}</span>
                                        {EXCHANGE_ICONS[result.exchange.toLowerCase() as keyof typeof EXCHANGE_ICONS] ? (
                                            <img
                                                src={EXCHANGE_ICONS[result.exchange.toLowerCase() as keyof typeof EXCHANGE_ICONS]}
                                                alt={result.exchange}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crypto-green/30 to-crypto-green/10 flex items-center justify-center text-sm font-bold text-crypto-green">
                                                {result.exchange.charAt(0).toUpperCase()}
                                            </div>
                                        )}
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
                    )}
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
