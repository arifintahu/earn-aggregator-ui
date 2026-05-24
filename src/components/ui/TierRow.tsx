import { Subscription } from '@/types';

interface TierRowProps {
  sub: Subscription;
  asset: string;
}

export function TierRow({ sub, asset }: TierRowProps) {
  const isCrypto = !['USDT', 'USDC'].includes(asset);
  const cap = sub.tier.max === -1 ? '∞' : isCrypto ? `${sub.tier.max} ${asset}` : `$${sub.tier.max.toLocaleString()}`;
  const min = isCrypto ? `${sub.tier.min} ${asset}` : `$${sub.tier.min.toLocaleString()}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'var(--surface-1)', border: '1px solid var(--border-1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: 2,
          background: sub.type === 'bonus' ? '#fcd34d' : 'var(--accent-1)',
          boxShadow: sub.type === 'bonus' ? '0 0 6px rgba(252,211,77,0.5)' : '0 0 6px var(--accent-glow)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', fontWeight: 600 }}>{sub.type}</span>
        <span className="ea-num" style={{ fontSize: 11, color: 'var(--text-3)' }}>{min} → {cap}</span>
      </div>
      <span className="ea-num" style={{ fontSize: 13, fontWeight: 600, color: sub.type === 'bonus' ? '#fcd34d' : 'var(--accent-1)' }}>
        {(sub.apr * 100).toFixed(2)}%
      </span>
    </div>
  );
}
