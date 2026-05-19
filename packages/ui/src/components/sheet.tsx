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

/**
 * Open/close animation duration (ms). Exported so callers that defer work
 * to the close animation (e.g. resetting a wizard) stay in sync — single
 * source of truth, no hardcoded timing at the call site.
 */
export const SHEET_TRANSITION_MS = 360;

/** iOS sheet easing — gentle decelerate, no overshoot, symmetric up/down. */
const SHEET_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/**
 * Bottom sheet — slides up from the bottom edge (iOS-style), not a centered
 * modal. Smoothly animates **both** directions: it stays mounted through the
 * close so the slide-down + backdrop fade play out before unmount. Accessible
 * dialog: `role="dialog"` + `aria-modal`, Esc/backdrop close, focus moved in
 * on open and restored on close, Tab trapped inside, body scroll locked.
 * Honors `prefers-reduced-motion` (instant, no slide). Framework-agnostic.
 */
export const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ open, onClose, title, closeLabel, children, className }, ref) => {
    const titleId = React.useId();
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const restoreFocusRef = React.useRef<HTMLElement | null>(null);
    const reducedRef = React.useRef(false);

    // `rendered` keeps the node in the DOM through the exit animation;
    // `shown` drives the enter/leave transform + backdrop opacity.
    const [rendered, setRendered] = React.useState(open);
    const [shown, setShown] = React.useState(false);

    const setPanel = React.useCallback(
      (node: HTMLDivElement | null) => {
        panelRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    React.useEffect(() => {
      reducedRef.current =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    // Drive mount/enter on open, leave/unmount on close.
    React.useEffect(() => {
      const rafs: number[] = [];
      let timer: ReturnType<typeof setTimeout> | undefined;

      if (open) {
        restoreFocusRef.current = document.activeElement as HTMLElement | null;
        setRendered(true);
        if (reducedRef.current) {
          setShown(true);
        } else {
          // Two frames: mount at translate-full, then flip so it slides up.
          rafs.push(
            requestAnimationFrame(() => {
              rafs.push(requestAnimationFrame(() => setShown(true)));
            }),
          );
        }
      } else {
        setShown(false);
        if (reducedRef.current) {
          setRendered(false);
        } else {
          timer = setTimeout(() => setRendered(false), SHEET_TRANSITION_MS);
        }
      }

      return () => {
        rafs.forEach(cancelAnimationFrame);
        if (timer) clearTimeout(timer);
      };
    }, [open]);

    // Scroll lock + focus management for the lifetime of the mounted sheet.
    React.useEffect(() => {
      if (!rendered) return;
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const raf = requestAnimationFrame(() => {
        const node = panelRef.current;
        if (!node) return;
        (node.querySelector<HTMLElement>(FOCUSABLE) ?? node).focus();
      });

      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = prevOverflow;
        restoreFocusRef.current?.focus?.();
      };
    }, [rendered]);

    if (!rendered) return null;

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

    const duration = reducedRef.current ? 0 : SHEET_TRANSITION_MS;

    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center">
        <button
          type="button"
          aria-label={closeLabel}
          tabIndex={-1}
          onClick={onClose}
          style={{ transitionDuration: `${duration}ms` }}
          className={cn(
            'absolute inset-0 bg-[color-mix(in_oklab,var(--color-bg)_60%,transparent)] backdrop-blur-sm transition-opacity ease-out',
            shown ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          ref={setPanel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={onKeyDown}
          style={{
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: SHEET_EASING,
            willChange: 'transform',
          }}
          className={cn(
            'relative flex max-h-[90vh] w-full flex-col rounded-t-3xl border-t border-[var(--glass-border)]',
            'bg-[var(--color-surface)] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)] sm:max-w-2xl',
            'transition-transform',
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
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
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
