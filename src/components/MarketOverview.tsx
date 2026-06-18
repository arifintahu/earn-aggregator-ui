'use client';

import React, { useState, useMemo } from 'react';
import { EarnProduct } from '@/types';
import { getMaxApr, formatAPR, getRelativeTime, capitalizeExchange } from '@/lib/calculations';
import { Icon } from '@/components/ui/Icon';
import { ExchangeMark } from '@/components/ui/ExchangeMark';
import { AssetCoin } from '@/components/ui/AssetBadge';
import { TierStrip } from '@/components/ui/TierStrip';

interface MarketOverviewProps {
  products: EarnProduct[];
  loading: boolean;
  error: string | null;
  selectedProductKeys: Set<string>;
  onToggleProduct: (productKey: string) => void;
  onToggleAll: (selectAll: boolean) => void;
  getProductKey: (product: { name: string; asset: string }) => string;
  onAddPortfolio?: (product: EarnProduct) => void;
  onOpenDetail?: (product: EarnProduct) => void;
}

type AssetFilter = 'ALL' | 'USDT' | 'USDC' | 'BTC' | 'ETH' | 'SOL';
type SortBy = 'exchange' | 'apr' | 'asset';
type SortOrder = 'asc' | 'desc';

export default function MarketOverview({
  products, loading, error,
  selectedProductKeys, onToggleProduct, onToggleAll, getProductKey,
  onAddPortfolio, onOpenDetail,
}: MarketOverviewProps) {
  const [assetFilter, setAssetFilter] = useState<AssetFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('apr');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filtered = useMemo(() => {
    let arr = [...products];
    if (assetFilter !== 'ALL') arr = arr.filter(p => p.asset === assetFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(p => p.name.toLowerCase().includes(q) || p.asset.toLowerCase().includes(q));
    }
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'exchange') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'apr') cmp = getMaxApr(a.subscriptions) - getMaxApr(b.subscriptions);
      else if (sortBy === 'asset') cmp = a.asset.localeCompare(b.asset);
      return sortOrder === 'desc' ? -cmp : cmp;
    });
    return arr;
  }, [products, assetFilter, searchQuery, sortBy, sortOrder]);

  const handleSort = (col: SortBy) => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortOrder('desc'); }
  };

  const aprCeiling = useMemo(
    () => Math.max(0.001, ...products.flatMap(p => p.subscriptions.map(s => s.apr * 100))),
    [products]
  );

  const totalSelected = selectedProductKeys.size;

  if (loading) {
    return (
      <div className="ea-card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
        Loading market data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="ea-card" style={{ padding: 24, textAlign: 'center', color: '#ff8b8b' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="ea-card ea-card-hero" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 className="ea-h2">Market Overview</h2>
            <span className="ea-mono-label" style={{ padding: '3px 8px', borderRadius: 999, background: 'var(--surface-1)', border: '1px solid var(--border-1)' }}>
              {filtered.length} products · {totalSelected} included
            </span>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: 13, margin: '6px 0 0' }}>
            Aggregated flexible-earn APRs across 5 exchanges. Click Detail to compare tiers.
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }}>
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            placeholder="Search exchanges"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ea-input"
            style={{ paddingLeft: 30, width: 'min(100%, 220px)', fontSize: 13 }}
          />
        </div>
      </div>

      {/* Asset filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['ALL', 'USDT', 'USDC', 'BTC', 'ETH', 'SOL'] as AssetFilter[]).map(a => (
          <button
            key={a}
            className={`ea-chip${assetFilter === a ? ' ea-chip-active' : ''}`}
            onClick={() => setAssetFilter(a)}
          >
            {a === 'ALL' ? 'All assets' : a}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="ea-desktop-only" style={{ overflowX: 'auto', margin: '0 -10px' }}>
        <table className="ea-table">
          <thead>
            <tr>
              <th style={{ width: 32, paddingLeft: 14 }}>
                <input
                  type="checkbox"
                  className="ea-check"
                  checked={products.length > 0 && totalSelected === products.length}
                  onChange={e => onToggleAll(e.target.checked)}
                />
              </th>
              <SortableHeader label="Exchange" col="exchange" sortBy={sortBy} sortOrder={sortOrder} onClick={handleSort} />
              <SortableHeader label="Asset" col="asset" sortBy={sortBy} sortOrder={sortOrder} onClick={handleSort} />
              <SortableHeader label="Max APR" col="apr" sortBy={sortBy} sortOrder={sortOrder} onClick={handleSort} align="right" />
              <th>Tier curve</th>
              <th>Updated</th>
              <th style={{ textAlign: 'right', paddingRight: 14 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => {
              const key = getProductKey(product);
              const selected = selectedProductKeys.has(key);
              const maxApr = getMaxApr(product.subscriptions);
              const bonus = product.subscriptions.find(s => s.type === 'bonus');
              return (
                <tr key={key} className={selected ? '' : 'is-muted'}>
                  <td style={{ paddingLeft: 14 }}>
                    <input
                      type="checkbox"
                      className="ea-check"
                      checked={selected}
                      onChange={() => onToggleProduct(key)}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => onOpenDetail?.(product)}
                      style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                      title="View exchange detail"
                    >
                      <ExchangeMark name={product.name} size={32} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{capitalizeExchange(product.name)}</div>
                        <div className="ea-mono-label" style={{ marginTop: 2 }}>
                          {product.subscriptions.length} tier{product.subscriptions.length > 1 ? 's' : ''}
                          {bonus ? <> · <span style={{ color: '#f6d36a' }}>bonus</span></> : null}
                        </div>
                      </div>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AssetCoin asset={product.asset} size={22} />
                      <span className="ea-num" style={{ fontSize: 13, fontWeight: 600 }}>{product.asset}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="ea-apr-pill ea-accent-glow">{formatAPR(maxApr)}</span>
                  </td>
                  <td>
                    <TierStrip subs={product.subscriptions} aprCeiling={aprCeiling} asset={product.asset} />
                  </td>
                  <td style={{ color: 'var(--text-3)', fontSize: 12, whiteSpace: 'nowrap' }} className="ea-num">
                    {getRelativeTime(product.updatedAt)}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 14 }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="ea-btn ea-btn-ghost"
                        onClick={() => onOpenDetail?.(product)}
                      >
                        <Icon name="eye" size={12} />
                        Detail
                      </button>
                      <button
                        className="ea-btn"
                        onClick={() => onAddPortfolio?.(product)}
                      >
                        <Icon name="plus" size={12} />
                        Track
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="ea-mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 2 }}>
          <div className="ea-mono-label">Tap Detail to view tier breakdown</div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 12 }}>
            <input
              type="checkbox"
              className="ea-check"
              checked={products.length > 0 && totalSelected === products.length}
              onChange={e => onToggleAll(e.target.checked)}
            />
            Include all
          </label>
        </div>
        {filtered.map(product => {
          const key = getProductKey(product);
          const selected = selectedProductKeys.has(key);
          const maxApr = getMaxApr(product.subscriptions);
          const bonus = product.subscriptions.find(s => s.type === 'bonus');
          return (
            <div
              key={key}
              className="ea-inset"
              style={{
                padding: 12,
                opacity: selected ? 1 : 0.6,
                borderColor: selected
                  ? 'color-mix(in oklch, var(--accent-1) 24%, var(--border-1))'
                  : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <ExchangeMark name={product.name} size={30} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{capitalizeExchange(product.name)}</div>
                    <div className="ea-mono-label" style={{ marginTop: 2 }}>
                      {product.subscriptions.length} tier{product.subscriptions.length > 1 ? 's' : ''}
                      {bonus ? <> · <span style={{ color: '#f6d36a' }}>bonus</span></> : null}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="ea-check"
                  checked={selected}
                  onChange={() => onToggleProduct(key)}
                  aria-label={`Include ${capitalizeExchange(product.name)} ${product.asset}`}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginTop: 12 }}>
                <div>
                  <div className="ea-mono-label" style={{ marginBottom: 6 }}>Asset</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AssetCoin asset={product.asset} size={22} />
                    <span className="ea-num" style={{ fontSize: 13, fontWeight: 600 }}>{product.asset}</span>
                  </div>
                </div>
                <div>
                  <div className="ea-mono-label" style={{ marginBottom: 6 }}>Max APR</div>
                  <span className="ea-apr-pill ea-accent-glow">{formatAPR(maxApr)}</span>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className="ea-mono-label" style={{ marginBottom: 6 }}>APR by tier</div>
                <TierStrip subs={product.subscriptions} aprCeiling={aprCeiling} asset={product.asset} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <div style={{ color: 'var(--text-3)', fontSize: 12 }} className="ea-num">
                  Updated {getRelativeTime(product.updatedAt)}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="ea-btn ea-btn-ghost"
                    onClick={() => onOpenDetail?.(product)}
                  >
                    <Icon name="eye" size={12} />
                    Detail
                  </button>
                  <button
                    className="ea-btn"
                    onClick={() => onAddPortfolio?.(product)}
                  >
                    <Icon name="plus" size={12} />
                    Track
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
          No products match your filters.
        </div>
      )}
    </div>
  );
}

function SortableHeader({ label, col, sortBy, sortOrder, onClick, align = 'left' }: {
  label: string; col: SortBy; sortBy: SortBy; sortOrder: SortOrder;
  onClick: (col: SortBy) => void; align?: 'left' | 'right';
}) {
  const active = sortBy === col;
  return (
    <th onClick={() => onClick(col)} style={{ cursor: 'pointer', textAlign: align, userSelect: 'none' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: active ? 'var(--text-1)' : undefined }}>
        {label}
        <span style={{ opacity: active ? 1 : 0.3, fontSize: 9 }}>{active && sortOrder === 'asc' ? '▲' : '▼'}</span>
      </span>
    </th>
  );
}
