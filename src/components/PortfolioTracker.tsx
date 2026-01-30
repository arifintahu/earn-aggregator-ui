'use client';

import React, { useState } from 'react';
import { EarnProduct, PortfolioPosition } from '@/types';
import { usePortfolio } from '@/context/PortfolioContext';
import { EXCHANGE_ICONS } from '@/constants';
import {
    calculatePortfolioMetrics,
    formatAPR,
    formatUSD,
    capitalizeExchange,
    calculateEffectiveYield
} from '@/lib/calculations';

interface PortfolioTrackerProps {
    products: EarnProduct[];
}

export default function PortfolioTracker({ products }: PortfolioTrackerProps) {
    const { positions, updatePosition, removePosition, clearPortfolio } = usePortfolio();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');

    const metrics = calculatePortfolioMetrics(positions, products);

    const handleEditStart = (position: PortfolioPosition) => {
        setEditingId(position.id);
        setEditAmount(position.amount.toString());
    };

    const handleEditSave = (id: string) => {
        const numAmount = parseFloat(editAmount);
        if (!isNaN(numAmount) && numAmount > 0) {
            updatePosition(id, { amount: numAmount });
        }
        setEditingId(null);
        setEditAmount('');
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditAmount('');
    };

    const getPositionYield = (position: PortfolioPosition) => {
        const product = products.find(
            p => p.name.toLowerCase() === position.exchange.toLowerCase() && p.asset === position.asset
        );
        if (product) {
            return calculateEffectiveYield(position.amount, product.subscriptions);
        }
        return null;
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <svg className="w-6 h-6 text-crypto-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Portfolio Tracker
                </h2>

                {positions.length > 0 && (
                    <button
                        onClick={clearPortfolio}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Portfolio Metrics */}
            {positions.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Total Balance</p>
                        <p className="text-lg font-bold truncate">{formatUSD(metrics.totalBalance)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Avg APR</p>
                        <p className="text-lg font-bold text-crypto-green truncate">
                            {formatAPR(metrics.weightedAvgApr)}%
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Daily Income</p>
                        <p className="text-lg font-bold text-crypto-green truncate">
                            {formatUSD(metrics.totalDailyIncome)}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">Monthly Income</p>
                        <p className="text-lg font-bold text-crypto-green truncate">
                            {formatUSD(metrics.totalMonthlyIncome)}
                        </p>
                    </div>
                </div>
            )}

            {/* Positions List */}
            {positions.length > 0 ? (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Your Positions</h3>
                    {positions.map((position) => {
                        const yield_ = getPositionYield(position);
                        const isEditing = editingId === position.id;

                        return (
                            <div
                                key={position.id}
                                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                {/* Top row: Exchange info and amount */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {EXCHANGE_ICONS[position.exchange.toLowerCase() as keyof typeof EXCHANGE_ICONS] ? (
                                            <img
                                                src={EXCHANGE_ICONS[position.exchange.toLowerCase() as keyof typeof EXCHANGE_ICONS]}
                                                alt={position.exchange}
                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crypto-green/30 to-crypto-green/10 flex items-center justify-center text-sm font-bold text-crypto-green flex-shrink-0">
                                                {position.exchange.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{capitalizeExchange(position.exchange)}</p>
                                            <span className={`text-xs ${position.asset === 'USDT' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                                {position.asset}
                                            </span>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-semibold text-sm">{formatUSD(position.amount)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom row: Stats and actions */}
                                <div className="flex items-center justify-between">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 w-full">
                                            <input
                                                type="number"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                className="input-field flex-1 text-sm py-1 px-2"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleEditSave(position.id)}
                                                className="p-1.5 text-crypto-green hover:text-crypto-green/80"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={handleEditCancel}
                                                className="p-1.5 text-gray-400 hover:text-white"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                {yield_ && (
                                                    <>
                                                        <span className="text-crypto-green">{formatAPR(yield_.effectiveApr)}% APR</span>
                                                        <span>•</span>
                                                        <span className="text-crypto-green">+{formatUSD(yield_.dailyReward)}/day</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEditStart(position)}
                                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => removePosition(position.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <p className="text-gray-400 mb-2">No positions recorded</p>
                    <p className="text-sm text-gray-500">
                        Click the &quot;Add&quot; button on any exchange to track your deposits
                    </p>
                </div>
            )}
        </div>
    );
}
