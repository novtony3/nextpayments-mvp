import 'server-only';

import { API_ROUTES, type ApiRoute } from '@/constants/api';
import { getAccessToken } from '@/lib/auth/session';
import { envelopeSchema } from '@/lib/auth/types';
import { toPaginatedPage } from '@/lib/pagination';
import { backendFetch } from '@/lib/server/backend-fetch';

import {
  paginatedTransactionsSchema,
  type TransactionsQuery,
  type TransactionsResult,
  type TransactionTab,
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
