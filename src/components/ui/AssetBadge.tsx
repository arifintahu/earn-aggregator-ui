import { ASSET_META } from '@/constants';

const COIN_ICONS: Partial<Record<string, string>> = {
  BTC:  '/icons/coins/btc.png',
  ETH:  '/icons/coins/eth.png',
  SOL:  '/icons/coins/sol.png',
  USDT: '/icons/coins/usdt.png',
  USDC: '/icons/coins/usdc.png',
};

interface AssetCoinProps {
  asset: string;
  size?: number;
}

export function AssetCoin({ asset, size = 24 }: AssetCoinProps) {
  const m = ASSET_META[asset] ?? { color: '#888', glyph: '?' };
  const imgSrc = COIN_ICONS[asset];
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset',
        flexShrink: 0,
      }}
    >
      {imgSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={imgSrc} alt={asset} width={size} height={size}
          style={{ width: size, height: size, objectFit: 'cover' }} />
      ) : (
        <span style={{
          color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.5),
          fontFamily: 'var(--font-mono)',
        }}>{m.glyph}</span>
      )}
    </div>
  );
}

interface AssetBadgeProps {
  asset: string;
}

export function AssetBadge({ asset }: AssetBadgeProps) {
  const m = ASSET_META[asset] ?? { color: '#888', label: asset };
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '2px 8px 2px 6px',
        borderRadius: 999,
        fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
        background: `color-mix(in oklch, ${m.color} 18%, transparent)`,
        color: `color-mix(in oklch, ${m.color} 50%, white)`,
        border: `1px solid color-mix(in oklch, ${m.color} 30%, transparent)`,
        fontFamily: 'var(--font-mono)',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: m.color,
        boxShadow: `0 0 6px ${m.color}`,
        flexShrink: 0,
      }} />
      {asset}
    </span>
  );
}
