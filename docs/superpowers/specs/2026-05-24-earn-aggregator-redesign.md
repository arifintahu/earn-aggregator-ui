# Earn Aggregator — Glassmorphism Redesign

**Date:** 2026-05-24  
**Source:** `earn.zip` prototype — "Glassy vibrant dark UI"  
**Branch:** `feat/new-design`

---

## Overview

Port the standalone React prototype from `earn.zip` into the existing Next.js 16 / TypeScript codebase. The prototype defines a complete CSS design system (`ea-*` tokens), enhanced versions of every existing component, and two new components (ExchangeDetail overlay, AddToPortfolioModal). Goal: pixel-faithful implementation of the prototype's visual design while keeping all existing data-fetching logic and TypeScript types intact.

---

## 1. CSS / Design System

**File:** `src/app/globals.css`

Replace Tailwind utility usage in components with the `ea-*` design system. Keep `@import "tailwindcss"` for its CSS reset only.

### Design tokens (CSS variables on `:root`)
- **Fonts:** `--font-sans: 'Geist'`, `--font-mono: 'Geist Mono'`
- **Accent:** `--accent-1: #10b981`, `--accent-2: #6ee7b7`, `--accent-glow: rgba(16,185,129,0.55)`
- **Surfaces:** `--bg-0` through `--bg-2`, `--surface-1` through `--surface-3` (rgba white overlays)
- **Borders:** `--border-1` through `--border-3` (rgba white overlays)
- **Text:** `--text-1` through `--text-4` (rgba of `#f3f6f5`)
- **Density:** `--row-py: 14px`, `--card-p: 22px`, `--gap-1: 20px`, `--radius-1: 18px`, `--radius-2: 12px`, `--glow-strength: 1`

### Shell
`.ea-shell`: radial gradient background (two accent glows + dark gradient) + subtle 64px dot-grid via `::before` masked to top.

### Card variants
- `.ea-card`: glassmorphism — `backdrop-filter: blur(18px)`, gradient background, `::after` gradient border via mask-composite
- `.ea-card-hero`: variant with brand radial glow at top-left
- `.ea-inset`: flat surface-1 inner card

### Typography classes
`ea-h1`, `ea-h2`, `ea-h3`, `ea-num`, `ea-num-lg`, `ea-num-xl`, `ea-mono-label`, `ea-accent`, `ea-accent-glow`, `ea-gradient-text`

### Component classes
`ea-btn`, `ea-btn-primary`, `ea-btn-ghost`, `ea-input`, `ea-chip`, `ea-chip-active`, `ea-table` (with `th`/`td`/`tbody tr` rules), `ea-apr-pill`, `ea-bar`/`ea-bar-fill`, `ea-tier-strip`/`ea-tier-block`/`ea-tier-fill`, `ea-check`, `ea-status-dot` (with `pulse` animation), `ea-donut-track`/`ea-donut-seg`, `ea-modal-backdrop`/`ea-modal`, `ea-spark`, `ea-divider`, `ea-hairline`

### Density variants
`[data-density="compact"]` and `[data-density="spacious"]` override `--row-py`, `--card-p`, `--gap-1`.

### Scrollbar
Custom webkit scrollbar scoped to `.ea-shell`.

---

## 2. Layout (`src/app/layout.tsx`)

- Switch font to `Geist` + `Geist Mono` via `next/font/google` (both with `subsets: ['latin']`)
- Pass font CSS variables to `<body>` classname
- Keep existing providers (`PriceProvider`, `PortfolioProvider`, `PWAInstallPopup`)
- Remove `Inter` import

---

## 3. Shared UI Components (`src/components/ui/`)

### `Icon.tsx`
Functional component `Icon({ name, size?, stroke? })`. Inline SVG for: `search`, `plus`, `close`, `check`, `edit`, `trash`, `caret`, `arrow-right`, `arrow-up-right`, `spark`, `wallet`, `sliders`, `chart`, `info`, `bolt`, `globe`, `pulse`, `flame`, `star`, `menu`, `bell`, `columns`.

### `Logomark.tsx`
SVG hex frame + yield-curve path + dot. Uses `--accent-1`/`--accent-2` via inline `linearGradient`. Props: `size` (default 28).

### `ExchangeMark.tsx`
Circular div with exchange color gradient + monogram letter. `EXCHANGE_META` record defines color + glyph for `binance`, `bybit`, `bitget`, `mexc`, `gate`. Props: `name`, `size` (default 32).

### `AssetBadge.tsx`
Two exports:
- `AssetCoin({ asset, size? })`: circular div with asset color + glyph character
- `AssetBadge({ asset })`: pill with 6px colored dot + asset label. `ASSET_META` record for `USDT`, `USDC`, `BTC`, `ETH`, `SOL`.

