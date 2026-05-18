---
name: component-reuse
description: Mandatory check before creating ANY UI/component. Invoke at the start of every task that adds or changes UI — reuse existing shared components first; only build new when none fits, and then strictly follow the project's UI concept.
---

# Component Reuse & UI-Concept Adherence

A hard rule for every UI task in this repo. Reuse first; never re-invent.

## 1. Reuse before you build (mandatory first step)

Before writing a single new component, **search what already exists** and use it:

- `packages/ui/src/components/**` — shared primitives (Button, IconButton, ButtonGroup, …).
- `apps/merchant-app/src/components/**` — feature/shared components (`TextField`,
  `PasswordToggle`, `SocialButtons`, `BlueAccent`, `Reveal`, `SectionHeading`,
  `Logo`, `Toaster`, …).
- `apps/admin-dashboard/src/components/**` — admin shell, `StatCard`, `BrandMark`.
- Shared utilities: `@nextpayments/ui/lib/utils` (`cn`), constants in `src/constants/**`,
  design tokens in `packages/config/tailwind/theme.css`.

Process every time:
1. Grep/scan the locations above for the thing you need (by name and by purpose).
2. If a component exists → **use it as-is**. Need a variant? Extend it via props
   (`variant`, `intensity`, `color`, `size`, `asChild`) — do **not** fork or copy it.
3. If it almost fits → improve the shared component (new prop/variant) so both
   old and new callers benefit. Keep its API backward-compatible.
4. Only if nothing fits → build new (section 2).

A new task is **not** a license to build a parallel component. Duplicating an
existing one is a defect, not progress.

## 2. If you must build a new shared component

It MUST conform to the existing project UI concept — no off-brand invention,
no decorative embellishment "because it looks nice":

- **Design tokens only.** Colors/radii/spacing via `var(--color-*)`,
  `var(--radius-*)`, Tailwind scale. No raw hex, no arbitrary one-off colors.
- **Gemini concept.** Monochrome + single blue accent; gradient reserved for the
  logo/aurora; calm motion (long ease, `prefers-reduced-motion`); glass surfaces
  via the glass tokens; hairline borders. Match the look of neighboring
  components — do not introduce a new visual language.
- **Same patterns as siblings.** `cva` variants + `VariantProps`, `forwardRef`,
  spread `...props`, `asChild` where polymorphism helps; `'use client'` only when
  needed; one component per file, kebab-case filename, PascalCase export.
- **Right layer.** Framework-agnostic primitive → `packages/ui` (no `next/*`, no
  business logic). Feature/shared app component → that app's `components/`.
  Promote to shared only when a second consumer is real.
- **No scope creep.** Build the smallest component that satisfies the task.
  Don't add unrequested variants, animations, or "polish" the user didn't ask
  for. Match, don't embellish.

## Self-check before finishing

- Did I search existing components first, and reuse/extend rather than recreate?
- Does anything I added duplicate an existing component? (If yes — delete, reuse.)
- Does new UI use only design tokens and match the Gemini concept of its neighbors?
- Is it in the correct layer with the project's standard component patterns?
