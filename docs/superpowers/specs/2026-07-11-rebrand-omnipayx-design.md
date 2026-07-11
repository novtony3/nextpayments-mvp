# Rebrand — VNPayment → OMNIPAYX (Phase 1: logo, SEO/metadata, name/domain)

Date: 2026-07-11 · Branch: `tai/chore/rebrand-omnipayx` (from `dev`).
Scope: `apps/merchant-app`, `apps/admin-dashboard`, `README.md`.

Brainstormed + agreed with the user. Phase 1 of two: swap the brand identity
across every SSOT constant, i18n string, and env default. Phase 2 (UI/UX
enterprise polish across landing/auth/dashboard) is deliberately **out of
scope** here and will get its own brainstorm + spec after this ships — the
final logo/monogram from Phase 1 feeds directly into it.

---

## Product decisions (confirmed)

- **Brand name:** `OMNIPAYX` (all caps), replacing `VNPayment` everywhere.
- **Domain:** `omnipayx.io`, replacing `vnpayment.xyz` — for the **frontend
  site only** (`SITE_URL`, canonical/OG/manifest URLs). The **backend API
  host stays `api.vnpayment.xyz` for now** (user's explicit call: backend
  hasn't moved yet, so `NEXT_PUBLIC_API_URL` is untouched in this phase).
- **Monogram:** `OX`, replacing `VN` — rendered in the exact same rounded-square
  gradient tile (no shape/color redesign).
- **Tagline, messaging, fee/referral copy, colors/theme:** unchanged. This is a
  name/domain/logo-letters swap only — not a rewrite of positioning or a new
  palette (user explicitly kept the current Gemini design system).
- **Twitter/X handle:** `@omnipayx`, replacing `@vnpayment`.

## Why this is low-risk

Everything visual/SEO-facing already funnels through one file —
`apps/merchant-app/src/constants/site.ts` — per the repo's no-hardcoding
convention. There are no raster logo files to replace: the logo, favicon,
Apple touch icon, and OpenGraph card are all SVG/`next/og` routes that read
`BRAND_NAME` / `BRAND_MONOGRAM` / `BRAND_GRADIENT_STOPS` from that one place.
Metadata (title template, JSON-LD, manifest, robots, canonical URL) is
likewise derived from these constants in
`apps/merchant-app/src/app/[locale]/layout.tsx` — nothing to touch there
beyond the constants themselves.

The admin dashboard is a separate small surface (`Nextpayments` / `Admin`
strings via its own i18n file), not previously branded `VNPayment`.

---

## Changes (file by file)

### 1. `apps/merchant-app/src/constants/site.ts` (SSOT)

| Constant | Current | New |
|---|---|---|
| `BRAND_NAME` | `'VNPayment'` | `'OMNIPAYX'` |
| `BRAND_MONOGRAM` | `'VN'` | `'OX'` |
| `BRAND_DESCRIPTION` | "...VNPayment gateway..." | "...OMNIPAYX gateway..." |
| `SITE_URL` fallback | `'https://vnpayment.xyz'` | `'https://omnipayx.io'` |
| `TWITTER_HANDLE` | `'@vnpayment'` | `'@omnipayx'` |
| `SEO_KEYWORDS` | includes `'VNPayment'` | includes `'OMNIPAYX'` |

`BRAND_TAGLINE`, `BRAND_OG_SUBLINE`, `FEE_RATE`, `REFERRAL_RATE`,
`BRAND_GRADIENT_STOPS`, `BRAND_GRADIENT_CSS`, `BRAND_BG*`,
`BRAND_THEME_COLOR`, `OG_IMAGE_SIZE`, `SITEMAP_PATHS` — all unchanged.

### 2. `apps/merchant-app/src/app/icon.tsx`, `apps/merchant-app/src/app/opengraph-image.tsx`

Fix stale code comments that still say `"NP"` (leftover from an earlier name,
predates `VNPayment` even) to reference the current monogram concept
generically instead of hardcoding letters in prose.

### 3. `apps/merchant-app/src/i18n/messages/en.json`

- `common.appName`: `"VNPayment"` → `"OMNIPAYX"`
- `meta.description`: replace "...with VNPayment. Integrate the gateway..."
- `landing.footer.copyright`: `"© 2026 VNPayment. All rights reserved."` →
  `"© 2026 OMNIPAYX. All rights reserved."`

### 4. `apps/merchant-app/src/i18n/messages/fr.json`

Same three keys, French copy, brand name swapped (keep rest of French wording
as-is — no re-translation needed since only the brand token changes).

### 5. `apps/admin-dashboard/src/i18n/locales/en.json`

`common.appName`: `"Nextpayments"` → `"OMNIPAYX"`. `common.appSuffix`
(`"Admin"`) stays — renders as "OMNIPAYX Admin" via `<BrandMark>`.

### 6. `apps/admin-dashboard/index.html`

`<title>Nextpayments Admin</title>` → `<title>OMNIPAYX Admin</title>`.

### 7. `README.md`

Update the env-var reference table: the `NEXT_PUBLIC_SITE_URL` row's fallback
`vnpayment.xyz` → `omnipayx.io`. The `NEXT_PUBLIC_API_URL` row (backend host)
stays `api.vnpayment.xyz` — annotate it as "not yet migrated" so the README
doesn't read as stale/wrong.

---

## Out of scope

- **Phase 2 (UI/UX enterprise polish)** — landing/auth/dashboard visual detail,
  motion, trust signals, typography hierarchy. Separate brainstorm + spec
  after this ships.
- **`docs/branding-website-plan.md`** — the user's own planning doc for a
  *separate, not-yet-built* marketing site repo. It references the old brand
  as historical context and a since-superseded placeholder name
  (`OmniPayStack`). Left untouched; the user may update it separately.
- Color palette / gradient stops — explicitly kept as-is per user decision.
- Landing page messaging/positioning copy — explicitly kept as-is; only the
  brand token within existing copy changes.
- `apps/admin-dashboard/package.json` / `apps/merchant-app` package name
  fields — internal workspace identifiers, not user-facing brand surface.
- Backend/API service repo (not in this monorepo) — any brand strings it
  owns (emails, etc.) are out of scope here.
- **`NEXT_PUBLIC_API_URL` / backend API domain** (`.env.example`,
  `.env.local`, `api.vnpayment.xyz`) — explicitly **kept as-is** per the
  user's instruction. The backend hasn't migrated to `omnipayx.io` yet; only
  the frontend's own `SITE_URL` moves in this phase. Revisit once the backend
  is ready to move to `api.omnipayx.io`.

## Verification

- Grep the whole repo (excluding `node_modules`) case-insensitively for
  `vnpayment` — expect hits only in `docs/branding-website-plan.md` (out of
  scope) and the two `NEXT_PUBLIC_API_URL` lines in `.env.example`/`.env.local`
  (intentionally kept — backend not yet migrated).
- `pnpm --filter merchant-app typecheck && lint && format` and
  `pnpm --filter admin-dashboard typecheck && lint` (or repo-equivalent
  commands) — output gate before commit.
- `pnpm --filter merchant-app build` (metadata/OG routes are build-time
  generated — confirms no runtime errors from the constant swap).
- i18n parity check: `en.json` and `fr.json` key sets still match.
- Browser preview: confirm the header logo shows "OX" tile + "OMNIPAYX"
  wordmark, the favicon/tab title read "OMNIPAYX — Crypto Payment Gateway",
  and the footer copyright reads "© 2026 OMNIPAYX." on both locales. Confirm
  admin dashboard sidebar reads "OMNIPAYX Admin" and browser tab title
  matches.
