# Phase 2A — Design-System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the missing foundation tokens (elevation, type scale, motion, focus-ring) and primitives (Skeleton, Notice success tone, DataTable loading/empty) that Phase 2 sub-projects B–E consume.

**Architecture:** All tokens land in the shared Tailwind v4 CSS-first file `packages/config/tailwind/theme.css` (both apps already import it); primitives land in `packages/ui` (consumed via the `./components/*` export map — no index barrel to update). Shared components migrate to the new tokens in-place. No page-level adoption yet — that is sub-projects C/D/E.

**Tech Stack:** Tailwind v4 CSS-first (`@theme`, `@utility`, native nesting), React 19 function components, cva-style class composition, pnpm workspace.

**Spec:** `docs/superpowers/specs/2026-07-11-design-system-foundation-design.md` (committed on this branch, already reconciled with this plan — the two are consistent; no in-flight spec amendment is needed). Key naming decisions the spec records: shadow tokens are `--shadow-elev-*` (defining `--shadow-sm/md/lg` in `@theme` would override Tailwind's stock `shadow-sm` utility, which `toggle-switch.tsx:44` uses — a visual regression); `--shadow-elev-lg` is pinned to the user-menu dropdown's current literal and `--shadow-overlay-up` to the Sheet's; the motion scale adds `--motion-slower: 500ms` (Card glow) and `--motion-shimmer: 1.8s` (Skeleton).

## Global Constraints

- **No visual redesign:** dark theme must look pixel-identical after every task, except the two sanctioned changes — consistent focus rings and softer light-mode overlay shadows. When tokenizing an existing literal, the token value must equal the literal.
- Branch: `tai/feat/design-foundation` (exists, based on `dev`, holds the spec commit). Never commit on `dev`/`main`.
- Validation gate GREEN before every commit: `pnpm --filter merchant-app typecheck` + `lint`, `pnpm --filter admin-dashboard typecheck` + `lint`, prettier on touched files (both apps import theme.css, so both gates run for token changes).
- Working tree has unrelated untracked/modified items — `docs/branding-website-plan.md`, `postman/`, `.claude/launch.json` — NEVER stage them; `git add` specific paths only, review `git diff --cached` before each commit.
- End every commit message with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- No unit-test runner exists. Per-task verification = grep gates with expected output + typecheck/lint; the final task adds a browser QA-page walk.
- Use `command grep` for gate greps (bypasses ignore-aware shims).
- Merchant `next build` is broken pre-existing (workerd crash, separate fix in flight — task_8ae14fae). Do NOT run it as a gate; the dev-server compile in Task 6 stands in.

---

### Task 1: Foundation tokens in `theme.css`

**Files:**

- Modify: `packages/config/tailwind/theme.css` (inside `@theme` after the Interaction-tokens block ~line 102; inside the light block ~line 175; new `@utility` after `action-icon-danger` ~line 277)

**Interfaces:**

- Consumes: existing `--interaction-duration: 180ms`, `--interaction-easing`, `--color-accent`, `--color-bg`.
- Produces (later tasks rely on these exact names): `--shadow-elev-sm/md/lg`, `--shadow-overlay-up`, `--text-display-xl/display/title/lede/body/caption/micro`, `--container-content`, `--motion-fast/base/slow/slower/overlay/shimmer`, and the `focus-ring` utility with its `--focus-ring-offset` override variable.

- [ ] **Step 1: Add elevation + type + motion tokens inside `@theme`**

Insert directly after line 102 (`--interaction-easing: … /* luxury ease-out */`), before the `/* === Typography === */` block:

```css
/* === Elevation scale ===
   * Named `elev` (not sm/md/lg) so Tailwind's default shadow-sm/md/lg
   * utilities keep their stock values (toggle-switch's knob uses shadow-sm).
   * Dark values are pinned to the literals they replace — tokenizing must
   * not change the dark theme. Light mode softens them (see light block). */
--shadow-elev-sm: 0 1px 2px -1px rgba(0, 0, 0, 0.4);
--shadow-elev-md: 0 8px 24px -12px rgba(0, 0, 0, 0.5);
--shadow-elev-lg: 0 16px 48px -16px rgba(0, 0, 0, 0.5); /* = user-menu dropdown today */
--shadow-overlay-up: 0 -20px 60px -20px rgba(0, 0, 0, 0.6); /* = bottom Sheet today */

/* === Type scale ===
   * Role-named sizes matching current real usage; generates text-display,
   * text-title, … utilities. Adoption happens per-area (Phase 2 C/D/E).
   * Heading recipe: page h1 = text-title + font-semibold; micro-labels =
   * text-micro + uppercase tracking-wider. */
--text-display-xl: 72px; /* landing hero headline */
--text-display: 44px; /* landing section titles */
--text-title: 24px; /* dashboard/auth page h1 */
--text-lede: 17px; /* hero/section subtitles */
--text-body: 15px; /* default copy */
--text-caption: 13px; /* secondary copy, header nav */
--text-micro: 11px; /* uppercase micro-labels */
--container-content: 1120px; /* standard section max-width (max-w-content) */

/* === Motion scale ===
   * Extends the interaction pair above. Consumed as arbitrary values, e.g.
   * `duration-[var(--motion-base)]`. --motion-overlay documents the Sheet's
   * JS travel constant (SHEET_TRANSITION_MS). */
--motion-fast: 120ms; /* hover/focus feedback */
--motion-base: var(--interaction-duration); /* standard transitions */
--motion-slow: 300ms; /* entrances, reveals */
--motion-slower: 500ms; /* ambient fades (Card glow) */
--motion-overlay: 440ms; /* sheet/drawer travel */
--motion-shimmer: 1.8s; /* skeleton shimmer loop */
```

- [ ] **Step 2: Add light-mode shadow overrides**

Inside the existing light block (after `--glass-highlight: color-mix(in oklab, white 50%, transparent);`, before its closing brace):

```css
/* Elevation reads lighter on a light canvas — raw dark-theme blacks
     * cast unnaturally heavy shadows on #f0f4f9. */
--shadow-elev-sm: 0 1px 2px -1px rgba(0, 0, 0, 0.25);
--shadow-elev-md: 0 8px 24px -12px rgba(0, 0, 0, 0.3);
--shadow-elev-lg: 0 16px 48px -16px rgba(0, 0, 0, 0.3);
--shadow-overlay-up: 0 -20px 60px -20px rgba(0, 0, 0, 0.35);
```

- [ ] **Step 3: Add the focus-ring utility**

Append after the `action-icon-danger` utility at the end of the file:

```css
/* === Focus ring ===
 * THE focus treatment for interactive controls (Button's recipe,
 * generalized). Offset color defaults to the page canvas via the
 * --focus-ring-offset variable; components that sit on a surface override it
 * per-instance with the arbitrary-property class
 * `[--focus-ring-offset:var(--color-surface)]`.
 * Exception: Checkbox keeps a `peer-focus-visible:` variant of the same
 * ring (its native input is sr-only, so the ring renders on a sibling). */
@utility focus-ring {
  @apply outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-ring-offset,var(--color-bg))];
}
```

(Uses the documented `ring-offset-[<value>]` arbitrary utility rather than
poking `--tw-ring-offset-color` directly — `ring-offset-[…]` is what sets that
internal variable, and the arbitrary value carries the `--focus-ring-offset`
fallback chain.)

- [ ] **Step 4: Gate**

```bash
pnpm exec prettier --write packages/config/tailwind/theme.css
pnpm --filter merchant-app typecheck && pnpm --filter merchant-app lint
pnpm --filter admin-dashboard typecheck && pnpm --filter admin-dashboard lint
```

Expected: all pass (tokens are additive; nothing consumes them yet).

- [ ] **Step 5: Commit**

```bash
git add packages/config/tailwind/theme.css
git diff --cached --stat   # exactly 1 file
git commit -m "feat(theme): elevation/type/motion tokens + focus-ring utility

Foundation for Phase 2 polish: --shadow-elev-* (+ light-mode softening),
role-named type scale, --motion-* scale (incl. shimmer), and THE focus-ring
utility with per-surface offset override. Additive only — no consumer
changes yet; spec already records these names.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Adopt `focus-ring` across `packages/ui`

**Files:**

- Modify: `packages/ui/src/components/button.tsx:32-33`
- Modify: `packages/ui/src/components/action-icon.tsx:36`
- Modify: `packages/ui/src/components/toggle-switch.tsx:34`
- Modify: `packages/ui/src/components/tabs.tsx:62`
- Modify: `packages/ui/src/components/sheet.tsx:268`
- Modify: `packages/ui/src/components/checkbox.tsx:31`

**Interfaces:**

- Consumes: Task 1's `focus-ring` utility + `--focus-ring-offset` variable.
- Produces: no API changes — class-string edits only; every component keeps its exact props.

Context: today five different focus recipes exist. Standard: `focus-ring`; components rendered on a surface (sheet close button, action icons in table rows) override the offset color; Checkbox keeps a `peer-` variant (its input is sr-only); SearchInput/SelectField keep their focus-within container treatment (form-field pattern, not a ring) — do NOT touch them.

- [ ] **Step 1: `button.tsx` — replace the two recipe lines**

```tsx
// current (lines 32-33, inside the cva base array)
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-[var(--color-bg)]',
// becomes (one line)
    'focus-ring',
```

- [ ] **Step 2: `action-icon.tsx` — surface offset**

```tsx
// current (line 36)
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]',
// becomes
        'focus-ring [--focus-ring-offset:var(--color-surface)]',
