'use client';

import { AlertTriangle, Info, Plug, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type ReactNode } from 'react';

import { Button } from '@nextpayments/ui/components/button';
import { Card } from '@nextpayments/ui/components/card';
import { EmptyState } from '@nextpayments/ui/components/empty-state';
import { Tabs } from '@nextpayments/ui/components/tabs';

import { DOC_LINKS } from '@/constants/dashboard';
import type { IntegrationListResult } from '@/lib/integrations/types';

import { DashboardFooter } from './dashboard-footer';
import { AddIntegrationSheet } from './integrations/add-integration-sheet';
import { IntegrationsList } from './integrations/integrations-list';

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

type IntegrationsViewProps = {
  list: IntegrationListResult;
};

/**
 * Integrations page: help banner, Active / Webhook History tabs, the wired
 * list (GET /api/integrations) with a degraded notice on failure, and the
 * add-integration bottom sheet. Webhook history stays a placeholder — no
 * browser-facing list endpoint in API.md.
 */
export function IntegrationsView({ list }: IntegrationsViewProps) {
  const t = useTranslations('dashboard.integrations');
  const [tab, setTab] = useState<string>(TAB_ACTIVE);
  const [sheetOpen, setSheetOpen] = useState(false);

  const tabItems = useMemo(
    () => [
      { value: TAB_ACTIVE, label: t('tabActive') },
      { value: TAB_WEBHOOKS, label: t('tabWebhooks') },
    ],
    [t],
  );

  const addButton = (
    <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setSheetOpen(true)}>
      {t('add')}
    </Button>
  );

  const renderActive = () => {
    if (!list.ok) {
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
    if (list.data.rows.length === 0) {
      return (
        <Card glow={false}>
          <EmptyState
            icon={<Plug className="h-5 w-5" />}
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            action={addButton}
          />
        </Card>
      );
    }
    return (
      <>
        <div className="flex justify-end">{addButton}</div>
        <IntegrationsList data={list.data} />
      </>
    );
  };

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

      <Tabs aria-label={t('title')} items={tabItems} value={tab} onValueChange={setTab} />

      {tab === TAB_ACTIVE ? (
        renderActive()
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

      <AddIntegrationSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
