---
name: frontend-clean-architecture
description: Frontend clean-architecture rules for this monorepo. Invoke when adding features, structuring components/modules, deciding where code lives, or reviewing for separation of concerns, reuse, and maintainability.
---

# Frontend Clean Architecture

Keep the UI layer thin and the boundaries explicit. Apply on any new feature or refactor.

## Layering (dependency direction points inward)

1. **Tokens / config** — `packages/config` (Tailwind theme, tsconfig, eslint). No app logic.
2. **Pure UI primitives** — `packages/ui` (atoms like Button). Framework-agnostic, no `next/*`, no business logic, no fetching. Polymorphic via `asChild`; styled only via design tokens.
3. **Constants & domain data** — `apps/*/src/constants` (routes, dummy data, schemas). No React.
4. **Feature components** — `apps/*/src/components/<feature>` (auth, landing). Compose primitives + constants + i18n. Reusable, presentational where possible.
5. **Routes/pages** — `app/[locale]/…`. Thin: compose feature components, set metadata, pass data down. No inline business logic or duplicated markup.

A lower layer must never import from a higher one (a page may import a feature; `packages/ui` must not import an app).

## Rules

- **DRY by extraction, not copy.** Duplicated markup/logic across ≥2 places → extract a component (`TextField`), hook (`useXxx`), or constant. The threshold is "appears twice".
- **Single responsibility.** A component either fetches/orchestrates or renders — not both. Keep render components prop-driven and side-effect-free.
- **Stable contracts.** Components expose a typed prop API (`VariantProps`/explicit types), forward `ref`, spread `...rest` to the DOM node. Don't leak internal class names as the public API.
- **Co-location.** A feature's components, schema, and constants live under that feature folder; promote to `shared/`/`constants/` only when a second consumer appears.
- **Validation at the edge.** Zod schema = source of truth; derive types with `z.infer`. Build schemas where locale-aware messages are needed, never duplicate rule numbers (import from constants).
- **No prop drilling > 2 levels.** Use composition or context; never a global store for what is local state.
- **Accessibility is structural,** not an afterthought: labels tied to inputs, `aria-*` on state, `role="alert"` on errors, reduced-motion respected.
- **Performance by default:** Server Components unless interactivity is required; dynamic-import heavy/below-the-fold client code; fixed dimensions to avoid CLS.

## Smell checklist (reject in review)

Hardcoded literal · duplicated block · component doing fetch + render · `packages/ui`
importing `next/*` · business rule inside JSX · untyped `any` prop · effect that
derives state that could be computed in render.
