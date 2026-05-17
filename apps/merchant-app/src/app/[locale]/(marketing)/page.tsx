import { Coins } from '@/components/landing/coins';
import { CtaBanner } from '@/components/landing/cta-banner';
import { Features } from '@/components/landing/features';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Pricing } from '@/components/landing/pricing';
import { TrustBar } from '@/components/landing/trust-bar';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Features />
      <Coins />
      <HowItWorks />
      <Pricing />
      <CtaBanner />
    </>
  );
}
