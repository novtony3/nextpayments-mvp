'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@nextpayments/ui/components/button';
import { cn } from '@nextpayments/ui/lib/utils';

import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/routes';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

const NAV_KEYS = ['features', 'coins', 'pricing', 'docs'] as const;

export function Header() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_70%,transparent)] backdrop-blur-2xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_KEYS.map((key) => (
            <a
              key={key}
              href={`#${key}`}
              className="rounded-full px-3 py-1.5 text-[13px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href={ROUTES.LOGIN}
            className="ml-1 rounded-full px-3 py-1.5 text-[13px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            {t('login')}
          </Link>
          <Button asChild size="sm" className="ml-1">
            <Link href={ROUTES.REGISTER}>{t('getStarted')}</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
            {NAV_KEYS.map((key) => (
              <a
                key={key}
                href={`#${key}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-full px-3 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                {t(key)}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <Link
                href={ROUTES.LOGIN}
                className="ml-auto rounded-full px-3 py-2 text-sm text-[var(--color-text-muted)]"
                onClick={() => setMobileOpen(false)}
              >
                {t('login')}
              </Link>
              <Button asChild size="sm">
                <Link href={ROUTES.REGISTER} onClick={() => setMobileOpen(false)}>
                  {t('getStarted')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
