# Product Requirement Document (PRD): Earn Aggregator UI

**Version:** 1.0

**Status:** Draft

**Target Date:** February 2026

**Product Overview:** A web-based dashboard that aggregates "Simple Earn" yields for USDT and USDC from various centralized exchanges (CEXs). The platform allows users to find the best rates, simulate returns based on investment amounts, and track their active portfolio locally.

---

## 1. Objectives & Goals

* **Centralize Yield Data:** Provide a single source of truth for USDT/USDC APRs across multiple exchanges.
* **Yield Optimization:** Help users navigate complex "Tiered APR" structures to maximize returns.
* **Portfolio Tracking:** Allow users to record their positions without needing to connect a wallet or account (Privacy-first/Local Storage).

---

## 2. User Stories

* **As a yield seeker**, I want to compare APRs across Binance, Bybit, etc., so I can move my funds to the highest-paying platform.
* **As a calculator user**, I want to input a specific dollar amount (e.g., $1000) and see my "Effective APR" after accounting for tiered limits.
* **As a portfolio manager**, I want to save my current deposits locally so I can see my total daily earnings across all platforms.

---

## 3. Functional Requirements

### 3.1 Data Integration

* **Endpoint:** `https://earn-aggregator.vercel.app/api/v1/earn-products`
* **Fetch Mechanism:** The UI must fetch fresh data on page load.
* **Data Parsing:**
* Handle `subscriptions` arrays where `type` can be "bonus" or "base".
* Interpret `max: -1` as "No Limit/Infinity".
* Display `updatedAt` to show data freshness.



### 3.2 Market Overview (Table List)

* **Search/Filter:** Filter by asset (USDT or USDC) and Search by CEX name.
* **Table Columns:**
* Exchange (Name + Icon)
* Asset (USDT/USDC)
* Max APR (The highest possible tier)
* Tier Details (A dropdown or tooltip showing the breakdown: e.g., 0-500 @ 18%, 500+ @ 2%).


* **Sort:** Ability to sort by highest APR.

### 3.3 Yield Simulator ("The Optimizer")

* **Input Field:** A numeric input for "Investment Amount ($)".
* **Logic Engine:** * Calculate the **Effective APR** for every CEX based on the input.
* *Example Calculation ($1000 on Binance):* * First $500 @ 18% = $90/year.
* Remaining $500 @ 1.96% = $9.8/year.
* Total = $99.8/year. **Effective APR = 9.98%.**




* **Output Displays:** * Best Exchange recommendation.
* Projected Daily Reward ($).
* Projected Monthly Reward ($).



### 3.4 Local Portfolio Tracker

* **Add to Portfolio:** A "+" button on each CEX row to "Record Deposit."
* **LocalStorage Persistence:** Save an array of objects containing `{exchange, asset, amount, timestamp}`.
* **Portfolio Dashboard:**
* **Total Balance:** Sum of all recorded deposits.
* **Weighted Average APR:** Total annual yield / Total balance.
* **Total Daily Income:** Aggregated daily rewards from all positions.


* **Actions:** Ability to delete or edit recorded positions.

---

## 4. UI/UX Requirements

* **Theme:** Pure Dark Mode.
* **Style:** **Glassmorphism**
* Background: Deep dark gradient (e.g., #0f172a to #000000).
* Cards/Table: Translucent background (`rgba(255, 255, 255, 0.05)`) with `backdrop-filter: blur(12px)`.
* Borders: Thin, subtle borders (`1px solid rgba(255, 255, 255, 0.1)`).


* **Typography:** Clean Sans-serif (Inter or Roboto).
* **Visual Accents:** * APR percentages in "Crypto Green" (#10b981).
* Buttons with subtle glow effects.



---

## 5. Technical Specifications

* **Frontend:** React, Next.js, or Vue 3.
* **State Management:** React Context API or Pinia (to handle portfolio state).
* **Storage:** `window.localStorage`.
* **Styling:** Tailwind CSS (for easy glassmorphism utility classes).
* **Formatting:** * Numbers: 2 decimal places for USD, 2-4 for APR.
* Dates: Relative time (e.g., "Updated 5 mins ago").



---

## 6. Logic Example: Effective APR Calculation

To be implemented in the Simulator component:

```javascript
function calculateEffectiveYield(amount, subscriptions) {
  let totalAnnualReturn = 0;
  let remainingAmount = amount;

  // Sort tiers by min value
  const sortedTiers = subscriptions.sort((a, b) => a.tier.min - b.tier.min);

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

  return { effectiveApr, dailyReward };
}

```

---

## 7. Roadmap & Future Enhancements

* **V1.1:** Add "Redemption Period" info (Instant vs 24h).
* **V1.2:** Push notifications for APR changes.
* **V2.0:** Support for Decentralized Finance (DeFi) protocols (Aave, Compound).