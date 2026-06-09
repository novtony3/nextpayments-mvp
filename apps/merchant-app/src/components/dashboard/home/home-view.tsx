import { useLocale, useTranslations } from 'next-intl';
import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  Clock,
  DollarSign,
  Plug,
  Receipt,
} from 'lucide-react';

import { Button } from '@nextpayments/ui/components/button';
import { EmptyState } from '@nextpayments/ui/components/empty-state';
import { Notice } from '@nextpayments/ui/components/notice';

import { FIAT } from '@/constants/dashboard';
import { ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import { formatCount, formatCrypto, formatFiat, parseAmount } from '@/lib/format';
import type { OrderListResult, OrderStatsResult } from '@/lib/orders/types';
import { OrderStatusBadge } from '@/components/dashboard/orders/order-status-badge';
import { StatCard } from '@/components/dashboard/shared/stat-card';
import { SectionPanel } from '@/components/dashboard/shared/section-panel';
import { RefreshButton } from '@/components/dashboard/shared/refresh-button';

type HomeViewProps = {
  displayName: string;
  stats: OrderStatsResult;
  /** Latest paid orders (preview). */
  recent: OrderListResult;
  /** Pending orders — only `total` (the count) is read. */
  pending: OrderListResult;
};

/**
 * Home overview — the post-login landing. Mirrors the reference dashboard's
 * layout (4 metric cards + Recent Transactions + Quick Actions) but every
 * figure is backed by a real endpoint (`/orders/me/stats` + `/orders/me`);
 * concepts the backend doesn't have (invoices/sessions/overpaid/overdue) are
 * intentionally omitted. Server Component — data is fetched by the route and
 * passed in; the only client island is the Refresh button.
 */
export function HomeView({ displayName, stats, recent, pending }: HomeViewProps) {
  const t = useTranslations('dashboard.home');
  const locale = useLocale();

  const s = stats.ok ? stats.data : null;
  const succeeded = s?.paidOrders ?? 0;
  const totalRevenue = `${FIAT.symbol}${formatFiat(s?.totalUsdt ?? 0, locale)}`;
  const totalPayments = formatCount(s?.totalOrders ?? 0, locale);
  const pendingCount = pending.ok ? pending.data.total : 0;
  const recentRows = recent.ok ? recent.data.rows : [];
  const byCoin = s?.byCoin ?? [];

  const viewAllOrders = (
    <Link
      href={ROUTES.ORDERS}
      className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
    >
      {t('recent.viewAll')}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">
            {t('welcome', { name: displayName })}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">{t('subtitle')}</p>
        </div>
        <RefreshButton label={t('refresh')} />
      </header>

      {!stats.ok && <Notice tone="danger">{t('error')}</Notice>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          tone="success"
          label={t('cards.totalRevenue.label')}
          value={totalRevenue}
          caption={t('cards.totalRevenue.caption', { count: succeeded })}
        />
        <StatCard
          icon={Receipt}
          tone="info"
          label={t('cards.totalPayments.label')}
          value={totalPayments}
          caption={t('cards.totalPayments.caption', { count: succeeded })}
        />
        <StatCard
          icon={Activity}
          tone="warning"
          label={t('cards.transactions.label')}
          value={formatCount(succeeded, locale)}
          caption={t('cards.transactions.caption', { count: succeeded })}
        />
        <StatCard
          icon={Clock}
          tone="danger"
          label={t('cards.pending.label')}
          value={formatCount(pendingCount, locale)}
          caption={t('cards.pending.caption')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionPanel title={t('recent.title')} action={viewAllOrders}>
            {recentRows.length === 0 ? (
              <EmptyState
                title={t('recent.empty.title')}
                description={t('recent.empty.description')}
              />
            ) : (
              <ul className="divide-y divide-[var(--glass-border)]">
                {recentRows.map((row, index) => {
                  const amount = parseAmount(row.amount);
                  return (
                    <li
                      key={row.orderId ?? row._id ?? index}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-mono text-xs text-[var(--color-text-muted)]">
                          {row.orderId ?? row._id ?? '—'}
                        </span>
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {t('recent.amount', {
                            amount: amount === null ? '—' : formatCrypto(amount, locale),
                            coin: row.coin ?? '',
                          })}
                        </span>
                      </div>
                      {row.status && <OrderStatusBadge status={row.status} />}
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionPanel>
        </div>

        <SectionPanel title={t('quickActions.title')}>
          <div className="flex flex-col gap-2 p-4">
            <Button asChild variant="outline" size="md" fullWidth>
              <Link href={ROUTES.ORDERS}>
                <Receipt className="h-4 w-4" aria-hidden="true" />
                {t('quickActions.viewOrders')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="md" fullWidth>
              <Link href={ROUTES.TRANSACTIONS}>
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                {t('quickActions.viewTransactions')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="md" fullWidth>
              <Link href={ROUTES.INTEGRATIONS}>
                <Plug className="h-4 w-4" aria-hidden="true" />
                {t('quickActions.integrations')}
              </Link>
            </Button>
          </div>
        </SectionPanel>
      </div>

      {byCoin.length > 0 && (
        <SectionPanel title={t('byCoin.title')}>
          <ul className="divide-y divide-[var(--glass-border)]">
            {byCoin.map((coin) => (
              <li
                key={coin.coin}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <span className="font-medium text-[var(--color-text)]">{coin.coin}</span>
                <span className="text-[var(--color-text-muted)]">
                  {t('byCoin.amount', {
                    amount: formatCrypto(coin.totalAmount, locale),
                    count: coin.count,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </SectionPanel>
      )}
    </div>
  );
}
