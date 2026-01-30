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
