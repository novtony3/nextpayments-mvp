'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';
import { Pagination } from '@nextpayments/ui/components/pagination';

import { CURRENCY_FILTER_ALL, TX_PARAM } from '@/constants/transactions';
import { usePathname, useRouter } from '@/i18n/routing';
import type { TransactionRow, TransactionsPage, TransactionTab } from '@/lib/fund/types';

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

  const formatDate = (value?: string): string => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? cell(value) : d.toLocaleString(locale);
  };

  if (data.rows.length === 0) {
    return (
      <Card glow={false}>
        <p className="px-5 py-16 text-center text-sm text-[var(--color-text-muted)]">
          {t('empty')}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card glow={false} className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
              <th className="px-5 py-3 font-medium">{t('columns.coin')}</th>
              <th className="px-5 py-3 font-medium">{t('columns.amount')}</th>
              <th className="px-5 py-3 font-medium">{t('columns.status')}</th>
              <th className="px-5 py-3 font-medium">{t('columns.date')}</th>
              <th className="px-5 py-3 font-medium">{t('columns.reference')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.rows.map((row, i) => (
              <tr
                key={String(row._id ?? row.id ?? i)}
                className="transition-colors duration-200 hover:bg-[var(--glass-fill)]"
              >
                <td className="px-5 py-4 font-medium text-[var(--color-text)]">{cell(row.coin)}</td>
                <td className="px-5 py-4 text-[var(--color-text)]">{cell(row.amount)}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent)]">
                    {cell(row.status)}
                  </span>
                </td>
                <td className="px-5 py-4 text-[var(--color-text-muted)]">
                  {formatDate(row.createdAt)}
                </td>
                <td className="max-w-[16rem] truncate px-5 py-4 font-mono text-xs text-[var(--color-text-subtle)]">
                  {reference(row)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Pagination
        page={data.page}
        totalPages={Math.max(data.totalPages, 1)}
        onPageChange={goToPage}
        labels={{
          nav: t('pagination.nav'),
          prev: t('pagination.prev'),
          next: t('pagination.next'),
          page: (n) => t('pagination.page', { page: n }),
        }}
      />
    </div>
  );
}
