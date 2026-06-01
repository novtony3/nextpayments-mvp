import type { ReactNode } from 'react';

import { getHeaderUser } from '@/lib/auth/session';
import { Footer } from '@/components/shared/footer';
import { Header } from '@/components/shared/header';

/**
 * Resolves the header identity server-side and passes it to the (client)
 * Header so the auth chrome is correct in the first paint — no client-side
 * null→resolve transition, so no "Get started" flash on load or on locale
 * switch (which re-renders this layout). Reading the session cookie opts the
 * marketing routes into dynamic rendering, which is correct for personalised
 * chrome.
 */
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const user = await getHeaderUser();
  return (
    <>
      <Header initialUser={user} />
      <main className="flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
