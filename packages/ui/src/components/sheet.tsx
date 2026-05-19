'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '../lib/utils';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Visible header title; also the dialog's accessible name. */
  title: string;
  /** Accessible name for the close button. */
  closeLabel: string;
  children: React.ReactNode;
  className?: string;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/**
 * Bottom sheet — slides up from the bottom edge (iOS-style), not a centered
 * modal. Accessible dialog: `role="dialog"` + `aria-modal`, Esc/backdrop
 * close, focus moved in on open and restored on close, Tab trapped inside,
 * body scroll locked. Slide is skipped under `prefers-reduced-motion`.
 * Token-styled, framework-agnostic.
 */
export const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ open, onClose, title, closeLabel, children, className }, ref) => {
    const titleId = React.useId();
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const restoreFocusRef = React.useRef<HTMLElement | null>(null);
    const [shown, setShown] = React.useState(false);

    const setPanel = React.useCallback(
      (node: HTMLDivElement | null) => {
        panelRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // Mount → next frame flips `shown` so the translate transition runs.
    React.useEffect(() => {
      if (!open) {
        setShown(false);
        return;
      }
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }, [open]);

    // Body scroll lock + focus management while open.
    React.useEffect(() => {
      if (!open) return;
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const focusFirst = () => {
        const node = panelRef.current;
        if (!node) return;
        const target = node.querySelector<HTMLElement>(FOCUSABLE) ?? node;
        target.focus();
      };
      const raf = requestAnimationFrame(focusFirst);

      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = prevOverflow;
        restoreFocusRef.current?.focus?.();
      };
    }, [open]);

    if (!open) return null;

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const node = panelRef.current;
      if (!node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-end">
        <button
          type="button"
          aria-label={closeLabel}
          tabIndex={-1}
          onClick={onClose}
          className={cn(
            'absolute inset-0 bg-[color-mix(in_oklab,var(--color-bg)_60%,transparent)] backdrop-blur-sm transition-opacity duration-300',
            shown ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          ref={setPanel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={onKeyDown}
          className={cn(
            'relative flex max-h-[90vh] w-full flex-col rounded-t-3xl border-t border-[var(--glass-border)]',
            'bg-[var(--color-surface)] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)] sm:max-w-2xl',
            'transition-transform duration-300 ease-out motion-reduce:transition-none',
            shown ? 'translate-y-0' : 'translate-y-full',
            className,
          )}
        >
          <span
            aria-hidden="true"
            className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-[var(--color-border-strong)]"
          />
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <h2 id={titleId} className="text-lg font-semibold text-[var(--color-text)]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-[var(--glass-fill)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-6 pb-8">{children}</div>
        </div>
      </div>
    );
  },
);

Sheet.displayName = 'Sheet';
