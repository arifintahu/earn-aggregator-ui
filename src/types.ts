// API Response Types
export interface Tier {
  min: number;
  max: number; // -1 means no limit (infinity)
}

export interface Subscription {
  type: 'bonus' | 'base';
  apr: number;
  tier: Tier;
}

export interface EarnProduct {
  name: string;
  asset: 'USDT' | 'USDC';
  subscriptions: Subscription[];
  updatedAt: string;
}

// Portfolio Types
export interface PortfolioPosition {
  id: string;
  exchange: string;
  asset: 'USDT' | 'USDC';
  amount: number;
  timestamp: number;
}

// Calculation Types
export interface YieldResult {
  effectiveApr: number;
  annualReturn: number;
  dailyReward: number;
  monthlyReward: number;
}

export interface ExchangeYieldResult extends YieldResult {
  exchange: string;
  asset: string;
  maxApr: number;
}

// Multi-exchange allocation types
export interface AllocationSlot {
  exchange: string;
  asset: 'USDT' | 'USDC';
  tierType: 'bonus' | 'base';
  amount: number;
  apr: number;           // APR decimal (e.g., 0.18 for 18%)
  annualReturn: number;  // amount * apr
}

export interface OptimalAllocation {
  allocations: AllocationSlot[];
  totalAmount: number;
  totalAnnualReturn: number;
  effectiveApr: number;   // percentage (e.g., 12.5 for 12.5%)
  dailyReward: number;
  monthlyReward: number;
}
