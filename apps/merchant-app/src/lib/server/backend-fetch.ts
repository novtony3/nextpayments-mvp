import 'server-only';

import {
  API_BASE_URL,
  API_PROXY_TARGET_ENV,
  DEFAULT_API_PROXY_TARGET,
  type ApiRoute,
} from '@/constants/api';

/**
 * Server-side calls to the backend, straight to the upstream origin reached
 * via the SSH tunnel (the browser `/api` rewrite is for client code only).
 * The upstream host comes from a server-only env, so it never reaches the
 * browser. Used by Server Actions and diagnostics.
 */

/** Upstream origin (no path) — for display/diagnostics. */
export function getBackendTarget(): string {
  return process.env[API_PROXY_TARGET_ENV] ?? DEFAULT_API_PROXY_TARGET;
}

export function backendUrl(route: ApiRoute): string {
  return `${getBackendTarget()}${API_BASE_URL}${route}`;
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
export async function backendFetch(route: ApiRoute, init?: RequestInit): Promise<BackendResponse> {
  const res = await fetch(backendUrl(route), {
    cache: 'no-store',
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  return { ok: res.ok, status: res.status, raw: await res.text() };
}
