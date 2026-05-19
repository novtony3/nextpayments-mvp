'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from './button';
import { cn } from '../lib/utils';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  labels: {
    /** Accessible name for the nav landmark. */
    nav: string;
    prev: string;
    next: string;
    /** `aria-label` for the page-`n` button (caller does the i18n). */
    page: (page: number) => string;
  };
  className?: string;
}

/**
 * Prev / numbered / Next pager. Numbers are rendered for small ranges (the
 * dashboard lists are short); endpoints disable at the bounds. Token-styled,
 * framework-agnostic — the caller owns `page` state.
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ page, totalPages, onPageChange, labels, className }, ref) => {
    const pages = Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1);

    return (
      <nav
        ref={ref}
        aria-label={labels.nav}
        className={cn('flex items-center justify-center gap-2', className)}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          {labels.prev}
        </Button>

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'primary' : 'outline'}
            size="icon"
            aria-current={p === page ? 'page' : undefined}
            aria-label={labels.page(p)}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          {labels.next}
        </Button>
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
