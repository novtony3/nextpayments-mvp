import { AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';

import { ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import type { OrderDetailResult, OrderRow } from '@/lib/orders/types';

import { ReadOnlyField } from '../integrations/read-only-field';

type OrderDetailViewProps = {
  orderId: string;
  result: OrderDetailResult;
};

function formatDate(value: unknown, locale: string): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString(locale);
}

function formatAmount(value: OrderRow['amount'], locale: string): string {
  if (value === undefined || value === null || value === '') return '—';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }).format(num);
}

function asString(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  return String(value);
}

/**
 * Order detail — built off a single `OrderRow` from `loadOrderForUser`. The
 * backend has no JWT detail route; the helper walks `/me` pages to find by
 * `orderId`. Fields are grouped by concern (identity, payment, status, IPN).
 */
export function OrderDetailView({ orderId, result }: OrderDetailViewProps) {
  const t = useTranslations('dashboard.orders.detail');
  const tStatus = useTranslations('dashboard.orders.status');
  const locale = useLocale();

  const backLink = (
    <Link
      href={ROUTES.ORDERS}
      className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {t('back')}
    </Link>
  );

  if (!result.ok) {
    const isNotFound = result.reason === 'notfound';
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {backLink}
        <Card glow={false} className="flex items-start gap-3 bg-[var(--glass-fill)] px-5 py-4">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]"
            aria-hidden="true"
          />
          <p className="text-sm text-[var(--color-text-muted)]">
            {t(isNotFound ? 'notFound' : 'error', { orderId })}
          </p>
        </Card>
      </div>
    );
  }

  const order = result.data;
  const status = order.status ? tStatus(order.status) : '—';
  const txHash = asString(order.transactionHash);
  const address = asString(order.address);
  const memo = asString(order.memo);
  const description = asString(order.description);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {backLink}

      <header className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          {t('eyebrow')}
        </p>
        <h1 className="break-all font-mono text-xl font-semibold text-[var(--color-text)]">
          {order.orderId ?? orderId}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {t('createdAt', { date: formatDate(order.createdAt, locale) })}
        </p>
      </header>

      <Card glow={false} className="flex flex-col gap-4 px-5 py-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">{t('sections.payment')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReadOnlyField
            label={t('fields.amount')}
            value={`${formatAmount(order.amount, locale)} ${order.coin ?? ''}`.trim()}
          />
          <ReadOnlyField label={t('fields.network')} value={order.network ?? '—'} />
          <ReadOnlyField label={t('fields.status')} value={status} />
          <ReadOnlyField
            label={t('fields.expiresAt')}
            value={formatDate(order.expiresAt, locale)}
          />
        </div>
        {address && (
          <ReadOnlyField
            label={t('fields.address')}
            value={address}
            copyable
            monospace
            truncate
            copyLabel={t('copy')}
          />
        )}
        {memo && <ReadOnlyField label={t('fields.memo')} value={memo} monospace truncate />}
      </Card>

      <Card glow={false} className="flex flex-col gap-4 px-5 py-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">
          {t('sections.transaction')}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReadOnlyField label={t('fields.paidAt')} value={formatDate(order.paidAt, locale)} />
          {txHash ? (
            <ReadOnlyField
              label={t('fields.transactionHash')}
              value={txHash}
              copyable
              monospace
              truncate
              copyLabel={t('copy')}
              trailing={<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
            />
          ) : (
            <ReadOnlyField label={t('fields.transactionHash')} value="—" />
          )}
        </div>
      </Card>

      <Card glow={false} className="flex flex-col gap-4 px-5 py-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">{t('sections.ipn')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReadOnlyField label={t('fields.ipnStatus')} value={asString(order.ipnStatus) || '—'} />
          <ReadOnlyField
            label={t('fields.ipnAttempts')}
            value={
              typeof order.ipnAttempts === 'number'
                ? String(order.ipnAttempts)
                : asString(order.ipnAttempts) || '—'
            }
          />
          <ReadOnlyField
            label={t('fields.ipnDeliveredAt')}
            value={formatDate(order.ipnDeliveredAt, locale)}
          />
          {asString(order.ipnLastError) && (
            <ReadOnlyField
              label={t('fields.ipnLastError')}
              value={asString(order.ipnLastError)}
              monospace
              truncate
            />
          )}
        </div>
      </Card>

      <Card glow={false} className="flex flex-col gap-4 px-5 py-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">{t('sections.identity')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReadOnlyField
            label={t('fields.orderId')}
            value={asString(order.orderId) || orderId}
            copyable
            monospace
            truncate
            copyLabel={t('copy')}
          />
          <ReadOnlyField
            label={t('fields.externalOrderId')}
            value={asString(order.externalOrderId) || '—'}
            monospace
          />
          <ReadOnlyField
            label={t('fields.integrationId')}
            value={asString(order.integrationId) || '—'}
            copyable
            monospace
            truncate
            copyLabel={t('copy')}
          />
          <ReadOnlyField
            label={t('fields.updatedAt')}
            value={formatDate(order.updatedAt, locale)}
          />
        </div>
        {description && <ReadOnlyField label={t('fields.description')} value={description} />}
      </Card>
    </div>
  );
}
