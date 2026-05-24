'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { EarnProduct, Subscription, AssetSymbol, isStablecoin } from '@/types';
import {
  calculateEffectiveYield,
  getMaxApr,
  formatAPR,
  getRelativeTime,
} from '@/lib/calculations';
import { Icon } from '@/components/ui/Icon';
import { ExchangeMark } from '@/components/ui/ExchangeMark';
import { AssetCoin } from '@/components/ui/AssetBadge';
import { MetricChip } from '@/components/ui/MetricChip';
import { TierRow } from '@/components/ui/TierRow';
import { EXCHANGE_META, EXCHANGES } from '@/constants';

// ─── TierCurveChart ───────────────────────────────────────────────────────────

interface TierCurveChartProps {
  subs: Subscription[];
  asset: AssetSymbol;
}

function TierCurveChart({ subs, asset }: TierCurveChartProps) {
  if (!subs || subs.length === 0) return null;

  const sortedSubs = [...subs].sort((a, b) => a.tier.min - b.tier.min);
  const isCrypto = !isStablecoin(asset);

  // Determine totalMax: the largest finite tier.max
  const finiteMaxes = sortedSubs.map(s => s.tier.max).filter(m => m !== -1);
  const defaultMax = isCrypto ? 100 : 1_000_000;
  const totalMax = finiteMaxes.length > 0 ? Math.max(...finiteMaxes) : defaultMax;

  const maxAprDecimal = Math.max(...sortedSubs.map(s => s.apr));
  const aprMax = Math.max(maxAprDecimal * 100 * 1.2, 5);

  const toX = (v: number): number => {
    const logMin = 0;
    const logMax = Math.log10(Math.max(totalMax, 1));
    if (logMax === 0) return 10;
    return 10 + ((Math.log10(Math.max(v, 1)) - logMin) / (logMax - logMin)) * 360;
  };

  const toY = (aprPct: number): number => {
    return 180 - (aprPct / aprMax) * 150;
  };

  // Build effective-APR filled curve using 60 log-sampled points
  const numSamples = 60;
  const effectivePoints: Array<[number, number]> = [];
  for (let i = 0; i < numSamples; i++) {
    const t = i / (numSamples - 1);
    const logMin = Math.log10(1);
    const logMax = Math.log10(Math.max(totalMax, 1));
    const amount = Math.pow(10, logMin + t * (logMax - logMin));
    const result = calculateEffectiveYield(amount, sortedSubs);
    const px = toX(amount);
    const py = toY(result.effectiveApr);
    effectivePoints.push([px, py]);
  }

  const polylineStr = effectivePoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  // Area fill path: polyline + down to bottom + back to start
  const bottomY = 180;
  const firstPt = effectivePoints[0];
  const lastPt = effectivePoints[effectivePoints.length - 1];
  const areaPath =
    `M ${firstPt[0].toFixed(1)} ${firstPt[1].toFixed(1)} ` +
    effectivePoints.slice(1).map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') +
    ` L ${lastPt[0].toFixed(1)} ${bottomY} L ${firstPt[0].toFixed(1)} ${bottomY} Z`;

  // Y grid lines (25%, 50%, 75% of aprMax)
  const yGridValues = [0.25, 0.5, 0.75].map(f => f * aprMax);

  // X axis tick labels
  const xTicks = isCrypto
    ? [0.01, 0.1, 1, 10, 100].filter(v => v <= totalMax)
    : [1, 10, 100, 1_000, 10_000, 100_000].filter(v => v <= totalMax * 1.1);

  const gradientId = `curveGrad_${asset}`;

  return (
    <svg
      width="100%"
      height={200}
      viewBox="0 0 400 200"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y grid lines */}
      {yGridValues.map((val) => {
        const gy = toY(val);
        return (
          <g key={val}>
            <line
              x1={10} y1={gy} x2={370} y2={gy}
              stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3 4"
            />
            <text
              x={6} y={gy + 3}
              fill="var(--text-4)"
              fontSize={9}
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              {val.toFixed(0)}%
            </text>
          </g>
        );
      })}

      {/* X axis tick labels */}
      {xTicks.map((v) => {
        const tx = toX(v);
        const label = isCrypto
          ? v >= 1 ? `${v}` : v.toFixed(2)
          : v >= 1000 ? `$${v / 1000}k` : `$${v}`;
        return (
          <text
            key={v}
            x={tx} y={196}
            fill="var(--text-4)"
            fontSize={9}
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            {label}
          </text>
        );
      })}

      {/* Effective APR filled area */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Effective APR polyline */}
      <polyline
        points={polylineStr}
        fill="none"
        stroke="var(--accent-1)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />

      {/* Tier step-function lines */}
      {sortedSubs.map((sub, i) => {
        const xStart = toX(sub.tier.min === 0 ? 1 : sub.tier.min);
        const xEnd = toX(sub.tier.max === -1 ? totalMax : sub.tier.max);
        const y = toY(sub.apr * 100);
        const color = sub.type === 'bonus' ? '#fcd34d' : 'var(--accent-2)';
        const prevSub = i > 0 ? sortedSubs[i - 1] : null;
        return (
          <g key={`${sub.type}-${sub.tier.min}`}>
            {prevSub && (
              <line
                x1={xStart} y1={toY(prevSub.apr * 100)}
                x2={xStart} y2={y}
                stroke={color} strokeWidth={1} opacity={0.5}
              />
            )}
            <line
              x1={xStart} y1={y} x2={xEnd} y2={y}
              stroke={color} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.75}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── ExchangeCompareBars ──────────────────────────────────────────────────────

interface ExchangeCompareBarsProps {
  allProducts: EarnProduct[];
  currentExchange: string;
  asset: AssetSymbol;
}

function ExchangeCompareBars({ allProducts, currentExchange, asset }: ExchangeCompareBarsProps) {
  const current = currentExchange.toLowerCase();

  // Build per-exchange max APR for this asset
  const rows = EXCHANGES.map((ex) => {
    const product = allProducts.find(
      (p) => p.name.toLowerCase() === ex && p.asset === asset
    );
    const maxApr = product ? getMaxApr(product.subscriptions) : 0;
    return { name: ex, maxApr };
  }).filter((r) => r.maxApr > 0);

  if (rows.length === 0) return (
    <div style={{ color: 'var(--text-4)', fontSize: 12, padding: '8px 0' }}>
      No data for {asset} on other exchanges
    </div>
  );

  const ceiling = Math.max(...rows.map((r) => r.maxApr));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {rows.map((row) => {
        const isCurrent = row.name === current;
        const widthPct = ceiling > 0 ? (row.maxApr / ceiling) * 100 : 0;
        return (
          <div
            key={row.name}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}
          >
            <ExchangeMark name={row.name} size={22} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: 'var(--surface-2)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${widthPct}%`,
                    background: isCurrent
                      ? 'linear-gradient(90deg, var(--accent-1), var(--accent-2))'
                      : 'var(--surface-3)',
                    boxShadow: isCurrent
                      ? '0 0 8px color-mix(in oklch, var(--accent-1) 60%, transparent)'
                      : 'none',
                    borderRadius: 3,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
            <span
              className="ea-num"
              style={{
                fontSize: 12,
                color: isCurrent ? 'var(--accent-1)' : 'var(--text-3)',
                width: 52,
                textAlign: 'right',
              }}
            >
              {formatAPR(row.maxApr)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── ExchangeDetail ───────────────────────────────────────────────────────────

interface ExchangeDetailProps {
  exchange: string;
  allProducts: EarnProduct[];
  onClose: () => void;
  onAddPortfolio: (p: EarnProduct) => void;
}

export default function ExchangeDetail({
  exchange,
  allProducts,
  onClose,
  onAddPortfolio,
}: ExchangeDetailProps) {
  const exchangeLower = exchange.toLowerCase();
  const meta = EXCHANGE_META[exchangeLower] ?? { color: '#888', glyph: '?', long: exchange };

  // Products for this exchange
  const thisProducts = useMemo(
    () => allProducts.filter((p) => p.name.toLowerCase() === exchangeLower),
    [allProducts, exchangeLower]
  );

  // Unique assets for this exchange
  const assets = useMemo<AssetSymbol[]>(
    () => Array.from(new Set(thisProducts.map((p) => p.asset))),
    [thisProducts]
  );

  const [selectedAsset, setSelectedAsset] = useState<AssetSymbol>(
    assets[0] ?? 'USDT'
  );

  // Keep selectedAsset valid if assets change
  useEffect(() => {
    if (assets.length > 0 && !assets.includes(selectedAsset)) {
      setSelectedAsset(assets[0]);
    }
  }, [assets, selectedAsset]);

  const selectedProduct = useMemo(
    () => thisProducts.find((p) => p.asset === selectedAsset),
    [thisProducts, selectedAsset]
  );

  const subs = selectedProduct?.subscriptions ?? [];
  const sortedSubs = useMemo(
    () => [...subs].sort((a, b) => a.tier.min - b.tier.min),
    [subs]
  );

  const maxApr = subs.length > 0 ? getMaxApr(subs) : 0;
  const bonusSub = subs.find((s) => s.type === 'bonus');
  const baseSub = subs.find((s) => s.type === 'base');

  // Relative time from latest updatedAt in thisProducts
  const updatedAt = useMemo(() => {
    const dates = thisProducts.map((p) => p.updatedAt).filter(Boolean);
    if (dates.length === 0) return '';
    const latest = dates.reduce((a, b) => (a > b ? a : b));
    return getRelativeTime(latest);
  }, [thisProducts]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Bonus cap display
  const bonusCapValue = useMemo(() => {
    if (!bonusSub) return '—';
    if (bonusSub.tier.max === -1) return '∞';
    if (isStablecoin(selectedAsset)) {
      return `$${bonusSub.tier.max.toLocaleString()}`;
    }
    return `${bonusSub.tier.max} ${selectedAsset}`;
  }, [bonusSub, selectedAsset]);

  const baseAprValue = baseSub ? `${formatAPR(baseSub.apr * 100)}%` : '—';

  return (
    <div
      className="ea-modal-backdrop"
      style={{ alignItems: 'flex-start', overflowY: 'auto' }}
      onClick={onClose}
    >
      {/* Content panel — stops propagation */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'var(--bg-1)',
          margin: '24px auto',
          borderRadius: 'var(--radius-1)',
          maxWidth: 900,
          width: '100%',
          maxHeight: 'calc(100vh - 48px)',
          overflow: 'hidden auto',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
          animation: 'ea-pop 200ms cubic-bezier(0.22,1.2,0.36,1)',
        }}
      >
        {/* Exchange color radial glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${meta.color}22 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* ── Header ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '24px 28px 20px',
            borderBottom: '1px solid var(--border-1)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          {/* Back button */}
          <button
            className="ea-btn ea-btn-ghost"
            onClick={onClose}
            style={{ padding: '6px 8px', marginTop: 2, flexShrink: 0 }}
            aria-label="Back"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </button>

          {/* Exchange mark */}
          <ExchangeMark name={exchangeLower} size={48} />

          {/* Exchange info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 className="ea-h1" style={{ margin: 0 }}>{meta.long}</h1>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  color: 'var(--text-3)',
                  textDecoration: 'none',
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--border-1)',
                  background: 'var(--surface-1)',
                }}
              >
                View on Exchange
                <Icon name="arrow-right" size={12} />
              </a>
            </div>
            <p
              className="ea-mono-label"
              style={{ marginTop: 6, color: 'var(--text-3)' }}
            >
              {assets.length} asset{assets.length !== 1 ? 's' : ''}
              {updatedAt ? ` · updated ${updatedAt}` : ''}
            </p>
          </div>

          {/* Close button */}
          <button
            className="ea-btn ea-btn-ghost"
            onClick={onClose}
            style={{ padding: '6px 8px', flexShrink: 0 }}
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* ── Asset Switcher ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '14px 28px',
            borderBottom: '1px solid var(--border-1)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {assets.map((asset) => {
            const product = thisProducts.find((p) => p.asset === asset);
            const apr = product ? getMaxApr(product.subscriptions) : 0;
            const isActive = asset === selectedAsset;
            return (
              <button
                key={asset}
                className={isActive ? 'ea-chip ea-chip-active' : 'ea-chip'}
                onClick={() => setSelectedAsset(asset)}
              >
                <AssetCoin asset={asset} size={18} />
                <span>{asset}</span>
                {apr > 0 && (
                  <span style={{ opacity: 0.75 }}>· {formatAPR(apr)}%</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '20px 28px 28px',
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 16,
          }}
        >
          {/* Left column: Tier Curve */}
          <div className="ea-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 className="ea-h2" style={{ margin: 0 }}>Tier Curve</h2>

            {/* SVG Chart */}
            {selectedProduct && sortedSubs.length > 0 ? (
              <TierCurveChart subs={sortedSubs} asset={selectedAsset} />
            ) : (
              <div
                style={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-4)',
                  fontSize: 13,
                }}
              >
                No tier data
              </div>
            )}

            {/* Tier ladder */}
            {sortedSubs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p className="ea-mono-label" style={{ marginBottom: 4 }}>Tier Ladder</p>
                {sortedSubs.map((sub) => (
                  <TierRow key={`${sub.type}-${sub.tier.min}`} sub={sub} asset={selectedAsset} />
                ))}
              </div>
            )}

            {/* Track button */}
            {selectedProduct && (
              <button
                className="ea-btn ea-btn-primary"
                onClick={() => onAddPortfolio(selectedProduct)}
                style={{ marginTop: 4 }}
              >
                <Icon name="plus" size={14} stroke="#04140d" />
                Track {selectedAsset}
              </button>
            )}
          </div>

          {/* Right column: Compare + Stats */}
          <div className="ea-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 className="ea-h2" style={{ margin: 0 }}>Vs. Other Exchanges</h2>

            <ExchangeCompareBars
              allProducts={allProducts}
              currentExchange={exchangeLower}
              asset={selectedAsset}
            />

            <div className="ea-divider" style={{ margin: '4px 0' }} />

            {/* Quick stats grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              <MetricChip label="Max APR" value={`${formatAPR(maxApr)}%`} />
              <MetricChip label="Tiers" value={subs.length} />
              <MetricChip label="Bonus cap" value={bonusCapValue} />
              <MetricChip label="Base APR" value={baseAprValue} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
