import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { ROUTES } from '@/constants/routes';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/constants/site';
import { Link } from '@/i18n/routing';
import { TwinAuroras } from '@/components/shared/twin-auroras';
import { Reveal } from '@/components/landing/reveal';

/**
 * Placeholder for the marketing sections we haven't shipped yet (docs, API
 * reference, SDK, status, about, blog, careers, and the legal pages). Renders
 * inside the marketing layout, so the header (with the logo) and the footer
 * come from there — this view only owns the section between them.
 *
 * Stays inside the Gemini system: monochrome canvas, the `TwinAuroras` ribbons
 * as the living accent, glass status pill, calm `Reveal` entrance (reduced
 * motion respected), tokens throughout. Localized (en/fr).
 */
export function ComingSoonView() {
  const t = useTranslations('comingSoon');

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-5 py-32 text-center sm:px-6">
      <TwinAuroras intensity="subtle" feather className="-z-10" />

      <Reveal className="flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)] px-4 py-1.5 backdrop-blur-md">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-text-subtle)]">
            {t('badge')}
          </span>
        </div>

        <h1 className="text-3xl font-normal tracking-tight text-[var(--color-text)] sm:text-5xl">
          {t('title')}
        </h1>
        <p className="max-w-md text-sm text-[var(--color-text-muted)] sm:text-base">
          {t('subtitle')}
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={ROUTES.HOME}>{t('ctaHome')}</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={CONTACT_MAILTO}>{t('ctaContact')}</a>
          </Button>
        </div>

        <p className="text-sm text-[var(--color-text-muted)]">
          {t('contactPrompt')}{' '}
          <a
            href={CONTACT_MAILTO}
            className="font-medium text-[var(--color-accent)] underline-offset-4 transition-colors hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </Reveal>
    </section>
  );
}
