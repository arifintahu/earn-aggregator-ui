import { Subscription } from '@/types';

interface TierStripProps {
  subs: Subscription[];
  aprCeiling: number;
  asset: string;
}

export function TierStrip({ subs, aprCeiling, asset }: TierStripProps) {
  if (!subs?.length) return null;
  const sorted = [...subs].sort((a, b) => a.tier.min - b.tier.min);
  return (
    <div className="ea-tier-strip">
      {sorted.map((s, i) => {
        const h = Math.max(20, (s.apr * 100 / aprCeiling) * 100);
        const isBonus = s.type === 'bonus';
        const color = isBonus
          ? 'linear-gradient(180deg, #fcd34d, #f59e0b)'
          : 'linear-gradient(180deg, var(--accent-2), var(--accent-1))';
        const isCrypto = !['USDT', 'USDC'].includes(asset);
        const cap = s.tier.max === -1
          ? '∞'
          : isCrypto ? `${s.tier.max} ${asset}` : `$${s.tier.max.toLocaleString()}`;
        return (
          <div key={i} className="ea-tier-col">
            <span
              className="ea-tier-label"
              style={{ color: isBonus ? '#f6d36a' : undefined }}
            >
              {(s.apr * 100).toFixed(2)}%
            </span>
            <div
              className="ea-tier-block"
              title={`${s.type.toUpperCase()} · ${(s.apr * 100).toFixed(2)}% APR · up to ${cap}`}
            >
              <div
                className="ea-tier-fill"
                style={{
                  top: `${100 - h}%`,
                  background: color,
                  boxShadow: isBonus
                    ? '0 0 6px rgba(252,211,77,0.4)'
                    : '0 0 6px color-mix(in oklch, var(--accent-1) 50%, transparent)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
