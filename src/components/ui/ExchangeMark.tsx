import { EXCHANGE_ICONS, EXCHANGE_META } from '@/constants';

interface ExchangeMarkProps {
  name: string;
  size?: number;
}

export function ExchangeMark({ name, size = 32 }: ExchangeMarkProps) {
  const key = name?.toLowerCase();
  const meta = EXCHANGE_META[key] ?? { color: '#888', glyph: '?', long: name };
  const imgSrc = EXCHANGE_ICONS[key as keyof typeof EXCHANGE_ICONS];

  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.10) inset, 0 6px 16px -8px ${meta.color}80`,
        background: meta.color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {imgSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imgSrc}
          alt={meta.long ?? name}
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: 'cover', mixBlendMode: 'multiply' }}
        />
      ) : (
        <span style={{
          color: '#0b0d10', fontWeight: 800, fontSize: Math.round(size * 0.46),
          fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em',
        }}>
          {meta.glyph}
        </span>
      )}
    </div>
  );
}
