'use client';

import React, { useState, useMemo } from 'react';
import { EarnProduct, ExchangeYieldResult } from '@/types';
import { calculateEffectiveYield, calculateOptimalAllocation, getMaxApr, formatAPR, formatUSDCompact, capitalizeExchange, normalizeToUsd } from '@/lib/calculations';
import { usePrices } from '@/context/PriceContext';
import { Icon } from '@/components/ui/Icon';
import { ExchangeMark } from '@/components/ui/ExchangeMark';
import { AssetBadge } from '@/components/ui/AssetBadge';
import { AllocationDonut } from '@/components/ui/AllocationDonut';
import { EXCHANGE_META } from '@/constants';
import { AllocationSlot } from '@/types';

interface YieldSimulatorProps {
  products: EarnProduct[];
}

export default function YieldSimulator({ products }: YieldSimulatorProps) {
  const [amount, setAmount] = useState('5000');
  const [showAll, setShowAll] = useState(false);
  const { prices } = usePrices();
  const numAmount = parseFloat(amount) || 0;

  const normalizedProducts = useMemo(
    () => products.map(p => normalizeToUsd(p, prices)),
    [products, prices]
  );

  const optimal = useMemo(
    () => calculateOptimalAllocation(numAmount, normalizedProducts),
    [numAmount, normalizedProducts]
  );

  const singleResults = useMemo((): ExchangeYieldResult[] => {
    if (numAmount <= 0) return [];
    return normalizedProducts.map((p, i) => {
      const y = calculateEffectiveYield(numAmount, p.subscriptions);
      return {
        exchange: p.name,
        asset: products[i].asset,
        maxApr: getMaxApr(p.subscriptions),
        ...y,
      };
    }).sort((a, b) => b.effectiveApr - a.effectiveApr);
  }, [numAmount, normalizedProducts, products]);

  const bestSingle = singleResults[0];
  const lift = bestSingle ? optimal.effectiveApr - bestSingle.effectiveApr : 0;

  return (
    <div className="ea-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'color-mix(in oklch, var(--accent-1) 18%, transparent)',
          border: '1px solid color-mix(in oklch, var(--accent-1) 30%, transparent)',
          color: 'var(--accent-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="bolt" size={16} stroke="var(--accent-1)" />
        </div>
        <div>
          <h2 className="ea-h2">Yield Simulator</h2>
          <div className="ea-mono-label">Optimal allocation across selected exchanges</div>
        </div>
      </div>

      {/* Amount input */}
      <div style={{ marginBottom: 14 }}>
        <div className="ea-mono-label" style={{ marginBottom: 6 }}>Investment Amount</div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 18 }}>$</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="ea-input ea-num"
            style={{ paddingLeft: 28, fontSize: 22, fontWeight: 600, padding: '14px 14px 14px 28px' }}
            min="0"
            step="100"
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {[1000, 5000, 10000, 50000, 100000].map(p => (
            <button
              key={p}
              onClick={() => setAmount(String(p))}
              className={`ea-chip${amount === String(p) ? ' ea-chip-active' : ''}`}
            >
              ${p >= 1000 ? (p / 1000) + 'k' : p}
            </button>
          ))}
        </div>
      </div>

      {numAmount <= 0 && (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
          Enter an investment amount to see projected yields
        </div>
      )}

      {numAmount > 0 && optimal.allocations.length > 0 && (
        <>
          {/* APR centerpiece */}
          <div style={{
            position: 'relative', marginBottom: 14, padding: '14px 16px', borderRadius: 14,
            background: 'radial-gradient(180px 100px at 0% 0%, color-mix(in oklch, var(--accent-1) 26%, transparent), transparent 70%)',
            border: '1px solid color-mix(in oklch, var(--accent-1) 24%, transparent)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div className="ea-mono-label" style={{ color: 'var(--accent-1)' }}>Combined Effective APR</div>
                <div className="ea-num-xl ea-accent-glow" style={{ marginTop: 4 }}>
                  {formatAPR(optimal.effectiveApr)}<span style={{ fontSize: 22, color: 'var(--text-3)', marginLeft: 4 }}>%</span>
                </div>
              </div>
              <AllocationDonut allocations={optimal.allocations} size={86} />
            </div>
            {bestSingle && lift > 0.05 && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="arrow-up-right" size={12} stroke="var(--accent-1)" />
                <span className="ea-num">+{formatAPR(lift)}%</span>
                <span style={{ color: 'var(--text-3)' }}>
                  vs best single ({capitalizeExchange(bestSingle.exchange)} {bestSingle.asset})
                </span>
              </div>
            )}
          </div>

          {/* Reward grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            <RewardStat label="Daily" value={formatUSDCompact(optimal.dailyReward)} />
            <RewardStat label="Monthly" value={formatUSDCompact(optimal.monthlyReward)} />
            <RewardStat label="Annual" value={formatUSDCompact(optimal.totalAnnualReturn)} />
          </div>

          {/* Allocation breakdown */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div className="ea-mono-label">Allocation Breakdown</div>
              <div className="ea-mono-label" style={{ color: 'var(--text-3)' }}>
                {optimal.allocations.length} tier{optimal.allocations.length > 1 ? 's' : ''}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {optimal.allocations.map((alloc, i) => (
                <AllocationRow key={i} alloc={alloc} total={optimal.totalAmount} index={i} />
              ))}
            </div>
          </div>

          {/* Single-exchange comparison */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed var(--border-1)' }}>
            <button
              onClick={() => setShowAll(!showAll)}
              style={{ all: 'unset', display: 'flex', alignItems: 'center', gap: 6, padding: 0, color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12 }}
            >
              <Icon name="caret" size={12} />
              {showAll ? 'Hide' : 'Show'} single-exchange comparison
            </button>
            {showAll && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
                {singleResults.map((r, i) => (
                  <SingleRow key={`${r.exchange}-${r.asset}`} result={r} rank={i + 1} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function RewardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ea-inset" style={{ padding: 10 }}>
      <div className="ea-mono-label" style={{ fontSize: 9 }}>{label}</div>
      <div className="ea-num" style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent-1)', marginTop: 2 }}>{value}</div>
    </div>
  );
}

function AllocationRow({ alloc, total, index }: { alloc: AllocationSlot; total: number; index: number }) {
  const share = total > 0 ? alloc.amount / total : 0;
  const meta = EXCHANGE_META[alloc.exchange];
  return (
    <div style={{
      position: 'relative', padding: '10px 12px', borderRadius: 10,
      background: 'var(--surface-1)', border: '1px solid var(--border-1)', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${share * 100}%`,
        background: `linear-gradient(90deg, ${meta?.color ?? 'var(--accent-1)'}30 0%, transparent 100%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span className="ea-mono-label" style={{ width: 14, color: 'var(--text-4)' }}>{index + 1}</span>
          <ExchangeMark name={alloc.exchange} size={26} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{capitalizeExchange(alloc.exchange)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <AssetBadge asset={alloc.asset} />
              <span style={{
                fontSize: 9, padding: '1px 5px', borderRadius: 4,
                background: alloc.tierType === 'bonus' ? 'rgba(252,211,77,0.15)' : 'var(--surface-2)',
                color: alloc.tierType === 'bonus' ? '#fcd34d' : 'var(--text-3)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600,
              }}>{alloc.tierType}</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="ea-num" style={{ fontSize: 13, fontWeight: 600 }}>{formatUSDCompact(alloc.amount)}</div>
          <div className="ea-num" style={{ fontSize: 11, color: 'var(--accent-1)' }}>
            {formatAPR(alloc.apr * 100)}% · {(share * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleRow({ result, rank }: { result: ExchangeYieldResult; rank: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      padding: '8px 10px', borderRadius: 8,
      background: rank === 1 ? 'color-mix(in oklch, var(--accent-1) 10%, transparent)' : 'var(--surface-1)',
      border: rank === 1 ? '1px solid color-mix(in oklch, var(--accent-1) 25%, transparent)' : '1px solid var(--border-1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="ea-mono-label" style={{ width: 16, color: 'var(--text-4)' }}>#{rank}</span>
        <ExchangeMark name={result.exchange} size={22} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{capitalizeExchange(result.exchange)}</span>
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{result.asset}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="ea-num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-1)' }}>{formatAPR(result.effectiveApr)}%</div>
        <div className="ea-num" style={{ fontSize: 10, color: 'var(--text-3)' }}>{formatUSDCompact(result.dailyReward)}/day</div>
      </div>
    </div>
  );
}
