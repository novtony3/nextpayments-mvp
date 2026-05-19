import type { TransactionTab } from '@/lib/fund/types';

/**
 * Transactions page config — single source of truth for tab order/kind,
 * paging, and filter wiring. No React/i18n here: labels are i18n keys
 * (`dashboard.transactions.tabs.<key>`), icons are string keys the filters
 * component maps to Lucide.
 */

/** `data` tabs hit a fund-history endpoint; `placeholder` have none yet. */
export type TransactionTabKind = 'data' | 'placeholder';

export type TransactionTabMeta = {
  key: TransactionTab;
  kind: TransactionTabKind;
};

/** Order mirrors the reference screenshot; `all` is the default landing tab. */
export const TRANSACTION_TAB_META: ReadonlyArray<TransactionTabMeta> = [
  { key: 'all', kind: 'data' },
  { key: 'received', kind: 'data' },
  { key: 'sent', kind: 'data' },
  { key: 'conversions', kind: 'data' },
  { key: 'invoices', kind: 'placeholder' },
  { key: 'payments', kind: 'placeholder' },
];

export const DEFAULT_TRANSACTION_TAB: TransactionTab = 'all';

/** Backend `?limit=`; also the page size the pager assumes. */
export const TRANSACTIONS_PAGE_SIZE = 20 as const;

/** Sentinel for the currency filter's "all coins" option (omits `?coin=`). */
export const CURRENCY_FILTER_ALL = 'all' as const;

/** URL search-param keys driving the server fetch (no inline strings). */
export const TX_PARAM = {
  TAB: 'tab',
  PAGE: 'page',
  COIN: 'coin',
} as const;
