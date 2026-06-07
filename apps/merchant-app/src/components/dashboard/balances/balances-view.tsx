'use client';

import { ArrowDownLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Card } from '@nextpayments/ui/components/card';
import { IconButton } from '@nextpayments/ui/components/icon-button';
import { SearchInput } from '@nextpayments/ui/components/search-input';

import { COIN_TILES } from '@/constants/coins';
import { ZERO_CRYPTO } from '@/constants/dashboard';
import { formatCrypto, parseAmount } from '@/lib/format';
import type { BalanceRow } from '@/lib/fund/types';

/** Neutral tile when the coin isn't in the shared {@link COIN_TILES} list. */
const FALLBACK_GRADIENT = 'linear-gradient(135deg,#5a6772,#8a94a3)';

/** Display shape derived from a loose backend balance row + coin metadata. */
type DisplayBalance = {
  ticker: string;
  name: string;
  gradient: string;
  amount: string;
};

function CoinAvatar({ row }: { row: DisplayBalance }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold text-white"
      style={{ backgroundImage: row.gradient }}
    >
      {row.ticker.slice(0, 4)}
    </span>
  );
}

type BalancesViewProps = {
  /** Live rows from `GET /fund/balance` (loose shape; read defensively). */
  balances: BalanceRow[];
  /** False when the balance read failed (tunnel down / not authed). */
  ok: boolean;
  /** Open the deposit panel for a coin (balance row "Receive"). */
  onReceive: (coin: string) => void;
  /** Open the withdraw sheet for a coin (balance row "Send"). TODO: re-enable —
   * the Send icon is temporarily commented out, so this is currently unused. */
  onSend: (coin: string) => void;
};

/**
 * Wallet balances list — wired to `GET /fund/balance`. Rows are a loose
 * backend shape, so coin/amount are read defensively and display metadata
 * (name, tile color) is joined from the shared {@link COIN_TILES}. No fiat is
 * shown: the balance endpoint carries no price, so a fabricated value would be
 * misleading — the crypto amount is the source of truth.
 */
export function BalancesView({ balances, ok, onReceive }: BalancesViewProps) {
  const t = useTranslations('dashboard.balances');
  const locale = useLocale();
  const [query, setQuery] = useState('');

  const display = useMemo<DisplayBalance[]>(() => {
    return balances.map((row) => {
      const ticker =
        typeof row.coin === 'string'
          ? row.coin
          : typeof row.currency === 'string'
            ? row.currency
            : typeof row.ticker === 'string'
              ? row.ticker
              : '—';
      const tile = COIN_TILES.find((c) => c.ticker === ticker);
      const num = parseAmount(row.amount);
      return {
        ticker,
        name: tile?.name ?? ticker,
        gradient: tile?.gradient ?? FALLBACK_GRADIENT,
        amount: num === null ? ZERO_CRYPTO : formatCrypto(num, locale),
      };
    });
  }, [balances, locale]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return display;
    return display.filter(
      (row) => row.name.toLowerCase().includes(q) || row.ticker.toLowerCase().includes(q),
    );
  }, [display, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">{t('title')}</h2>
        <SearchInput
          aria-label={t('searchPlaceholder')}
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:ml-auto sm:max-w-xs"
        />
      </div>

      <p className="text-xs text-[var(--color-text-subtle)]">{t('fiatUnavailable')}</p>

      <Card glow={false} className="divide-y divide-[var(--color-border)]">
        {!ok ? (
          <p className="px-5 py-10 text-center text-sm text-[var(--color-danger)]">{t('error')}</p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
            {query ? t('empty') : t('noBalances')}
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.ticker} className="row-interactive flex items-center gap-4 px-5 py-4">
              <CoinAvatar row={row} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--color-text)]">{row.name}</p>
                <p className="text-xs text-[var(--color-text-subtle)]">{row.ticker}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {row.amount} {row.ticker}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <IconButton
                  aria-label={`${t('receive')} ${row.ticker}`}
                  variant="subtle"
                  icon={<ArrowDownLeft className="h-4 w-4" />}
                  onClick={() => onReceive(row.ticker)}
                />
                {/* TODO: re-enable withdraw — Send icon (opens the "Withdraw funds" sheet)
                    temporarily disabled.
                <IconButton
                  aria-label={`${t('send')} ${row.ticker}`}
                  variant="subtle"
                  icon={<ArrowUpRight className="h-4 w-4" />}
                  onClick={() => onSend(row.ticker)}
                />
                */}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
