'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';
import { Pagination } from '@nextpayments/ui/components/pagination';

import { INTEGRATIONS_PARAM } from '@/constants/integrations';
import { usePathname, useRouter } from '@/i18n/routing';
import type { Integration, IntegrationListPage } from '@/lib/integrations/types';

type IntegrationsListProps = {
  data: IntegrationListPage;
};

/**
 * Wired integration list (GET /api/integrations). Adaptive cells (loose row
 * schema); pagination pushes `?page=` so the Server Component refetches.
 */
export function IntegrationsList({ data }: IntegrationsListProps) {
  const t = useTranslations('dashboard.integrations');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    params.set(INTEGRATIONS_PARAM.PAGE, String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const created = (row: Integration): string => {
    if (!row.createdAt) return t('list.none');
    const d = new Date(row.createdAt);
    return Number.isNaN(d.getTime()) ? t('list.none') : d.toLocaleDateString(locale);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card glow={false} className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
              <th className="px-5 py-3 font-medium">{t('list.name')}</th>
              <th className="px-5 py-3 font-medium">{t('list.site')}</th>
              <th className="px-5 py-3 font-medium">{t('list.status')}</th>
              <th className="px-5 py-3 font-medium">{t('list.created')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.rows.map((row, i) => (
              <tr
                key={row._id ?? String(row.id ?? i)}
                className="transition-colors duration-200 hover:bg-[var(--glass-fill)]"
              >
                <td className="px-5 py-4 font-medium text-[var(--color-text)]">
                  {row.name || t('list.none')}
                </td>
                <td className="max-w-[18rem] truncate px-5 py-4 text-[var(--color-text-muted)]">
                  {row.siteUrl || t('list.none')}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={
                      row.isActive === false
                        ? 'rounded-full bg-[var(--glass-fill-strong)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]'
                        : 'rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent)]'
                    }
                  >
                    {row.isActive === false ? t('list.inactive') : t('list.active')}
                  </span>
                </td>
                <td className="px-5 py-4 text-[var(--color-text-muted)]">{created(row)}</td>
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