```

- [ ] **Step 3: `toggle-switch.tsx`**

```tsx
// current (line 34)
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
// becomes
        'focus-ring',
```

- [ ] **Step 4: `tabs.tsx` — gains the standard offset (sanctioned focus-consistency change)**

```tsx
// current (line 62)
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
// becomes
                'focus-ring',
```

- [ ] **Step 5: `sheet.tsx` close button**

In the line-268 className, replace exactly this substring:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]
```

with:

```
focus-ring [--focus-ring-offset:var(--color-surface)]
```

(the rest of that className string stays).

- [ ] **Step 6: `checkbox.tsx` — align the peer variant's ring color to the standard**

```tsx
// current (line 31)
          'peer-focus-visible:border-[var(--color-accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-accent-soft)]',
// becomes
          'peer-focus-visible:border-[var(--color-accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-accent)]',
```

- [ ] **Step 7: Gate**

```bash
command grep -rn "focus-visible:ring" packages/ui/src --include="*.tsx"
```

Expected: exactly ONE hit — the `peer-focus-visible:` line in checkbox.tsx.

```bash
command grep -rn "focus-ring" packages/ui/src --include="*.tsx" | wc -l
```

Expected: 5 (button, action-icon, toggle-switch, tabs, sheet).

```bash
pnpm --filter merchant-app typecheck && pnpm --filter merchant-app lint
pnpm --filter admin-dashboard typecheck && pnpm --filter admin-dashboard lint
pnpm exec prettier --check packages/ui/src/components/button.tsx packages/ui/src/components/action-icon.tsx packages/ui/src/components/toggle-switch.tsx packages/ui/src/components/tabs.tsx packages/ui/src/components/sheet.tsx packages/ui/src/components/checkbox.tsx
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components/button.tsx packages/ui/src/components/action-icon.tsx packages/ui/src/components/toggle-switch.tsx packages/ui/src/components/tabs.tsx packages/ui/src/components/sheet.tsx packages/ui/src/components/checkbox.tsx
git diff --cached --stat   # exactly 6 files
git commit -m "refactor(ui): one focus-ring standard across all controls

Button/ActionIcon/ToggleSwitch/Tabs/Sheet-close adopt the focus-ring
utility (surface components override the offset color); Checkbox's
peer variant aligns its ring to the full accent. Tabs gains the
standard offset — the sanctioned consistency change.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Tokenize durations + shadows in shared components

**Files:**

- Modify: `packages/ui/src/components/button.tsx:30`
- Modify: `packages/ui/src/components/card.tsx:58,67`
- Modify: `packages/ui/src/components/checkbox.tsx:28,40`
- Modify: `packages/ui/src/components/search-input.tsx:26,33`
- Modify: `packages/ui/src/components/select-field.tsx:33,55`
- Modify: `packages/ui/src/components/sheet.tsx:28,251,268`
- Modify: `packages/ui/src/components/tabs.tsx:61`
- Modify: `packages/ui/src/components/toggle-switch.tsx:33,45`
- Modify: `apps/merchant-app/src/components/auth/user-menu.tsx:138`

**Interfaces:**

- Consumes: Task 1's `--motion-base/slow/slower/overlay`, `--shadow-elev-lg`, `--shadow-overlay-up`.
- Produces: no API changes; Sheet still exports `SHEET_TRANSITION_MS = 440`.

Duration mapping (dark theme visually unchanged; 150/200 → 180ms is imperceptible and unifies the tier): every `duration-150` and `duration-200` → `duration-[var(--motion-base)]`; `duration-300` → `duration-[var(--motion-slow)]`; `duration-500` → `duration-[var(--motion-slower)]`. Button's brand-glow / glass-highlight shadows (lines 40/43/46 — brand-blue glow, brand-lilac glow, and an inset glass-highlight) are accent art, NOT elevation — leave them.

- [ ] **Step 1: Swap durations — 13 occurrences**

Apply the mapping to each listed line. Exact per-file edits:

`button.tsx:30`: `transition-all duration-200 select-none` → `transition-all duration-[var(--motion-base)] select-none`

`card.tsx:58`: `transition-colors duration-300` → `transition-colors duration-[var(--motion-slow)]`
`card.tsx:67`: `transition-opacity duration-500 ease-out` → `transition-opacity duration-[var(--motion-slower)] ease-out`

`checkbox.tsx:28`: `transition-colors duration-150` → `transition-colors duration-[var(--motion-base)]`
`checkbox.tsx:40`: `transition-opacity duration-150` → `transition-opacity duration-[var(--motion-base)]`

`search-input.tsx:26`: `transition-colors duration-200` → `transition-colors duration-[var(--motion-base)]`
`search-input.tsx:33`: `transition-colors duration-200` → `transition-colors duration-[var(--motion-base)]`

`select-field.tsx:33`: `transition-colors duration-200` → `transition-colors duration-[var(--motion-base)]`
`select-field.tsx:55`: `transition-colors duration-200` → `transition-colors duration-[var(--motion-base)]`

`sheet.tsx:268` (close button, same className Task 2 touched): `transition-colors duration-200` → `transition-colors duration-[var(--motion-base)]`

`tabs.tsx:61`: `transition-colors duration-200` → `transition-colors duration-[var(--motion-base)]`

`toggle-switch.tsx:33`: `transition-colors duration-200` → `transition-colors duration-[var(--motion-base)]`
`toggle-switch.tsx:45`: `transition-transform duration-200` → `transition-transform duration-[var(--motion-base)]`

- [ ] **Step 2: Tokenize the two elevation literals**

`sheet.tsx:251`:

```tsx
// current
            'bg-[var(--color-surface)] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)] sm:max-w-2xl',
