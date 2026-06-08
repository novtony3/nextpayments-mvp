import { Coins } from './coins';
import { CtaBanner } from './cta-banner';
import { Features } from './features';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';
import { Pricing } from './pricing';
import { TrustBar } from './trust-bar';

/** The experimental web3 landing composition (shown behind `?temp=1`). */
export function LandingTemp() {
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
