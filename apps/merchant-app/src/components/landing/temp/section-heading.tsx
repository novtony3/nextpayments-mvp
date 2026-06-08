'use client';

import { cn } from '@nextpayments/ui/lib/utils';

import { Reveal } from './reveal';

interface SectionHeadingProps {
  /** Branded pill label above the title (already localized). */
  kicker: string;
  /** Section title (already localized). */
  title: string;
  /** Supporting line under the title (already localized). */
  subtitle: string;
  className?: string;
}

/**
 * Centered section header — a glowing accent pill, a bold title, and a
 * supporting line, revealed on scroll. Single source for every landing
 * section so spacing/typography stay consistent. Presentational only.
 */
export function SectionHeading({ kicker, title, subtitle, className }: SectionHeadingProps) {
  return (
    <Reveal className={cn('mx-auto max-w-2xl text-center', className)}>
      <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-accent)_30%,transparent)] bg-[var(--color-accent-soft)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)] backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
        {kicker}
      </span>
      <h2 className="mt-6 text-balance text-3xl font-medium tracking-tight text-[var(--color-text)] sm:text-[44px] sm:leading-[1.08]">
        {title}
      </h2>
      <p className="mt-5 text-pretty text-[var(--color-text-muted)]">{subtitle}</p>
    </Reveal>
  );
}