// becomes
            'bg-[var(--color-surface)] shadow-[var(--shadow-overlay-up)] sm:max-w-2xl',
```

`apps/merchant-app/src/components/auth/user-menu.tsx:138` — replace exactly the substring `shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)]` with `shadow-[var(--shadow-elev-lg)]` (rest of the className stays).

- [ ] **Step 3: Tie the Sheet JS constant to the token**

`sheet.tsx:28`:

```tsx
// current
export const SHEET_TRANSITION_MS = 440;
// becomes
/** Sheet travel duration. Keep in sync with `--motion-overlay` in theme.css —
 * the value lives in TS because JS timers (unmount, height animation) need it. */
export const SHEET_TRANSITION_MS = 440;
```

- [ ] **Step 4: Gate**

```bash
command grep -rn "duration-150\|duration-200\|duration-300\|duration-500" packages/ui/src --include="*.tsx"
command grep -rn "rgba(0,0,0" packages/ui/src --include="*.tsx"
```

Expected: no output from either.

```bash
pnpm --filter merchant-app typecheck && pnpm --filter merchant-app lint
pnpm --filter admin-dashboard typecheck && pnpm --filter admin-dashboard lint
pnpm exec prettier --check packages/ui/src/components/button.tsx packages/ui/src/components/card.tsx packages/ui/src/components/checkbox.tsx packages/ui/src/components/search-input.tsx packages/ui/src/components/select-field.tsx packages/ui/src/components/sheet.tsx packages/ui/src/components/tabs.tsx packages/ui/src/components/toggle-switch.tsx "apps/merchant-app/src/components/auth/user-menu.tsx"
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/button.tsx packages/ui/src/components/card.tsx packages/ui/src/components/checkbox.tsx packages/ui/src/components/search-input.tsx packages/ui/src/components/select-field.tsx packages/ui/src/components/sheet.tsx packages/ui/src/components/tabs.tsx packages/ui/src/components/toggle-switch.tsx "apps/merchant-app/src/components/auth/user-menu.tsx"
git diff --cached --stat   # exactly 9 files
git commit -m "refactor(ui): route shared-component timing and elevation through tokens

