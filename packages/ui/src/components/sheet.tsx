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
 *
 * Bumped slightly above iOS' typical 320–360ms to compensate for the heavier
 * frosted-glass surface (the GPU spends extra time on the shadow rasterize
 * per frame) — anything shorter felt clipped/janky.
 */
/** Sheet travel duration. Keep in sync with `--motion-overlay` in theme.css —
 * the value lives in TS because JS timers (unmount, height animation) need it. */
export const SHEET_TRANSITION_MS = 440;

/**
 * Smooth long-tail ease-out (no overshoot). Gentler than the iOS 0.32/0.72
 * curve, which felt abrupt against the heavier sheet shadow on this app.
 */
const SHEET_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Height-animation duration when the content swaps (e.g. switching tabs in
 * {@link TabbedSheet}). Snappier than the open/close slide so a tab switch
 * doesn't feel like a full transition, while still smoothing the snap.
 */
const SHEET_CONTENT_TRANSITION_MS = 260;

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

    // Smoothly animate the panel's content height when it changes (e.g. a
    // TabbedSheet tab switch). Measure the children wrapper via
    // ResizeObserver → drive `max-height` (in px). `animateHeight` gates
    // the transition so the very first measure snaps instead of crawling
    // up from 0; subsequent updates animate.
    const contentWrapperRef = React.useRef<HTMLDivElement | null>(null);
    const [contentMaxHeight, setContentMaxHeight] = React.useState<number | null>(null);
    const [animateHeight, setAnimateHeight] = React.useState(false);

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

    // Smooth content-height transitions. The middle "clip" wrapper below
    // animates its `height` (in px); we measure the innermost wrapper's
    // natural size via ResizeObserver and drive that. Three-layer layout
    // means: the clip wrapper grows/shrinks without children sticking out
    // (overflow:hidden clips during the transition), and the outer
    // overflow-y-auto still handles real content > 90vh.
    //
    // The first measure snaps (no transition) so the panel doesn't crawl
    // up from 0 on open. The animation only enables AFTER the slide-up
    // settles (SHEET_TRANSITION_MS), so the open slide and the height
    // transition don't run in parallel — that double-animation is what
    // felt like a "conflict" when clicking Add Integration.
    React.useLayoutEffect(() => {
      if (!rendered) return;
      const node = contentWrapperRef.current;
      if (!node) return;

      setContentMaxHeight(node.scrollHeight);
      const enableTimer = window.setTimeout(
        () => setAnimateHeight(true),
        reducedRef.current ? 0 : SHEET_TRANSITION_MS,
      );

      const ro = new ResizeObserver(() => {
        const current = contentWrapperRef.current;
        if (current) {
          const h = current.scrollHeight;
          setContentMaxHeight((prev) => (prev === h ? prev : h));
        }
      });
      ro.observe(node);

      return () => {
        clearTimeout(enableTimer);
        ro.disconnect();
        setAnimateHeight(false);
        setContentMaxHeight(null);
      };
    }, [rendered]);

    // Scroll lock + focus management for the lifetime of the mounted sheet.
    // The scrollbar-gutter compensation is what stops the page underneath
    // from snapping sideways when the body's scrollbar disappears — that
    // shift, coinciding with the slide-up, was the perceived "conflict"
    // when clicking Add Integration on a desktop with a visible scrollbar.
    React.useEffect(() => {
      if (!rendered) return;
      const prevOverflow = document.body.style.overflow;
      const prevPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      const raf = requestAnimationFrame(() => {
        const node = panelRef.current;
        if (!node) return;
        (node.querySelector<HTMLElement>(FOCUSABLE) ?? node).focus();
      });

      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPaddingRight;
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
        {/* Backdrop — `backdrop-blur` removed because re-rasterizing the blur
            on every opacity frame caused the visible jank; the darker
            color-mix tint plus the panel shadow give enough depth. */}
        <button
          type="button"
          aria-label={closeLabel}
          tabIndex={-1}
          onClick={onClose}
          style={{ transitionDuration: `${duration}ms` }}
          className={cn(
            'absolute inset-0 bg-[color-mix(in_oklab,var(--color-bg)_72%,transparent)] transition-opacity ease-out',
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
            // `translate3d` + `willChange` pin the panel onto its own
            // compositor layer so the shadow + content aren't re-rasterized
            // each frame of the slide.
            willChange: 'transform',
            transform: shown ? 'translate3d(0, 0, 0)' : 'translate3d(0, 100%, 0)',
          }}
          className={cn(
            'relative flex max-h-[90vh] w-full flex-col rounded-t-3xl border-t border-[var(--glass-border)]',
            'bg-[var(--color-surface)] shadow-[var(--shadow-overlay-up)] sm:max-w-2xl',
            'transform-gpu transition-transform',
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
              className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] transition-colors duration-[var(--motion-base)] [--focus-ring-offset:var(--color-surface)] hover:bg-[var(--color-accent-strong)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/*
            Three layers for smooth content-height swaps:
              1. outer  — `overflow-y-auto`, handles real content > 90vh
              2. middle — animated `height` (px) + `overflow: hidden` so
                          children don't poke out / cause a scrollbar flash
                          while the height transitions
              3. inner  — natural-size, observed by ResizeObserver to drive
                          the middle layer's height
          */}
          <div className="overflow-y-auto">
            <div
              style={{
                height: contentMaxHeight != null ? `${contentMaxHeight}px` : undefined,
                overflow: 'hidden',
                transition:
                  animateHeight && !reducedRef.current
                    ? `height ${SHEET_CONTENT_TRANSITION_MS}ms ${SHEET_EASING}`
                    : undefined,
              }}
            >
              <div ref={contentWrapperRef} className="px-6 pb-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Sheet.displayName = 'Sheet';
