import { ASSET_META } from '@/constants';

interface CompositionDonutProps {
  byAsset: Record<string, number>;
  total: number;
  size?: number;
}

export function CompositionDonut({ byAsset, total, size = 80 }: CompositionDonutProps) {
  const r = size / 2 - 5;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  const entries = Object.entries(byAsset).filter(([, v]) => v > 0);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="ea-donut-track" cx={cx} cy={cy} r={r} strokeWidth="6" />
        {entries.map(([asset, v]) => {
          const frac = total > 0 ? v / total : 0;
          const dash = frac * circ;
          const gap = circ - dash;
          const offset = -(acc * circ);
          acc += frac;
          const color = ASSET_META[asset]?.color ?? '#888';
          return (
            <circle
              key={asset}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ filter: `drop-shadow(0 0 3px ${color}55)` }}
            />
          );
        })}
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)',
      }}>
        <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>MIX</div>
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-1)' }}>{entries.length}</div>
      </div>
    </div>
  );
}
