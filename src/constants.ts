export const EXCHANGE_ICONS = {
    'binance': '/images/binance.jpg',
    'bybit': '/images/bybit.webp',
    'bitget': '/images/bitget.jpg',
    'mexc': '/images/mexc.webp',
    'gate': '/images/gate.webp',
}

export const EXCHANGE_META: Record<string, { color: string; glyph: string; long: string }> = {
  binance: { color: '#F0B90B', glyph: 'B', long: 'Binance' },
  bybit:   { color: '#F7A600', glyph: 'B', long: 'Bybit' },
  bitget:  { color: '#00D8C2', glyph: 'b', long: 'Bitget' },
  mexc:    { color: '#1972F5', glyph: 'M', long: 'MEXC' },
  gate:    { color: '#2354E6', glyph: 'G', long: 'Gate.io' },
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