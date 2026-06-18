'use client';

import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { cn } from '@nextpayments/ui/lib/utils';

import { coinGradient } from '@/constants/coins';
import { DEFAULT_HEADER_BALANCE_COIN, HEADER_BALANCE_COINS } from '@/constants/fund';
import { formatFiat } from '@/lib/format';
import { getFundBalanceAction } from '@/lib/fund/actions';
import type { HeaderBalanceResult } from '@/lib/fund/types';
import { useWindowFocus } from '@/lib/hooks/use-window-focus';

type HeaderBalanceProps = {
  /** Server-rendered balance for the default coin — avoids a first-paint flash. */
  initial: HeaderBalanceResult;
};

/** Shown when the balance is unknown (no session / fetch failed). */
const NO_BALANCE = '—';

/** Soft top highlight layered over the coin gradient for a glossy-token look. */
const COIN_GLOSS = 'radial-gradient(circle at 50% 28%, rgba(255, 255, 255, 0.5), transparent 58%)';

/**
 * A coin switch (chevron + select) only makes sense once more than one coin is
 * offered; with a single coin the pill is a clean display-only chip. Computed
 * once from the catalog so adding a coin lights up the switcher automatically.
 */
const CAN_SWITCH_COIN = HEADER_BALANCE_COINS.length > 1;

/**
 * Dashboard header balance — one glass pill, sized to sit with the topbar's
 * other controls (h-9): a glossy brand-gradient coin token, the spendable amount
 * (`GET /fund/balance?coin=`), and the ticker. The default coin's amount is
 * server-rendered (`initial`). When more than one coin is offered, a transparent
 * native `<select>` overlays the pill for an accessible, low-code coin switch
 * (matching the app's `SelectField` approach) and a chevron signals it; with one
 * coin the pill is display-only. The value refetches on switch + tab refocus. It
 * lives in the persistent shell, so its state survives client-side navigations.
 * Hidden on narrow screens.
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
    <div
      className={cn(
        'group relative hidden h-9 select-none items-center gap-2 rounded-full pl-1.5 pr-3.5',
        'border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-md',
        'transition-colors duration-200 sm:inline-flex',
        'focus-within:border-[var(--color-accent)]',
        CAN_SWITCH_COIN && 'pr-2.5 hover:border-[var(--color-accent)]',
      )}
    >
      <span
        aria-hidden="true"
        className="h-6 w-6 shrink-0 rounded-full ring-1 ring-inset ring-[var(--glass-highlight)]"
        style={{ backgroundImage: `${COIN_GLOSS}, ${coinGradient(coin)}` }}
      />

      <span className="flex items-baseline gap-1">
        <span
          aria-live="polite"
          className={cn(
            'text-sm font-semibold tabular-nums leading-none text-[var(--color-text)]',
            'transition-opacity duration-200',
            pending && 'opacity-50',
          )}
        >
          {amount === null ? NO_BALANCE : formatFiat(amount, locale)}
        </span>
        <span className="text-xs font-medium leading-none text-[var(--color-text-muted)]">
          {coin}
        </span>
      </span>

      {CAN_SWITCH_COIN && (
        <>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-[var(--color-text-subtle)] transition-colors duration-200',
              'group-focus-within:text-[var(--color-accent)] group-hover:text-[var(--color-text-muted)]',
            )}
          />
          <select
            aria-label={t('coinLabel')}
            value={coin}
            onChange={(event) => onCoinChange(event.target.value)}
            className={cn(
              'absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0',
              '[&>option]:bg-[var(--color-surface-elevated)] [&>option]:text-[var(--color-text)]',
            )}
          >
            {HEADER_BALANCE_COINS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
