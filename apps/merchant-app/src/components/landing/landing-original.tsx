import { Coins } from './coins';
import { CtaBanner } from './cta-banner';
import { Features } from './features';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';
import { Pricing } from './pricing';
import { TrustBar } from './trust-bar';

/** The original (default) landing composition. */
export function LandingOriginal() {
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
