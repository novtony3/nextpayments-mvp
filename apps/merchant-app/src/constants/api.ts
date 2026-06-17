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
  USER_ME: '/user/me',
  USER_CHANGE_PASSWORD: '/user/change-password',
  USER_FORGOT_PASSWORD: '/user/forgot-password',
  USER_RESET_PASSWORD: '/user/reset-password',
  USER_VERIFY_EMAIL: '/user/verify-email',
  USER_GET_2FA_KEY: '/user/get-2fa-key',
  USER_ENABLE_2FA: '/user/enable-2fa',
  USER_DISABLE_2FA: '/user/disable-2fa',
  FUND_BALANCE: '/fund/balance',
  FUND_FEE_BALANCE: '/fund/fee-balance',
  FUND_GET_ADDRESS: '/fund/get-address',
  FUND_GET_FEE_ADDRESS: '/fund/get-fee-address',
  FUND_VALIDATE_ADDRESS: '/fund/validate-address',
  FUND_WITHDRAW: '/fund/withdraw',
  FUND_DEPOSIT_HISTORY: '/fund/deposit-history',
  FUND_WITHDRAW_HISTORY: '/fund/withdraw-history',
  FUND_BALANCE_HISTORY: '/fund/balance-history',
  INTEGRATIONS: '/integrations',
  ORDERS: '/orders',
  AFFILIATE_TOTALS: '/affiliate/totals',
  AFFILIATE_DOWNLINE: '/affiliate/downline',
  AFFILIATE_COMMISSIONS: '/affiliate/commissions',
} as const;

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES];

/**
 * Resource paths with an id — built from {@link API_ROUTES} so no raw path
 * literal appears at a call site (the no-hardcoding rule still holds).
 */
export const apiPath = {
  integration: (id: string): string => `${API_ROUTES.INTEGRATIONS}/${id}`,
  integrationApiKeys: (id: string): string => `${API_ROUTES.INTEGRATIONS}/${id}/api-keys`,
  /** JWT-protected dashboard endpoints (no HMAC needed — uses the session). */
  ordersMe: (): string => `${API_ROUTES.ORDERS}/me`,
  ordersMeStats: (): string => `${API_ROUTES.ORDERS}/me/stats`,
  /** Approve a pending withdrawal via its single-use token (`PUT`). */
  fundWithdrawApprove: (token: string): string => `${API_ROUTES.FUND_WITHDRAW}/${token}`,
} as const;

/** Per-machine override that points the Next rewrite at a local tunnel port. */
export const API_PROXY_TARGET_ENV = 'API_PROXY_TARGET' as const;

/** Configured backend origin for deployed/shared envs (e.g. the hosted API). */
export const PUBLIC_API_URL_ENV = 'NEXT_PUBLIC_API_URL' as const;

/**
 * Default upstream when no env is set. Matches the Postman `baseUrl` and the
 * tunnel script's default remote port — run the tunnel with `--local-port 3000`
 * for zero-config, or set an env to your chosen target.
 */
export const DEFAULT_API_PROXY_TARGET = 'http://localhost:3000' as const;

/**
 * Resolve the backend origin (no path) that the Next `/api` rewrite and the
 * server-side fetches forward to. The browser never sees this — calls stay
 * same-origin, so there is no CORS regardless of which target wins.
 *
 * Precedence: `API_PROXY_TARGET` (per-machine override, e.g. an SSH tunnel) →
 * `NEXT_PUBLIC_API_URL` (the configured hosted backend) → localhost default.
 */
export function resolveBackendTarget(): string {
  return (
    process.env[API_PROXY_TARGET_ENV] ?? process.env[PUBLIC_API_URL_ENV] ?? DEFAULT_API_PROXY_TARGET
  );
}
