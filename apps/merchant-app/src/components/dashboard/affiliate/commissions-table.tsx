import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, ReceiptText } from 'lucide-react';

import { Card } from '@nextpayments/ui/components/card';

import { ROUTES } from '@/constants/routes';
import type { CommissionResult } from '@/lib/affiliate/types';

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

  return (
    <Card glow={false} className="flex flex-col gap-6 px-6 py-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-medium text-[var(--color-text)]">{t('title')}</h2>
        <p className="text-sm text-[var(--color-text-muted)]">{t('description')}</p>
      </div>

      {!result.ok && (
        <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_oklab,var(--color-danger)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-danger)_10%,transparent)] px-4 py-3">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]"
            aria-hidden="true"
          />
          <p className="text-sm text-[var(--color-text-muted)]">{t('error')}</p>
        </div>
      )}

      {result.ok && result.data.rows.length === 0 && (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--glass-border)] bg-[var(--glass-fill)] px-4 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)]">
            <ReceiptText className="h-6 w-6 text-[var(--color-text-subtle)]" aria-hidden="true" />
          </span>
          <p className="text-sm text-[var(--color-text-muted)]">{t('empty')}</p>
        </div>
      )}

      {result.ok && result.data.rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
                <th className="border-b border-[var(--glass-border)] py-2 pr-4 font-medium">
                  {t('headers.date')}
                </th>
                <th className="border-b border-[var(--glass-border)] py-2 pr-4 font-medium">
                  {t('headers.coin')}
                </th>
                <th className="border-b border-[var(--glass-border)] py-2 pr-4 font-medium">
                  {t('headers.amount')}
                </th>
                <th className="border-b border-[var(--glass-border)] py-2 pr-4 font-medium">
                  {t('headers.level')}
                </th>
                <th className="border-b border-[var(--glass-border)] py-2 pr-4 font-medium">
                  {t('headers.from')}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.rows.map((row, index) => (
                <tr
                  key={row._id ?? `${index}-${row.createdAt ?? ''}`}
                  className="border-b border-[var(--glass-border)] last:border-b-0"
                >
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                    {formatDate(row.createdAt, locale)}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text)]">{row.coin ?? '—'}</td>
                  <td className="py-3 pr-4 text-[var(--color-text)]">
                    {formatAmount(toNumber(row.amount), locale)}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">{row.level ?? '—'}</td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                    {row.fromEmail ?? row.fromUserId ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    </Card>
  );
}
