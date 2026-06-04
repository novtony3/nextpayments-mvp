import 'server-only';

import { API_ROUTES, type ApiRoute } from '@/constants/api';
import { getAccessToken } from '@/lib/auth/session';
import { AuthError, envelopeSchema } from '@/lib/auth/types';
import { toPaginatedPage } from '@/lib/pagination';
import { backendFetch } from '@/lib/server/backend-fetch';

import {
  balanceResponseSchema,
  getAddressResponseSchema,
  paginatedTransactionsSchema,
  withdrawInputSchema,
  type BalanceRow,
  type BalancesResult,
  type GetAddressInput,
  type TransactionsQuery,
  type TransactionsResult,
  type TransactionTab,
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

/** GET /fund/balance (optional `?coin=`). Throws on a non-success envelope. */
export async function backendFundBalance(token: string, coin?: string): Promise<BalanceRow[]> {
  const res = await backendFetch(API_ROUTES.FUND_BALANCE, {
    headers: { Authorization: `Bearer ${token}` },
    query: { coin },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not load balances');
  return balanceResponseSchema.parse(json).data.balances;
}

/** Result-returning reader for the Wallet page — never throws into the RSC
 * tree (tunnel-down / not-authed → `{ ok:false }`), like `loadIntegrationList`. */
export async function loadFundBalance(coin?: string): Promise<BalancesResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };
  try {
    return { ok: true, balances: await backendFundBalance(token, coin) };
  } catch {
    return { ok: false };
  }
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

/** POST /fund/get-address. Throws `AuthError(code)` on FUER; returns the
 * deposit address (+ memo for tag chains) on success. */
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
