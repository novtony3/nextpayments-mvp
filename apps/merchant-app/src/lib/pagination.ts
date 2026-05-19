import { z, type ZodTypeAny } from 'zod';

/**
 * API.md §2 paginated envelope — `{ data: { data:[…], total, totalPages,
 * page, limit } }`. Shared by every list endpoint (fund history,
 * integrations, …) so the wrapper shape is declared once, not per feature.
 */
export function paginatedSchema<T extends ZodTypeAny>(row: T) {
  return z.object({
    data: z.object({
      data: z.array(row),
      total: z.number(),
      totalPages: z.number(),
      page: z.number(),
      limit: z.number(),
    }),
  });
}

/** Normalized page the UI consumes (rows + paging), generic over the row. */
export type PaginatedPage<Row> = {
  rows: Row[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

/** `{ data:{ data, … } }` → flat {@link PaginatedPage}. */
export function toPaginatedPage<Row>(envelope: {
  data: { data: Row[]; total: number; totalPages: number; page: number; limit: number };
}): PaginatedPage<Row> {
  const { data, total, totalPages, page, limit } = envelope.data;
  return { rows: data, total, totalPages, page, limit };
}
