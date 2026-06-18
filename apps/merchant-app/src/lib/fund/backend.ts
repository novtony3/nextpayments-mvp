import 'server-only';

import { API_ROUTES, apiPath, type ApiRoute } from '@/constants/api';
import { FUND_BALANCE_COINS } from '@/constants/fund';
import { getAccessToken } from '@/lib/auth/session';
import { AuthError, envelopeSchema } from '@/lib/auth/types';
import { toPaginatedPage } from '@/lib/pagination';
import { backendFetch } from '@/lib/server/backend-fetch';

import { readBalanceAmount, readBalanceTicker } from './balance';
import {
  balanceResponseSchema,
  getAddressResponseSchema,
  paginatedTransactionsSchema,
  withdrawInputSchema,
  type BalanceRow,
  type BalancesResult,
  type CoinBalance,
  type GetAddressInput,
  type HeaderBalancesResult,
  type TransactionsQuery,
  type TransactionsResult,
  type TransactionTab,
  type ValidateAddressInput,
  type WithdrawApprovalSummary,
  type WithdrawInput,
} from './types';

/**
 * Server-side transaction-history reads (run only inside Server Components /
 * Actions so the access token never reaches the browser). Transport failures
 * and unmapped tabs become a serializable {@link TransactionsResult} instead
 * of throwing — a flaky tunnel must not 500 the protected layout.
 *
 * Tab→endpoint mapping (API.md Fund §): only deposit/withdraw/balance history
 * are browser-reachable. `all` provisionally uses deposit-history until a
 * unified endpoint exists; invoices/payments have no browser endpoint.
 */
const TAB_ROUTE: Partial<Record<TransactionTab, ApiRoute>> = {
  all: API_ROUTES.FUND_DEPOSIT_HISTORY,
  received: API_ROUTES.FUND_DEPOSIT_HISTORY,
  sent: API_ROUTES.FUND_WITHDRAW_HISTORY,
  conversions: API_ROUTES.FUND_BALANCE_HISTORY,
};

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * Throw {@link AuthError} carrying the backend `error.code` (FUER00x) when the
 * envelope is missing or `success:false` — mirrors `integrations/backend.ts`
 * so deposit/withdraw write paths surface a mappable code to the caller.
 */
function ensureOk(ok: boolean, json: unknown, fallback: string): void {
  const envelope = envelopeSchema.safeParse(json);
  if (!ok || !envelope.success || !envelope.data.success) {
    const err = envelope.success ? envelope.data.error : undefined;
    throw new AuthError(err?.message ?? fallback, err?.code);
  }
}

export async function backendFundHistory(
  tab: TransactionTab,
  query: TransactionsQuery,
): Promise<TransactionsResult> {
  const route = TAB_ROUTE[tab];
  if (!route) return { ok: false, reason: 'unsupported' };

  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };

  try {
    const res = await backendFetch(route, {
      headers: { Authorization: `Bearer ${token}` },
      query: { page: query.page, limit: query.limit, coin: query.coin },
    });

    const json = parseJson(res.raw);
    const envelope = envelopeSchema.safeParse(json);
    if (!res.ok || !envelope.success || !envelope.data.success) {
      return { ok: false, reason: 'error' };
    }

    const parsed = paginatedTransactionsSchema.safeParse(json);
    if (!parsed.success) return { ok: false, reason: 'error' };

    return { ok: true, data: toPaginatedPage(parsed.data) };
  } catch {
    // Transport failure (tunnel down) or unexpected response shape.
    return { ok: false, reason: 'error' };
  }
}

/* ------------------------------------------------------------------ *
 * Balance / Deposit / Withdraw (run only in Server Components / Actions)
 * ------------------------------------------------------------------ */

