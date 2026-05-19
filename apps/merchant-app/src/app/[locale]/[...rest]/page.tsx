import { notFound } from 'next/navigation';

/**
 * Catch-all so any unmatched path under a locale renders the localized
 * `not-found` (next-intl App Router pattern) instead of the unstyled global
 * 404 that has no i18n context.
 */
export default function CatchAllNotFound() {
  notFound();
}
