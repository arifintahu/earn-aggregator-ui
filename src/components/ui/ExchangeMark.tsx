import { EXCHANGE_META } from '@/constants';

interface ExchangeMarkProps {
  name: string;
  size?: number;
}

export function ExchangeMark({ name, size = 32 }: ExchangeMarkProps) {
  const meta = EXCHANGE_META[name?.toLowerCase()] ?? { color: '#888', glyph: '?' };
  const fs = Math.round(size * 0.46);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}aa 100%)`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#0b0d10', fontWeight: 800, fontSize: fs,
        fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.06) inset, 0 6px 16px -8px ${meta.color}80`,
        flexShrink: 0,
      }}
    >
      {meta.glyph}
    </div>
  );
}
