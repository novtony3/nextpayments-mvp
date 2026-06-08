import { Github, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Logo } from './logo';

const COLUMNS = [
  { key: 'product', items: ['features', 'pricing', 'coins', 'widget'] },
  { key: 'developers', items: ['docs', 'api', 'sdk', 'status'] },
  { key: 'company', items: ['about', 'blog', 'careers', 'contact'] },
  { key: 'legal', items: ['terms', 'privacy', 'cookies'] },
] as const;

export function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="relative">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--color-accent)_45%,transparent)] to-transparent"
      />
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm text-[var(--color-text-muted)]">{t('tagline')}</p>
            <div className="flex gap-1 pt-2">
              <a
                href="#"
                aria-label="Twitter"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <Twitter className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <Github className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.key}>
              <h3 className="text-[13px] font-medium text-[var(--color-text)]">
                {t(`columns.${column.key}.title`)}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    >
                      {t(`columns.${column.key}.items.${item}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 text-xs text-[var(--color-text-subtle)] sm:flex-row sm:items-center">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
