'use client';

import { Info, Plug, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type ReactNode } from 'react';

import { Button } from '@nextpayments/ui/components/button';
import { Card } from '@nextpayments/ui/components/card';
import { EmptyState } from '@nextpayments/ui/components/empty-state';
import { Pagination } from '@nextpayments/ui/components/pagination';
import { SearchInput } from '@nextpayments/ui/components/search-input';
import { Tabs } from '@nextpayments/ui/components/tabs';

import { DOC_LINKS } from '@/constants/dashboard';

import { DashboardFooter } from './dashboard-footer';

const TAB_ACTIVE = 'active';
const TAB_WEBHOOKS = 'webhooks';

function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

/**
 * Integrations page (UI phase): help banner, Active / Webhook History tabs,
 * search, empty state with the create CTA, and pagination. No data yet —
 * replaced by `GET /api/integrations` when the feature is wired.
 */
export function IntegrationsView() {
  const t = useTranslations('dashboard.integrations');
  const [tab, setTab] = useState<string>(TAB_ACTIVE);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const tabItems = useMemo(
    () => [
      { value: TAB_ACTIVE, label: t('tabActive') },
      { value: TAB_WEBHOOKS, label: t('tabWebhooks') },
    ],
    [t],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Card glow={false} className="flex items-start gap-3 bg-[var(--glass-fill)] px-5 py-4">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-subtle)]"
          aria-hidden="true"
        />
        <p className="text-sm text-[var(--color-text-muted)]">
          {t.rich('help', {
            docs: (chunks) => <DocLink href={DOC_LINKS.apiDocs}>{chunks}</DocLink>,
            kb: (chunks) => <DocLink href={DOC_LINKS.knowledgeBase}>{chunks}</DocLink>,
          })}
        </p>
      </Card>

      <Tabs aria-label={t('tabActive')} items={tabItems} value={tab} onValueChange={setTab} />

      {tab === TAB_ACTIVE ? (
        <>
          <SearchInput
            aria-label={t('searchPlaceholder')}
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:max-w-sm"
          />
          <Card glow={false}>
            <EmptyState
              icon={<Plug className="h-5 w-5" />}
              title={t('emptyTitle')}
              description={t('emptyDescription')}
              action={<Button leftIcon={<Plus className="h-4 w-4" />}>{t('add')}</Button>}
            />
          </Card>
          <Pagination
            page={page}
            totalPages={1}
            onPageChange={setPage}
            labels={{
              nav: t('pagination.nav'),
              prev: t('pagination.prev'),
              next: t('pagination.next'),
              page: t('pagination.page'),
            }}
          />
        </>
      ) : (
        <Card glow={false}>
          <EmptyState
            icon={<Plug className="h-5 w-5" />}
            title={t('webhooksEmptyTitle')}
            description={t('webhooksEmptyDescription')}
          />
        </Card>
      )}

      <DashboardFooter />
    </div>
  );
}
