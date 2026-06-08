import 'server-only';

import { API_BASE_URL, resolveBackendTarget, type ApiRoute } from '@/constants/api';

/**
 * A backend path. Static endpoints come from `API_ROUTES` (`ApiRoute`);
 * resource paths with an id are built by the typed helpers in
 * `constants/api` — still never a raw literal at the call site.
 */
export type BackendRoute = ApiRoute | (string & {});

/**
 * Server-side calls to the backend, straight to the upstream origin (the
 * hosted API, or a local tunnel) — the browser `/api` rewrite is for client
 * code only. The target is resolved by `resolveBackendTarget()`; client API
 * calls still stay same-origin, so there is no CORS. Used by Server Actions
 * and diagnostics.
 */

/** Upstream origin (no path) — for display/diagnostics. */
export function getBackendTarget(): string {
  return resolveBackendTarget();
}

/** Query values to append as `?k=v`; `undefined` entries are skipped. */
export type BackendQuery = Record<string, string | number | undefined>;

export function backendUrl(route: BackendRoute, query?: BackendQuery): string {
  const base = `${getBackendTarget()}${API_BASE_URL}${route}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export interface BackendResponse {
  ok: boolean;
  status: number;
  /** Raw body text — callers JSON-parse/validate as needed. */
  raw: string;
}

/**
 * Fetch a backend route. Rejects (throws) on transport failure — e.g. the
 * tunnel is down — so callers can tell that apart from an HTTP error status.
 */
export async function backendFetch(
  route: BackendRoute,
  init?: RequestInit & { query?: BackendQuery },
): Promise<BackendResponse> {
  const { query, ...requestInit } = init ?? {};
  const res = await fetch(backendUrl(route, query), {
    cache: 'no-store',
    ...requestInit,
    headers: { Accept: 'application/json', ...requestInit.headers },
  });
  return { ok: res.ok, status: res.status, raw: await res.text() };
}
