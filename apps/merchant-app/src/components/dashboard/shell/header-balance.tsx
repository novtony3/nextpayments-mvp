'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { SelectField } from '@nextpayments/ui/components/select-field';
import { cn } from '@nextpayments/ui/lib/utils';

import { DEFAULT_HEADER_BALANCE_COIN, HEADER_BALANCE_COINS } from '@/constants/fund';
import { formatFiat } from '@/lib/format';
import { getFundBalanceAction } from '@/lib/fund/actions';
import type { HeaderBalanceResult } from '@/lib/fund/types';
import { useWindowFocus } from '@/lib/hooks/use-window-focus';

type HeaderBalanceProps = {
  /** Server-rendered balance for the default coin — avoids a first-paint flash. */
  initial: HeaderBalanceResult;
};

/** Coin options for the selector (the ticker is also its display label). */
const COIN_OPTIONS = HEADER_BALANCE_COINS.map((coin) => ({ value: coin, label: coin }));

/** Shown when the balance is unknown (no session / fetch failed). */
const NO_BALANCE = '—';

/**
 * Dashboard header balance — a coin selector beside the selected coin's
 * spendable balance (`GET /fund/balance?coin=`). The default coin's amount is
 * server-rendered (`initial`); switching coins or returning to the tab refetches
 * via a Server Action. It lives in the persistent shell, so the selection and
 * last value survive client-side navigations. Hidden on narrow screens.
 */
export function HeaderBalance({ initial }: HeaderBalanceProps) {
  const t = useTranslations('dashboard.headerBalance');
  const locale = useLocale();
  const [coin, setCoin] = useState(initial.ok ? initial.coin : DEFAULT_HEADER_BALANCE_COIN);
  const [amount, setAmount] = useState<number | null>(initial.ok ? initial.amount : null);
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async (next: string) => {
    setPending(true);
    const result = await getFundBalanceAction(next);
    setAmount(result.ok ? result.amount : null);
    setPending(false);
  }, []);

  const onCoinChange = (next: string) => {
    setCoin(next);
    void refresh(next);
  };

  // Re-fetch the current coin when the user returns to the tab.
  useWindowFocus(() => void refresh(coin));

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <SelectField
        aria-label={t('coinLabel')}
        value={coin}
        options={COIN_OPTIONS}
        onChange={(event) => onCoinChange(event.target.value)}
      />
      <span
        aria-live="polite"
        className={cn(
          'min-w-16 text-right text-sm font-semibold tabular-nums text-[var(--color-text)] transition-opacity duration-200',
          pending && 'opacity-50',
        )}
      >
        {amount === null ? NO_BALANCE : formatFiat(amount, locale)}
      </span>
    </div>
  );
}
