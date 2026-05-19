import { NotFoundView } from '@/components/shared/not-found-view';

/**
 * Localized 404 — rendered inside `[locale]/layout` (i18n provider + fonts).
 * Triggered by `notFound()` and by the `[...rest]` catch-all for any
 * unmatched path under a locale.
 */
export default function NotFound() {
  return <NotFoundView />;
}
