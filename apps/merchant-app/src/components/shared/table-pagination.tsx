'use client';

import { useTranslations } from 'next-intl';

import { Pagination } from '@nextpayments/ui/components/pagination';

type TablePaginationProps = {
  /** 1-based current page. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

/**
 * Common, reusable pager for dashboard list tables. Wraps the framework-
 * agnostic `Pagination` (packages/ui) and supplies the shared
 * `common.pagination` i18n labels in one place, so each table no longer
 * repeats the labels object. Renders nothing for a single page.
 */
export function TablePagination({
  page,
  totalPages,
  onPageChange,
  className,
}: TablePaginationProps) {
  const t = useTranslations('common.pagination');

  if (totalPages <= 1) return null;

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      className={className}
      labels={{
        nav: t('nav'),
        prev: t('prev'),
        next: t('next'),
        page: (p) => t('page', { page: p }),
      }}
    />
  );
}
