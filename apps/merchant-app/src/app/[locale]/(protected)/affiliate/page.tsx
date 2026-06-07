import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  AFFILIATE_COMMISSIONS_PAGE_PARAM,
  AFFILIATE_DOWNLINE_PAGE_PARAM,
  AFFILIATE_FIRST_PAGE,
  AFFILIATE_ONLY_LEVEL,
  AFFILIATE_PAGE_LIMIT,
} from '@/constants/affiliate';
import { CommissionsTable } from '@/components/dashboard/affiliate/commissions-table';
import { DownlineTable } from '@/components/dashboard/affiliate/downline-table';
import { TotalsStrip } from '@/components/dashboard/affiliate/totals-strip';
import { loadAffiliateTotals, loadCommissions, loadDownline } from '@/lib/affiliate/backend';

type AffiliatePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Read the first occurrence of a query param as a string (Next provides
 * arrays when the same key appears multiple times). */
function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse a 1-based page from a query param; falls back to the first page. */
function parsePage(raw: string | undefined): number {
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n >= AFFILIATE_FIRST_PAGE ? n : AFFILIATE_FIRST_PAGE;
}

/**
 * Affiliate dashboard — a top-level merchant nav entry. Totals (per-coin
 * commission strip) at the top, then two paginated tables: downline
 * (referred users, filtered by level) and commissions ledger. All
 * read-only; the data layer (`lib/affiliate/backend`) returns
 * `{ ok:false }` instead of throwing so the page degrades to a notice
 * when the tunnel is down.
 *
 * Container width matches other dashboard pages (`max-w-6xl`) — the shell
 * already supplies `<main>` + horizontal padding, so this only contributes
 * the inner content stack.
 */
export default async function AffiliatePage({ params, searchParams }: AffiliatePageProps) {
  const [{ locale }, search] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const downlinePage = parsePage(firstParam(search[AFFILIATE_DOWNLINE_PAGE_PARAM]));
  const commissionsPage = parsePage(firstParam(search[AFFILIATE_COMMISSIONS_PAGE_PARAM]));

  const [totals, downline, commissions] = await Promise.all([
    loadAffiliateTotals(),
    loadDownline({
      page: downlinePage,
      limit: AFFILIATE_PAGE_LIMIT,
      level: AFFILIATE_ONLY_LEVEL,
    }),
    loadCommissions({
      page: commissionsPage,
      limit: AFFILIATE_PAGE_LIMIT,
    }),
  ]);

  const t = await getTranslations('affiliate');

  // Each table preserves the OTHER table's page param when paginating so
  // moving through commissions does not reset the downline page.
  const downlinePreserved: Record<string, string | undefined> = {
    [AFFILIATE_COMMISSIONS_PAGE_PARAM]:
      commissionsPage !== AFFILIATE_FIRST_PAGE ? String(commissionsPage) : undefined,
  };
  const commissionsPreserved: Record<string, string | undefined> = {
    [AFFILIATE_DOWNLINE_PAGE_PARAM]:
      downlinePage !== AFFILIATE_FIRST_PAGE ? String(downlinePage) : undefined,
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium text-[var(--color-text)]">{t('pageTitle')}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{t('pageSubtitle')}</p>
      </header>

      <TotalsStrip result={totals} />
      <DownlineTable
        result={downline}
        pageParam={AFFILIATE_DOWNLINE_PAGE_PARAM}
        preservedParams={downlinePreserved}
      />
      <CommissionsTable
        result={commissions}
        pageParam={AFFILIATE_COMMISSIONS_PAGE_PARAM}
        preservedParams={commissionsPreserved}
      />
    </div>
  );
}
