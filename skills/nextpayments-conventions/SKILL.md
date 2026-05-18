---
name: nextpayments-conventions
description: Nextpayments project rules — invoke when writing/editing any code in this monorepo (apps/merchant-app, packages/ui, packages/config). Covers the no-hardcoding rule, Gemini design system, i18n, locale-safe routing, and file/naming conventions defined by the user and PLAN.md.
---

# Nextpayments Project Conventions

Apply these on every change in this repo. They consolidate user-defined rules and PLAN.md §4, §11, §12.

## 1. No hardcoding (hard rule)

Never inline a literal that is used in more than one place or carries meaning:
routes, URLs, timeouts/delays, numeric thresholds, repeated class strings,
placeholder text, magic numbers.

- Put cross-cutting constants in `apps/merchant-app/src/constants/` (`routes.ts`, `auth.ts`, …), `UPPER_SNAKE_CASE`, `as const`, imported via the `@/` alias.
- Localizable copy → i18n messages, never a constant or inline string.
- Design tokens (colors, radii) → `packages/config/tailwind/theme.css` as `--color-*` / `--radius-*`; reference via `var(--…)`, never raw hex at a call site.
- Component-internal tuning constants centralized at the top of their own file (e.g. animation `STOPS`/durations) are acceptable.
- Prefer extracting a reusable component over duplicating markup (see `TextField`, `PasswordToggle`, `BlueAccent`).

## 2. Design system (Gemini Desktop)

- Monochrome + single accent. The aurora **gradient is reserved for the logo mark and explicit hero moments only** (PLAN §4.2). Buttons/CTAs use `primary` (frosted Gemini-blue) or `outline` — not `gradient` — unless it's a designated hero CTA.
- Use design tokens for every color/radius. The deep-blue ambient is the shared `--color-aurora` token; the flowing-water glow is the reusable `<BlueAccent>` (`intensity` + `color` props) — reuse it, don't reimplement.
- Dark is default; everything must also work in light. Use theme tokens, never `text-white`/raw hex.
- Calm motion: long eased loops, honor `prefers-reduced-motion`.

## 3. i18n

- Every user-facing string goes through `next-intl` (`useTranslations`). Add the key to **both** `src/i18n/messages/en.json` and `vi.json` in the same change. Keep keys namespaced (`auth.login.*`).

## 4. Routing

- Always import `Link`/`useRouter`/`redirect` from `@/i18n/routing` (locale-safe), never from `next/navigation`, and never hardcode a path — use `ROUTES` from `@/constants/routes`.

## 5. File / naming

- Files `kebab-case.tsx`; components `PascalCase`; hooks `useCamelCase`; constants `UPPER_SNAKE_CASE`.
- Server Component by default; add `'use client'` only when hooks/events are needed.
- `packages/ui` is framework-agnostic: no `next/*` imports, no business logic, no data fetching.
- One component per file; absolute imports via `@/`.

## 6. Before declaring done

Run `pnpm --filter merchant-app typecheck` and `lint` (both must be clean) and validate any edited JSON.
