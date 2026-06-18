import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  stroke?: string;
}

export function Icon({ name, size = 16, stroke = 'currentColor' }: IconProps) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke, strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'search':        return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'plus':          return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'close':         return <svg {...common}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'check':         return <svg {...common}><path d="m5 12 5 5L20 7"/></svg>;
    case 'edit':          return <svg {...common}><path d="M4 20h4l10-10-4-4L4 16z"/><path d="m14 6 4 4"/></svg>;
    case 'trash':         return <svg {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>;
    case 'caret':         return <svg {...common}><path d="m6 9 6 6 6-6"/></svg>;
    case 'arrow-right':   return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-up-right':return <svg {...common}><path d="M7 17 17 7M9 7h8v8"/></svg>;
    case 'wallet':        return <svg {...common}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 13h2"/><path d="M3 8V6a2 2 0 0 1 2-2h12"/></svg>;
    case 'sliders':       return <svg {...common}><path d="M4 6h13M4 12h7M4 18h11"/><circle cx="19" cy="6" r="2"/><circle cx="14" cy="12" r="2"/><circle cx="17" cy="18" r="2"/></svg>;
    case 'chart':         return <svg {...common}><path d="M3 3v18h18"/><path d="m7 15 4-5 4 3 5-7"/></svg>;
    case 'info':          return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v5h1"/></svg>;
    case 'bolt':          return <svg {...common} fill={stroke} stroke="none"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>;
    case 'globe':         return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case 'pulse':         return <svg {...common}><path d="M3 12h4l2-6 4 12 2-6h6"/></svg>;
    case 'flame':         return <svg {...common}><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3-1-3 0-7 1-10z"/></svg>;
    case 'bell':          return <svg {...common}><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case 'columns':       return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/></svg>;
    case 'menu':          return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case 'eye':           return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M2 12c2-5 5-8 10-8s8 3 10 8-5 8-10 8-8-3-10-8z"/></svg>;
    default:              return null;
  }
}
