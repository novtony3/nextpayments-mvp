---
name: nextpayments-conventions
description: Nextpayments project rules — invoke when writing/editing any code in this monorepo (apps/merchant-app, packages/ui, packages/config). Covers the no-hardcoding rule, Gemini design system, i18n, locale-safe routing, and file/naming conventions defined by the user and the design-system specs under docs/superpowers/specs/.
---

# Nextpayments Project Conventions

Apply these on every change in this repo. They consolidate user-defined rules, packages/config/tailwind/theme.css (the token source of truth), and docs/superpowers/specs/2026-07-11-design-system-foundation-design.md.

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

- Monochrome + single accent. The aurora **gradient is reserved for the logo mark and explicit hero moments only** (see theme.css "Single accent token" note). Buttons/CTAs use `primary` (frosted Gemini-blue) or `outline` — not `gradient` — unless it's a designated hero CTA.
- Use design tokens for every color/radius. The deep-blue ambient is the shared `--color-aurora` token; the flowing-water glow is the reusable `<BlueAccent>` (`intensity` + `color` props) — reuse it, don't reimplement.
- Dark is default; everything must also work in light. Use theme tokens, never `text-white`/raw hex.
- Calm motion: long eased loops, honor `prefers-reduced-motion`.
- Foundation tokens are mandatory where they exist: elevation via `--shadow-elev-*`/`--shadow-overlay-up` (no raw black box-shadows), timing via `--motion-*` (no `duration-<number>` literals in shared components), focus via the `focus-ring` utility (surface components override `--focus-ring-offset`), loading via the `Skeleton` primitive.

## 3. i18n

- Every user-facing string goes through `next-intl` (`useTranslations`). Merchant locales are **`en` (default) and `fr`** — add the key to **every** `src/i18n/messages/*.json` (`en.json` + `fr.json`) in the same change; no missing keys. Vietnamese was removed — do not reintroduce it. Keep keys namespaced (`auth.login.*`). Admin (`react-i18next`) is **English only** by decision.

## 4. Routing

- Always import `Link`/`useRouter`/`redirect` from `@/i18n/routing` (locale-safe), never from `next/navigation`, and never hardcode a path — use `ROUTES` from `@/constants/routes`.

## 5. File / naming

- Files `kebab-case.tsx`; components `PascalCase`; hooks `useCamelCase`; constants `UPPER_SNAKE_CASE`.
- Server Component by default; add `'use client'` only when hooks/events are needed.
- `packages/ui` is framework-agnostic: no `next/*` imports, no business logic, no data fetching.
- One component per file; absolute imports via `@/`.

## 6. Output validation gate (run BEFORE every commit AND before declaring done)

Code only leaves your hands when it is green. Run this **ordered** gate before
**every commit** and again before declaring a task done — not just at the very
end. A commit that skips it (e.g. forgetting `pnpm format`) leaves drift that a
later sweep has to clean up.

Run from the repo root, in order; each must pass before the next:

1. **Typecheck** — `pnpm --filter merchant-app typecheck` → zero errors, no `any`/implicit-any.
2. **Lint** — `pnpm --filter merchant-app lint` (or `pnpm -r lint` when packages/admin are touched) → zero warnings/errors. Never disable a rule to pass.
3. **Format** — `pnpm format` (Prettier write), then confirm clean with `pnpm exec prettier --check "<glob>"`. See the **code-formatting** skill. Tailwind class lists are sorted by the plugin — don't hand-order.
4. **i18n parity** — every new key exists in **both** `src/i18n/messages/en.json` and `fr.json` (same key set); validate both files parse as JSON.
5. **Build (when the change is broad or touches layout/routing/SSR/config)** — `pnpm --filter merchant-app build` → succeeds, and pages that should stay static/SSG still do (a stray `cookies()`/dynamic API silently flips them).

After staging, sanity-check the diff: `git diff --cached --ignore-all-space` should show only intentional logic — anything else is stray formatting or an accident.

> This gate is the contract referenced by the **git-teamwork** pre-commit
> checklist. Green gate → commit. Red gate → fix first, never commit around it.
