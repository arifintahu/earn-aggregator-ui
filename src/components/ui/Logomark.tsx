export function Logomark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lm-fill" x1="0" x2="32" y1="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent-1)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <path
        d="M16 1.5 28.7 8.75v14.5L16 30.5 3.3 23.25V8.75z"
        fill="rgba(255,255,255,0.04)"
        stroke="url(#lm-fill)"
        strokeWidth="1.2"
      />
      <path
        d="M7.5 22 Q 13 22 16 16 T 24.5 10"
        stroke="url(#lm-fill)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="24.5" cy="10" r="1.8" fill="var(--accent-2)" />
    </svg>
  );
}
