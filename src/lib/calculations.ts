import { Subscription, YieldResult, EarnProduct, PortfolioPosition } from '@/types';

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
 * Calculate weighted average APR for portfolio
 */
export function calculatePortfolioMetrics(
    positions: PortfolioPosition[],
    products: EarnProduct[]
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

        if (product) {
            const yield_ = calculateEffectiveYield(position.amount, product.subscriptions);
            totalBalance += position.amount;
            totalAnnualIncome += yield_.annualReturn;
        } else {
            totalBalance += position.amount;
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
