import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';
import { Notice } from '@nextpayments/ui/components/notice';

import { FIAT } from '@/constants/dashboard';
import { formatCount, formatCrypto, formatFiat } from '@/lib/format';
import type { OrderStatsResult } from '@/lib/orders/types';

type OrderStatsPanelProps = {
  result: OrderStatsResult;
};

/**
 * Dashboard stats fed by `GET /api/orders/me/stats`. Server Component so the
 * numbers are SSRd with the page; the data result is passed in by the route
 * (never throws into the tree — degrades to a notice on failure).
 *
 * `byCoin` is rendered as-is (the backend already sorts desc by `totalUsdt`).
 * Coins whose `priceUsd === 0` are not yet seeded; one page-level notice
 * lists them so the merchant knows the USDT figure is partial.
 */
export function OrderStatsPanel({ result }: OrderStatsPanelProps) {
  const t = useTranslations('dashboard.orderStats');
  const locale = useLocale();

  if (!result.ok) {
    return <Notice tone="danger">{t('error')}</Notice>;
  }

  const { totalOrders, paidOrders, totalUsdt, byCoin } = result.data;
  const unpricedCoins = byCoin.filter((c) => c.priceUsd === 0).map((c) => c.coin);

  const cards = [
    { key: 'totalOrders' as const, value: formatCount(totalOrders, locale) },
    { key: 'paidOrders' as const, value: formatCount(paidOrders, locale) },
    {
      key: 'totalUsdt' as const,
      value: `${FIAT.symbol}${formatFiat(totalUsdt, locale)} USDT`,
    },
  ];

  return (
    <section aria-label={t('title')} className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.key} glow={false} className="px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
              {t(`cards.${card.key}`)}
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">{card.value}</p>
          </Card>
        ))}
      </div>

      {byCoin.length > 0 && (
        <Card glow={false} className="px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
            {t('byCoin.title')}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {byCoin.map((row) => (
              <li
                key={row.coin}
                className="flex items-baseline justify-between gap-3 text-sm text-[var(--color-text)]"
              >
                <span className="font-medium">{row.coin}</span>
                <span className="text-[var(--color-text-muted)]">
                  {t('byCoin.amount', {
                    amount: formatCrypto(row.totalAmount, locale),
                    count: formatCount(row.count, locale),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {unpricedCoins.length > 0 && (
        <Notice tone="info">{t('unpriced', { coins: unpricedCoins.join(', ') })}</Notice>
      )}
    </section>
  );
}
