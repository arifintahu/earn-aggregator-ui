interface MetricChipProps {
  label: string;
  value: string | number;
}

export function MetricChip({ label, value }: MetricChipProps) {
  return (
    <div style={{ padding: '8px 10px', background: 'var(--surface-1)', border: '1px solid var(--border-1)', borderRadius: 8 }}>
      <div className="ea-mono-label" style={{ fontSize: 9 }}>{label}</div>
      <div className="ea-num" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-1)', marginTop: 2 }}>{value}</div>
    </div>
  );
}