All duration-* literals in packages/ui map onto the --motion-* scale
(150/200→base, 300→slow, 500→slower); Sheet panel and user-menu
dropdown shadows become --shadow-overlay-up / --shadow-elev-lg, which
also softens them in light mode. Dark theme unchanged.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: `Skeleton` primitive

**Files:**

- Modify: `packages/config/tailwind/theme.css` (append after the `focus-ring` utility)
- Create: `packages/ui/src/components/skeleton.tsx`

**Interfaces:**

- Consumes: `--glass-fill`, `--glass-highlight`, `--motion-shimmer` tokens.
- Produces: `Skeleton` component — `function Skeleton({ className }: { className?: string })`, importable as `@nextpayments/ui/components/skeleton` (the `./components/*` export map covers it automatically). Task 5's DataTable and sub-project C consume it.

- [ ] **Step 1: Add the shimmer utility + keyframes to `theme.css`**

Append after the `focus-ring` utility:

```css
/* === Skeleton shimmer ===
 * Loading-placeholder sweep used by the Skeleton primitive. Static glass
 * fill under prefers-reduced-motion — the placeholder stays visible, only
 * the sweep stops. */
@keyframes np-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

@utility skeleton-shimmer {
  background-color: var(--glass-fill);
  background-image: linear-gradient(
    100deg,
    transparent 35%,
    var(--glass-highlight) 50%,
    transparent 65%
  );
  background-size: 200% 100%;

  @media (prefers-reduced-motion: no-preference) {
    animation: np-shimmer var(--motion-shimmer) linear infinite;
  }
}
```

