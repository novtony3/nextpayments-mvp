/**
 * Coin catalog — the single source for how a cryptocurrency is shown anywhere in
 * the app: brand gradient (avatars/tiles/backdrop bloom), display name, and
 * amount precision. Gradients are CSS strings so each token stays on-brand
 * without external SVG assets. Append new coins at the END (some callers read by
 * index). Keep entries to genuinely popular coins.
 */
import { formatCrypto, formatFiat } from '@/lib/format';

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
  { ticker: 'AVAX', name: 'Avalanche', gradient: 'linear-gradient(135deg,#e84142,#ff7a7b)' },
  { ticker: 'LINK', name: 'Chainlink', gradient: 'linear-gradient(135deg,#2a5ada,#6f9cff)' },
  { ticker: 'DOT', name: 'Polkadot', gradient: 'linear-gradient(135deg,#e6007a,#ff5cae)' },
];

/** Neutral gradient for a coin not present in {@link COIN_TILES}. */
export const COIN_FALLBACK_GRADIENT = 'linear-gradient(135deg,#5a6772,#8a94a3)';

const TILE_BY_TICKER = new Map(COIN_TILES.map((tile) => [tile.ticker, tile]));

/**
 * Brand gradient for a coin ticker (from {@link COIN_TILES}), or the neutral
 * fallback. Single source for every coin avatar/tile in the app, so the same
 * coin reads identically in the header, the balances list and the landing grid.
 */
export function coinGradient(ticker: string): string {
  return TILE_BY_TICKER.get(ticker)?.gradient ?? COIN_FALLBACK_GRADIENT;
}

/** Display name for a coin ticker (from {@link COIN_TILES}), or the ticker. */
export function coinName(ticker: string): string {
  return TILE_BY_TICKER.get(ticker)?.name ?? ticker;
}

/**
 * Tickers rendered as fiat-style amounts (exactly 2 decimals). Everything else
 * is a volatile crypto shown with up to 8 decimals.
 */
export const STABLECOINS: ReadonlyArray<string> = ['USDT', 'USDC'];

export function isStablecoin(ticker: string): boolean {
  return STABLECOINS.includes(ticker);
}

/**
 * Format a coin amount with per-coin precision: stablecoins to 2 decimals
 * ({@link formatFiat}), volatile coins up to 8 ({@link formatCrypto}). One place
 * so the header and balances list never disagree on a coin's decimals.
 */
export function formatCoinAmount(value: number, ticker: string, locale: string): string {
  return isStablecoin(ticker) ? formatFiat(value, locale) : formatCrypto(value, locale);
}
