'use client';

import React, { useState, useMemo } from 'react';
import { EarnProduct } from '@/types';
import { usePortfolio } from '@/context/PortfolioContext';
import { usePrices } from '@/context/PriceContext';
import { isStablecoin } from '@/types';
import {
  calculateEffectiveYield, normalizeToUsd, nativeToUsd,
  getMaxApr, formatAPR, formatUSDCompact, capitalizeExchange,
} from '@/lib/calculations';
import { Icon } from '@/components/ui/Icon';
import { ExchangeMark } from '@/components/ui/ExchangeMark';
import { AssetBadge } from '@/components/ui/AssetBadge';
import { TierRow } from '@/components/ui/TierRow';

interface AddToPortfolioModalProps {
  product: EarnProduct;
  onClose: () => void;
}

export default function AddToPortfolioModal({ product, onClose }: AddToPortfolioModalProps) {
  const [amount, setAmount] = useState('');
  const { addPosition } = usePortfolio();
  const { prices } = usePrices();
  const numAmount = parseFloat(amount) || 0;
  const isCrypto = !isStablecoin(product.asset);

  const yieldEstimate = useMemo(() => {
    if (numAmount <= 0) return null;
    const normalized = normalizeToUsd(product, prices);
    const usd = isCrypto ? nativeToUsd(numAmount, product.asset, prices) : numAmount;
    return { ...calculateEffectiveYield(usd, normalized.subscriptions), usd };
  }, [numAmount, product, prices, isCrypto]);

  const handleSave = () => {
    if (numAmount > 0) {
      addPosition({ exchange: product.name, asset: product.asset, amount: numAmount });
      onClose();
    }
  };

  const quickAmounts = isCrypto
    ? (product.asset === 'BTC' ? [0.01, 0.1, 1] : product.asset === 'ETH' ? [0.5, 5, 32] : [10, 50, 200])
    : [100, 1000, 5000, 25000];

  return (
    <div className="ea-modal-backdrop" onClick={onClose}>
      <div className="ea-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid var(--border-1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ExchangeMark name={product.name} size={36} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{capitalizeExchange(product.name)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <AssetBadge asset={product.asset} />
                <span className="ea-num" style={{ fontSize: 11, color: 'var(--accent-1)' }}>
                  up to {formatAPR(getMaxApr(product.subscriptions))}% APR
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ all: 'unset', padding: 8, cursor: 'pointer', color: 'var(--text-3)' }}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 22 }}>
          <div className="ea-mono-label" style={{ marginBottom: 6 }}>
            Position size ({isCrypto ? product.asset : 'USD'})
          </div>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            {!isCrypto && (
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 18 }}>$</span>
            )}
            <input
              autoFocus
              type="number"
              className="ea-input ea-num"
              style={{
                fontSize: 22, fontWeight: 700,
                paddingLeft: isCrypto ? 14 : 28,
                paddingRight: isCrypto ? 80 : 14,
                padding: `14px ${isCrypto ? '80px' : '14px'} 14px ${isCrypto ? '14px' : '28px'}`,
              }}
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
            />
            {isCrypto && (
              <span style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
              }}>{product.asset}</span>
            )}
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {quickAmounts.map(p => (
              <button key={p} onClick={() => setAmount(String(p))} className="ea-chip">
                {isCrypto ? `${p} ${product.asset}` : `$${p.toLocaleString()}`}
              </button>
            ))}
          </div>

          {/* Yield preview */}
          {yieldEstimate && (
            <div className="ea-inset" style={{ padding: 14, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div className="ea-mono-label">Estimated yield</div>
                  <div className="ea-num-lg ea-accent-glow" style={{ marginTop: 2, fontSize: 28 }}>
                    {formatAPR(yieldEstimate.effectiveApr)}<span style={{ fontSize: 14, color: 'var(--text-3)' }}>%</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ea-mono-label">Daily</div>
                  <div className="ea-num" style={{ color: 'var(--accent-1)', fontSize: 14 }}>+{formatUSDCompact(yieldEstimate.dailyReward)}</div>
                  <div className="ea-mono-label" style={{ marginTop: 4 }}>Annual</div>
                  <div className="ea-num" style={{ color: 'var(--accent-1)', fontSize: 14 }}>+{formatUSDCompact(yieldEstimate.annualReturn)}</div>
                </div>
              </div>
              {isCrypto && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  ≈ {formatUSDCompact(yieldEstimate.usd)} at ${prices[product.asset]?.toLocaleString()}/{product.asset}
                </div>
              )}
            </div>
          )}

          {/* Tier ladder */}
          <div className="ea-mono-label" style={{ marginBottom: 6 }}>Tier ladder</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 18 }}>
            {[...product.subscriptions].sort((a, b) => a.tier.min - b.tier.min).map((s, i) => (
              <TierRow key={i} sub={s} asset={product.asset} />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="ea-btn" onClick={onClose}>Cancel</button>
            <button
              className="ea-btn ea-btn-primary"
              onClick={handleSave}
              disabled={numAmount <= 0}
              style={numAmount <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <Icon name="plus" size={12} />
              Track position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
