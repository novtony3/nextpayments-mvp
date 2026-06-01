import 'server-only';

import { API_ROUTES } from '@/constants/api';
import { getAccessToken } from '@/lib/auth/session';
import { AuthError, envelopeSchema } from '@/lib/auth/types';
import { toPaginatedPage } from '@/lib/pagination';
import { backendFetch } from '@/lib/server/backend-fetch';

import {
  listCommissionsResponseSchema,
  listDownlineResponseSchema,
  totalsResponseSchema,
  type CommissionResult,
  type CommissionsQuery,
  type DownlineQuery,
  type DownlineResult,
  type TotalsResult,
} from './types';

/**
 * Server-side reads for the affiliate dashboard. Mirrors `lib/orders/backend`:
 * each loader is result-returning (`{ ok:true,data } | { ok:false }`) so the
 * RSC page never throws into the protected layout when the tunnel is down or
 * the session is stale — the page renders a degraded notice instead.
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

export async function loadAffiliateTotals(): Promise<TotalsResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };
  try {
    const res = await backendFetch(API_ROUTES.AFFILIATE_TOTALS, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = parseJson(res.raw);
    ensureOk(res.ok, json, 'Could not load affiliate totals');
    return { ok: true, data: totalsResponseSchema.parse(json).data.totals };
  } catch {
    return { ok: false };
  }
}

export async function loadDownline(query: DownlineQuery): Promise<DownlineResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };
  try {
    const res = await backendFetch(API_ROUTES.AFFILIATE_DOWNLINE, {
      headers: { Authorization: `Bearer ${token}` },
      query: {
        page: query.page,
        limit: query.limit,
        level: query.level,
      },
    });
    const json = parseJson(res.raw);
    ensureOk(res.ok, json, 'Could not load downline');
    return { ok: true, data: toPaginatedPage(listDownlineResponseSchema.parse(json)) };
  } catch {
    return { ok: false };
  }
}

export async function loadCommissions(query: CommissionsQuery): Promise<CommissionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false };
  try {
    const res = await backendFetch(API_ROUTES.AFFILIATE_COMMISSIONS, {
      headers: { Authorization: `Bearer ${token}` },
      query: { page: query.page, limit: query.limit },
    });
    const json = parseJson(res.raw);
    ensureOk(res.ok, json, 'Could not load commissions');
    return { ok: true, data: toPaginatedPage(listCommissionsResponseSchema.parse(json)) };
  } catch {
    return { ok: false };
  }
}
