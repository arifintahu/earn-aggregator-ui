# Earn Aggregator UI

A modern, responsive frontend for visualizing aggregated flexible earn product APYs from major crypto exchanges. Built with Next.js and TypeScript.

## Features

- **Framework**: Next.js + TypeScript for performance and type safety.
- **Data Source**: Fetches aggregated earn products from [Earn Aggregator API](https://github.com/arifintahu/earn-aggregator).
- **Asset Filtering**: Filter products by asset — USDT, USDC, BTC, ETH, SOL.
- **APR by Tier**: Displays APR breakdown per deposit tier with asset-native units.
- **Exchange Coverage**: Aggregated data from:
  - Binance
  - Bybit
  - Bitget
  - MEXC
  - Gate.io

## Supported Assets

| Asset | Type |
|-------|------|
| USDT | Stablecoin |
| USDC | Stablecoin |
| BTC | Bitcoin |
| ETH | Ethereum |
| SOL | Solana |

## API

Earn products are fetched from:

```
GET https://earn-aggregator.vercel.app/api/v1/earn-products
```

See the [Earn Aggregator API](https://github.com/arifintahu/earn-aggregator) for full API documentation.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run in development mode:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

This project is optimized for [Vercel](https://vercel.com/new) deployment.

1. **Push to GitHub**.
2. **Import Project** in Vercel.
3. **Deploy** — no environment variables required for the UI.
