import { AlertTriangle, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';

import type { TransactionTabKind } from '@/constants/transactions';
import type { TransactionsResult, TransactionTab } from '@/lib/fund/types';

import { TransactionsFilters } from './transactions-filters';
import { TransactionsTable } from './transactions-table';

type TransactionsViewProps = {
  tab: TransactionTab;
  coin: string;
  kind: TransactionTabKind;
  /** Present only for `data` tabs (placeholder tabs are not fetched). */
  result?: TransactionsResult;
};

function Notice({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card glow={false} className="bg-[var(--glass-fill)] px-5 py-4">
      {/* Card renders children inside a non-flex wrapper, so the row lives here
          to keep the icon and text aligned on one line. */}
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-[var(--color-text-subtle)]" aria-hidden="true">
          {icon}
        </span>
        <p className="text-sm text-[var(--color-text-muted)]">{children}</p>
      </div>
    </Card>
  );
}

/**
 * Transactions section: the filter bar plus the tab's content — adaptive
 * table, the provisional "all" note, a localized placeholder for tabs with
 * no backend, or a degraded error state (never a thrown 500).
 */
export function TransactionsView({ tab, coin, kind, result }: TransactionsViewProps) {
  const t = useTranslations('dashboard.transactions');

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <TransactionsFilters tab={tab} coin={coin} />

      {kind === 'placeholder' ? (
        <Notice icon={<Info className="h-4 w-4" />}>
          {t('tabUnavailable', { tab: t(`tabs.${tab}`) })}
        </Notice>
      ) : result?.ok ? (
        <>
          {tab === 'all' && <Notice icon={<Info className="h-4 w-4" />}>{t('allNote')}</Notice>}
          <TransactionsTable data={result.data} tab={tab} coin={coin} />
        </>
      ) : (
        <Notice icon={<AlertTriangle className="h-4 w-4 text-[var(--color-danger)]" />}>
          {t('error')}
        </Notice>
      )}
    </div>
  );
}
