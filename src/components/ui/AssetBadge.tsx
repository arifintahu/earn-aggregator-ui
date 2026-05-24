import { ASSET_META } from '@/constants';

interface AssetCoinProps {
  asset: string;
  size?: number;
}

export function AssetCoin({ asset, size = 24 }: AssetCoinProps) {
  const m = ASSET_META[asset] ?? { color: '#888', glyph: '?' };
  const fs = Math.round(size * 0.5);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: m.color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: fs,
        fontFamily: 'var(--font-mono)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset',
        flexShrink: 0,
      }}
    >
      {m.glyph}
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