Add `EXCHANGE_META` and `ASSET_META` to `src/constants.ts` (alongside the existing `EXCHANGE_ICONS`). The new `ExchangeMark` component uses inline monogram circles — `EXCHANGE_ICONS` (image paths) is no longer used in components but kept in the file.

### `MetricChip.tsx`
`MetricChip({ label, value })`: small `ea-inset`-style cell with mono-label + accent value. Shared between `PortfolioTracker` and `ExchangeDetail`.

### `TierStrip.tsx`
`TierStrip({ subs, aprCeiling, asset })`: renders `ea-tier-strip` with one `ea-tier-block` per subscription, `ea-tier-fill` height proportional to `apr / aprCeiling`. Bonus tiers → amber gradient; base tiers → accent gradient. Tooltip via `title` attribute.

### `AllocationDonut.tsx`
`AllocationDonut({ allocations, size? })`: SVG donut, one arc segment per allocation colored by `EXCHANGE_META[exchange].color`. Center label shows "SPLIT" + count. Uses `strokeDasharray` + `strokeDashoffset` for arcs.

### `CompositionDonut.tsx`
`CompositionDonut({ byAsset, total, size? })`: same arc technique, colored by `ASSET_META[asset].color`. Center label shows "MIX" + count.

---

## 4. `src/app/page.tsx` — Desktop Layout

### Header (sticky)
```
[Logomark] [Earn Aggregator] | [Market] [Simulator] [Portfolio] [API ↗]    [BTC $x ETH $x SOL $x] [● API online]
```
- `background: rgba(5,8,10,0.7)` + `backdrop-filter: blur(18px)`
- Price ticker: pill with BTC/ETH/SOL prices from `PriceContext`
- API status: `ea-chip` with `ea-status-dot pulse` + text from `useApiHealth`
- Nav links: active = `surface-1` background, others transparent

### PageHeading hero (two-column)
- **Left card** (`ea-card`): "FLEXIBLE EARN · LIVE" mono label, `ea-gradient-text` h1, subtitle with product/exchange counts, live refresh + price-conversion badges
- **Right card** (`ea-card`): "Top rate right now" label, top product's `ExchangeMark` + name + "bonus tier active" label, huge `ea-num-xl ea-accent-glow` APR number

### Main grid
`display: grid; grid-template-columns: 1fr 380px; gap: var(--gap-1)`  
Left: `MarketOverview`. Right: `YieldSimulator` + `PortfolioTracker` in sticky column.

### Overlays
State: `modalProduct` (for `AddToPortfolioModal`) and `detailExchange` (for `ExchangeDetail`). Both rendered at page root with `position: absolute`.

### Footer
Logomark + exchange source list + "Portfolio data stored locally" — `text-3`, `border-top: border-1`.

---

## 5. `src/components/MarketOverview.tsx`

Wrapper: `ea-card ea-card-hero`, `overflow: hidden`.

**Header row:** `ea-h2` title + mono-label pill (`{n} products · {m} included`) + search input (`ea-input` with `Icon name="search"` absolute-positioned inside).

**Asset filter:** `ea-chip`/`ea-chip-active` row for ALL, USDT, USDC, BTC, ETH, SOL.

**Table:** `ea-table`
- Checkbox column: `ea-check` input (select-all in `<th>`)
- Exchange column: `ExchangeMark` + exchange name + tier count + "bonus" badge; entire cell is a button that calls `onOpenDetail`
- Asset column: `AssetCoin` + asset name
- Max APR column: `ea-apr-pill ea-accent-glow`
- Tier curve column: `TierStrip`
- Updated column: relative time string
- Action column: `ea-btn` "+ Track" → `onAddPortfolio`

Muted rows (unchecked) get `opacity: 0.42`.

Sortable headers for Exchange, Asset, Max APR — active column shows ▲/▼.

New prop: `onOpenDetail(product)` — page passes setter for `detailExchange`.

---

## 6. `src/components/YieldSimulator.tsx`

Header: bolt icon box + "Yield Simulator" h2 + mono-label subtitle.

**Amount input:** `ea-input ea-num` with `$` prefix; quick-amount chips (1k, 5k, 10k, 50k, 100k).

**APR centerpiece panel** (radial-gradient background + accent border):
- Left: "Combined Effective APR" mono-label + `ea-num-xl ea-accent-glow` value
- Right: `AllocationDonut`
- Below: lift vs best single (+X% vs Best Exchange Asset) when lift > 0.05%

**Reward grid:** 3-column — Daily / Monthly / Annual in `ea-inset` cells.