- [ ] **Step 2: Create the component**

`packages/ui/src/components/skeleton.tsx`:

```tsx
import { cn } from '../lib/utils';

export interface SkeletonProps {
  /** Size/shape via className, e.g. `h-4 w-32` or `h-10 w-10 rounded-full`. */
  className?: string;
}

/**
 * Loading placeholder block — glass-tinted with a slow shimmer sweep
 * (static under reduced motion; see `skeleton-shimmer` in theme.css).
 * Decorative by contract: always `aria-hidden`, so the loading REGION'S
 * container owns the announcement (`aria-busy`), not each block.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <span aria-hidden="true" className={cn('skeleton-shimmer block rounded-md', className)} />;
}
```

- [ ] **Step 3: Gate**

```bash
pnpm --filter merchant-app typecheck && pnpm --filter merchant-app lint
pnpm --filter admin-dashboard typecheck && pnpm --filter admin-dashboard lint
pnpm exec prettier --check packages/config/tailwind/theme.css packages/ui/src/components/skeleton.tsx
```

Expected: all pass. (Nothing imports Skeleton yet — Task 5 and the QA page do.)

- [ ] **Step 4: Commit**

```bash
git add packages/config/tailwind/theme.css packages/ui/src/components/skeleton.tsx
git diff --cached --stat   # exactly 2 files
git commit -m "feat(ui): Skeleton loading primitive with reduced-motion-safe shimmer

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: `Notice` success tone + `DataTable` loading/empty

**Files:**

- Modify: `packages/ui/src/components/notice.tsx`
- Modify: `packages/ui/src/components/data-table.tsx`

**Interfaces:**

- Consumes: Task 4's `Skeleton` (`../lib/utils`-sibling import `./skeleton`); existing `--color-success`.
- Produces: `NoticeTone = 'info' | 'success' | 'danger' | 'warning'`; `DataTableProps` gains `loading?: boolean`, `loadingRows?: number` (default 5), `empty?: React.ReactNode`. Both additive — existing callers compile unchanged. Sub-project C migrates dashboard callers onto them.

- [ ] **Step 1: `notice.tsx` — add the success tone**

Three edits:

```tsx
// import line — add CheckCircle2
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

// type — add 'success'
export type NoticeTone = 'info' | 'success' | 'danger' | 'warning';

