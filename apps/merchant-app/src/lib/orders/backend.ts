import 'server-only';

import { apiPath } from '@/constants/api';
import { getAccessToken } from '@/lib/auth/session';
import { AuthError, envelopeSchema } from '@/lib/auth/types';
import { toPaginatedPage } from '@/lib/pagination';
import { backendFetch } from '@/lib/server/backend-fetch';

import {
  listOrdersForUserResponseSchema,
  orderStatsResponseSchema,
  type OrderDetailResult,
  type OrderListPage,
  type OrderListQuery,
  type OrderListResult,
  type OrderStats,
  type OrderStatsQuery,
  type OrderStatsResult,
} from './types';

/**
 * Backend `/me` page-size cap is `lt: 200` (see order.validators.listForUser).
 * Detail lookup uses this as the per-request limit and walks up to
 * {@link DETAIL_LOOKUP_MAX_PAGES} pages — bounded so a missing id can't fan
 * out an unbounded crawl.
 */
const DETAIL_LOOKUP_LIMIT = 199;
const DETAIL_LOOKUP_MAX_PAGES = 5;

/**
 * Server-side reads for the JWT-protected order routes (`/me`, `/me/stats`).
 * Mirrors `lib/integrations/backend.ts`: never throws into the RSC tree —
 * transport / auth failures return `{ ok:false }` so pages can degrade to a
 * notice rather than throw into the protected layout.
 */

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new AuthError('Backend returned a non-JSON response');
  }
}

function ensureOk(ok: boolean, json: unknown, fallback: string): void {
  const envelope = envelopeSchema.safeParse(json);
  if (!ok || !envelope.success || !envelope.data.success) {
    const err = envelope.success ? envelope.data.error : undefined;
    throw new AuthError(err?.message ?? fallback, err?.code);
  }
}

export async function backendListOrdersForUser(
  token: string,
  query: OrderListQuery,
): Promise<OrderListPage> {
  const res = await backendFetch(apiPath.ordersMe(), {
    headers: { Authorization: `Bearer ${token}` },
    query: {
      page: query.page,
      limit: query.limit,
      status: query.status,
      integrationId: query.integrationId,
    },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not load orders');
  return toPaginatedPage(listOrdersForUserResponseSchema.parse(json));
}

export async function backendOrderStats(
  token: string,
  query: OrderStatsQuery,
): Promise<OrderStats> {
  const res = await backendFetch(apiPath.ordersMeStats(), {
    headers: { Authorization: `Bearer ${token}` },
    query: { integrationId: query.integrationId },
  });
  const json = parseJson(res.raw);
  ensureOk(res.ok, json, 'Could not load order stats');
  return orderStatsResponseSchema.parse(json).data;
}

/** Server Component reader — result-returning, never throws. */
export async function loadOrderListForUser(query: OrderListQuery): Promise<OrderListResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };
  try {
    const data = await backendListOrdersForUser(token, query);
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

/** Server Component reader — result-returning, never throws. */
export async function loadOrderStats(query: OrderStatsQuery): Promise<OrderStatsResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };
  try {
    const data = await backendOrderStats(token, query);
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

/**
 * Detail lookup. The backend has no `GET /api/orders/me/:orderId` (the
 * `:orderId` route is HMAC, server-to-server — not a browser flow). Until a
 * JWT detail route lands, this walks pages of `/me` and returns the first
 * match by `orderId`. Pagination is hard-capped (199 × 5 = ~1k orders) so an
 * unknown id can't fan out an unbounded crawl.
 *
 * Pass `integrationId` to narrow the search when the caller knows it (e.g.
 * deep-linking from the integrations table).
 */
export async function loadOrderForUser(
  orderId: string,
  query: { integrationId?: string } = {},
): Promise<OrderDetailResult> {
  if (!orderId) return { ok: false, reason: 'notfound' };
  const token = await getAccessToken();
  if (!token) return { ok: false, reason: 'error' };

  try {
    for (let page = 1; page <= DETAIL_LOOKUP_MAX_PAGES; page += 1) {
      const result = await backendListOrdersForUser(token, {
        page,
        limit: DETAIL_LOOKUP_LIMIT,
        integrationId: query.integrationId,
      });
      const match = result.rows.find((row) => row.orderId === orderId);
      if (match) return { ok: true, data: match };
      if (page >= result.totalPages) break;
    }
    return { ok: false, reason: 'notfound' };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
