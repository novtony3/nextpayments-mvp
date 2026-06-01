import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, UsersRound } from 'lucide-react';

import { Card } from '@nextpayments/ui/components/card';
import { cn } from '@nextpayments/ui/lib/utils';

import { AFFILIATE_LEVEL_PARAM, AFFILIATE_LEVELS } from '@/constants/affiliate';
import { ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import type { DownlineResult } from '@/lib/affiliate/types';

import { AffiliatePager } from './affiliate-pager';

type DownlineTableProps = {
  result: DownlineResult;
  /** Current level filter, or `null` for "all levels". */
  level: number | null;
  /** Page-param key the pager mutates (constants/affiliate). */
  pageParam: string;
  /** Other search params to preserve when changing page (e.g. commissions page). */
  preservedParams: Record<string, string | undefined>;
};

const CHIP_BASE = cn(
  'inline-flex h-7 items-center justify-center rounded-full border px-3 text-xs font-medium transition-colors',
);
const CHIP_ACTIVE = cn(
  CHIP_BASE,
  'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-text)]',
);
const CHIP_INACTIVE = cn(
  CHIP_BASE,
  'border-[var(--glass-border)] bg-[var(--glass-fill)] text-[var(--color-text-muted)]',
  'hover:border-[var(--color-accent)] hover:text-[var(--color-text)]',
);

function formatDate(value: string | undefined, locale: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}

/**
 * Downline (referred users) table. Level filter is URL-driven: clicking a
 * chip mutates `?level=` and (implicitly via the omitted page param) resets
 * the downline page to 1. Empty / error states render in-card so the rest
 * of the page still scrolls.
 */
export function DownlineTable({ result, level, pageParam, preservedParams }: DownlineTableProps) {
  const t = useTranslations('affiliate.downline');
  const locale = useLocale();

  return (
    <Card glow={false} className="flex flex-col gap-6 px-6 py-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium text-[var(--color-text)]">{t('title')}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">{t('description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
            {t('levelFilter')}
          </span>
          <LevelChip
            label={t('allLevels')}
            href={buildLevelHref(null, preservedParams)}
            active={level === null}
          />
          {AFFILIATE_LEVELS.map((l) => (
            <LevelChip
              key={l}
              label={String(l)}
              href={buildLevelHref(l, preservedParams)}
              active={level === l}
            />
          ))}
        </div>
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
            <UsersRound className="h-6 w-6 text-[var(--color-text-subtle)]" aria-hidden="true" />
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
                  {t('headers.email')}
                </th>
                <th className="border-b border-[var(--glass-border)] py-2 pr-4 font-medium">
                  {t('headers.level')}
                </th>
                <th className="border-b border-[var(--glass-border)] py-2 pr-4 font-medium">
                  {t('headers.joined')}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.rows.map((row, index) => (
                <tr
                  key={row._id ?? `${index}-${row.email ?? 'row'}`}
                  className="border-b border-[var(--glass-border)] last:border-b-0"
                >
                  <td className="py-3 pr-4 text-[var(--color-text)]">
                    {row.email ?? row.userName ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">{row.level ?? '—'}</td>
                  <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                    {formatDate(row.joinedAt ?? row.createdAt, locale)}
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

function buildLevelHref(
  level: number | null,
  preservedParams: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(preservedParams)) {
    if (v !== undefined && v !== '') search.set(k, v);
  }
  if (level !== null) search.set(AFFILIATE_LEVEL_PARAM, String(level));
  const qs = search.toString();
  return qs ? `${ROUTES.AFFILIATE}?${qs}` : ROUTES.AFFILIATE;
}

type LevelChipProps = { label: string; href: string; active: boolean };

function LevelChip({ label, href, active }: LevelChipProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={active ? CHIP_ACTIVE : CHIP_INACTIVE}
    >
      {label}
    </Link>
  );
}
