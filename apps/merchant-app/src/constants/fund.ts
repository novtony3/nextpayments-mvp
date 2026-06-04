/**
 * Fund (Topup wallet) config — single source of truth for the deposit/withdraw
 * UI. No React/i18n here: labels are derived from `network`/`coin` at the call
 * site, errors are i18n keys the form maps from the backend `FUER00x` codes.
 *
 * Backend contract: API.md Fund §. On the probed backend the live, enabled
 * pair is ETH/ETH (deposit via `get-address` returns a real `type:"user"`
 * address); USDT on ETH/BSC exists in the catalog but returns `FUER006`
 * "not supported" until enabled server-side, so the UI degrades gracefully on
 * `FUER006` for those.
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
 * Catalog pairs offered in the selectors. Data-driven so the selector and the
 * default never drift; ETH/ETH (enabled) is first so it is the landing
 * selection. The USDT pairs are catalog-present but currently `FUER006` — the
 * deposit panel surfaces them as "temporarily unavailable" rather than hiding.
 */
export const FUND_ASSETS: ReadonlyArray<FundAsset> = [
  { network: 'ETH', coin: 'ETH' },
  { network: 'ETH', coin: 'USDT' },
  { network: 'BSC', coin: 'USDT' },
];

/** Stable `value` for an asset `<option>` (no inline join at call sites). */
export function fundAssetValue({ network, coin }: FundAsset): string {
  return `${network}:${coin}`;
}

/** EVM (`0x` + 40 hex) address gate — the real client-side check for ETH/BSC
 * withdrawals; the backend `validate-address` is only a soft pre-check. */
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
} as const;

export type FundErrorCode = (typeof FUND_ERROR_CODE)[keyof typeof FUND_ERROR_CODE];