/** GET /fund/fee-balance?coin= for one coin. Throws on a non-success envelope. */
export async function backendFeeBalance(token: string, coin: string): Promise<BalanceRow[]> {
  const res = await backendFetch(API_ROUTES.FUND_FEE_BALANCE, {
    headers: { Authorization: `Bearer ${token}` },
    query: { coin },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not load balances');
  return balanceResponseSchema.parse(json).data.balances;
}

/**
 * GET /fund/balance?coin= for one coin — the documented *spendable* balance
 * (distinct from `fee-balance`, the gas reserve the wallet list shows). Drives
 * the withdraw form's "available" + Max. Throws on a non-success envelope.
 */
export async function backendBalance(token: string, coin: string): Promise<BalanceRow[]> {
  const res = await backendFetch(API_ROUTES.FUND_BALANCE, {
    headers: { Authorization: `Bearer ${token}` },
    query: { coin },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not load balances');
  return balanceResponseSchema.parse(json).data.balances;
}

/**
 * Result-returning reader of the spendable balance (`/fund/balance`) for the
 * withdraw form — never throws into the tree. Mirrors {@link loadFundBalance}
 * (which reads `fee-balance` for the wallet list); queried per coin in parallel.
 */
export async function loadSpendableBalance(
  coins: ReadonlyArray<string> = FUND_BALANCE_COINS,
): Promise<BalancesResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };

  const settled = await Promise.allSettled(coins.map((coin) => backendBalance(token, coin)));
  const fulfilled = settled.filter(
    (r): r is PromiseFulfilledResult<BalanceRow[]> => r.status === 'fulfilled',
  );
  if (fulfilled.length === 0) return { ok: false };
  return { ok: true, balances: fulfilled.flatMap((r) => r.value) };
}

/**
 * GET /fund/balance with NO coin filter — the account's full spendable balance
 * set in one call. Throws on a non-success envelope (e.g. if the backend requires
 * a coin), so {@link loadHeaderBalances} can fall back to enumerating coins.
 */
export async function backendAllBalances(token: string): Promise<BalanceRow[]> {
  const res = await backendFetch(API_ROUTES.FUND_BALANCE, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not load balances');
  return balanceResponseSchema.parse(json).data.balances;
}

/** Map loose balance rows to `{ coin, amount }`, dropping rows with no ticker. */
function toCoinBalances(rows: ReadonlyArray<BalanceRow>): CoinBalance[] {
  return rows.flatMap((row) => {
    const coin = readBalanceTicker(row);
    return coin ? [{ coin, amount: readBalanceAmount(row) ?? 0 }] : [];
  });
}

/**
 * The account's spendable balances for the dashboard header selector — the coins
 * actually returned, mapped to `{ coin, amount }`; never throws. Prefers a single
 * all-coins read ({@link backendAllBalances}); if the backend requires a coin
 * filter (it throws), falls back to enumerating the known catalog coins in
 * parallel. An empty but successful read is a genuine "no balances yet".
 */
export async function loadHeaderBalances(): Promise<HeaderBalancesResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };

  try {
    return { ok: true, balances: toCoinBalances(await backendAllBalances(token)) };
  } catch {
    const settled = await Promise.allSettled(
      FUND_BALANCE_COINS.map((coin) => backendBalance(token, coin)),
    );
    const fulfilled = settled.filter(
      (r): r is PromiseFulfilledResult<BalanceRow[]> => r.status === 'fulfilled',
    );
    if (fulfilled.length === 0) return { ok: false };
    return { ok: true, balances: toCoinBalances(fulfilled.flatMap((r) => r.value)) };
  }
}

/**
 * Result-returning reader for the Wallet page — never throws into the RSC tree
 * (tunnel-down / not-authed → `{ ok:false }`), like `loadIntegrationList`.
 * Queries fee-balance for each configured coin ({@link FUND_BALANCE_COINS}, so
 * the coin set is expandable, not fixed) in parallel and merges the rows; a
 * single coin failing is tolerated as long as at least one succeeds.
 */
export async function loadFundBalance(
  coins: ReadonlyArray<string> = FUND_BALANCE_COINS,
): Promise<BalancesResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };

  const settled = await Promise.allSettled(coins.map((coin) => backendFeeBalance(token, coin)));
  const fulfilled = settled.filter(
    (r): r is PromiseFulfilledResult<BalanceRow[]> => r.status === 'fulfilled',
  );
  if (fulfilled.length === 0) return { ok: false };
  return { ok: true, balances: fulfilled.flatMap((r) => r.value) };
}

/** Pull a usable deposit address out of the loose `data` (string at
 * `data.address`, or nested `data.address.address`). */
function extractAddress(data: Record<string, unknown>): { address: string; memo?: string } | null {
  const raw = data.address;
  const memo = typeof data.memo === 'string' ? data.memo : undefined;
  if (typeof raw === 'string' && raw) return { address: raw, memo };
  if (raw && typeof raw === 'object') {
    const nested = raw as Record<string, unknown>;
    if (typeof nested.address === 'string' && nested.address) {
      return {
        address: nested.address,
        memo: typeof nested.memo === 'string' ? nested.memo : memo,
      };
    }
  }
  return null;
}

