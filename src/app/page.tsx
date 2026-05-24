'use client';

import { useState, useEffect, useMemo } from 'react';
import { useEarnProducts } from '@/hooks/useEarnProducts';
import { useApiHealth } from '@/hooks/useApiHealth';
import { usePrices } from '@/context/PriceContext';
import { usePortfolio } from '@/context/PortfolioContext';
import MarketOverview from '@/components/MarketOverview';
import YieldSimulator from '@/components/YieldSimulator';
import PortfolioTracker from '@/components/PortfolioTracker';
import AddToPortfolioModal from '@/components/AddToPortfolioModal';
import ExchangeDetail from '@/components/ExchangeDetail';
import { Logomark } from '@/components/ui/Logomark';
import { Icon } from '@/components/ui/Icon';
import { AssetBadge } from '@/components/ui/AssetBadge';
import { ExchangeMark } from '@/components/ui/ExchangeMark';
import { EarnProduct } from '@/types';
import { getMaxApr, formatAPR, capitalizeExchange } from '@/lib/calculations';
import { EXCHANGE_META } from '@/constants';

type Tab = 'market' | 'simulator' | 'portfolio';

export default function Home() {
  const { products, loading, error } = useEarnProducts();
  const apiHealth = useApiHealth();
  const { prices } = usePrices();
  const { addPosition } = usePortfolio();

  const [selectedProductKeys, setSelectedProductKeys] = useState<Set<string>>(new Set());
  const [modalProduct, setModalProduct] = useState<EarnProduct | null>(null);
  const [detailExchange, setDetailExchange] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('market');

  const getProductKey = (product: { name: string; asset: string }) =>
    `${product.name}-${product.asset}`;

  useEffect(() => {
    if (products.length > 0 && selectedProductKeys.size === 0) {
      setSelectedProductKeys(new Set(products.map(getProductKey)));
    }
  }, [products]);

  const toggleProductSelection = (key: string) => {
    setSelectedProductKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAllProducts = (selectAll: boolean) => {
    setSelectedProductKeys(selectAll ? new Set(products.map(getProductKey)) : new Set());
  };

  const selectedProducts = useMemo(
    () => products.filter(p => selectedProductKeys.has(getProductKey(p))),
    [products, selectedProductKeys]
  );

  // Top-rate product for hero card
  const topProduct = useMemo(
    () => products.length ? [...products].sort((a, b) => getMaxApr(b.subscriptions) - getMaxApr(a.subscriptions))[0] : null,
    [products]
  );

  return (
    <div className="ea-shell" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(5,8,10,0.7)',
        backdropFilter: 'blur(18px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        borderBottom: '1px solid var(--border-1)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Logomark size={28} />
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.025em' }}>
                <span className="ea-gradient-text">Earn</span> Aggregator
              </span>
            </div>
            <nav className="ea-desktop-only" style={{ display: 'flex', gap: 4 }}>
              {(['Market', 'Simulator', 'Portfolio'] as const).map((label) => {
                const tab = label.toLowerCase() as Tab;
                return (
                  <button
                    key={label}
                    onClick={() => {
                      setActiveTab(tab);
                      document.getElementById(`section-${tab}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    style={{
                      all: 'unset', padding: '6px 12px', borderRadius: 8,
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)',
                      background: activeTab === tab ? 'var(--surface-1)' : 'transparent',
                      transition: '120ms ease',
                    }}
                  >{label}</button>
                );
              })}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Price ticker */}
            <div className="ea-desktop-only" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '6px 12px', borderRadius: 999,
              background: 'var(--surface-1)', border: '1px solid var(--border-1)',
              fontFamily: 'var(--font-mono)', fontSize: 11,
            }}>
              {(['BTC', 'ETH', 'SOL'] as const).map(a => (
                <span key={a} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#F7931A', fontWeight: 700 }}>{a === 'ETH' ? <span style={{ color: '#627EEA' }}>{a}</span> : a === 'SOL' ? <span style={{ color: '#9945FF' }}>{a}</span> : a}</span>
                  <span style={{ color: 'var(--text-1)' }}>${(prices[a] ?? 0).toLocaleString()}</span>
                </span>
              ))}
            </div>
            {/* API status */}
            <div className="ea-chip" style={{ cursor: 'default' }}>
              <span className={`ea-status-dot ${apiHealth.healthy ? 'pulse' : ''}`} style={{ background: apiHealth.loading ? '#f59e0b' : apiHealth.healthy ? 'var(--accent-1)' : '#ef4444' }} />
              <span style={{ color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>
                {apiHealth.loading ? 'Connecting' : apiHealth.healthy ? 'API online' : 'API offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main style={{ position: 'relative', maxWidth: 1400, margin: '0 auto', padding: '24px 32px 120px' }}>
        {/* Hero heading (desktop only) */}
        <div className="ea-desktop-only ea-page-heading-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--gap-1)', marginBottom: 'var(--gap-1)' }}>
          {/* Left: title card */}
          <div className="ea-card" style={{
            background: 'radial-gradient(400px 200px at 100% 0%, color-mix(in oklch, var(--accent-1) 16%, transparent), transparent 70%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          }}>
            <div className="ea-mono-label">FLEXIBLE EARN · LIVE</div>
            <h1 className="ea-h1" style={{ marginTop: 8, fontSize: 34 }}>
              <span className="ea-gradient-text">Flexible Earn — aggregated</span>
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 8 }}>
              {products.length} products · 5 exchanges · live tier pricing
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="ea-num" style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="pulse" size={12} stroke="var(--accent-1)" /> Refreshes every 24h
              </div>
              <div className="ea-num" style={{ fontSize: 12, color: 'var(--text-3)' }}>· USD prices auto-converted</div>
            </div>
          </div>

          {/* Right: top rate card */}
          {topProduct && (
            <div className="ea-card" style={{
              background: `radial-gradient(220px 160px at 0% 0%, ${EXCHANGE_META[topProduct.name]?.color ?? '#10b981'}33, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div className="ea-mono-label" style={{ color: 'var(--accent-1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="flame" size={11} stroke="var(--accent-1)" /> Top rate right now
                </div>
                <AssetBadge asset={topProduct.asset} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ExchangeMark name={topProduct.name} size={36} />
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{capitalizeExchange(topProduct.name)}</div>
                    <div className="ea-mono-label" style={{ marginTop: 2 }}>
                      {topProduct.subscriptions.find(s => s.type === 'bonus') ? 'bonus tier active' : 'base tier'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ea-num-xl ea-accent-glow">{formatAPR(getMaxApr(topProduct.subscriptions))}</div>
                  <div className="ea-mono-label" style={{ color: 'var(--text-3)' }}>% APR</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: 2-col grid */}
        <div className="ea-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--gap-1)', alignItems: 'start' }}>
          <div id="section-market">
            <MarketOverview
              products={products}
              loading={loading}
              error={error}
              selectedProductKeys={selectedProductKeys}
              onToggleProduct={toggleProductSelection}
              onToggleAll={toggleAllProducts}
              getProductKey={getProductKey}
              onAddPortfolio={(p: EarnProduct) => setModalProduct(p)}
              onOpenDetail={(p: EarnProduct) => setDetailExchange(p.name)}
            />
          </div>
          <div className="ea-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-1)', position: 'sticky', top: 80 }}>
            <div id="section-simulator"><YieldSimulator products={selectedProducts} /></div>
            <div id="section-portfolio"><PortfolioTracker products={products} /></div>
          </div>
        </div>

        {/* Mobile: single tab view */}
        <div className="ea-mobile-only" style={{ display: 'none' }}>
          {activeTab === 'market' && (
            <MarketOverview
              products={products}
              loading={loading}
              error={error}
              selectedProductKeys={selectedProductKeys}
              onToggleProduct={toggleProductSelection}
              onToggleAll={toggleAllProducts}
              getProductKey={getProductKey}
              onAddPortfolio={(p: EarnProduct) => setModalProduct(p)}
              onOpenDetail={(p: EarnProduct) => setDetailExchange(p.name)}
            />
          )}
          {activeTab === 'simulator' && <YieldSimulator products={selectedProducts} />}
          {activeTab === 'portfolio' && <PortfolioTracker products={products} />}
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="ea-desktop-only" style={{
        maxWidth: 1400, margin: '0 auto', padding: '24px 32px',
        borderTop: '1px solid var(--border-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: 'var(--text-3)', fontSize: 12,
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Logomark size={16} />
          <span className="ea-num">Sources: Binance · Bybit · Bitget · MEXC · Gate</span>
        </div>
        <div className="ea-num">Portfolio data stored locally</div>
      </footer>

      {/* ── Mobile bottom tab bar ─────────────────────────────── */}
      <div className="ea-tab-bar">
        {([
          { id: 'market' as Tab, icon: 'columns', label: 'Market' },
          { id: 'simulator' as Tab, icon: 'bolt', label: 'Simulate' },
          { id: 'portfolio' as Tab, icon: 'wallet', label: 'Portfolio' },
        ]).map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              all: 'unset',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              padding: '8px 4px',
              borderRadius: 16,
              background: activeTab === id ? 'color-mix(in oklch, var(--accent-1) 16%, transparent)' : 'transparent',
              color: activeTab === id ? 'var(--accent-1)' : 'var(--text-2)',
              cursor: 'pointer',
              border: activeTab === id ? '1px solid color-mix(in oklch, var(--accent-1) 30%, transparent)' : '1px solid transparent',
              fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Icon name={icon} size={18} stroke={activeTab === id ? 'var(--accent-1)' : 'currentColor'} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Overlays ─────────────────────────────────────────── */}
      {modalProduct && (
        <AddToPortfolioModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
      {detailExchange && (
        <ExchangeDetail
          exchange={detailExchange}
          allProducts={products}
          onClose={() => setDetailExchange(null)}
          onAddPortfolio={(p: EarnProduct) => { setDetailExchange(null); setModalProduct(p); }}
        />
      )}
    </div>
  );
}
