import { z } from 'zod';

import { paginatedSchema, type PaginatedPage } from '@/lib/pagination';

/**
 * Affiliate domain — zod is the source of truth. Backend contract:
 * API.md §Affiliate + live probe (2026-06-01):
 *
 *   GET /api/affiliate/totals      → { data: { totals: [] } }
 *   GET /api/affiliate/downline    → paginated rows (empty for a fresh acct)
 *   GET /api/affiliate/commissions → paginated rows
 *
 * Row schemas are intentionally permissive (`.passthrough()` + optional
 * fields) because the populated shapes are not yet covered by the Postman
 * collection — adjust the field names once a seeded account is available.
 */

const totalEntrySchema = z
  .object({
    coin: z.string().optional(),
    total: z.union([z.number(), z.string()]).optional(),
    amount: z.union([z.number(), z.string()]).optional(),
    count: z.number().optional(),
  })
  .passthrough();

export type AffiliateTotalEntry = z.infer<typeof totalEntrySchema>;

export const totalsResponseSchema = z.object({
  data: z.object({ totals: z.array(totalEntrySchema) }),
});

const downlineRowSchema = z
  .object({
    _id: z.string().optional(),
    email: z.string().optional(),
    userName: z.string().optional(),
    level: z.number().int().optional(),
    joinedAt: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();

export type AffiliateDownlineRow = z.infer<typeof downlineRowSchema>;

const commissionRowSchema = z
  .object({
    _id: z.string().optional(),
    coin: z.string().optional(),
    amount: z.union([z.number(), z.string()]).optional(),
    level: z.number().int().optional(),
    fromUserId: z.string().optional(),
    fromEmail: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();

export type AffiliateCommissionRow = z.infer<typeof commissionRowSchema>;

export const listDownlineResponseSchema = paginatedSchema(downlineRowSchema);
export const listCommissionsResponseSchema = paginatedSchema(commissionRowSchema);

export type DownlinePage = PaginatedPage<AffiliateDownlineRow>;
export type CommissionPage = PaginatedPage<AffiliateCommissionRow>;
export type AffiliateTotals = AffiliateTotalEntry[];

export type DownlineResult = { ok: true; data: DownlinePage } | { ok: false };
export type CommissionResult = { ok: true; data: CommissionPage } | { ok: false };
export type TotalsResult = { ok: true; data: AffiliateTotals } | { ok: false };

/** UI query for downline — page-1 by default, optional level filter. */
export type DownlineQuery = {
  page: number;
  limit: number;
  level?: number;
};

export type CommissionsQuery = {
  page: number;
  limit: number;
};
