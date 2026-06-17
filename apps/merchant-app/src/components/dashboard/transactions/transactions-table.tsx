'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';
import { DataTable, type DataTableColumn } from '@nextpayments/ui/components/data-table';
import { EmptyState } from '@nextpayments/ui/components/empty-state';

import { WITHDRAW_TERMINAL_STATUSES } from '@/constants/fund';
import { CURRENCY_FILTER_ALL, TX_PARAM } from '@/constants/transactions';
import { usePathname, useRouter } from '@/i18n/routing';
import type { TransactionRow, TransactionsPage, TransactionTab } from '@/lib/fund/types';
import { TablePagination } from '@/components/shared/table-pagination';
import { WithdrawCancelButton } from './withdraw-cancel-button';

type TransactionsTableProps = {
  data: TransactionsPage;
  tab: TransactionTab;
  coin: string;
};

function cell(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  return String(value);
}

function reference(row: TransactionRow): string {
  return cell(row.transactionHash ?? row._id ?? row.id);
}

function rowKey(row: TransactionRow, index: number): string {
  const id = row._id ?? row.id;
  return id === undefined || id === null ? String(index) : String(id);
}

/**
 * Id to cancel a withdrawal by. Prefer a numeric business id — the backend's
 * `confirm-withdrawal` uses a numeric `externalId`, so `DELETE /:withdrawId`
 * likely wants that, not the Mongo `_id` the table otherwise displays. Falls
 * back through `id` → `_id`. (Assumed shape — no authed history to observe.)
 */
function withdrawCancelId(row: TransactionRow): string | undefined {
  for (const value of [row.withdrawId, row.externalId, row.id, row._id]) {
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string' && value) return value;
  }
  return undefined;
}

/**
 * The cancel id when the row looks cancellable: we have an id AND the status is
 * not clearly terminal (denylist). Unknown statuses stay cancellable — the
 * backend rejects a non-cancellable withdrawal, so it is the authority.
 */
function withdrawCancelTarget(row: TransactionRow): string | undefined {
  const id = withdrawCancelId(row);
  if (!id) return undefined;
  const status = typeof row.status === 'string' ? row.status.toLowerCase() : '';
  return WITHDRAW_TERMINAL_STATUSES.includes(status) ? undefined : id;
}

/**
 * Transaction list. Rows are rendered adaptively (provisional shape — see
 * `lib/fund/types`); missing fields show as "—". Pagination pushes `?page=`
 * to the URL so the Server Component refetches, preserving tab + coin.
 */
export function TransactionsTable({ data, tab, coin }: TransactionsTableProps) {
  const t = useTranslations('dashboard.transactions');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    params.set(TX_PARAM.TAB, tab);
    if (coin && coin !== CURRENCY_FILTER_ALL) params.set(TX_PARAM.COIN, coin);
    params.set(TX_PARAM.PAGE, String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const formatDate = (value: unknown): string => {
    if (typeof value !== 'string' && typeof value !== 'number') return cell(value);
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? cell(value) : d.toLocaleString(locale);
  };

  if (data.rows.length === 0) {
    return (
      <Card glow={false}>
        <EmptyState title={t('empty')} />
      </Card>
    );
  }

  const columns: DataTableColumn<TransactionRow>[] = [
    {
      key: 'coin',
      header: t('columns.coin'),
      cellClassName: 'font-medium',
      render: (row) => cell(row.coin),
    },
    { key: 'amount', header: t('columns.amount'), render: (row) => cell(row.amount) },
    {
      key: 'status',
      header: t('columns.status'),
      render: (row) => (
        <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent)]">
          {cell(row.status)}
        </span>
      ),
    },
    {
      key: 'date',
      header: t('columns.date'),
      cellClassName: 'text-[var(--color-text-muted)]',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'reference',
      header: t('columns.reference'),
      cellClassName: 'max-w-[16rem] truncate font-mono text-xs text-[var(--color-text-subtle)]',
      render: (row) => reference(row),
    },
  ];

  // The "sent" tab is the withdrawal history — pending rows can be cancelled
  // (`DELETE /fund/withdraw/:id`). Only added here so other tabs are untouched.
  if (tab === 'sent') {
    columns.push({
      key: 'actions',
      header: t('columns.actions'),
      cellClassName: 'text-right',
      render: (row) => {
        const id = withdrawCancelTarget(row);
        return id ? <WithdrawCancelButton withdrawId={id} /> : null;
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card glow={false} className="p-0">
        <DataTable
          columns={columns}
          rows={data.rows}
          getRowKey={rowKey}
          minWidthClassName="min-w-[40rem]"
        />
      </Card>

      <TablePagination page={data.page} totalPages={data.totalPages} onPageChange={goToPage} />
    </div>
  );
}
