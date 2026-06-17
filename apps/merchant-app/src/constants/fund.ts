/**
 * Fund (Topup wallet) config — single source of truth for the deposit/withdraw
 * UI. No React/i18n here: labels are derived from `network`/`coin` at the call
 * site, errors are i18n keys the form maps from the backend `FUER00x` codes.
 *
 * Backend contract: API.md Fund §. The enabled catalog pairs (from the backend
 * coin/network catalog) are ETH on `ETH` and USDT on `ERC20` — these are the
 * exact `network`/`coin` strings the backend matches, so they must be sent
 * verbatim on deposit/withdraw. The UI still degrades gracefully on `FUER006`
 * if a pair is later disabled server-side.
 */

/** Default coin/network the deposit panel and withdraw form land on — the
 * enabled pair on the probed backend (ETH on the Ethereum/Sepolia network). */
export const DEFAULT_FUND_NETWORK = 'ETH' as const;
export const DEFAULT_FUND_COIN = 'ETH' as const;

/** A selectable (network, coin) pair for deposit/withdraw. */
export type FundAsset = {
  /** Chain identifier sent as `network` (matches `Order.network`). */
  network: string;
  /** Ticker sent as `coin`. */
  coin: string;
};

/**
 * Catalog pairs offered in the selectors — the `enabled:true` (network, coin)
 * entries from the backend coin/network catalog. `network`/`coin` are the exact
 * strings the backend stores and matches, sent verbatim on deposit/withdraw
 * (USDT is on `ERC20`, NOT `ETH`/`BSC`). ETH/ETH is first so it is the default
 * landing selection. Keep in sync with the backend catalog's enabled rows.
 */
export const FUND_ASSETS: ReadonlyArray<FundAsset> = [
  { network: 'ETH', coin: 'ETH' },
  { network: 'ERC20', coin: 'USDT' },
];

/** Stable `value` for an asset `<option>` (no inline join at call sites). */
export function fundAssetValue({ network, coin }: FundAsset): string {
  return `${network}:${coin}`;
}

/**
 * Coins the Wallet queries fee-balance for (`GET /fund/fee-balance?coin=`).
 * Derived from {@link FUND_ASSETS} (unique tickers) so adding a pair there
 * automatically expands the balance query — no fixed coin hardcoded.
 */
export const FUND_BALANCE_COINS: ReadonlyArray<string> = [
  ...new Set(FUND_ASSETS.map((a) => a.coin)),
];

/** EVM (`0x` + 40 hex) address gate — the real client-side check for the
 * Ethereum-based chains (ETH, ERC20); the backend `validate-address` is only a
 * soft pre-check. */
export const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/** Deposit QR edge length (px) — mirrors `two-fa-card`'s `QR_SIZE_PX`. */
export const FUND_QR_SIZE_PX = 196 as const;

/** Smallest withdrawable amount the form accepts before hitting the backend. */
export const WITHDRAW_MIN_AMOUNT = 0 as const;

/**
 * Backend Fund error codes (probed live). The deposit/withdraw flows map these
 * to a field error or a "temporarily unavailable" banner — never a raw code.
 */
export const FUND_ERROR_CODE = {
  INVALID_NETWORK: 'FUER001',
  INVALID_COIN: 'FUER002',
  INVALID_AMOUNT: 'FUER005',
  /** Pair exists in the catalog but deposit/withdraw is not enabled. */
  NOT_SUPPORTED: 'FUER006',
  /** Withdrawal amount exceeds the account's available balance. */
  INSUFFICIENT_BALANCE: 'FUER008',
} as const;

export type FundErrorCode = (typeof FUND_ERROR_CODE)[keyof typeof FUND_ERROR_CODE];

/**
 * Withdrawal statuses that are **terminal** (already sent, failed, or already
 * cancelled) — a denylist, lowercased for case-insensitive matching. The
 * cancel affordance is hidden only for these; any unknown/intermediate status
 * still shows the button (the backend is the authority and rejects a
 * non-cancellable withdrawal). A denylist fails safe — an unobserved
 * "pending"-like status keeps Cancel visible, whereas an allowlist guess would
 * silently hide it. Tighten once a real withdraw-history row is observed.
 */
export const WITHDRAW_TERMINAL_STATUSES: ReadonlyArray<string> = [
  'success',
  'succeeded',
  'completed',
  'done',
  'failed',
  'rejected',
  'cancelled',
  'canceled',
];
