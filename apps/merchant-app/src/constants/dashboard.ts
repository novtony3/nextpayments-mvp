import { ROUTES, type Route } from '@/constants/routes';

/**
 * Merchant dashboard shell configuration — single source of truth for the
 * sidebar navigation, fiat display, and verification gate. No React here
 * (clean-architecture): the icon is a string key the sidebar maps to a
 * Lucide component, and labels are i18n keys (`dashboard.nav.<key>`), never
 * hardcoded copy.
 */

/** Lucide icon keys the dashboard chrome knows how to render. */
export type DashboardIconKey =
  | 'home'
  | 'wallet'
  | 'transactions'
  | 'orders'
  | 'affiliate'
  | 'paySettings'
  | 'integrations'
  | 'invoicing'
  | 'quickPos'
  | 'support';

export type DashboardNavItem = {
  /** i18n key under `dashboard.nav` + stable React key. */
  key: DashboardIconKey;
  route: Route;
  icon: DashboardIconKey;
  /** True when a real backend endpoint exists (API.md). UI-only otherwise. */
  backed: boolean;
};

/** Sidebar order mirrors the reference dashboard. */
export const DASHBOARD_NAV: ReadonlyArray<DashboardNavItem> = [
  { key: 'home', route: ROUTES.OVERVIEW, icon: 'home', backed: true },
  { key: 'wallet', route: ROUTES.DASHBOARD, icon: 'wallet', backed: true },
  { key: 'transactions', route: ROUTES.TRANSACTIONS, icon: 'transactions', backed: true },
  { key: 'orders', route: ROUTES.ORDERS, icon: 'orders', backed: true },
  { key: 'affiliate', route: ROUTES.AFFILIATE, icon: 'affiliate', backed: true },
  { key: 'paySettings', route: ROUTES.PAY_SETTINGS, icon: 'paySettings', backed: true },
  { key: 'integrations', route: ROUTES.INTEGRATIONS, icon: 'integrations', backed: true },
  { key: 'invoicing', route: ROUTES.INVOICING, icon: 'invoicing', backed: false },
  { key: 'quickPos', route: ROUTES.QUICK_POS, icon: 'quickPos', backed: false },
  { key: 'support', route: ROUTES.SUPPORT, icon: 'support', backed: true },
];

/** Fiat the estimated balance is displayed in (no inline "$"/"USD"). */
export const FIAT = { code: 'USD', symbol: '$' } as const;

/** Rows shown in the Home overview's "Recent Transactions" preview list. */
export const HOME_RECENT_LIMIT = 5 as const;

/** Zero-value placeholders for the UI-only balances list. */
export const ZERO_CRYPTO = '0.00000000' as const;
export const ZERO_FIAT = '0.00' as const;

/**
 * Master switch for the "verify your account" banner. The shell ANDs this
 * with the live `user.emailVerified` state (from `/user/me` via the protected
 * layout), so the banner only shows for unverified accounts. Flip to `false`
 * to suppress it entirely regardless of verification state.
 */
export const SHOW_VERIFY_BANNER = true as const;

/**
 * Outbound documentation/support links. Placeholders (`#`) for the UI phase —
 * centralized so the real URLs are swapped in one place, never inlined.
 */
export const DOC_LINKS = {
  apiDocs: '#',
  knowledgeBase: '#',
  integrationGuide: '#',
  faq: '#',
  support: '#',
} as const;
