'use client';

import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { usePathname, useRouter, type Locale } from '@/i18n/routing';

const LOCALES: ReadonlyArray<{ code: Locale; label: string }> = [
  { code: 'vi', label: 'VI' },
  { code: 'en', label: 'EN' },
];

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const [isPending, startTransition] = useTransition();

  const next = LOCALES.find((l) => l.code !== locale) ?? LOCALES[0]!;

  return (
    <button
      type="button"
      aria-label={`${t('language')}: ${next.label}`}
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          router.replace(pathname, { locale: next.code });
        })
      }
      className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] disabled:opacity-50"
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{next.label}</span>
    </button>
  );
}
