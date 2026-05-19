import { z } from 'zod';

import { paginatedSchema, type PaginatedPage } from '@/lib/pagination';

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

/**
 * Transaction row — intentionally a free-form record. The documented postman
 * collection is absent and the verified account is empty, so the real field
 * shape is unknown. Validating specific field *types* here would reject real
 * rows (e.g. `amount` as an object) and mislead the user into the
 * transport-error state. Accept any object; the table reads fields
 * defensively and stringifies. Tighten when a real row is observed.
 *
 * Fields the UI looks for (best-effort): `coin`, `amount`, `status`,
 * `createdAt`, `transactionHash`/`_id`/`id`.
 */
export const transactionRowSchema = z.record(z.string(), z.unknown());

export type TransactionRow = z.infer<typeof transactionRowSchema>;

/** Shared API.md §2 paginated envelope (declared once in `lib/pagination`). */
export const paginatedTransactionsSchema = paginatedSchema(transactionRowSchema);

/** Normalized result the page consumes (success path). */
export type TransactionsPage = PaginatedPage<TransactionRow>;

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