/**
 * POST /fund/get-address — the user's **spendable** deposit address
 * (`type:"user"`). Deposits here credit the withdrawable balance
 * (`GET /fund/balance`). Must NOT use `get-fee-address` (`type:"fee"`): that is
 * the gas/fee reserve, and deposits to it land in `fee-balance` (kind
 * `feeDeposit`) which is NOT withdrawable. Throws `AuthError(code)` on FUER;
 * returns the address (+ memo for tag chains) on success.
 */
export async function backendGetDepositAddress(
  token: string,
  input: GetAddressInput,
): Promise<{ address: string; memo?: string }> {
  const res = await backendFetch(API_ROUTES.FUND_GET_ADDRESS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ network: input.network, coin: input.coin }),
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not get a deposit address');
  const address = extractAddress(getAddressResponseSchema.parse(json).data);
  if (!address) throw new AuthError('Deposit address missing from response');
  return address;
}

/** Pull a boolean validity verdict out of the loose `data` (`valid`/`isValid`/
 * `validity`), or null when none is present (no clear verdict → no warning). */
function extractValidity(json: unknown): boolean | null {
  const data = json && typeof json === 'object' ? (json as { data?: unknown }).data : null;
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  for (const key of ['valid', 'isValid', 'validity']) {
    if (typeof record[key] === 'boolean') return record[key] as boolean;
  }
  return null;
}

/**
 * POST /fund/validate-address — soft/advisory destination check. Returns the
 * backend verdict, or `null` when no clear flag is present (endpoint disabled
 * or unobserved shape) so the form stays advisory and never blocks. Throws
 * `AuthError` on a non-success envelope.
 */
export async function backendValidateAddress(
  token: string,
  input: ValidateAddressInput,
): Promise<boolean | null> {
  const res = await backendFetch(API_ROUTES.FUND_VALIDATE_ADDRESS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ network: input.network, coin: input.coin, address: input.address }),
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not validate the address');
  return extractValidity(json);
}

/** POST /fund/withdraw — requests the withdrawal (backend emails an approval
 * link). Throws `AuthError(code)` on FUER so the caller can map the field. */
export async function backendWithdraw(token: string, input: WithdrawInput): Promise<void> {
  const body = withdrawInputSchema.parse(input);
  const res = await backendFetch(API_ROUTES.FUND_WITHDRAW, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      network: body.network,
      coin: body.coin,
      address: body.address,
      memo: body.memo ?? '',
      amount: body.amount,
      token2fa: body.token2fa ?? '',
    }),
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not request the withdrawal');
}

/** Pull a best-effort {amount,coin,address} out of the loose approve response
 * `data` (numbers coerced to strings); `undefined` when none are present. */
function extractApprovalSummary(json: unknown): WithdrawApprovalSummary | undefined {
  const data = json && typeof json === 'object' ? (json as { data?: unknown }).data : null;
  if (!data || typeof data !== 'object') return undefined;
  const rec = data as Record<string, unknown>;
  const str = (v: unknown): string | undefined =>
    typeof v === 'string' ? v : typeof v === 'number' ? String(v) : undefined;
  const summary: WithdrawApprovalSummary = {
    amount: str(rec.amount),
    coin: str(rec.coin),
    address: str(rec.address),
  };
  return summary.amount || summary.coin || summary.address ? summary : undefined;
}

/**
 * PUT /fund/withdraw/:token — approve a pending withdrawal from the email link.
 * Requires the user's JWT (the token identifies *which* withdrawal, not the
 * user — the backend returns 401 USER016 without a session). Throws
 * `AuthError(code)` on a non-success envelope; returns a best-effort summary
 * from the response when present.
 */
export async function backendApproveWithdraw(
  accessToken: string,
  approvalToken: string,
): Promise<WithdrawApprovalSummary | undefined> {
  const res = await backendFetch(apiPath.fundWithdrawApprove(approvalToken), {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not approve the withdrawal');
  return extractApprovalSummary(json);
}

/**
 * DELETE /fund/withdraw/:withdrawId — cancel a pending withdrawal. Requires the
 * user's JWT (probe with no auth → 401 USER016). The id is the withdrawal's
 * business id from a withdraw-history row (see the caller's id extraction);
 * throws `AuthError(code)` if the backend refuses (already sent/approved,
 * unknown id, or not cancellable).
 */
export async function backendCancelWithdraw(
  accessToken: string,
  withdrawId: string,
): Promise<void> {
  const res = await backendFetch(apiPath.fundWithdrawCancel(withdrawId), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not cancel the withdrawal');
}
