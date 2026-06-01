import { z } from 'zod';

import { paginatedSchema, type PaginatedPage } from '@/lib/pagination';

/**
 * Orders domain — zod is the source of truth, types inferred. Backend
 * contract (read directly from `/opt/crypto-payment-be/src/modules/order/`
 * 2026-05-27, on top of API.md §4):
 *
 *   GET  /api/orders/me?page&limit&status&integrationId           🔒 JWT
 *     → paginated `{ data:[orderForUser], total, totalPages, page, limit }`
 *       (toPublicForUser keeps `integrationId`, hides apiKeyId/userId/ipnUrl)
 *
 *   GET  /api/orders/me/stats?integrationId                       🔒 JWT
 *     → `{ totalOrders, paidOrders, byCoin:[{coin,totalAmount,count,
 *          priceUsd,totalUsdt}], totalUsdt }`
 *
 * The HMAC routes (POST /orders, GET /orders, GET /orders/:id) are
 * server-to-server and intentionally not wired from the browser.
 */

/** Backend lifecycle: `ORDER.STATUS` in `crypto-payment-be/src/config/constants`. */
export const ORDER_STATUSES = ['pending', 'paid', 'expired', 'cancelled'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orderStatusSchema = z.enum(ORDER_STATUSES);

/**
 * Order row — intentionally loose. The exact projected shape is
 * `toPublicForUser` (everything minus `apiKeyId/userId/ipnUrl/__v`), and the
 * verified test account is empty per API.md §1, so over-validating would
 * mislead. The table reads fields defensively.
 */
export const orderRowSchema = z
  .object({
    _id: z.string().optional(),
    id: z.union([z.string(), z.number()]).optional(),
    orderId: z.string().optional(),
    integrationId: z.string().optional(),
    externalOrderId: z.union([z.string(), z.number()]).optional(),
    amount: z.union([z.number(), z.string()]).optional(),
    coin: z.string().optional(),
    network: z.string().optional(),
    status: orderStatusSchema.optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

export type OrderRow = z.infer<typeof orderRowSchema>;

/** GET `/orders/me` paginated envelope. */
export const listOrdersForUserResponseSchema = paginatedSchema(orderRowSchema);

export type OrderListPage = PaginatedPage<OrderRow>;

export type OrderListResult = { ok: true; data: OrderListPage } | { ok: false };

export type OrderListQuery = {
  page: number;
  limit: number;
  status?: OrderStatus;
  integrationId?: string;
};

/**
 * GET `/orders/me/stats` — exact shape from `orderService.getDashboardStats`.
 * `byCoin` is already sorted desc by `totalUsdt` server-side (do not re-sort).
 * `priceUsd === 0` means the Coin doc has no seeded price; the UI surfaces a
 * single notice listing such coins rather than a per-row warning.
 */
export const orderStatsByCoinSchema = z.object({
  coin: z.string(),
  totalAmount: z.number(),
  count: z.number(),
  priceUsd: z.number(),
  totalUsdt: z.number(),
});

export type OrderStatsByCoin = z.infer<typeof orderStatsByCoinSchema>;

export const orderStatsSchema = z.object({
  totalOrders: z.number(),
  paidOrders: z.number(),
  byCoin: z.array(orderStatsByCoinSchema),
  totalUsdt: z.number(),
});

export type OrderStats = z.infer<typeof orderStatsSchema>;

export const orderStatsResponseSchema = z.object({
  data: orderStatsSchema,
});

export type OrderStatsResult = { ok: true; data: OrderStats } | { ok: false };

export type OrderStatsQuery = {
  /** Omit to aggregate across all the user's integrations. */
  integrationId?: string;
};

/**
 * Result-returning shape for the order-detail Server Component. `notfound`
 * is distinct from `error` so the page can render a 404-ish notice vs. a
 * "service unavailable" notice — see `lib/orders/backend.ts#loadOrderForUser`.
 */
export type OrderDetailResult =
  | { ok: true; data: OrderRow }
  | { ok: false; reason: 'notfound' | 'error' };
