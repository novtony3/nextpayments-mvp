import { HOME_RECENT_LIMIT } from '@/constants/dashboard';
import { getHeaderUser } from '@/lib/auth/session';
import { loadOrderListForUser, loadOrderStats } from '@/lib/orders/backend';
import { HomeView } from '@/components/dashboard/home/home-view';

/**
 * Home overview — the post-login landing. Aggregated stats (`/orders/me/stats`)
 * + a recent-paid-orders preview + a pending-orders count, all fetched in
 * parallel. The result-returning loaders never throw into the tree, so the
 * view degrades to zeros + a notice on failure.
 */
export default async function HomePage() {
  const [stats, recent, pending, user] = await Promise.all([
    loadOrderStats({}),
    loadOrderListForUser({ status: 'paid', page: 1, limit: HOME_RECENT_LIMIT }),
    loadOrderListForUser({ status: 'pending', page: 1, limit: 1 }),
    getHeaderUser(),
  ]);

  return (
    <HomeView
      displayName={user?.displayName ?? ''}
      stats={stats}
      recent={recent}
      pending={pending}
    />
  );
}
