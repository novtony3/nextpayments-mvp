import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@nextpayments/ui/lib/utils';

import { Link } from '@/i18n/routing';

type PagerProps = {
  /** Base path the pager links to (locale-prefixed by next-intl `Link`). */
  baseHref: string;
  /** Existing query params to preserve when changing pages. */
  preservedParams: Record<string, string | undefined>;
  /** Search-param key this pager mutates (so two pagers on a page do not clash). */
  pageParam: string;
  /** 1-based current page. */
  page: number;
  /** Total pages available (0 when the list is empty — pager hides). */
  totalPages: number;
};

const STEP_CLASS = cn(
  'inline-flex h-8 items-center gap-1 rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)]',
  'px-3 text-xs font-medium text-[var(--color-text)] backdrop-blur-md transition-colors',
  'hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]',
);
const STEP_DISABLED_CLASS = cn(
  'inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-full border border-[var(--glass-border)]',
  'bg-[var(--glass-fill)] px-3 text-xs font-medium text-[var(--color-text-subtle)] opacity-60',
);

function makeHref(
  baseHref: string,
  params: Record<string, string | undefined>,
  pageParam: string,
  page: number,
): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') search.set(k, v);
  }
  search.set(pageParam, String(page));
  const qs = search.toString();
  return qs ? `${baseHref}?${qs}` : baseHref;
}

/**
 * URL-driven pager for the affiliate tables. Two pagers coexist on the page
 * (downline + commissions) — each binds to its own `pageParam` so they
 * paginate independently without clobbering each other's state.
 */
export function AffiliatePager({
  baseHref,
  preservedParams,
  pageParam,
  page,
  totalPages,
}: PagerProps) {
  const t = useTranslations('affiliate.pager');
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--glass-border)] pt-3">
      <span className="text-xs text-[var(--color-text-muted)]">
        {t('label', { page, totalPages })}
      </span>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={makeHref(baseHref, preservedParams, pageParam, page - 1)}
            className={STEP_CLASS}
            aria-label={t('previous')}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            {t('previous')}
          </Link>
        ) : (
          <span className={STEP_DISABLED_CLASS} aria-disabled>
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            {t('previous')}
          </span>
        )}
        {hasNext ? (
          <Link
            href={makeHref(baseHref, preservedParams, pageParam, page + 1)}
            className={STEP_CLASS}
            aria-label={t('next')}
          >
            {t('next')}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <span className={STEP_DISABLED_CLASS} aria-disabled>
            {t('next')}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}