// both tone maps — add the success entries
const TONE_ICON: Record<NoticeTone, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  danger: AlertTriangle,
  warning: AlertTriangle,
};

const TONE_ICON_CLASS: Record<NoticeTone, string> = {
  info: 'text-[var(--color-text-subtle)]',
  success: 'text-[var(--color-success)]',
  danger: 'text-[var(--color-danger)]',
  warning: 'text-[var(--color-warning)]',
};
```

- [ ] **Step 2: `data-table.tsx` — built-in loading/empty**

Add the import, the three props, and replace the `<tbody>` contents:

```tsx
import { cn } from '../lib/utils';
import { Skeleton } from './skeleton';
```

```tsx
export interface DataTableProps<Row> {
  columns: ReadonlyArray<DataTableColumn<Row>>;
  rows: ReadonlyArray<Row>;
  /** Stable React key per row. */
  getRowKey: (row: Row, index: number) => string;
  /** Force horizontal scroll below this width, e.g. `min-w-[640px]`. */
  minWidthClassName?: string;
  /** Extra classes for the scroll wrapper. */
  className?: string;
  /** Render skeleton rows instead of data (wins over `empty`). */
  loading?: boolean;
  /** How many skeleton rows `loading` renders. */
  loadingRows?: number;
  /** Rendered full-width when `rows` is empty and not loading
   * (e.g. `<EmptyState title={…} />`). Omitted → today's bare table. */
  empty?: React.ReactNode;
}
```

New `<tbody>` (the `<thead>` and wrapper stay exactly as-is; note `aria-busy`
on the tbody while loading — Skeleton blocks themselves are aria-hidden):

```tsx
<tbody className="text-[var(--color-text)]" aria-busy={loading || undefined}>
  {loading ? (
    Array.from({ length: loadingRows }, (_, index) => (
      <tr key={index} className="border-t border-[var(--color-border)] align-middle">
        {columns.map((col) => (
          <td key={col.key} className={cn('px-4 py-3', col.cellClassName)}>
            <Skeleton className="h-4 w-full max-w-32" />
          </td>
        ))}
      </tr>
    ))
  ) : rows.length === 0 && empty !== undefined ? (
    <tr className="border-t border-[var(--color-border)]">
      <td colSpan={columns.length} className="px-4 py-6">
        {empty}
      </td>
    </tr>
  ) : (
    rows.map((row, index) => (
      <tr
        key={getRowKey(row, index)}
        className="row-interactive border-t border-[var(--color-border)] align-middle"
      >
        {columns.map((col) => (
          <td key={col.key} className={cn('px-4 py-3', col.cellClassName)}>
            {col.render(row, index)}
          </td>
        ))}
      </tr>
    ))
  )}
