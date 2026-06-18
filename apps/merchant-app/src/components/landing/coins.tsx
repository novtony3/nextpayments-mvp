import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { COIN_TILES } from '@/constants/coins';
import { CoinAvatar } from '@/components/shared/coin-avatar';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

export function Coins() {
  const t = useTranslations('landing.coins');

  return (
    <section id="coins" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading kicker={t('kicker')} title={t('title')} subtitle={t('subtitle')} />

        <Reveal className="mt-14">
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {COIN_TILES.map((coin) => (
              <li
                key={coin.ticker}
                className="group flex flex-col items-center gap-2 rounded-2xl bg-[var(--color-surface)] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-surface-elevated)]"
              >
                <CoinAvatar
                  ticker={coin.ticker}
                  size="lg"
                  showTicker
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <span className="text-xs font-medium text-[var(--color-text-muted)] transition-colors duration-300 group-hover:text-[var(--color-text)]">
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
