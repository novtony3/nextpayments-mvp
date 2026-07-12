'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

import { cn } from '../lib/utils';

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  /** Accessible name — required since the visual label is the placeholder. */
  'aria-label': string;
}

/**
 * Search field — glass surface with a leading magnifier, matching the Gemini
 * concept (token-styled, theme-aware, hairline border, calm focus ring).
 * Framework-agnostic; reused by the dashboard balances + integrations search.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        'group relative flex items-center rounded-full border border-[var(--glass-border)]',
        'bg-[var(--glass-fill)] backdrop-blur-md transition-colors duration-[var(--motion-base)]',
        'focus-within:border-[var(--color-accent)]',
        className,
      )}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 h-4 w-4 text-[var(--color-text-subtle)] transition-colors duration-[var(--motion-base)] group-focus-within:text-[var(--color-accent)]"
      />
      <input
        ref={ref}
        type="search"
        className={cn(
          'h-11 w-full rounded-full bg-transparent pl-11 pr-4 text-sm text-[var(--color-text)]',
          'placeholder:text-[var(--color-text-subtle)] focus-visible:outline-none',
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
        {...props}
      />
    </div>
  ),
);

SearchInput.displayName = 'SearchInput';
