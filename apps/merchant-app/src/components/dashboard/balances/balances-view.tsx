'use client';

import { ArrowDownLeft, ArrowUpRight, Lock, Repeat } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Card } from '@nextpayments/ui/components/card';
import { IconButton } from '@nextpayments/ui/components/icon-button';
import { SearchInput } from '@nextpayments/ui/components/search-input';
import { SelectField } from '@nextpayments/ui/components/select-field';
import { ToggleSwitch } from '@nextpayments/ui/components/toggle-switch';

import { MOCK_BALANCES, type BalanceRow } from '@/constants/balances';
import { FIAT, ZERO_FIAT } from '@/constants/dashboard';

function CoinAvatar({ row }: { row: BalanceRow }) {
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

/**
 * Wallet balances list. Client-side search/filter only (UI phase); rows come
 * from the shared mock data and are replaced by `GET /api/fund/balance` when
 * Fund is wired. Single-accent Gemini styling, theme-aware tokens throughout.
 */
export function BalancesView() {
  const t = useTranslations('dashboard.balances');
  const [query, setQuery] = useState('');
  const [autoAccept, setAutoAccept] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_BALANCES;
    return MOCK_BALANCES.filter(
      (row) => row.name.toLowerCase().includes(q) || row.ticker.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput
          aria-label={t('searchPlaceholder')}
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <SelectField
          aria-label={t('filterAll')}
          defaultValue="all"
          options={[{ value: 'all', label: t('filterAll') }]}
        />
        <div className="sm:ml-auto sm:text-right">
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
            {t('estimatedBalance')}
          </p>
          <p className="text-2xl font-semibold text-[var(--color-text)]">
            {FIAT.symbol}
            {ZERO_FIAT} {FIAT.code}
          </p>
        </div>
      </div>

      <label className="flex w-fit items-center gap-3 text-sm text-[var(--color-text-muted)]">
        <ToggleSwitch
          aria-label={t('autoAccept')}
          checked={autoAccept}
          onCheckedChange={setAutoAccept}
        />
        {t('autoAccept')}
      </label>

      <Card glow={false} className="divide-y divide-[var(--color-border)]">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[var(--color-text-muted)]">
            {t('empty')}
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
                <p className="text-xs text-[var(--color-text-subtle)]">
                  {FIAT.symbol}
                  {row.fiat} {FIAT.code}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {row.locked ? (
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-subtle)]"
                    title={t('locked', { ticker: row.ticker })}
                  >
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{t('locked', { ticker: row.ticker })}</span>
                  </span>
                ) : (
                  <>
                    <IconButton
                      aria-label={`${t('send')} ${row.ticker}`}
                      variant="subtle"
                      icon={<ArrowUpRight className="h-4 w-4" />}
                    />
                    <IconButton
                      aria-label={`${t('receive')} ${row.ticker}`}
                      variant="subtle"
                      icon={<ArrowDownLeft className="h-4 w-4" />}
                    />
                    <IconButton
                      aria-label={`${t('convert')} ${row.ticker}`}
                      variant="subtle"
                      icon={<Repeat className="h-4 w-4" />}
                    />
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
