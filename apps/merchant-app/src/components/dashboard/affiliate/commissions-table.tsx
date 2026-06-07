'use client';

import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, ReceiptText } from 'lucide-react';

import { Card } from '@nextpayments/ui/components/card';
import { DataTable, type DataTableColumn } from '@nextpayments/ui/components/data-table';
import { EmptyState } from '@nextpayments/ui/components/empty-state';

import { ROUTES } from '@/constants/routes';
import type { AffiliateCommissionRow, CommissionResult } from '@/lib/affiliate/types';

import { AffiliatePager } from './affiliate-pager';

type CommissionsTableProps = {
  result: CommissionResult;
  pageParam: string;
  /** Query params to preserve when paging (e.g. downline page + level). */
  preservedParams: Record<string, string | undefined>;
};

function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : 0;
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }).format(value);
}

function formatDate(value: string | undefined, locale: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}

/** Commissions ledger — paginated independently from the downline table. */
export function CommissionsTable({ result, pageParam, preservedParams }: CommissionsTableProps) {
  const t = useTranslations('affiliate.commissions');
  const locale = useLocale();

  const columns: DataTableColumn<AffiliateCommissionRow>[] = [
    {
      key: 'date',
      header: t('headers.date'),
      cellClassName: 'text-[var(--color-text-muted)]',
      render: (row) => formatDate(row.createdAt, locale),
    },
    { key: 'coin', header: t('headers.coin'), render: (row) => row.coin ?? '—' },
    {
      key: 'amount',
      header: t('headers.amount'),
      render: (row) => formatAmount(toNumber(row.amount), locale),
    },
    {
      key: 'from',
      header: t('headers.from'),
      cellClassName: 'text-[var(--color-text-muted)]',
      render: (row) => row.fromEmail ?? row.fromUserId ?? '—',
    },
  ];

  return (
    <Card glow={false} className="px-6 py-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium text-[var(--color-text)]">{t('title')}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{t('description')}</p>
        </div>

        {!result.ok && (
          <div className="flex items-center gap-3 rounded-xl border border-[color-mix(in_oklab,var(--color-danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-danger)_10%,transparent)] px-4 py-3">
            <AlertTriangle
              className="h-4 w-4 shrink-0 text-[var(--color-danger)]"
              aria-hidden="true"
            />
            <p className="text-sm text-[var(--color-text-muted)]">{t('error')}</p>
          </div>
        )}

        {result.ok && result.data.rows.length === 0 && (
          <EmptyState icon={<ReceiptText className="h-5 w-5" />} title={t('empty')} />
        )}

        {result.ok && result.data.rows.length > 0 && (
          <DataTable
            columns={columns}
            rows={result.data.rows}
            getRowKey={(row, index) => row._id ?? `${index}-${row.createdAt ?? ''}`}
          />
        )}

        {result.ok && (
          <AffiliatePager
            baseHref={ROUTES.AFFILIATE}
            preservedParams={preservedParams}
            pageParam={pageParam}
            page={result.data.page}
            totalPages={result.data.totalPages}
          />
        )}
      </div>
    </Card>
  );
}
