---
name: type-safety
description: TypeScript typing discipline — full, explicit types/interfaces, no `any`, no implicit any, no unsafe casts. Invoke whenever writing or editing TS/TSX (components, hooks, utils, constants, API shapes).
---

# Type Safety — Full Types & Interfaces

`strict` is on workspace-wide (`strict`, `noUncheckedIndexedAccess`,
`noImplicitOverride`). Write code that fully satisfies it — typed, not coerced.

## Rules

- **No `any`** — neither explicit nor implicit. If a type is truly unknown use
  `unknown` and narrow. Never silence the checker with `any`.
- **No escape hatches to "make it compile":** no `as any`, no `@ts-ignore` /
  `@ts-expect-error`, no non-null `!` to dodge a real null case. Fix the type.
  A cast is only acceptable when you provably know more than the compiler and a
  comment says why.
- **Every public surface is explicitly typed:**
  - Component props → a named `type`/`interface` (e.g. `XxxProps`); extend the
    DOM props you spread (`React.InputHTMLAttributes<HTMLInputElement>`), use
    `VariantProps<typeof cva>` for variant APIs.
  - Exported functions/hooks → explicit parameter and return types. Local
    helpers may infer when obvious.
  - Constants → `as const`; derive the type (`(typeof X)[number]`), don't
    restate it.
- **Validation drives types:** zod schema is the source of truth → `z.infer`;
  don't hand-write a parallel interface that can drift.
- **Discriminated unions over loose optionals** for state/variants; make
  illegal states unrepresentable. Prefer `interface`/`type` over inline
  repeated object shapes — name and reuse them.
- **No implicit `any` from libraries:** use proper generics (`useState<T>()`,
  `useForm<T>()`); type event handlers (`React.MouseEvent<HTMLButtonElement>`).
- **Respect `noUncheckedIndexedAccess`:** array/record index access is `T |
undefined` — guard it, don't `!` it away.
- **`tsc --noEmit` must pass** with zero errors before done — typecheck is not
  optional and warnings/errors are never left for "later".

## Self-check before finishing

- Any `any`, `as any`, `@ts-ignore`, or unexplained `!` I added? → remove/fix.
- Are all new props/exports/returns explicitly typed via named types?
- Types derived from `as const` / `z.infer`, not duplicated by hand?
- `pnpm -r typecheck` clean?
