import { useTranslations } from 'next-intl';

import { DOC_LINKS } from '@/constants/dashboard';

const LINK_CLASS =
  'text-[var(--color-text-muted)] underline-offset-4 transition-colors hover:text-[var(--color-accent)] hover:underline';

/**
 * Compact dashboard footer — help/support and documentation links. Localized
 * labels, URLs from {@link DOC_LINKS} (no inline hrefs). Static, presentational.
 */
export function DashboardFooter() {
  const t = useTranslations('dashboard.footer');

  return (
    <footer className="mt-10 border-t border-[var(--color-border)] pt-6 text-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[var(--color-text-muted)]">
          {t('assistance')}{' '}
          <a href={DOC_LINKS.support} className={LINK_CLASS}>
            {t('contactSupport')}
          </a>
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <a href={DOC_LINKS.integrationGuide} className={LINK_CLASS}>
            {t('integrationGuide')}
          </a>
          <a href={DOC_LINKS.apiDocs} className={LINK_CLASS}>
            {t('apiDocs')}
          </a>
          <a href={DOC_LINKS.faq} className={LINK_CLASS}>
            {t('faq')}
          </a>
        </nav>
      </div>
    </footer>
  );
}
