import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders/types';

/**
 * Orders UI config — single source of truth for the status filter, paging,
 * and URL search-param keys. No React/i18n here (clean-architecture):
 * labels are i18n keys (`dashboard.orders.status.<key>`) and the icon for
 * the sidebar comes from the icon map.
 */

/** Pseudo-value for "no status filter" — never sent to the backend. */
export const ORDER_STATUS_FILTER_ALL = 'all' as const;

/** Filter dropdown order (mirrors the lifecycle). */
export const ORDER_STATUS_FILTER_OPTIONS = [ORDER_STATUS_FILTER_ALL, ...ORDER_STATUSES] as const;

export type OrderStatusFilter = (typeof ORDER_STATUS_FILTER_OPTIONS)[number];

/** Backend `?limit=`; also the pager's assumed page size. */
export const ORDERS_PAGE_SIZE = 20 as const;

/** URL search-param keys driving the server list fetch. */
export const ORDERS_PARAM = {
  PAGE: 'page',
  STATUS: 'status',
  INTEGRATION: 'integrationId',
} as const;

/**
 * Backend error code → i18n reason key (under `dashboard.orders.errors`).
 * Kept here for forward-compat with the HMAC checkout widget — none of the
 * `/me` reads currently surface these to the user.
 */
export const ORDER_ERROR_CODE: Record<string, string> = {
  ORER001: 'invalidAmount',
  ORER002: 'invalidCoin',
  ORER003: 'notFound',
};

export type { OrderStatus };
