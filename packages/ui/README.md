# @nextpayments/ui

Framework-agnostic UI primitives + utilities shared between `merchant-app` and `admin-dashboard`.

## Rules

1. **No framework-specific imports.** Do NOT import `next/image`, `next/link`, `next/font`, etc.
   Pass routing/image components as props from the consuming app instead.
2. **Pure components only.** No data fetching, no global state, no env access.
3. Components are added incrementally as `merchant-app` or `admin-dashboard` need them
   (Shadcn-style: copy primitive → customize).

## Conventions

- All components use `cn()` from `@nextpayments/ui/lib/utils` for className merging.
- Variants via `class-variance-authority`.
- Default border radius: `rounded-xl` (12px) per Gemini design tokens.
