import { AllocationSlot } from '@/types';
import { EXCHANGE_META } from '@/constants';

interface AllocationDonutProps {
  allocations: AllocationSlot[];
  size?: number;
}

export function AllocationDonut({ allocations, size = 100 }: AllocationDonutProps) {
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = allocations.reduce((s, a) => s + a.amount, 0) || 1;
  let acc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle className="ea-donut-track" cx={cx} cy={cy} r={r} strokeWidth="8" />
      {allocations.map((a, i) => {
        const frac = a.amount / total;
        const dash = frac * circ;
        const gap = circ - dash;
        const offset = -(acc * circ);
        acc += frac;
        const color = EXCHANGE_META[a.exchange]?.color ?? 'var(--accent-1)';
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
          />
        );
      })}
      <text x={cx} y={cy + 5} textAnchor="middle" fill="var(--text-1)" fontSize="14" fontFamily="var(--font-mono)" fontWeight="700">{allocations.length}</text>
      <text x={cx} y={cy + 17} textAnchor="middle" fill="var(--text-3)" fontSize="7" fontFamily="var(--font-mono)" letterSpacing="0.08em">EXCH</text>
    </svg>
  );
}
