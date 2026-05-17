import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { COIN_TILES } from '@/constants/coins';
import { Reveal } from './reveal';

export function Coins() {
  const t = useTranslations('landing.coins');

  return (
    <section id="coins" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs tracking-[0.14em] text-[var(--color-text-subtle)]">
            {t('kicker')}
          </p>
          <h2 className="mt-4 text-balance text-3xl font-normal tracking-tight sm:text-[42px] sm:leading-[1.15]">
            {t('title')}
          </h2>
          <p className="mt-5 text-[var(--color-text-muted)]">{t('subtitle')}</p>
        </Reveal>

        <Reveal className="mt-14">
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {COIN_TILES.map((coin) => (
              <li
                key={coin.ticker}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] font-mono text-[11px] font-semibold tracking-tight text-[var(--color-text)] transition-colors group-hover:border-[var(--color-text-muted)]"
                  aria-hidden
                >
                  {coin.ticker}
                </span>
                <span className="text-xs font-medium text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text)]">
                  {coin.name}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex justify-center">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              {t('viewAll')}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
