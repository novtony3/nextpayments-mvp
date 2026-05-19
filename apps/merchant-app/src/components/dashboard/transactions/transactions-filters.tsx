'use client';

import { useTranslations } from 'next-intl';

import { SelectField } from '@nextpayments/ui/components/select-field';
import { Tabs } from '@nextpayments/ui/components/tabs';

import { COIN_TILES } from '@/constants/coins';
import { CURRENCY_FILTER_ALL, TRANSACTION_TAB_META, TX_PARAM } from '@/constants/transactions';
import { usePathname, useRouter } from '@/i18n/routing';
import type { TransactionTab } from '@/lib/fund/types';

import { TX_TAB_ICONS } from './tab-icons';

type TransactionsFiltersProps = {
  tab: TransactionTab;
  /** Selected coin ticker, or the "all" sentinel. */
  coin: string;
};

const ICON_CLASS = 'h-4 w-4';

/**
 * Filter bar — tabs + currency. Only filters the backend actually supports
 * (`tab`, `?coin=`) are wired; selections are pushed to the URL so the
 * Server Component re-fetches (page resets to 1 on any filter change).
 */
export function TransactionsFilters({ tab, coin }: TransactionsFiltersProps) {
  const t = useTranslations('dashboard.transactions');
  const router = useRouter();
  const pathname = usePathname();

  const push = (next: Partial<Record<string, string>>) => {
    const params = new URLSearchParams();
    params.set(TX_PARAM.TAB, next.tab ?? tab);
    const nextCoin = next.coin ?? coin;
    if (nextCoin && nextCoin !== CURRENCY_FILTER_ALL) {
      params.set(TX_PARAM.COIN, nextCoin);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const tabItems = TRANSACTION_TAB_META.map((meta) => {
    const Icon = TX_TAB_ICONS[meta.key];
    return {
      value: meta.key,
      label: t(`tabs.${meta.key}`),
      icon: <Icon className={ICON_CLASS} aria-hidden="true" />,
    };
  });

  const currencyOptions = [
    { value: CURRENCY_FILTER_ALL, label: t('currencyAll') },
    ...COIN_TILES.map((c) => ({ value: c.ticker, label: `${c.name} (${c.ticker})` })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <Tabs
          aria-label={t('title')}
          items={tabItems}
          value={tab}
          onValueChange={(value) => push({ tab: value })}
          className="min-w-max"
        />
      </div>
      <SelectField
        aria-label={t('currencyFilter')}
        value={coin}
        onChange={(e) => push({ coin: e.target.value })}
        options={currencyOptions}
        className="w-full sm:max-w-xs"
      />
    </div>
  );
}
