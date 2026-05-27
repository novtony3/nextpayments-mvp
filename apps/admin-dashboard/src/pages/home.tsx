import { useTranslation } from 'react-i18next';

import { cn } from '@nextpayments/ui/lib/utils';

import { OVERVIEW_STATS, RECENT_TX } from '@/constants/dashboard';
import { StatCard } from '@/components/dashboard/stat-card';

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          {t('home.title')}
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{t('home.subtitle')}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {OVERVIEW_STATS.map((s) => (
          <StatCard
            key={s.id}
            label={t(s.labelKey)}
            value={s.value}
            delta={s.delta}
            deltaUp={s.deltaUp}
            deltaCaption={t(s.deltaUp ? 'home.trend.up' : 'home.trend.down')}
            icon={s.icon}
          />
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-sm font-medium text-[var(--color-text)]">{t('home.recent.title')}</h2>
          <button
            type="button"
            className="text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
          >
            {t('common.viewAll')}
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[var(--color-text-subtle)]">
              <th className="px-5 py-3 font-medium">{t('home.recent.merchant')}</th>
              <th className="px-5 py-3 font-medium">{t('home.recent.amount')}</th>
              <th className="px-5 py-3 font-medium">{t('home.recent.status')}</th>
              <th className="px-5 py-3 text-right font-medium">{t('home.recent.time')}</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_TX.map((tx) => (
              <tr
                key={tx.id}
                className="border-t border-[var(--color-border)] transition-colors hover:bg-[var(--glass-fill)]"
              >
                <td className="px-5 py-3.5 text-[var(--color-text)]">{tx.merchant}</td>
                <td className="px-5 py-3.5 font-mono text-[var(--color-text-muted)]">
                  {tx.amount}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                      tx.status === 'confirmed'
                        ? 'bg-[color-mix(in_oklab,var(--color-success)_16%,transparent)] text-[var(--color-success)]'
                        : 'bg-[color-mix(in_oklab,var(--color-warning)_16%,transparent)] text-[var(--color-warning)]',
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {t(`home.status.${tx.status}`)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right text-[var(--color-text-subtle)]">
                  {tx.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
