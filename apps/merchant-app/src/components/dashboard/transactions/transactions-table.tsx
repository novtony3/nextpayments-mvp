'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';
import { DataTable, type DataTableColumn } from '@nextpayments/ui/components/data-table';
import { EmptyState } from '@nextpayments/ui/components/empty-state';

import { CURRENCY_FILTER_ALL, TX_PARAM } from '@/constants/transactions';
import { usePathname, useRouter } from '@/i18n/routing';
import type { TransactionRow, TransactionsPage, TransactionTab } from '@/lib/fund/types';
import { TablePagination } from '@/components/shared/table-pagination';

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
