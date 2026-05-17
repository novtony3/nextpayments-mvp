import { useTranslations } from 'next-intl';

const PLACEHOLDER_LOGOS = [
  'Acme',
  'Cumulus',
  'Northwind',
  'Globex',
  'Stark',
  'Initech',
  'Hooli',
  'Pied Piper',
] as const;

export function TrustBar() {
  const t = useTranslations('landing.trustBar');

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <p className="text-center text-xs font-normal tracking-[0.14em] text-[var(--color-text-subtle)]">
          {t('title')}
        </p>
        <ul className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
          {PLACEHOLDER_LOGOS.map((name) => (
            <li
              key={name}
              className="select-none text-center font-mono text-sm tracking-tight text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text-muted)]"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
