---
name: code-formatting
description: Code formatting rule — all code MUST be Prettier-formatted to the repo config. Invoke before finishing any task that creates or edits files; never hand-format or fight Prettier.
---

# Code Formatting (Prettier)

Prettier is the single source of truth for formatting in this repo. Humans and
agents do not decide formatting — Prettier does.

## Rules

- **Never hand-format.** Don't manually align, re-wrap, or tweak whitespace to
  taste. Write reasonable code and let Prettier normalize it.
- **Match the repo config exactly** (`.prettierrc` at root — do not override per
  file/inline):
  - `semi: true` · `singleQuote: true` · `tabWidth: 2`
  - `trailingComma: "all"` · `printWidth: 100`
  - plugin: `prettier-plugin-tailwindcss` (auto-sorts Tailwind class lists — do
    not manually reorder `className` utilities; let the plugin do it)
- **Format before declaring done.** Run from the repo root:
  ```bash
  pnpm format          # prettier --write across the workspace
  ```
  or check only: `pnpm exec prettier --check "<glob>"`.
- **Don't change `.prettierrc`** to make code pass. The config is intentional;
  changing it reformats the whole repo and is out of scope unless explicitly
  requested.
- **Formatting ≠ linting.** Prettier handles layout; ESLint handles correctness.
  Run both; never disable an ESLint rule to avoid a formatting fix.
- Generated files, lockfiles, and `*.pen` are not hand-formatted.

## Self-check before finishing

- Did I run `pnpm format` (or verify `prettier --check` is clean) on what I touched?
- Are Tailwind `className` lists left for the plugin to sort (not hand-ordered)?
- Untouched `.prettierrc`?
