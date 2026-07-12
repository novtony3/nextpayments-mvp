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
shadows that read too heavy in light mode. Add to the dark root block —
named `elev` (not `sm`/`md`/`lg`) so Tailwind's stock `shadow-sm/md/lg`
utilities keep their default values (the toggle-switch knob uses `shadow-sm`):

```css
--shadow-elev-sm: 0 1px 2px -1px rgba(0, 0, 0, 0.4);
--shadow-elev-md: 0 8px 24px -12px rgba(0, 0, 0, 0.5);
--shadow-elev-lg: 0 16px 48px -16px rgba(0, 0, 0, 0.5); /* = user-menu dropdown today */
--shadow-overlay-up: 0 -20px 60px -20px rgba(0, 0, 0, 0.6); /* = bottom Sheet today */
```

and light-mode overrides (inside the existing light block) at roughly 60% of
the dark alpha (0.25/0.3/0.3/0.35). `elev-lg` matches the user-menu dropdown's
current literal and `overlay-up` matches the Sheet's, so the dark theme is
pixel-identical; the light theme intentionally softens.

**Migrated consumers (this sub-project only):** `packages/ui` Sheet panel
(`shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)]` → `shadow-[var(--shadow-overlay-up)]`)
and the merchant user-menu dropdown (`shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)]`
literal → `shadow-[var(--shadow-elev-lg)]`). Landing's intentional art shadows
(hero card, pricing, CTA banner) migrate in sub-project E; dashboard leftovers
in C.

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
--motion-slower: 500ms; /* ambient fades (Card glow) */
--motion-overlay: 440ms; /* sheet/drawer travel (= Sheet's current constant) */
--motion-shimmer: 1.8s; /* skeleton shimmer loop */
```

**Migrated consumers:** every `duration-*` literal in `packages/ui` maps onto
the scale so the tier unifies without a perceptible change — `duration-150`
and `duration-200` → `duration-[var(--motion-base)]` (150/200 → 180ms is
imperceptible), `duration-300` → `duration-[var(--motion-slow)]`,
`duration-500` → `duration-[var(--motion-slower)]`. Sheet's
`SHEET_TRANSITION_MS = 440` stays in TS (it drives JS timing) but gains a
comment tying it to `--motion-overlay`.

### 1.4 Focus-ring standard

One utility, Button's current recipe generalized, with a per-surface offset
override variable (`--focus-ring-offset`, defaulting to the page canvas):

```css
@utility focus-ring {
  @apply outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-ring-offset,var(--color-bg))];
}
```

**Migrated consumers:** the focusable `packages/ui` components that carry
their own `focus-visible:ring` recipe today — Button, ActionIcon,
ToggleSwitch, Tabs, and the Sheet close button — use `focus-ring` instead.
Components rendered on a surface (ActionIcon, Sheet close) override the offset
per-instance with `[--focus-ring-offset:var(--color-surface)]`. Two sanctioned
exceptions: **Checkbox** keeps a `peer-focus-visible:` variant of the same
accent ring (its native input is sr-only, so the ring must render on a
sibling), and **SearchInput/SelectField** keep their `focus-within` container
treatment (an intentional form-field pattern, not a ring — left as-is).
App-local controls (auth TextField, PasswordToggle, landing nav links) adopt
`focus-ring` in D/E.

## 2. `packages/ui` primitives

### 2.1 New `Skeleton`

`packages/ui/src/components/skeleton.tsx` — a single block primitive:

```tsx
<Skeleton className="h-4 w-32" /> // rounded, glass-tinted, shimmer
```

Glass-fill base (`--glass-fill`) with a shimmer sweep timed by the
`--motion-shimmer` token; static (no shimmer) under
`prefers-reduced-motion`. `aria-hidden` — skeletons are decorative; the
loading region's container owns the `aria-busy` announcement. No preset
variants (YAGNI) — consumers size via className; DataTable composes its own
rows from it (§2.3).

### 2.2 `Notice` gains `success` tone

Add `success` to the tone map using the existing `--color-success` token,
mirroring how `danger`/`warning` drive the leading icon and its color (Notice
has no per-tone soft fill — the surface is a shared `--glass-fill` Card).
Unlocks shared success confirmations (withdrawal submitted, integration
created) that today have no sanctioned surface.

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
- QA page preview walk: dark + light; tab through the full sampler (Button,
  IconButton, ToggleSwitch, Checkbox, ActionIcon, Tabs, and a Sheet's close
  button) to see one consistent focus ring; open a Sheet — unchanged in dark,
  softer shadow in light; Skeleton shimmers, and is static when
  `prefers-reduced-motion` is emulated (the shimmer sits under a
  `no-preference` media query — confirm in code + emulate if the preview
  supports it).
- Grep gates: no `duration-150|duration-200|duration-300|duration-500` left in
  `packages/ui`; no raw `rgba(0,0,0` shadows left in `packages/ui`;
  `focus-visible:ring` reduced to the single sanctioned Checkbox
  `peer-focus-visible:` variant (all other private recipes replaced by the
  `focus-ring` utility).
- Visual regression sanity: landing + dashboard home before/after in dark
  mode look identical (screenshots).
