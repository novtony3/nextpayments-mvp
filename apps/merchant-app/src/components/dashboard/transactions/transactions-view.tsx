import { useTranslations } from 'next-intl';

import { Notice } from '@nextpayments/ui/components/notice';

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
        <Notice tone="info">{t('tabUnavailable', { tab: t(`tabs.${tab}`) })}</Notice>
      ) : result?.ok ? (
        <>
          {tab === 'all' && <Notice tone="info">{t('allNote')}</Notice>}
          <TransactionsTable data={result.data} tab={tab} coin={coin} />
        </>
      ) : (
        <Notice tone="danger">{t('error')}</Notice>
      )}
    </div>
  );
}
