'use client';

import React, { useState, useMemo } from 'react';
import { EarnProduct } from '@/types';
import { usePortfolio } from '@/context/PortfolioContext';
import { usePrices } from '@/context/PriceContext';
import { isStablecoin, AssetSymbol } from '@/types';
import {
  calculatePortfolioMetrics, formatAPR, formatUSD, formatNative, formatUSDCompact,
  capitalizeExchange, calculateEffectiveYield, normalizeToUsd, nativeToUsd,
} from '@/lib/calculations';
import { Icon } from '@/components/ui/Icon';
import { ExchangeMark } from '@/components/ui/ExchangeMark';
import { AssetBadge } from '@/components/ui/AssetBadge';
import { CompositionDonut } from '@/components/ui/CompositionDonut';
import { MetricChip } from '@/components/ui/MetricChip';

interface PortfolioTrackerProps {
  products: EarnProduct[];
}

export default function PortfolioTracker({ products }: PortfolioTrackerProps) {
  const { positions, updatePosition, removePosition, clearPortfolio } = usePortfolio();
  const { prices } = usePrices();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const metrics = useMemo(
    () => calculatePortfolioMetrics(positions, products, prices),
    [positions, products, prices]
  );

  const composition = useMemo(() => {
    const byAsset: Record<string, number> = {};
    let total = 0;
    for (const pos of positions) {
      const usd = nativeToUsd(pos.amount, pos.asset, prices);
      byAsset[pos.asset] = (byAsset[pos.asset] ?? 0) + usd;
      total += usd;
    }
    return { byAsset, total };
  }, [positions, prices]);

  const getPositionYield = (pos: { exchange: string; asset: AssetSymbol; amount: number }) => {
    const product = products.find(p => p.name === pos.exchange && p.asset === pos.asset);
    if (!product) return null;
    const normalized = normalizeToUsd(product, prices);
    const usd = isStablecoin(pos.asset) ? pos.amount : nativeToUsd(pos.amount, pos.asset, prices);
    return calculateEffectiveYield(usd, normalized.subscriptions);
  };

  const handleEditSave = (id: string) => {
    const n = parseFloat(editAmount);
    if (!isNaN(n) && n > 0) updatePosition(id, { amount: n });
    setEditingId(null);
    setEditAmount('');
  };

  return (
    <div className="ea-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--border-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-1)',
          }}>
            <Icon name="wallet" size={16} />
          </div>
          <div>
            <h2 className="ea-h2">Portfolio</h2>
            <div className="ea-mono-label">Stored locally, never sent off-device</div>
          </div>
        </div>
        {positions.length > 0 && (
          <button
            onClick={clearPortfolio}
            style={{ all: 'unset', color: 'var(--text-3)', fontSize: 12, cursor: 'pointer' }}
          >
            Clear all
          </button>
        )}
      </div>

      {positions.length > 0 ? (
        <>
          {/* Summary */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14,
            padding: '14px 0 16px', borderBottom: '1px dashed var(--border-1)', marginBottom: 12,
          }}>
            <div>
              <div className="ea-mono-label">Total Balance</div>
              <div className="ea-num-lg" style={{ marginTop: 4 }}>{formatUSD(metrics.totalBalance)}</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'var(--text-3)', flexWrap: 'wrap' }}>
                <span><span className="ea-num ea-accent">{formatAPR(metrics.weightedAvgApr)}%</span> avg APR</span>
                <span>·</span>
                <span><span className="ea-num ea-accent">+{formatUSDCompact(metrics.totalDailyIncome)}</span>/day</span>
              </div>
            </div>
            <CompositionDonut byAsset={composition.byAsset} total={composition.total} size={70} />
          </div>

          {/* Metric chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
            <MetricChip label="Monthly" value={formatUSDCompact(metrics.totalMonthlyIncome)} />
            <MetricChip label="Annual" value={formatUSDCompact(metrics.totalDailyIncome * 365)} />
          </div>

          {/* Positions */}
          <div className="ea-mono-label" style={{ marginBottom: 8 }}>Positions · {positions.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {positions.map(pos => {
              const isEditing = editingId === pos.id;
              const y = getPositionYield(pos);
              const isCrypto = !isStablecoin(pos.asset);
              const usdValue = isCrypto ? nativeToUsd(pos.amount, pos.asset, prices) : pos.amount;
              return (
                <div key={pos.id} className="ea-inset" style={{ padding: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <ExchangeMark name={pos.exchange} size={28} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{capitalizeExchange(pos.exchange)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <AssetBadge asset={pos.asset} />
                          {y && (
                            <span className="ea-num" style={{ fontSize: 10, color: 'var(--accent-1)' }}>
                              {formatAPR(y.effectiveApr)}% APR
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isEditing && (
                      <div style={{ textAlign: 'right' }}>
                        {isCrypto ? (
                          <>
                            <div className="ea-num" style={{ fontSize: 13, fontWeight: 600 }}>{formatNative(pos.amount, pos.asset)}</div>
                            <div className="ea-num" style={{ fontSize: 10, color: 'var(--text-3)' }}>{formatUSD(usdValue)}</div>
                          </>
                        ) : (
                          <>
                            <div className="ea-num" style={{ fontSize: 13, fontWeight: 600 }}>{formatUSD(pos.amount)}</div>
                            {y && <div className="ea-num" style={{ fontSize: 10, color: 'var(--accent-1)' }}>+{formatUSDCompact(y.dailyReward)}/d</div>}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <input
                        autoFocus
                        type="number"
                        className="ea-input"
                        style={{ fontSize: 13, padding: '6px 10px' }}
                        value={editAmount}
                        onChange={e => setEditAmount(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleEditSave(pos.id)}
                      />
                      <button className="ea-btn ea-btn-primary" onClick={() => handleEditSave(pos.id)}>
                        <Icon name="check" size={12} />
                      </button>
                      <button className="ea-btn" onClick={() => setEditingId(null)}>
                        <Icon name="close" size={12} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 6 }}>
                      <button
                        style={{ all: 'unset', padding: 4, color: 'var(--text-3)', cursor: 'pointer' }}
                        onClick={() => { setEditingId(pos.id); setEditAmount(String(pos.amount)); }}
                      >
                        <Icon name="edit" size={13} />
                      </button>
                      <button
                        style={{ all: 'unset', padding: 4, color: 'var(--text-3)', cursor: 'pointer' }}
                        onClick={() => removePosition(pos.id)}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ padding: '32px 12px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
            background: 'var(--surface-1)', border: '1px solid var(--border-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-3)',
          }}>
            <Icon name="wallet" size={22} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Nothing tracked yet</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, maxWidth: 240, marginInline: 'auto' }}>
            Click <strong>Track</strong> on any row in the Market Overview to add a position here.
          </div>
        </div>
      )}
    </div>
  );
}
