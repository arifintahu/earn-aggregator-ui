export const EXCHANGE_ICONS = {
    'binance': '/images/binance.jpg',
    'bybit': '/images/bybit.webp',
    'bitget': '/images/bitget.jpg',
    'mexc': '/images/mexc.webp',
    'gate': '/images/gate.webp',
}

export const EXCHANGE_META: Record<string, { color: string; glyph: string; long: string; url: string }> = {
  binance: { color: '#F0B90B', glyph: 'B', long: 'Binance', url: 'https://www.binance.com/en/savings' },
  bybit:   { color: '#F7A600', glyph: 'B', long: 'Bybit',   url: 'https://www.bybit.com/en/earn/' },
  bitget:  { color: '#00D8C2', glyph: 'b', long: 'Bitget',  url: 'https://www.bitget.com/earn/' },
  mexc:    { color: '#1972F5', glyph: 'M', long: 'MEXC',    url: 'https://www.mexc.com/earn' },
  gate:    { color: '#2354E6', glyph: 'G', long: 'Gate.io', url: 'https://www.gate.io/earn' },
}

export const ASSET_META: Record<string, { color: string; label: string; glyph: string }> = {
  USDT: { color: '#26A17B', label: 'USDT', glyph: '₮' },
  USDC: { color: '#2775CA', label: 'USDC', glyph: 'C' },
  BTC:  { color: '#F7931A', label: 'BTC',  glyph: '₿' },
  ETH:  { color: '#627EEA', label: 'ETH',  glyph: 'Ξ' },
  SOL:  { color: '#9945FF', label: 'SOL',  glyph: 'S' },
}

export const ASSETS = ['USDT', 'USDC', 'BTC', 'ETH', 'SOL'] as const;
export const EXCHANGES = ['binance', 'bybit', 'bitget', 'mexc', 'gate'] as const;