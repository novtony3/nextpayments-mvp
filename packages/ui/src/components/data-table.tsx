'use client';

import * as React from 'react';

import { cn } from '../lib/utils';

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
}

/**
 * Themed, horizontally-scrollable data table — one source of truth for the
 * dashboard list tables (orders, transactions, downline, commissions). Columns
 * are declarative `{ header, render }`; the caller owns the surrounding Card
 * shell, the empty/error states, and any pager below. Framework-agnostic:
 * headers are passed already-localized.
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  minWidthClassName,
  className,
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
        <tbody className="text-[var(--color-text)]">
          {rows.map((row, index) => (
            <tr
              key={getRowKey(row, index)}
              className="border-t border-[var(--color-border)] align-middle"
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3', col.cellClassName)}>
                  {col.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
