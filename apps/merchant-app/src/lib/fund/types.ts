import { z } from 'zod';

import { EVM_ADDRESS_REGEX } from '@/constants/fund';
import { paginatedSchema, type PaginatedPage } from '@/lib/pagination';

/**
 * Fund (transactions) domain types + zod schemas. Schema is the source of
 * truth; types are inferred. Backend contract: API.md §2 paginated envelope.
 *
 * Row shape is **provisional**: the documented postman collection is not in
 * the repo and the verified test account has zero history, so the per-row
 * fields below are best-effort and intentionally loose (`.passthrough()`,
 * everything optional). Tighten once a real transaction surfaces the shape.
 */

/** Transaction tabs (screenshot). `all` is the default landing tab. */
export const TRANSACTION_TABS = [
  'all',
  'received',
  'sent',
  'conversions',
  'invoices',
  'payments',
] as const;

export type TransactionTab = (typeof TRANSACTION_TABS)[number];

export const transactionTabSchema = z.enum(TRANSACTION_TABS);

/**
 * Transaction row — intentionally a free-form record. The documented postman
 * collection is absent and the verified account is empty, so the real field
 * shape is unknown. Validating specific field *types* here would reject real
 * rows (e.g. `amount` as an object) and mislead the user into the
 * transport-error state. Accept any object; the table reads fields
 * defensively and stringifies. Tighten when a real row is observed.
 *
 * Fields the UI looks for (best-effort): `coin`, `amount`, `status`,
 * `createdAt`, `transactionHash`/`_id`/`id`.
 */
export const transactionRowSchema = z.record(z.string(), z.unknown());

export type TransactionRow = z.infer<typeof transactionRowSchema>;

/** Shared API.md §2 paginated envelope (declared once in `lib/pagination`). */
export const paginatedTransactionsSchema = paginatedSchema(transactionRowSchema);

/** Normalized result the page consumes (success path). */
export type TransactionsPage = PaginatedPage<TransactionRow>;

/** Discriminated, serializable result — never throws into the RSC tree. */
export type TransactionsResult =
  | { ok: true; data: TransactionsPage }
  | { ok: false; reason: 'unsupported' | 'error' };

export type TransactionsQuery = {
  page: number;
  limit: number;
  /** Coin ticker filter (`?coin=`), when a currency is selected. */
  coin?: string;
};

/* ------------------------------------------------------------------ *
 * Balance — GET /fund/balance → { data: { balances: [...] } }
 * ------------------------------------------------------------------ */

/**
 * Balance row — intentionally loose. The probed account is empty so the real
 * populated shape is unobserved; tight types would reject real rows. The UI
 * reads `coin`/`amount` defensively and joins display metadata from
 * {@link COIN_TILES}. Tighten once a funded balance surfaces.
 */
export const balanceRowSchema = z.record(z.string(), z.unknown());

export type BalanceRow = z.infer<typeof balanceRowSchema>;

export const balanceResponseSchema = z.object({
  data: z.object({ balances: z.array(balanceRowSchema) }),
});

/** Never-throw reader result the Wallet page consumes. */
export type BalancesResult = { ok: true; balances: BalanceRow[] } | { ok: false };

/** One coin's spendable balance (header selector option). */
export type CoinBalance = { coin: string; amount: number };

/**
 * Header balances result — the spendable balances actually returned for the
 * account, used to populate the header coin selector (mapped to the coin catalog
 * for colour/name/precision). Never throws; `{ ok: false }` is no session /
 * fetch failure, which the header renders as a muted placeholder.
 */
export type HeaderBalancesResult = { ok: true; balances: CoinBalance[] } | { ok: false };

/* ------------------------------------------------------------------ *
 * Deposit — POST /fund/get-address → { data: { ... address ... } }
 * ------------------------------------------------------------------ */

/**
 * Deposit-address response — loose/passthrough on `data`. The pair is
 * `FUER006` on the probed backend so the success shape is unobserved; the
 * backend reader extracts `address`/`memo` defensively from `data` (or a
 * nested `data.address` object). Tighten once an address is observed.
 */
export const getAddressResponseSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

/** Serializable Server-Action result — `unsupported` is the FUER006 path. */
export type GetAddressResult =
  | { ok: true; address: string; memo?: string }
  | { ok: false; reason: 'unsupported' | 'invalid' | 'error'; code?: string };

export type GetAddressInput = { network: string; coin: string };

/* ------------------------------------------------------------------ *
 * Withdraw — POST /fund/withdraw (email-approval flow; submit-only here)
 * ------------------------------------------------------------------ */

/**
 * Withdraw input validated at the Server-Action boundary (never trust the
 * client even though the form also validates). `address` must be a valid EVM
 * address (the Ethereum-based chains — ETH, ERC20); `token2fa` is required only
 * when the account has 2FA on, enforced in the form — the schema keeps it optional.
 */
export const withdrawInputSchema = z.object({
  network: z.string().min(1),
  coin: z.string().min(1),
  address: z.string().regex(EVM_ADDRESS_REGEX),
  amount: z.number().positive(),
  memo: z.string().optional(),
  token2fa: z.string().optional(),
});

export type WithdrawInput = z.infer<typeof withdrawInputSchema>;

/**
 * Withdraw result. `code` carries the backend `FUER00x` so the form maps it to
 * a field (network/coin/amount) or the "temporarily unavailable" banner.
 */
export type WithdrawResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'error'; code?: string };

/* ------------------------------------------------------------------ *
 * Approve withdrawal — PUT /fund/withdraw/:token (email-link, JWT)
 * ------------------------------------------------------------------ */

/**
 * Best-effort summary of an approved withdrawal, shown on the success screen.
 * There is no GET-by-token endpoint, so the amount/coin/address are only known
 * from the approve PUT's response (when it returns them) — all fields optional.
 */
export type WithdrawApprovalSummary = {
  amount?: string;
  coin?: string;
  address?: string;
};

/**
 * Approve-withdrawal result. `invalid` = the backend rejected the approval
 * token (already used / expired / not found); `error` = transport, 5xx, or no
 * server session. The approval endpoint requires the user's JWT — the token
 * only identifies which pending withdrawal to approve.
 */
export type ApproveWithdrawResult =
  | { ok: true; summary?: WithdrawApprovalSummary }
  | { ok: false; reason: 'invalid' | 'error' };

/**
 * Cancel-withdrawal result (`DELETE /fund/withdraw/:withdrawId`). `invalid` =
 * the backend refused (already sent/approved, unknown id, or not cancellable);
 * `error` = transport / 5xx / no session. The row's cancel affordance is gated
 * only by a terminal-status denylist, so the backend is the real authority.
 */
export type CancelWithdrawResult = { ok: true } | { ok: false; reason: 'invalid' | 'error' };

/* ------------------------------------------------------------------ *
 * Validate address — POST /fund/validate-address (soft/advisory check)
 * ------------------------------------------------------------------ */

/** Validate-address input — `{network,coin,address}` per API.md Fund §. */
export const validateAddressInputSchema = z.object({
  network: z.string().min(1),
  coin: z.string().min(1),
  address: z.string().min(1),
});

export type ValidateAddressInput = z.infer<typeof validateAddressInputSchema>;

/**
 * Advisory validate-address result. `valid` is `null` when the backend gives no
 * clear verdict (endpoint disabled / unobserved shape) — the form then shows no
 * warning. The EVM regex + the `withdraw` call remain the hard gates; this is
 * only a soft pre-check (see `constants/fund.ts`).
 */
export type ValidateAddressResult = { ok: true; valid: boolean | null } | { ok: false };