**Allocation breakdown list:** each `AllocationRow` — exchange-colored left-fill bar + `ExchangeMark` + `AssetBadge` + tier type badge + USD amount + APR%.

**Single-exchange comparison** (collapsible): `SingleRow` items ranked #1–N, top rank highlighted in accent.

Accepts `prices` prop (already in `PriceContext` but passed explicitly for component purity).

---

## 7. `src/components/PortfolioTracker.tsx`

Header: wallet icon box + "Portfolio" h2 + "Stored locally" mono-label + "Clear all" ghost button.

**Summary panel** (when positions exist):
- Left: "Total Balance" mono-label + `ea-num-lg` value + avg APR + daily income
- Right: `CompositionDonut`
- Metric chips: Monthly + Annual in 2-col grid

**Position list:** each position in `ea-inset` card:
- `ExchangeMark` + exchange name + `AssetBadge` + effective APR%
- Right: native + USD amounts (or USD + daily reward for stablecoins)
- Edit/trash ghost buttons
- Inline edit: `ea-input` + confirm/cancel buttons

**Empty state:** centered wallet icon + "Nothing tracked yet" message.

---

## 8. `src/components/AddToPortfolioModal.tsx`

`ea-modal-backdrop` (click-outside closes) + `ea-modal` (max-width 460px, pop animation).

**Header:** `ExchangeMark` + exchange name + `AssetBadge` + max APR badge + close button.

**Body:**
- Position size input: `ea-input ea-num` ($ prefix for stablecoins, asset suffix for crypto)
- Quick amounts: crypto-specific (0.01/0.1/1 BTC, 0.5/5/32 ETH, 10/50/200 SOL) or USD (100/1k/5k/25k)
- Yield preview (`ea-inset`): effective APR glow + daily/annual rewards; USD equivalent for crypto
- Tier ladder: sorted tier rows with color dot + type label + range + APR%
- Action buttons: Cancel + "Track position" (primary, disabled when amount ≤ 0)

---

## 9. `src/components/ExchangeDetail.tsx` (new)

Full-viewport overlay (`ea-modal-backdrop`, `alignItems: stretch`, `padding: 0`).

**Header:** back arrow button + `ExchangeMark` (size 48) + exchange name (ea-h1) + asset/update count + "View on Exchange" link + close button. Exchange-colored radial glow behind header.

**Body (scrollable):**
- Asset switcher: `ea-chip`/`ea-chip-active` row with `AssetCoin` + symbol + max APR%
- Two-column grid (`1.4fr 1fr`):
  - **Left card:** "Tier curve" h2 + `TierCurveChart` SVG + tier ladder rows + "Track {asset}" primary button
  - **Right card:** "Vs. other exchanges" + `ExchangeCompareBars` + quick stats grid (Max APR, Tiers, Bonus cap, Base APR)

**`TierCurveChart`:** SVG step-function (tier APR as horizontal lines, gold for bonus) + effective APR curve (filled gradient area + accent line). Log-scale X axis (USD deposit amount). Grid lines + tick labels in `font-mono`.

**`ExchangeCompareBars`:** horizontal bar rows per exchange, current exchange highlighted with accent gradient + glow.

---

## 10. Mobile Responsive

At `max-width: 768px`:
- Header collapses: hide nav links + price ticker, keep Logomark + API chip
- Main grid: single column
- Bottom tab bar (fixed, above safe area): Market / Simulate / Portfolio tabs with active indicator
- `PageHeading`: single column, smaller APR number

Tab bar styles: `position: fixed`, `bottom: 14px`, left/right `12px`, pill shape with glassmorphism background, 3-column grid.

Mobile tab switching is controlled by `activeTab` state in `page.tsx` (default `'market'`). At narrow widths, the main grid is replaced with a single-column view that renders only the active section; the bottom tab bar is shown via CSS `display: none` on desktop and `display: grid` on mobile.

---

## Implementation Order

1. CSS design system (`globals.css` + `layout.tsx` font switch)
2. Shared UI components (`Icon`, `Logomark`, `ExchangeMark`, `AssetBadge`, `TierStrip`, `AllocationDonut`, `CompositionDonut`)
3. `page.tsx` (header + hero + grid + footer shell, overlays wired up)
4. `MarketOverview.tsx`
5. `YieldSimulator.tsx`
6. `PortfolioTracker.tsx`
7. `AddToPortfolioModal.tsx`
8. `ExchangeDetail.tsx`
9. Mobile responsive styles

---

## Constraints

- No new npm packages. Geist font via `next/font/google`.
- All existing data-fetching hooks (`useEarnProducts`, `useApiHealth`, contexts) remain unchanged.
- All existing TypeScript types in `src/types.ts` remain unchanged.
- `earn_extracted/` directory can be deleted after implementation.
