'use client';

import { KeyRound, Pencil, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Card } from '@nextpayments/ui/components/card';
import { IconButton } from '@nextpayments/ui/components/icon-button';
import { Pagination } from '@nextpayments/ui/components/pagination';

import { INTEGRATIONS_PARAM } from '@/constants/integrations';
import { usePathname, useRouter } from '@/i18n/routing';
import type { Integration, IntegrationListPage } from '@/lib/integrations/types';

import { ManageIntegrationSheet, type ManageTab } from './manage-integration-sheet';

type IntegrationsListProps = {
  data: IntegrationListPage;
};

/**
 * Wired integration list (GET /api/integrations). Adaptive cells (loose row
 * schema); pagination pushes `?page=` so the Server Component refetches.
 */
export function IntegrationsList({ data }: IntegrationsListProps) {
  const t = useTranslations('dashboard.integrations');
  const tManage = useTranslations('dashboard.integrations.manage');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<Integration | null>(null);
  const [tab, setTab] = useState<ManageTab>('settings');

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    params.set(INTEGRATIONS_PARAM.PAGE, String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const openAt = (row: Integration, next: ManageTab) => {
    setSelected(row);
    setTab(next);
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
              <th className="px-5 py-3 text-right font-medium">{t('list.actions')}</th>
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
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <IconButton
                      icon={<Pencil className="h-4 w-4" />}
                      aria-label={tManage('row.edit')}
                      onClick={() => openAt(row, 'settings')}
                      size="sm"
                    />
                    <IconButton
                      icon={<KeyRound className="h-4 w-4" />}
                      aria-label={tManage('row.keys')}
                      onClick={() => openAt(row, 'keys')}
                      size="sm"
                    />
                    <IconButton
                      icon={<Trash2 className="h-4 w-4" />}
                      aria-label={tManage('row.delete')}
                      onClick={() => openAt(row, 'delete')}
                      size="sm"
                      className="hover:text-[var(--color-danger)]"
                    />
                  </div>
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

      <ManageIntegrationSheet
        open={selected != null}
        onClose={() => setSelected(null)}
        integration={selected}
        initialTab={tab}
      />
    </div>
  );
}
