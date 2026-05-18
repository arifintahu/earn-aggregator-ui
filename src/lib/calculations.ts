import { Subscription, YieldResult, EarnProduct, PortfolioPosition, AllocationSlot, OptimalAllocation, AssetSymbol, PriceMap, isStablecoin } from '@/types';

export function getAssetBadgeClass(asset: string): string {
  const color =
    asset === 'USDT' ? 'bg-emerald-500/20 text-emerald-400' :
    asset === 'USDC' ? 'bg-blue-500/20 text-blue-400' :
    asset === 'BTC'  ? 'bg-orange-500/20 text-orange-400' :
    asset === 'ETH'  ? 'bg-gray-500/20 text-gray-300' :
    asset === 'SOL'  ? 'bg-purple-500/20 text-purple-400' :
                       'bg-gray-500/20 text-gray-400';
  return `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`;
}

/**
 * Calculate effective yield based on tiered APR structure
 * Example: $1000 on Binance USDT
 * - First $500 @ 18% = $90/year
 * - Remaining $500 @ 1.96% = $9.8/year
 * - Total = $99.8/year, Effective APR = 9.98%
 */
export function calculateEffectiveYield(amount: number, subscriptions: Subscription[]): YieldResult {
    if (amount <= 0) {
        return { effectiveApr: 0, annualReturn: 0, dailyReward: 0, monthlyReward: 0 };
    }

    let totalAnnualReturn = 0;
    let remainingAmount = amount;

    // Sort tiers by min value (ascending)
    const sortedTiers = [...subscriptions].sort((a, b) => a.tier.min - b.tier.min);

    for (const sub of sortedTiers) {
        if (remainingAmount <= 0) break;

        const tierMax = sub.tier.max === -1 ? Infinity : sub.tier.max;
        const tierRange = tierMax - sub.tier.min;
        const amountInTier = Math.min(remainingAmount, tierRange);

        totalAnnualReturn += amountInTier * sub.apr;
        remainingAmount -= amountInTier;
    }

    const effectiveApr = (totalAnnualReturn / amount) * 100;
    const dailyReward = totalAnnualReturn / 365;
    const monthlyReward = totalAnnualReturn / 12;

    return {
        effectiveApr,
        annualReturn: totalAnnualReturn,
        dailyReward,
        monthlyReward,
    };
}

/**
 * Calculate optimal allocation across all exchanges/tiers to maximize returns
 * Uses a greedy algorithm: fill highest-APR tiers first
 */
export function calculateOptimalAllocation(amount: number, products: EarnProduct[]): OptimalAllocation {
    if (amount <= 0 || products.length === 0) {
        return {
            allocations: [],
            totalAmount: 0,
            totalAnnualReturn: 0,
            effectiveApr: 0,
            dailyReward: 0,
            monthlyReward: 0,
        };
    }

    // Build list of all tier slots from all products
    interface TierSlot {
        exchange: string;
        asset: AssetSymbol;
        tierType: 'bonus' | 'base';
        apr: number;
        minAmount: number;
        maxAmount: number; // Infinity for unlimited
    }

    const tierSlots: TierSlot[] = [];

    for (const product of products) {
        for (const sub of product.subscriptions) {
            tierSlots.push({
                exchange: product.name,
                asset: product.asset,
                tierType: sub.type,
                apr: sub.apr,
                minAmount: sub.tier.min,
                maxAmount: sub.tier.max === -1 ? Infinity : sub.tier.max,
            });
        }
    }

    // Sort by APR descending (highest first)
    tierSlots.sort((a, b) => b.apr - a.apr);

    // Greedily fill each tier slot
    let remainingAmount = amount;
    const allocations: AllocationSlot[] = [];

    for (const slot of tierSlots) {
        if (remainingAmount <= 0) break;

        const slotCapacity = slot.maxAmount - slot.minAmount;
        const amountToAllocate = Math.min(remainingAmount, slotCapacity);

        if (amountToAllocate > 0) {
            allocations.push({
                exchange: slot.exchange,
                asset: slot.asset,
                tierType: slot.tierType,
                amount: amountToAllocate,
                apr: slot.apr,
                annualReturn: amountToAllocate * slot.apr,
            });
            remainingAmount -= amountToAllocate;
        }
    }

    // Calculate totals
    const totalAmount = allocations.reduce((sum, a) => sum + a.amount, 0);
    const totalAnnualReturn = allocations.reduce((sum, a) => sum + a.annualReturn, 0);
    const effectiveApr = totalAmount > 0 ? (totalAnnualReturn / totalAmount) * 100 : 0;
    const dailyReward = totalAnnualReturn / 365;
    const monthlyReward = totalAnnualReturn / 12;

    return {
        allocations,
        totalAmount,
        totalAnnualReturn,
        effectiveApr,
        dailyReward,
        monthlyReward,
    };
}

