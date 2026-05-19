import { COIN_TILES } from '@/constants/coins';
import { ZERO_CRYPTO, ZERO_FIAT } from '@/constants/dashboard';

/**
 * Mock wallet balances for the UI-only phase. Derived from the shared
 * {@link COIN_TILES} (no duplicated coin list) — every row is zeroed and
 * `locked` mirrors the reference dashboard (unverified accounts can only
 * transact a couple of currencies). Replaced by `GET /api/fund/balance`
 * when Fund is wired.
 */
export type BalanceRow = {
  ticker: string;
  name: string;
  /** On-brand tile color from the shared coin data. */
  gradient: string;
  /** Crypto amount, fixed-precision string (never a float). */
  amount: string;
  /** Fiat value in {@link FIAT}. */
  fiat: string;
  /** Currency disabled until the account is verified. */
  locked: boolean;
};

/** First two currencies are usable pre-verification (matches the reference). */
const UNLOCKED_TICKERS: ReadonlySet<string> = new Set(['LTC', 'BTC']);

export const MOCK_BALANCES: ReadonlyArray<BalanceRow> = COIN_TILES.map((coin) => ({
  ticker: coin.ticker,
  name: coin.name,
  gradient: coin.gradient,
  amount: ZERO_CRYPTO,
  fiat: ZERO_FIAT,
  locked: !UNLOCKED_TICKERS.has(coin.ticker),
}));
