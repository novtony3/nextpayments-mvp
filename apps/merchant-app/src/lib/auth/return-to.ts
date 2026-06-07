import { routing } from '@/i18n/routing';

/**
 * `returnTo` helpers — pure (no server-only), so both the protected-route
 * guard (build) and the login page (validate) can share them.
 *
 * Paths are stored locale-agnostic (`/transactions`, not `/en/transactions`)
 * because the next-intl navigation `redirect`/`router` re-adds the active
 * locale. The validation keeps it an internal path so the value — which ends
 * up as a user-controllable `?returnTo=` query — can never become an
 * open-redirect to another origin.
 */

/** Strip a leading `/{locale}` segment so the path can be re-localized later. */
export function stripLocalePrefix(pathname: string, locale: string): string {
  const prefix = `/${locale}`;
  if (pathname === prefix) return '/';
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname || '/';
}

/** True for a safe in-app path: single leading slash, no scheme, no `//` host. */
export function isInternalPath(value: string | undefined): value is string {
  return typeof value === 'string' && /^\/(?!\/)/.test(value) && !value.includes('://');
}

/**
 * Validate a raw `?returnTo=` value into a usable in-app path, or `undefined`.
 * Rejects external URLs and the login route itself (avoid a bounce loop).
 */
export function safeReturnTo(value: string | undefined): string | undefined {
  if (!isInternalPath(value)) return undefined;
  // Reject a value that still carries a locale prefix pointing at /login, and
  // any auth route, so recovery never loops back onto the login screen.
  const withoutLocale = routing.locales.reduce(
    (path, locale) => stripLocalePrefix(path, locale),
    value,
  );
  if (withoutLocale.startsWith('/login') || withoutLocale.startsWith('/register')) {
    return undefined;
  }
  return value;
}
