'use client';

import { Menu, X } from 'lucide-react';
import { useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { cn } from '@nextpayments/ui/lib/utils';

import { Link } from '@/i18n/routing';
import type { HeaderUser } from '@/lib/auth/types';
import { AuthControls } from '@/components/auth/auth-controls';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

const NAV_KEYS = ['features', 'coins', 'pricing', 'docs'] as const;

/** Scroll past this (px) collapses the bar into the floating pill. */
const SCROLL_COLLAPSE_THRESHOLD_PX = 24;

type HeaderProps = {
  /** Session identity resolved server-side in the marketing layout, so the
   * auth slot renders correctly on first paint (no flash). */
  initialUser: HeaderUser | null;
};

export function Header({ initialUser }: HeaderProps) {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  // Drive the collapse off Motion's batched scroll value (no raw window
  // listener / layout thrash), mirroring the snapvow landing nav.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > SCROLL_COLLAPSE_THRESHOLD_PX);
  });

  // Lock the page behind the full-screen mobile menu so only the overlay
  // scrolls (restores the prior value on close / unmount).
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  // Collapsed pill only when scrolled and the mobile sheet is closed (the
  // open menu uses the full-width flat bar to dock its close button).
  const collapsed = scrolled && !mobileOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'relative z-50 mx-auto flex h-14 items-center justify-between px-5 sm:px-6',
          !reduceMotion && 'transition-all duration-500 ease-[var(--interaction-easing)]',
          collapsed
            ? 'mt-3 max-w-5xl rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill-strong)] shadow-[0_10px_36px_-14px_rgba(0,0,0,0.55)] backdrop-blur-2xl'
            : 'mt-0 max-w-6xl border border-transparent bg-transparent',
        )}
      >
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
          <AuthControls user={initialUser} />
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
        <div className="fixed inset-0 z-40 flex flex-col bg-[color-mix(in_oklab,var(--color-bg)_94%,transparent)] px-6 pb-10 pt-24 backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col">
            {NAV_KEYS.map((key) => (
              <a
                key={key}
                href={`#${key}`}
                onClick={() => setMobileOpen(false)}
                className="border-b border-[var(--color-border)] py-5 text-2xl font-medium text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)]"
              >
                {t(key)}
              </a>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-2 pt-8">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="ml-auto">
              <AuthControls user={initialUser} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
