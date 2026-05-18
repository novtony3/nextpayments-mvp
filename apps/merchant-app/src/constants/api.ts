/**
 * API wiring constants — single source of truth (no hardcoded host/path at
 * call sites). The browser always calls the app's own origin under
 * {@link API_BASE_URL}; `next.config.ts` rewrites that prefix to the backend
 * (reached locally via the SSH tunnel), so the client never sees the upstream
 * origin and there is no CORS.
 *
 * Backend contract (from `postman/crypto-payment-be.postman_collection.json`):
 * routes are served under `/api`, health at `GET /api/health`.
 */

/** Same-origin prefix the client calls; proxied to the backend by Next. */
export const API_BASE_URL = '/api' as const;

/** Backend route paths (relative to {@link API_BASE_URL}). */
export const API_ROUTES = {
  HEALTH: '/health',
  USER_LOGIN: '/user/login',
  USER_REGISTER: '/user/register',
  USER_REFRESH: '/user/refresh-token',
  USER_LOGOUT: '/user/logout',
} as const;

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES];

/** Env var (server-only) that points the Next rewrite at the tunnel. */
export const API_PROXY_TARGET_ENV = 'API_PROXY_TARGET' as const;

/**
 * Default upstream when `API_PROXY_TARGET` is unset. Matches the Postman
 * `baseUrl` and the tunnel script's default remote port — run the tunnel with
 * `--local-port 3000` for zero-config, or set the env to your chosen port.
 */
export const DEFAULT_API_PROXY_TARGET = 'http://localhost:3000' as const;
