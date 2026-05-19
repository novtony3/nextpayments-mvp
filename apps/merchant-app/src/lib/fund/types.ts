import { z } from 'zod';

/**
 * Fund (transactions) domain types + zod schemas. Schema is the source of
 * truth; types are inferred. Backend contract: API.md §2 paginated envelope.
 *
 * Row shape is **provisional**: the documented postman collection is not in
 * the repo and the verified test account has zero history, so the per-row
 * fields below are best-effort and intentionally loose (`.passthrough()`,
 * everything optional). Tighten once a real transaction surfaces the shape.
 */

/** Transaction tabs (screenshot). `all` is the default landing tab. */
export const TRANSACTION_TABS = [
  'all',
  'received',
  'sent',
  'conversions',
  'invoices',
  'payments',
] as const;

export type TransactionTab = (typeof TRANSACTION_TABS)[number];

export const transactionTabSchema = z.enum(TRANSACTION_TABS);

/** Provisional transaction row — only fields we can reasonably expect. */
export const transactionRowSchema = z
  .object({
    _id: z.string().optional(),
    id: z.union([z.string(), z.number()]).optional(),
    coin: z.string().optional(),
    network: z.string().optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional(),
    address: z.string().optional(),
    transactionHash: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

export type TransactionRow = z.infer<typeof transactionRowSchema>;

/** API.md §2 paginated envelope: `{ success, data: { data:[], total, ... } }`. */
export const paginatedTransactionsSchema = z.object({
  data: z.object({
    data: z.array(transactionRowSchema),
    total: z.number(),
    totalPages: z.number(),
    page: z.number(),
    limit: z.number(),
  }),
});

/** Normalized result the page consumes (success path). */
export type TransactionsPage = {
  rows: TransactionRow[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

/** Discriminated, serializable result — never throws into the RSC tree. */
export type TransactionsResult =
  | { ok: true; data: TransactionsPage }
  | { ok: false; reason: 'unsupported' | 'error' };

export type TransactionsQuery = {
  page: number;
  limit: number;
  /** Coin ticker filter (`?coin=`), when a currency is selected. */
  coin?: string;
};
