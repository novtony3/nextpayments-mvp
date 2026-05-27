'use client';

import { useTranslations } from 'next-intl';

import { SelectField } from '@nextpayments/ui/components/select-field';

import {
  ORDERS_PARAM,
  ORDER_STATUS_FILTER_ALL,
  ORDER_STATUS_FILTER_OPTIONS,
  type OrderStatusFilter,
} from '@/constants/orders';
import { usePathname, useRouter } from '@/i18n/routing';

type OrdersFiltersProps = {
  /** Active status filter (or `all` for no filter). */
  status: OrderStatusFilter;
  /** Active integration filter from the URL (passthrough — no picker UI yet). */
  integrationId?: string;
};

/**
 * Filter bar — status only for now. Selecting a status pushes it to the URL
 * (resetting `?page=` to 1); the `?integrationId=` filter is passed through
 * unchanged if present, so deep-links from the integrations table still work
 * without a picker UI in this view.
 */
export function OrdersFilters({ status, integrationId }: OrdersFiltersProps) {
  const t = useTranslations('dashboard.orders');
  const router = useRouter();
  const pathname = usePathname();

  const push = (next: { status?: OrderStatusFilter }) => {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? status;
    if (nextStatus !== ORDER_STATUS_FILTER_ALL) {
      params.set(ORDERS_PARAM.STATUS, nextStatus);
    }
    if (integrationId) params.set(ORDERS_PARAM.INTEGRATION, integrationId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const options = ORDER_STATUS_FILTER_OPTIONS.map((key) => ({
    value: key,
    label: t(`status.${key}`),
  }));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SelectField
        aria-label={t('statusFilter')}
        value={status}
        onChange={(e) => push({ status: e.target.value as OrderStatusFilter })}
        options={options}
        className="w-full sm:max-w-xs"
      />
    </div>
  );
}
