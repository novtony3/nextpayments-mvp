/**
 * Lightweight full-area loading indicator rendered by route-level `loading.tsx`
 * boundaries while a navigation's server segment streams in. Pure CSS spin —
 * no JS, no framer — so it paints the instant a link is clicked.
 */
export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40vh] flex-1 items-center justify-center"
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden
        className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-accent)]"
      />
    </div>
  );
}
