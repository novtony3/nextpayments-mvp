import { useTranslations } from 'next-intl';

import { Button } from '@nextpayments/ui/components/button';

import { BRAND_NAME } from '@/constants/site';
import { ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import { TwinAuroras } from '@/components/shared/twin-auroras';
import { Logo } from '@/components/shared/logo';
import { Reveal } from '@/components/landing/reveal';

/**
 * 404 — themed as a failed crypto transaction (on-brand creative twist):
 * a never-mined route. Stays inside the Gemini system — monochrome canvas,
 * the `TwinAuroras` (two coiling aurora ribbons) as the living accent, the gradient
 * used once on the hero "404" numerals (a designated hero moment), Geist
 * Mono for the receipt line (the project's crypto-data typeface). Reuses
 * shared primitives only; tokens throughout; calm motion via `Reveal`
 * (reduced-motion respected). Localized (en/fr).
 */
export function NotFoundView() {
  const t = useTranslations('notFound');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <TwinAuroras intensity="bold" feather={false} className="-z-10" />

      <Link
        href={ROUTES.HOME}
        aria-label={BRAND_NAME}
        className="absolute left-6 top-6 sm:left-8 sm:top-8"
      >
        <Logo />
      </Link>

      <Reveal className="flex flex-col items-center gap-6">
        <span
          aria-hidden="true"
          className="text-aurora-gradient select-none font-mono text-[clamp(5rem,22vw,12rem)] font-bold leading-none tracking-tighter"
        >
          404
        </span>

        <h1 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
          {t('title')}
        </h1>
        <p className="max-w-md text-sm text-[var(--color-text-muted)] sm:text-base">
          {t('subtitle')}
        </p>

        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)] px-4 py-1.5 backdrop-blur-md">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" />
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--color-text-subtle)]">
            {t('receipt')}
          </span>
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={ROUTES.HOME}>{t('ctaHome')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.DASHBOARD}>{t('ctaDashboard')}</Link>
          </Button>
        </div>
      </Reveal>
    </main>
  );
}
