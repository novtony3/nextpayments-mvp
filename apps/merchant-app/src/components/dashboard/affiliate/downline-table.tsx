'use client';

import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, UsersRound } from 'lucide-react';

import { Card } from '@nextpayments/ui/components/card';
import { DataTable, type DataTableColumn } from '@nextpayments/ui/components/data-table';
import { EmptyState } from '@nextpayments/ui/components/empty-state';

import { ROUTES } from '@/constants/routes';
import type { AffiliateDownlineRow, DownlineResult } from '@/lib/affiliate/types';

import { AffiliatePager } from './affiliate-pager';

type DownlineTableProps = {
  result: DownlineResult;
  /** Page-param key the pager mutates (constants/affiliate). */
  pageParam: string;
  /** Other search params to preserve when changing page (e.g. commissions page). */
  preservedParams: Record<string, string | undefined>;
};

function formatDate(value: string | undefined, locale: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}

/**
 * Downline (direct referrals) table. Single-level program — only level-1
 * referrals are shown, so there is no level filter or level column. Empty /
 * error states render in-card so the rest of the page still scrolls.
 *
 * Card lays out its children inside a non-flex wrapper, so the vertical rhythm
 * (header ↔ content ↔ pager) lives on the inner `flex flex-col gap-5` here.
 */
export function DownlineTable({ result, pageParam, preservedParams }: DownlineTableProps) {
  const t = useTranslations('affiliate.downline');
  const locale = useLocale();

  const columns: DataTableColumn<AffiliateDownlineRow>[] = [
    {
      key: 'email',
      header: t('headers.email'),
      render: (row) => row.email ?? row.userName ?? '—',
    },
    {
      key: 'joined',
      header: t('headers.joined'),
      cellClassName: 'text-[var(--color-text-muted)]',
      render: (row) => formatDate(row.joinedAt ?? row.createdAt, locale),
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
          <EmptyState icon={<UsersRound className="h-5 w-5" />} title={t('empty')} />
        )}

        {result.ok && result.data.rows.length > 0 && (
          <DataTable
            columns={columns}
            rows={result.data.rows}
            getRowKey={(row, index) => row._id ?? `${index}-${row.email ?? 'row'}`}
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
