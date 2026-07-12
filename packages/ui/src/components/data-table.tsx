'use client';

import * as React from 'react';

import { cn } from '../lib/utils';
import { Skeleton } from './skeleton';

export type DataTableColumn<Row> = {
  /** Stable key + React key for the column. */
  key: string;
  /** Already-localized header label. */
  header: React.ReactNode;
  /** Cell content for a row. */
  render: (row: Row, index: number) => React.ReactNode;
  /** Extra classes for this column's `<td>` (e.g. `font-mono text-xs`). */
  cellClassName?: string;
  /** Extra classes for this column's `<th>`. */
  headerClassName?: string;
};

export interface DataTableProps<Row> {
  columns: ReadonlyArray<DataTableColumn<Row>>;
  rows: ReadonlyArray<Row>;
  /** Stable React key per row. */
  getRowKey: (row: Row, index: number) => string;
  /** Force horizontal scroll below this width, e.g. `min-w-[640px]`. */
  minWidthClassName?: string;
  /** Extra classes for the scroll wrapper. */
  className?: string;
  /** Render skeleton rows instead of data (wins over `empty`). */
  loading?: boolean;
  /** How many skeleton rows `loading` renders. */
  loadingRows?: number;
  /** Rendered full-width when `rows` is empty and not loading
   * (e.g. `<EmptyState title={…} />`). Omitted → today's bare table. */
  empty?: React.ReactNode;
}

/**
 * Themed, horizontally-scrollable data table — one source of truth for the
 * dashboard list tables (orders, transactions, downline, commissions). Columns
 * are declarative `{ header, render }`; the caller owns the surrounding Card
 * shell, any pager below; pass `empty` / `loading` for the built-in empty and
 * skeleton states (or omit both for the legacy bare table). Framework-agnostic:
 * headers are passed already-localized.
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  minWidthClassName,
  className,
  loading = false,
  loadingRows = 5,
  empty,
}: DataTableProps<Row>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className={cn('w-full border-collapse text-left text-sm', minWidthClassName)}>
        <thead className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-3 font-medium', col.headerClassName)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[var(--color-text)]" aria-busy={loading || undefined}>
          {loading ? (
            Array.from({ length: loadingRows }, (_, index) => (
              <tr key={index} className="border-t border-[var(--color-border)] align-middle">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.cellClassName)}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 && empty !== undefined ? (
            <tr className="border-t border-[var(--color-border)]">
              <td colSpan={columns.length} className="px-4 py-6">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={getRowKey(row, index)}
                className="row-interactive border-t border-[var(--color-border)] align-middle"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.cellClassName)}>
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
