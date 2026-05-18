---
name: react-nextjs-best-practices
description: Current React (React team) and Next.js/Vercel team best practices. Invoke when writing React 19 / Next.js 15 App Router code — Server vs Client Components, hooks, data fetching, performance, and rendering strategy.
---

# React + Next.js (Vercel) Best Practices

Stack here: Next.js 15 App Router, React 19, Tailwind v4. Follow the React core team and Vercel/Next.js team guidance below.

## React team guidance

- **Server Components by default.** Add `'use client'` only at the leaf that needs state/effects/events/browser APIs. Keep client bundles small; push `'use client'` down, not up.
- **Don't reach for `useEffect`.** No effects for: deriving state from props (compute in render), transforming data for render (compute/`useMemo`), responding to events (do it in the handler). Effects are for external-system sync only.
- **State: minimal & lifted only as needed.** Derive, don't duplicate. Lift state to the lowest common parent; prefer composition over context for passing children.
- **Keys are identity**, never array index for dynamic lists. Stable keys.
- **Refs for imperative escape hatches only**; forward refs on reusable inputs/controls so consumers (and form libs) can attach.
- **React 19**: use the Actions / `useActionState` / `useFormStatus` / `useOptimistic` model for form mutations when wiring real submission; `use()` for unwrapping promises/context in render. Don't hand-roll what these cover. The compiler may be enabled — don't add manual memoization that fights it; write clear code.
- Concurrent-safe: render must be pure; no side effects during render; tolerate double-invocation in dev StrictMode.

## Next.js / Vercel team guidance

- **App Router**: route groups for code-split boundaries (`(marketing)` vs `(auth)`); colocate route-only UI; `layout.tsx` for shared shells; `loading.tsx`/`error.tsx` for streaming + resilience.
- **Data fetching** server-side in Server Components; `fetch` with explicit `cache`/`revalidate` (or `unstable_cache`/`use cache` per version). Mutations via Server Actions, not client fetch-to-route-handler, unless there's a reason.
- **Params are async** in Next 15: `await params` / `await searchParams`.
- **Rendering strategy intentionally**: static by default, `generateStaticParams` for known dynamic segments, dynamic only when request data is truly needed. Use Suspense to stream slow parts; don't make the whole route dynamic for one widget.
- **Assets**: `next/image` for every image (sized, lazy below fold), `next/font` for fonts (zero CLS). Never raw `<img>`/`<link>` font for perf-critical pages.
- **Perf budgets** (this project): Landing LCP < 2.0s, CLS < 0.1, initial JS < 200KB gzip. Verify route sizes in `next build` output; reserve fixed space for dynamic content.
- **Boundaries**: `'use client'` cannot be imported by RSC and keep server-only secrets/`server-only` out of client. Pass serializable props across the boundary.
- **Middleware/proxy** for locale/redirects (next-intl middleware here) — keep it lean (runs on every request).

## Checklist before done

RSC-by-default kept? · no needless `useEffect`? · `await params`? · images via
`next/image`, fonts via `next/font`? · route still static unless it must be
dynamic? · `next build` size within budget? · typecheck + lint clean?
