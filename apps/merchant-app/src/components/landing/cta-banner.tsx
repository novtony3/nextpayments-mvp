import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { Reveal } from './reveal';

export function CtaBanner() {
  const t = useTranslations('landing.cta');

  return (
    <section id="cta" className="px-5 pb-32 sm:px-6 sm:pb-40">
      <Reveal className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-20 text-center shadow-[0_40px_100px_-50px_rgba(0,0,0,0.7)] sm:px-16">
          {/* Restrained accent: a soft top-edge glow, no full aurora here. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,var(--color-accent-soft)_0%,transparent_70%)]"
          />
          <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-normal tracking-tight text-[var(--color-text)] sm:text-5xl sm:leading-[1.1]">
            {t('title')}
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-pretty text-[var(--color-text-muted)]">
            {t('subtitle')}
          </p>
          <Button asChild size="lg" className="group relative mt-10">
            <Link href={ROUTES.REGISTER}>
              {t('button')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
