'use client';

import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import { cn } from '@nextpayments/ui/lib/utils';

import { coinName, formatCoinAmount } from '@/constants/coins';
import { DEFAULT_HEADER_BALANCE_COIN } from '@/constants/fund';
import { getHeaderBalancesAction } from '@/lib/fund/actions';
import type { CoinBalance, HeaderBalancesResult } from '@/lib/fund/types';
import { useWindowFocus } from '@/lib/hooks/use-window-focus';
import { CoinAvatar } from '@/components/shared/coin-avatar';

type HeaderBalanceProps = {
  /** Server-rendered holdings — the coins that populate the selector (no flash). */
  initial: HeaderBalancesResult;
};

/** Shown when the selected coin has no known amount (no session / fetch failed). */
const NO_BALANCE = '—';

function holdingsOf(result: HeaderBalancesResult): CoinBalance[] {
  return result.ok ? result.balances : [];
}

/** Default selection: the preferred coin if held, else the first holding. */
function preferredCoin(holdings: CoinBalance[]): string {
  if (holdings.some((b) => b.coin === DEFAULT_HEADER_BALANCE_COIN)) {
    return DEFAULT_HEADER_BALANCE_COIN;
  }
  return holdings[0]?.coin ?? DEFAULT_HEADER_BALANCE_COIN;
}

/**
 * Dashboard header balance — one glass pill showing the selected coin's spendable
 * balance, sized to sit with the topbar's other controls (h-9). The coins come
 * from the account's actual balance response (server-rendered as `initial`,
 * refreshed on tab refocus), each mapped to the shared coin catalog for its token
 * gradient, name and decimal precision. A transparent native `<select>` overlays
 * the pill when more than one coin is held; otherwise it is a display-only chip.
 * Lives in the persistent shell, so its state survives client-side navigations.
 * Hidden on narrow screens.
 */
export function HeaderBalance({ initial }: HeaderBalanceProps) {
  const t = useTranslations('dashboard.headerBalance');
  const locale = useLocale();
  const [holdings, setHoldings] = useState<CoinBalance[]>(() => holdingsOf(initial));
  const [coin, setCoin] = useState<string>(() => preferredCoin(holdingsOf(initial)));
  const [pending, setPending] = useState(false);

  const refresh = useCallback(async () => {
    setPending(true);
    const result = await getHeaderBalancesAction();
    setPending(false);
    if (!result.ok) return;
    setHoldings(result.balances);
    // Keep the selection valid if the held coins changed under us.
    setCoin((current) =>
      result.balances.some((b) => b.coin === current) ? current : preferredCoin(result.balances),
    );
  }, []);

  // Refresh holdings when the user returns to the tab.
  useWindowFocus(() => void refresh());

  const amount = useMemo(
    () => holdings.find((b) => b.coin === coin)?.amount ?? null,
    [holdings, coin],
  );

  const canSwitch = holdings.length > 1;

  return (
    <div
      className={cn(
        'group relative hidden h-9 select-none items-center gap-2 rounded-full pl-1.5 pr-3.5',
        'border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-md',
        'transition-colors duration-200 sm:inline-flex',
        'focus-within:border-[var(--color-accent)]',
        canSwitch && 'pr-2.5 hover:border-[var(--color-accent)]',
      )}
    >
      <CoinAvatar ticker={coin} size="sm" />

      <span className="flex items-baseline gap-1">
        <span
          aria-live="polite"
          className={cn(
            'text-sm font-semibold tabular-nums leading-none text-[var(--color-text)]',
            'transition-opacity duration-200',
            pending && 'opacity-50',
          )}
        >
          {amount === null ? NO_BALANCE : formatCoinAmount(amount, coin, locale)}
        </span>
        <span className="text-xs font-medium leading-none text-[var(--color-text-muted)]">
          {coin}
        </span>
      </span>

      {canSwitch && (
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
            onChange={(event) => setCoin(event.target.value)}
            className={cn(
              'absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0',
              '[&>option]:bg-[var(--color-surface-elevated)] [&>option]:text-[var(--color-text)]',
            )}
          >
            {holdings.map((b) => (
              <option key={b.coin} value={b.coin}>
                {coinName(b.coin)} ({b.coin})
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
