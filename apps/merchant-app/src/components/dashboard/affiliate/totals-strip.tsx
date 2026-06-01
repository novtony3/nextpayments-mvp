import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, Coins } from 'lucide-react';

import { Card } from '@nextpayments/ui/components/card';

import type { TotalsResult } from '@/lib/affiliate/types';

type TotalsStripProps = {
  result: TotalsResult;
};

/** Coerce backend string/number into a finite number, or 0 fallback. */
function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : 0;
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }).format(value);
}

/**
 * Per-coin commission totals laid out as a card grid. Echoes the dashboard's
 * `byCoin` panel so the affiliate page feels native to the rest of the shell.
 * Empty state is the common case for new accounts — render an explicit,
 * iconified placeholder rather than an apologetic message.
 */
export function TotalsStrip({ result }: TotalsStripProps) {
  const t = useTranslations('affiliate.totals');
  const locale = useLocale();

  if (!result.ok) {
    return (
      <Card glow={false} className="flex items-start gap-3 bg-[var(--glass-fill)] px-5 py-4">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]"
          aria-hidden="true"
        />
        <p className="text-sm text-[var(--color-text-muted)]">{t('error')}</p>
      </Card>
    );
  }

  if (result.data.length === 0) {
    return (
      <Card glow={false} className="flex items-center gap-4 px-6 py-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--glass-fill)] text-[var(--color-text-muted)]">
          <Coins className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
            {t('title')}
          </span>
          <p className="text-sm text-[var(--color-text-muted)]">{t('empty')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card glow={false} className="flex flex-col gap-4 px-6 py-6">
      <span className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
        {t('title')}
      </span>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 md:grid-cols-4">
        {result.data.map((entry, index) => {
          const amount = toNumber(entry.total ?? entry.amount);
          const coin = entry.coin ?? '—';
          return (
            <li
              key={`${coin}-${index}`}
              className="flex flex-col gap-1 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-fill)] px-4 py-3"
            >
              <span className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
                {coin}
              </span>
              <span className="text-lg font-medium text-[var(--color-text)]">
                {formatAmount(amount, locale)}
              </span>
              {entry.count !== undefined && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  {t('count', { count: entry.count })}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
