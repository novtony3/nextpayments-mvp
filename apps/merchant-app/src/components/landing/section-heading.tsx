'use client';

import { Reveal } from './reveal';

type SectionHeadingProps = {
  /** Small uppercase label above the title (already localized). */
  kicker: string;
  /** Section title (already localized). */
  title: string;
  /** Supporting line under the title (already localized). */
  subtitle: string;
};

/**
 * Centered section header — kicker + title + subtitle, revealed on scroll.
 * Single source for the four landing sections so spacing/typography stay
 * identical. Presentational only; caller passes already-translated strings.
 */
export function SectionHeading({ kicker, title, subtitle }: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">
        {kicker}
      </p>
      <h2 className="mt-4 text-balance text-3xl font-normal tracking-tight text-[var(--color-text)] sm:text-[42px] sm:leading-[1.15]">
        {title}
      </h2>
      <p className="mt-5 text-pretty text-[var(--color-text-muted)]">{subtitle}</p>
    </Reveal>
  );
}