/**
 * Get the maximum APR from a product's subscriptions
 */
export function getMaxApr(subscriptions: Subscription[]): number {
    return Math.max(...subscriptions.map(s => s.apr)) * 100;
}

/**
 * Format APR for display (2-4 decimal places)
 */
export function formatAPR(apr: number): string {
    if (apr >= 10) {
        return apr.toFixed(2);
    }
    return apr.toFixed(apr < 1 ? 4 : 2);
}

/**
 * Format USD amount (2 decimal places)
 */
export function formatUSD(amount: number): string {
    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Get relative time string (e.g., "5 mins ago")
 */
export function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Scale a product's tier thresholds from native token units to USD so that
 * calculateEffectiveYield can accept a plain USD amount for any asset.
 * For stablecoins (1:1 with USD) the product is returned unchanged.
 */
export function normalizeToUsd(product: EarnProduct, prices: PriceMap): EarnProduct {
    if (isStablecoin(product.asset)) return product;
    const price = prices[product.asset];
    if (!price) return product;
    return {
        ...product,
        subscriptions: product.subscriptions.map(sub => ({
            ...sub,
            tier: {
                min: sub.tier.min * price,
                max: sub.tier.max === -1 ? -1 : sub.tier.max * price,
            },
        })),
    };
}

/**
 * Convert a USD amount to native token amount for a given asset.
 * Returns usdAmount unchanged for stablecoins.
 */
export function usdToNative(usdAmount: number, asset: AssetSymbol, prices: PriceMap): number {
    if (isStablecoin(asset)) return usdAmount;
    const price = prices[asset];
    return price ? usdAmount / price : 0;
}

/**
 * Convert a native token amount to USD.
 * Returns nativeAmount unchanged for stablecoins.
 */
export function nativeToUsd(nativeAmount: number, asset: AssetSymbol, prices: PriceMap): number {
    if (isStablecoin(asset)) return nativeAmount;
    const price = prices[asset];
    return price ? nativeAmount * price : 0;
}

/**
 * Format a native token amount for display.
 */
export function formatNative(amount: number, asset: AssetSymbol): string {
    const decimals = asset === 'BTC' ? 6 : asset === 'ETH' ? 5 : 4;
    return `${amount.toFixed(decimals)} ${asset}`;
}

/**
 * Calculate weighted average APR for portfolio.
 * Positions for non-stablecoins store amounts in native token units;
 * pass prices to convert to USD for balance and yield calculations.
 */
export function calculatePortfolioMetrics(
    positions: PortfolioPosition[],
    products: EarnProduct[],
    prices: PriceMap = {}
) {
    if (positions.length === 0) {
        return {
            totalBalance: 0,
            weightedAvgApr: 0,
            totalDailyIncome: 0,
            totalMonthlyIncome: 0,
        };
    }

    let totalBalance = 0;
    let totalAnnualIncome = 0;

    for (const position of positions) {
        const product = products.find(
            p => p.name.toLowerCase() === position.exchange.toLowerCase() && p.asset === position.asset
        );

        const usdAmount = isStablecoin(position.asset)
            ? position.amount
            : nativeToUsd(position.amount, position.asset, prices);

        if (product) {
            const normalized = normalizeToUsd(product, prices);
            const yield_ = calculateEffectiveYield(usdAmount, normalized.subscriptions);
            totalBalance += usdAmount;
            totalAnnualIncome += yield_.annualReturn;
        } else {
            totalBalance += usdAmount;
        }
    }

    const weightedAvgApr = totalBalance > 0 ? (totalAnnualIncome / totalBalance) * 100 : 0;
    const totalDailyIncome = totalAnnualIncome / 365;
    const totalMonthlyIncome = totalAnnualIncome / 12;

    return {
        totalBalance,
        weightedAvgApr,
        totalDailyIncome,
        totalMonthlyIncome,
    };
}

/**
 * Capitalize exchange name
 */
export function capitalizeExchange(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
