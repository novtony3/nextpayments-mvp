# Phase 2A — Design-system foundation (tokens + primitives)

Date: 2026-07-11 · Branch: `tai/feat/design-foundation` (from `dev`).
Scope: `packages/config/tailwind/theme.css`, `packages/ui`, ui-kit QA page,
`skills/nextpayments-conventions/SKILL.md`.

First of five Phase 2 sub-projects (A Foundation → B Credibility → C
Dashboard → D Auth → E Landing), agreed with the user after a 4-reader UI
audit. A supplies the tokens and primitives that B–E consume, so nothing
downstream has to invent them twice. **No visual redesign**: existing dark
theme must look identical after this change except where explicitly intended
(consistent focus rings; softer light-mode overlay shadows).

User decisions binding all of Phase 2: trust content uses real facts only;
motion stays subtle-enterprise (150–300 ms, no decorative showpieces in
app surfaces); Gemini design system and messaging unchanged.

---

## 1. New tokens in `packages/config/tailwind/theme.css`

### 1.1 Elevation scale

Today zero `--shadow-*` tokens exist; shared components hardcode raw black
shadows that read too heavy in light mode. Add to the dark root block:

```css
--shadow-sm: 0 1px 2px -1px rgba(0, 0, 0, 0.4);
--shadow-md: 0 8px 24px -12px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 20px 60px -20px rgba(0, 0, 0, 0.6);
--shadow-overlay-up: 0 -20px 60px -20px rgba(0, 0, 0, 0.6);
```

and light-mode overrides (inside the existing light block) at roughly 60% of
the dark alpha (0.25/0.3/0.35/0.35). Values for `lg`/`overlay-up` match the
Sheet's current dark literal, so the dark theme is pixel-identical; the light
theme intentionally softens.

**Migrated consumers (this sub-project only):** `packages/ui` Sheet panel
(`shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)]` → `shadow-[var(--shadow-overlay-up)]`)
and the merchant user-menu dropdown (`rgba(0,0,0,0.5)` literal →
`var(--shadow-lg)`). Landing's intentional art shadows (hero card, pricing,
CTA banner) migrate in sub-project E; dashboard leftovers in C.

### 1.2 Type scale + container

Role-named font-size tokens matching today's most common real usage (no page
changes yet — adoption happens in C/D/E):

```css
--text-display-xl: 72px; /* landing hero headline */
--text-display: 44px; /* landing section titles */
--text-title: 24px; /* dashboard/auth page h1 (= text-2xl today) */
--text-lede: 17px; /* hero/section subtitles */
--text-body: 15px; /* default copy */
--text-caption: 13px; /* secondary copy, header nav */
--text-micro: 11px; /* uppercase micro-labels (tracking-wider) */
--container-content: 1120px; /* standard section max-width */
```

Documented heading recipe (in the token file's comments): page `h1` =
`--text-title` + `font-semibold`; micro-labels = `--text-micro` uppercase
`tracking-wider`. C fixes the current per-page drift against this recipe.

### 1.3 Motion tokens

Extend the existing pair (`--interaction-duration: 180ms`,
`--interaction-easing: cubic-bezier(0.16,1,0.3,1)`) into a scale — the
existing names stay as-is (they are the "base" tier; no alias churn):

```css
--motion-fast: 120ms; /* hover/focus feedback */
--motion-base: var(--interaction-duration); /* standard transitions */
--motion-slow: 300ms; /* entrances, reveals */
--motion-overlay: 440ms; /* sheet/drawer travel (= Sheet's current constant) */
```

**Migrated consumers:** `packages/ui` Button/IconButton/ActionIcon/Tabs etc.
swap hardcoded `duration-200`/`duration-300` for `duration-[var(--motion-base)]`;
Sheet's `SHEET_TRANSITION_MS = 440` stays in TS (it drives JS timing) but
gains a comment tying it to `--motion-overlay`.

### 1.4 Focus-ring standard

One utility, Button's current recipe generalized:

```css
@utility focus-ring {
  @apply outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)];
}
```

**Migrated consumers:** every focusable `packages/ui` component (Button,
IconButton, ActionIcon, Checkbox, ToggleSwitch, Tabs, SelectField,
SearchInput, Sheet close button, pagination controls) uses `focus-ring`
instead of its private variant. App-local controls (auth TextField,
PasswordToggle, landing nav links) adopt it in D/E.

## 2. `packages/ui` primitives

### 2.1 New `Skeleton`

`packages/ui/src/components/skeleton.tsx` — a single block primitive:

```tsx
<Skeleton className="h-4 w-32" /> // rounded, glass-tinted, shimmer
```

Glass-fill base (`--color-glass-fill`) with a slow shimmer sweep using
`--motion-slow`-family timing; static (no shimmer) under
`prefers-reduced-motion`. `aria-hidden` — skeletons are decorative; the
loading region's container owns the `aria-busy` announcement. No preset
variants (YAGNI) — consumers size via className; DataTable composes its own
rows from it (§2.3).

### 2.2 `Notice` gains `success` tone

Add `success` to the tone map using the existing `--color-success` token,
mirroring how `danger`/`warning` derive their soft fills. Unlocks shared
success confirmations (withdrawal submitted, integration created) that
today have no sanctioned surface.

### 2.3 `DataTable` built-in loading/empty

Two new optional props, additive (existing callers unchanged):

```tsx
<DataTable
  loading // renders `loadingRows` skeleton rows in the body
  loadingRows={5} // default 5
  empty={<EmptyState title={t('empty')} />} // rendered full-width when rows=[] && !loading
/>
```

When neither is passed, behavior is exactly today's. Callers stop hand-rolling
bare header rows / plain-`<p>` errors; C migrates the dashboard callers.

## 3. Small companion fixes

- **ui-kit QA page**: add showcase sections for Skeleton, all four Notice
  tones, DataTable loading/empty, and a focus-ring sampler (tab through every
  interactive primitive) — the visual gate for this sub-project. Today the QA
  page covers only Button/IconButton/ButtonGroup.
- **`skills/nextpayments-conventions/SKILL.md`**: replace the references to
  the non-existent `PLAN.md` with pointers to `theme.css` and this spec, and
  document the new token groups + focus-ring rule so future code review
  enforces them.

## Out of scope (deferred to their sub-projects)

- Applying type-scale/heading recipe to pages (C/D/E); landing art shadows
  (E); auth TextField error/disabled states (D); skeleton adoption in
  dashboard views (C); promoting app-local StatusBadge/StatCard into
  packages/ui (no second consumer yet — revisit if admin needs them);
  any color/spacing value changes beyond the light-mode shadow softening.

## Verification

- `pnpm --filter merchant-app typecheck && lint`, admin `typecheck && lint
&& build`, prettier on touched files. Merchant `next build` only if the
  parallel workerd fix has landed on dev (it is broken pre-existing —
  task_8ae14fae); otherwise dev-server compile of the QA page stands in.
- QA page preview walk: dark + light, reduced-motion on/off; tab through all
  primitives to see one consistent focus ring; Sheet open/close unchanged in
  dark, softer shadow in light; Skeleton shimmers (and doesn't under
  reduced-motion).
- Grep gates: no `duration-200|duration-300|duration-500` left in `packages/ui`; no raw
  `rgba(0,0,0` shadows left in `packages/ui`; `focus-visible:ring` private
  recipes replaced by `focus-ring` (one definition).
- Visual regression sanity: landing + dashboard home before/after in dark
  mode look identical (screenshots).
