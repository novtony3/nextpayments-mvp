'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@nextpayments/ui/components/card';
import { DataTable, type DataTableColumn } from '@nextpayments/ui/components/data-table';
import { EmptyState } from '@nextpayments/ui/components/empty-state';

import { ORDERS_PARAM, ORDER_STATUS_FILTER_ALL, type OrderStatusFilter } from '@/constants/orders';
import { ROUTES } from '@/constants/routes';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import type { OrderRow, OrderListPage } from '@/lib/orders/types';
import { TablePagination } from '@/components/shared/table-pagination';

import { OrderStatusBadge } from './order-status-badge';

type OrdersTableProps = {
  data: OrderListPage;
  status: OrderStatusFilter;
  integrationId?: string;
};

function cell(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  return String(value);
}

function rowKey(row: OrderRow, index: number): string {
  const id = row.orderId ?? row._id ?? row.id;
  return id === undefined || id === null ? String(index) : String(id);
}

function reference(row: OrderRow): string {
  return cell(row.orderId ?? row._id ?? row.externalOrderId ?? row.id);
}

/** Build the FE detail URL when the row has a real `orderId`; null otherwise. */
function detailHref(row: OrderRow, integrationId?: string): string | null {
  if (!row.orderId) return null;
  const params = new URLSearchParams();
  if (integrationId) params.set(ORDERS_PARAM.INTEGRATION, integrationId);
  const qs = params.toString();
  return `${ROUTES.ORDERS}/${row.orderId}${qs ? `?${qs}` : ''}`;
}

function amount(row: OrderRow, locale: string): string {
  if (row.amount === undefined || row.amount === null || row.amount === '') return '—';
  const num = typeof row.amount === 'number' ? row.amount : Number(row.amount);
  if (Number.isNaN(num)) return cell(row.amount);
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }).format(num);
}

/**
 * Order list. Rows are rendered adaptively (loose row shape per
 * `lib/orders/types`); missing fields show as "—". Pagination pushes
 * `?page=` to the URL so the Server Component refetches, preserving the
 * status + integration filters.
 */
export function OrdersTable({ data, status, integrationId }: OrdersTableProps) {
  const t = useTranslations('dashboard.orders');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (status !== ORDER_STATUS_FILTER_ALL) params.set(ORDERS_PARAM.STATUS, status);
    if (integrationId) params.set(ORDERS_PARAM.INTEGRATION, integrationId);
    params.set(ORDERS_PARAM.PAGE, String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const formatDate = (value: unknown): string => {
    if (typeof value !== 'string' && typeof value !== 'number') return cell(value);
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? cell(value) : d.toLocaleString(locale);
  };

  if (data.rows.length === 0) {
    return (
      <Card glow={false}>
        <EmptyState title={t('empty')} />
      </Card>
    );
  }

  const columns: DataTableColumn<OrderRow>[] = [
    {
      key: 'reference',
      header: t('columns.reference'),
      cellClassName: 'font-mono text-xs',
      render: (row) => {
        const href = detailHref(row, integrationId);
        const ref = reference(row);
        return href ? (
          <Link
            href={href}
            aria-label={t('viewDetail', { reference: ref })}
            className="text-[var(--color-accent)] underline-offset-4 transition-colors hover:underline"
          >
            {ref}
          </Link>
        ) : (
          <span className="text-[var(--color-text-muted)]">{ref}</span>
        );
      },
    },
    { key: 'coin', header: t('columns.coin'), render: (row) => cell(row.coin) },
    { key: 'amount', header: t('columns.amount'), render: (row) => amount(row, locale) },
    {
      key: 'status',
      header: t('columns.status'),
      render: (row) => (row.status ? <OrderStatusBadge status={row.status} /> : '—'),
    },
    {
      key: 'createdAt',
      header: t('columns.createdAt'),
      cellClassName: 'text-[var(--color-text-muted)]',
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card glow={false} className="p-0">
        <DataTable
          columns={columns}
          rows={data.rows}
          getRowKey={rowKey}
          minWidthClassName="min-w-[640px]"
        />
      </Card>

      <TablePagination page={data.page} totalPages={data.totalPages} onPageChange={goToPage} />
    </div>
  );
}
