/**
 * App route paths — single source of truth. Locale prefix is added by the
 * next-intl navigation `Link`/`useRouter` from `@/i18n/routing`, so these are
 * locale-agnostic. Never hardcode a path string at a call site.
 */
export const ROUTES = {
  HOME: '/',
  /** Placeholder page for sections we haven't shipped yet (docs, API reference,
   * blog, legal pages, …). Every unbuilt marketing link points here. */
  COMING_SOON: '/coming-soon',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  /** Set-a-new-password page reached from the reset email (carries `?token=`). */
  RESET_PASSWORD: '/reset-password',
  /** "Check your email" page shown after signup (carries `?email=`). */
  VERIFY_EMAIL: '/verify-email',
  /** Home — the protected dashboard overview + post-login landing. */
  OVERVIEW: '/home',
  /** Wallet / Balances. */
  DASHBOARD: '/dashboard',
  /** Withdrawal-approval landing reached from the email link; the single-use
   * approval token rides as a path segment (`/withdraw/approve/<token>`) so it
   * survives the protected-route login bounce, which only preserves the
   * pathname (the middleware's `x-pathname` drops the query string). */
  WITHDRAW_APPROVE: '/withdraw/approve',
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
