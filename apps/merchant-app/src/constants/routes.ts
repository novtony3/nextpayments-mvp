/**
 * App route paths — single source of truth. Locale prefix is added by the
 * next-intl navigation `Link`/`useRouter` from `@/i18n/routing`, so these are
 * locale-agnostic. Never hardcode a path string at a call site.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  /** Wallet / Balances — the protected dashboard landing. */
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  ORDERS: '/orders',
  /** Affiliate dashboard — totals + downline + commissions. Top-level
   * sidebar entry; sits above Pay Settings in the merchant nav. */
  AFFILIATE: '/affiliate',
  PAY_SETTINGS: '/pay-settings',
  INTEGRATIONS: '/integrations',
  INVOICING: '/invoicing',
  QUICK_POS: '/quick-pos',
  SUPPORT: '/support',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
