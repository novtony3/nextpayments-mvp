/**
 * Coin grid data for landing page. Gradients are CSS strings so each tile
 * stays a single-pixel border + on-brand color without external SVG assets.
 */
export type CoinTile = {
  ticker: string;
  name: string;
  gradient: string;
};

export const COIN_TILES: ReadonlyArray<CoinTile> = [
  { ticker: 'BTC', name: 'Bitcoin', gradient: 'linear-gradient(135deg,#f7931a,#ffb74d)' },
  { ticker: 'ETH', name: 'Ethereum', gradient: 'linear-gradient(135deg,#627eea,#8a9bff)' },
  { ticker: 'USDT', name: 'Tether', gradient: 'linear-gradient(135deg,#26a17b,#4cc9a0)' },
  { ticker: 'USDC', name: 'USD Coin', gradient: 'linear-gradient(135deg,#2775ca,#4a90e2)' },
  { ticker: 'BNB', name: 'BNB Chain', gradient: 'linear-gradient(135deg,#f3ba2f,#fcd34d)' },
  { ticker: 'SOL', name: 'Solana', gradient: 'linear-gradient(135deg,#9945ff,#14f195)' },
  { ticker: 'TRX', name: 'Tron', gradient: 'linear-gradient(135deg,#ef0027,#ff5577)' },
  { ticker: 'XRP', name: 'XRP', gradient: 'linear-gradient(135deg,#23292f,#5a6772)' },
  { ticker: 'ADA', name: 'Cardano', gradient: 'linear-gradient(135deg,#0033ad,#3a7bd5)' },
  { ticker: 'DOGE', name: 'Dogecoin', gradient: 'linear-gradient(135deg,#c2a633,#e6c862)' },
  { ticker: 'MATIC', name: 'Polygon', gradient: 'linear-gradient(135deg,#8247e5,#b48cff)' },
  { ticker: 'LTC', name: 'Litecoin', gradient: 'linear-gradient(135deg,#a6a9b0,#d4d8de)' },
];

/** Neutral tile gradient for a coin not present in {@link COIN_TILES}. */
export const COIN_FALLBACK_GRADIENT = 'linear-gradient(135deg,#5a6772,#8a94a3)';

/**
 * Brand gradient for a coin ticker (from {@link COIN_TILES}), or the neutral
 * fallback. Single source for the coin avatars shared by the balances list and
 * the header balance pill.
 */
export function coinGradient(ticker: string): string {
  return COIN_TILES.find((c) => c.ticker === ticker)?.gradient ?? COIN_FALLBACK_GRADIENT;
}