</tbody>
```

and the function signature gains the props with the default:

```tsx
export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  minWidthClassName,
  className,
  loading = false,
  loadingRows = 5,
  empty,
}: DataTableProps<Row>) {
```

Also update the component docstring. The real JSDoc wraps that sentence across two lines (`…the caller owns the surrounding Card` / ` * shell, the empty/error states, and any pager below.`), so do NOT try to match it as one line — replace the contiguous single-line substring `the empty/error states, and any pager below.` with `any pager below; pass \`empty\` / \`loading\` for the built-in empty and skeleton states (or omit both for the legacy bare table).`(leaving`shell, ` before it intact — the result reads "…the surrounding Card shell, any pager below; …").

- [ ] **Step 3: Gate**

```bash
pnpm --filter merchant-app typecheck && pnpm --filter merchant-app lint
pnpm --filter admin-dashboard typecheck && pnpm --filter admin-dashboard lint
pnpm exec prettier --check packages/ui/src/components/notice.tsx packages/ui/src/components/data-table.tsx
```

Expected: all pass — existing DataTable/Notice callers compile untouched (props additive).

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/notice.tsx packages/ui/src/components/data-table.tsx
git diff --cached --stat   # exactly 2 files
git commit -m "feat(ui): Notice success tone + DataTable built-in loading/empty states

Both additive: existing callers unchanged. DataTable composes Skeleton
rows under `loading` and renders the `empty` node full-width, so
dashboard callers stop hand-rolling bare tables (adopted in Phase 2C).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: QA-page showcase + SKILL.md + visual verification

**Files:**

- Modify: `apps/merchant-app/src/app/[locale]/ui-kit/page.tsx`
- Create (only if the page is a Server Component): a co-located client wrapper for the Sheet demo, e.g. `apps/merchant-app/src/app/[locale]/ui-kit/sheet-demo.tsx`
- Modify: `skills/nextpayments-conventions/SKILL.md` (lines 3, 8, 24)

**Interfaces:**

- Consumes: everything above (`Skeleton`, `Notice` 4 tones, `DataTable` loading/empty, `focus-ring`).
- Produces: the visual gate for this branch; documentation future code review enforces.

- [ ] **Step 1: Read the QA page and append five showcase sections**

Read `apps/merchant-app/src/app/[locale]/ui-kit/page.tsx` first and follow its existing section/heading pattern (it currently showcases Button/IconButton/ButtonGroup). Note whether the file is already a Client Component (`'use client'`); the Sheet showcase (section 5) needs client state, so if the page is a Server Component, put section 5's trigger+Sheet in a small co-located Client Component (`'use client'`, `useState`) rather than converting the whole page. Append five sections using the same wrapper/heading structure the file already uses — content per section:

1. **Skeleton** — a row of blocks demonstrating sizing via className:

```tsx
<div className="flex flex-col gap-3">
  <Skeleton className="h-4 w-48" />
  <Skeleton className="h-4 w-72" />
  <Skeleton className="h-10 w-10 rounded-full" />
  <Skeleton className="h-24 w-full rounded-2xl" />
</div>
```

2. **Notice tones** — all four stacked:

```tsx
<div className="flex flex-col gap-3">
  <Notice tone="info">Info — neutral guidance.</Notice>
  <Notice tone="success">Success — action completed.</Notice>
  <Notice tone="warning">Warning — needs attention.</Notice>
  <Notice tone="danger">Danger — something failed.</Notice>
</div>
```

3. **DataTable states** — three small tables (loading / empty / rows) sharing one column set:

```tsx
type SampleRow = { name: string; value: string };
const SAMPLE_COLUMNS: ReadonlyArray<DataTableColumn<SampleRow>> = [
  { key: 'name', header: 'Name', render: (row) => row.name },
  { key: 'value', header: 'Value', render: (row) => row.value, cellClassName: 'font-mono text-xs' },
];
const SAMPLE_ROWS: ReadonlyArray<SampleRow> = [
  { name: 'Orders', value: '18,402' },
  { name: 'Volume', value: '$2.84M' },
  { name: 'Fee', value: '0.5%' },
];
// loading:
<DataTable columns={SAMPLE_COLUMNS} rows={[]} getRowKey={(r) => r.name} loading loadingRows={3} />
// empty:
<DataTable columns={SAMPLE_COLUMNS} rows={[]} getRowKey={(r) => r.name} empty={<EmptyState title="Nothing here yet" />} />
// rows:
<DataTable columns={SAMPLE_COLUMNS} rows={SAMPLE_ROWS} getRowKey={(r) => r.name} />
```

4. **Focus-ring sampler** — one row with a `Button`, `IconButton` (any icon, `aria-label="Sample"`), `ToggleSwitch`, `Checkbox`, `ActionIcon`, and a `Tabs` (two tabs) side by side, captioned "Tab through — every control shows the same accent ring." (The Sheet's close button — the remaining focusable primitive — is covered by section 5.)
5. **Sheet** — a trigger button that opens a `Sheet` (title + a line of body text), so the reviewer can verify the panel's `--shadow-overlay-up` elevation (softer in light) and tab to its close button's `focus-ring`. Minimal client wrapper:

```tsx
'use client';
import { useState } from 'react';
import { Button } from '@nextpayments/ui/components/button';
import { Sheet } from '@nextpayments/ui/components/sheet';

export function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open sheet</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Sheet showcase">
        <p className="text-sm text-[var(--color-text-muted)]">
          Elevation via --shadow-overlay-up; tab to the close button for the focus ring.
        </p>
      </Sheet>
    </>
  );
}
```

Confirm the exact `Sheet` prop names by reading `packages/ui/src/components/sheet.tsx` before writing this (adjust `open`/`onClose`/`title` to the real signature if they differ).

(The QA page is a dev-only playground — hardcoded English strings are the file's existing convention; imports come from `@nextpayments/ui/components/*`.)

- [ ] **Step 2: Update SKILL.md**

- Line 3 (description): `…file/naming conventions defined by the user and PLAN.md.` → `…file/naming conventions defined by the user and the design-system specs under docs/superpowers/specs/.`
- Line 8: `They consolidate user-defined rules and PLAN.md §4, §11, §12.` → `They consolidate user-defined rules, packages/config/tailwind/theme.css (the token source of truth), and docs/superpowers/specs/2026-07-11-design-system-foundation-design.md.`
- Line 24: `…explicit hero moments only** (PLAN §4.2).` → `…explicit hero moments only** (see theme.css "Single accent token" note).`
- Append one bullet to the design-system rules section (match the file's existing bullet style):

```md
- Foundation tokens are mandatory where they exist: elevation via `--shadow-elev-*`/`--shadow-overlay-up` (no raw black box-shadows), timing via `--motion-*` (no `duration-<number>` literals in shared components), focus via the `focus-ring` utility (surface components override `--focus-ring-offset`), loading via the `Skeleton` primitive.
```

- [ ] **Step 3: Gate**

This is the final task, so its gate also runs the full admin production build
(the spec's verification requires it; `admin-dashboard build` = `tsc --noEmit
&& vite build`, ~1s):

```bash
pnpm --filter merchant-app typecheck && pnpm --filter merchant-app lint
pnpm --filter admin-dashboard typecheck && pnpm --filter admin-dashboard lint && pnpm --filter admin-dashboard build
pnpm exec prettier --check "apps/merchant-app/src/app/[locale]/ui-kit/page.tsx" skills/nextpayments-conventions/SKILL.md
command grep -n "PLAN" skills/nextpayments-conventions/SKILL.md
```

Expected: typecheck/lint/prettier/admin-build pass; grep returns nothing.

- [ ] **Step 4: Visual verification walk (dev server)**

Start the merchant dev server (`pnpm dev`, port 5001) and check `http://localhost:5001/en/ui-kit`:

- Skeleton blocks shimmer (a sweeping gradient, not a pulse).
- Reduced-motion: with `prefers-reduced-motion: reduce` emulated (Preview `preview_resize` doesn't toggle it — use the browser's rendering-emulation or a `preview_eval` matchMedia check), the Skeleton stays visible but static — no sweep. If the preview can't emulate it, confirm in code that the `animation` sits under the `@media (prefers-reduced-motion: no-preference)` guard and note that.
- Four Notice tones render with distinct icons/colors (success = green check).
- DataTable: loading shows 3 skeleton rows; empty shows the EmptyState full-width; rows table unchanged.
- Tab through the focus sampler (Button, IconButton, ToggleSwitch, Checkbox, ActionIcon, Tabs): every control shows the same 2px accent ring with offset.
- Open the Sheet (section 5): it slides up over the page; tab to its close button — same focus ring. Leave it open for the light-mode check.
- Dark → light (`preview_resize` colorScheme `light`, or the theme toggle): the Sheet panel and user-menu dropdown shadows read visibly softer in light; everything else identical.
- Landing `/en` and dashboard home: screenshot in dark mode — must look identical to before this branch (compare against the Phase 1 screenshots).

- [ ] **Step 5: Commit**

```bash
git add "apps/merchant-app/src/app/[locale]/ui-kit/" skills/nextpayments-conventions/SKILL.md
git diff --cached --stat   # ui-kit page + SKILL.md (+ sheet-demo.tsx if created)
git commit -m "docs(ui-kit): showcase foundation primitives; point SKILL.md at real specs

QA page gains Skeleton/Notice-tones/DataTable-states/focus-ring
sections (the visual gate for this branch); nextpayments-conventions
stops citing the non-existent PLAN.md and documents the new token
rules.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Explicitly NOT in this plan

- Page-level adoption of type scale / heading recipe / skeletons / Notice success (sub-projects C/D/E).
- Landing art shadows (hero card, pricing ring, CTA banner) — sub-project E.
- Auth TextField error/disabled states and its `focus:` → `focus-visible:` fix — sub-project D (app-local component).
- SearchInput/SelectField focus-within container treatment — intentional form-field pattern, not a ring.
- Promoting StatusBadge/StatCard into packages/ui — no second consumer yet.
- Merchant `next build` as a gate — broken pre-existing (task_8ae14fae fix in flight).
