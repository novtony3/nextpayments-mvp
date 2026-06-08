import { PageLoader } from '@/components/shared/page-loader';

/**
 * Instant loading boundary for the auth group. Shown the moment a link to
 * /login or /register is clicked, while the (dynamic, cookie-reading) segment
 * resolves — so navigation never feels blank.
 */
export default function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <PageLoader />
    </main>
  );
}
