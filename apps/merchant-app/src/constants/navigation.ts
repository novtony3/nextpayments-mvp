/**
 * Marketing navigation targets — the single source of truth for *where* the
 * header and footer links point. The labels stay in i18n (`nav.*` and
 * `landing.footer.columns.*`); this file only owns the destinations, so a link
 * flips from "coming soon" to a real page by editing one entry here.
 */

import { ROUTES } from './routes';
import { CONTACT_MAILTO } from './site';

/** Ids of the landing-page sections the marketing links scroll to. */
export const HOME_SECTIONS = {
  FEATURES: 'features',
  PRICING: 'pricing',
  COINS: 'coins',
} as const;

/**
 * How a link renders:
 * - `route`  — locale-safe internal navigation via the next-intl `Link`.
 * - `anchor` — same-page jump to a section id (plain `<a href="#id">`).
 * - `mailto` — opens the mail client (plain `<a>`).
 */
export type NavLinkKind = 'route' | 'anchor' | 'mailto';

export type NavLink = {
  /** i18n key for the label, resolved in the consumer's namespace. */
  readonly key: string;
  readonly href: string;
  readonly kind: NavLinkKind;
};

export type NavColumn = {
  readonly key: string;
  readonly items: readonly NavLink[];
};

/** Same-page section jump (header, which only renders over the landing page). */
const anchor = (id: string): NavLink => ({ key: id, href: `#${id}`, kind: 'anchor' });

/** Home + section id (footer, which also renders on pages that lack the
 * sections — a bare `#features` there would be a dead link). */
const section = (id: string): NavLink => ({
  key: id,
  href: `${ROUTES.HOME}#${id}`,
  kind: 'route',
});

/** A section we haven't built yet — parked on the coming-soon page. */
const comingSoon = (key: string): NavLink => ({
  key,
  href: ROUTES.COMING_SOON,
  kind: 'route',
});

/** Header nav. Docs has no page yet, so it lands on coming-soon. */
export const HEADER_LINKS: readonly NavLink[] = [
  anchor(HOME_SECTIONS.FEATURES),
  anchor(HOME_SECTIONS.COINS),
  anchor(HOME_SECTIONS.PRICING),
  comingSoon('docs'),
];

/**
 * Footer columns. Everything under Developers, Company (bar Contact) and Legal
 * is unbuilt, so those all route to the coming-soon page; Contact opens the
 * support mailbox instead.
 */
export const FOOTER_COLUMNS: readonly NavColumn[] = [
  {
    key: 'product',
    items: [
      section(HOME_SECTIONS.FEATURES),
      section(HOME_SECTIONS.PRICING),
      section(HOME_SECTIONS.COINS),
      comingSoon('widget'),
    ],
  },
  {
    key: 'developers',
    items: [comingSoon('docs'), comingSoon('api'), comingSoon('sdk'), comingSoon('status')],
  },
  {
    key: 'company',
    items: [
      comingSoon('about'),
      comingSoon('blog'),
      comingSoon('careers'),
      { key: 'contact', href: CONTACT_MAILTO, kind: 'mailto' },
    ],
  },
  {
    key: 'legal',
    items: [comingSoon('terms'), comingSoon('privacy'), comingSoon('cookies')],
  },
];
