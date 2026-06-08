import { LandingOriginal } from '@/components/landing/landing-original';
import { LandingTemp } from '@/components/landing/temp/landing-temp';

// The `?temp=1` flag depends on the request query, so the route must render on
// demand — otherwise a prerendered shell would serve one variant to everyone.
export const dynamic = 'force-dynamic';

type LandingPageProps = {
  searchParams: Promise<{ temp?: string }>;
};

/**
 * Landing A/B flag. The web3 PaaS redesign renders by default; `?temp=1` swaps
 * back to the original Gemini-calm design. Reading `searchParams` makes this
 * route render on demand (so both variants ship full HTML — no flash, SEO
 * intact). Remove this flag + the unused composition to ship one design
 * statically again.
 */
export default async function LandingPage({ searchParams }: LandingPageProps) {
  const { temp } = await searchParams;
  return temp === '1' ? <LandingOriginal /> : <LandingTemp />;
}
