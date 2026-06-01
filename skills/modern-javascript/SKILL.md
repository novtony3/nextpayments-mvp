---
name: modern-javascript
description: Modern JavaScript/TypeScript style — ES2015+ idioms only, no legacy patterns (var, ES5 prototype/IIFE, callback/then chains), no outdated or unnecessary classes. React = function components + hooks only. Invoke whenever writing or editing any JS/TS/TSX in this repo.
---

# Modern JavaScript / TypeScript

Target is modern ESNext + React 19 + TypeScript (strict). Write idiomatic
modern code; never reach for legacy syntax a current engine/bundler made
obsolete. This complements **type-safety** (typing) and **code-formatting**
(layout) — this skill is about _language idioms_.

## Use (required)

- **`const` / `let`** — never `var`. Default to `const`; `let` only when reassigned.
- **Arrow functions** for callbacks, inline handlers, and short helpers. Named
  `function` declarations are fine for top-level/hoisted utilities and React
  components (readability + stack traces) — that is not "legacy".
- **Template literals** for any string with interpolation or multi-part
  concatenation — never `'a' + x + 'b'`.
- **Destructuring** (params, props, imports) + **spread/rest** (`{...obj}`,
  `[...arr]`, `(...args)`) — never `Object.assign({}, …)` for cloning or the
  `arguments` object.
- **Optional chaining `?.`** and **nullish coalescing `??`** — not `a && a.b` /
  `x !== undefined ? x : y` ladders. Use `??` (not `||`) when `0`/`''`/`false`
  are valid values.
- **`async`/`await`** for async flow — not `.then()/.catch()` chains or
  callbacks. Use `Promise.all` for concurrency, not sequential awaits in a loop.
- **ES modules** — `import` / `export`. Never `require()` / `module.exports` in
  app code. Use `import type { … }` for type-only imports.
- **Array/object iteration**: `map`/`filter`/`reduce`/`find`/`some`/`every` and
  `for…of` over C-style `for (let i…)` index loops, except where an index is
  genuinely needed. Object shorthand (`{ x }`), computed keys, `Object.entries`.
- **Default parameters** instead of `arg = arg || default` inside the body.

## Avoid (legacy — do not write)

- `var`, function hoisting relied on for control flow, IIFEs to create module
  scope (ES modules already scope).
- ES5 OOP: constructor functions + `.prototype.x = …`, `Object.create` chains,
  `.call`/`.apply`/`.bind` to fake `this` (arrows capture lexical `this`).
- `.then()` pyramids / nested callbacks where `async`/`await` reads cleaner.
- String concatenation with `+`, `arguments`, `new Array()`/`new Object()`.
- jQuery-isms / manual DOM walking in React code — use refs/state.

## Classes — modern, minimal, or not at all

- **React components are functions + hooks.** Never class components, no
  lifecycle methods — `useState`/`useEffect`/`useRef`/etc.
- **Prefer functions, closures, plain objects and modules** over classes.
  A module of exported functions beats a class used only as a namespace or a
  bag of statics. Don't model stateless logic as a class.
- **Classes are acceptable only where idiomatic**: subclassing built-ins
  (e.g. `class AuthError extends Error` — already used in `lib/auth/types.ts`),
  or a small genuinely-stateful encapsulation with invariants. When you do use
  one, use modern class fields / `#private`, not prototype assignments.

## TypeScript idioms

- `import type` for types; `satisfies` to validate a literal without widening;
  `as const` for literal/readonly data.
- **Prefer `as const` object + union type over `enum`** (smaller output, no
  runtime quirks) — matches the existing `*_PALETTES`/`ROUTES`/`API_ROUTES`
  constants. No legacy `namespace` / `module` declarations.
- Discriminated unions for result shapes (`{ ok: true … } | { ok: false … }`),
  as the auth/security/affiliate actions already do.
- Don't fight the React compiler with manual `useMemo`/`useCallback`/`memo`
  unless profiling shows a need — write clear code (see react-nextjs-best-practices).

## Self-check before finishing

- No `var`, no `require`, no string `+` concatenation, no `.then()` chains?
- No ES5 prototype/IIFE/`.apply` hacks; arrows used for lexical `this`?
- Any class I added — is it a real Error subclass or genuine stateful object,
  not a namespace/statics bag? React components all functions?
- `import type`, `as const`/union over `enum`, `?.`/`??` where they fit?
