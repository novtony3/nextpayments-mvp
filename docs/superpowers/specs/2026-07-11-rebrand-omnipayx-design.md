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
  site only** (`SITE_URL`, canonical/OG/manifest URLs). The backend API host
  was left on the legacy domain in this phase. _(Superseded 2026-07-15: the
  backend migrated — `NEXT_PUBLIC_API_URL` now points at `api.omnipayx.io`.)_
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

| Constant            | Current                   | New                      |
| ------------------- | ------------------------- | ------------------------ |
| `BRAND_NAME`        | `'VNPayment'`             | `'OMNIPAYX'`             |
| `BRAND_MONOGRAM`    | `'VN'`                    | `'OX'`                   |
| `BRAND_DESCRIPTION` | "...VNPayment gateway..." | "...OMNIPAYX gateway..." |
| `SITE_URL` fallback | `'https://vnpayment.xyz'` | `'https://omnipayx.io'`  |
| `TWITTER_HANDLE`    | `'@vnpayment'`            | `'@omnipayx'`            |
| `SEO_KEYWORDS`      | includes `'VNPayment'`    | includes `'OMNIPAYX'`    |

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

### 7. `apps/merchant-app/src/constants/auth.ts` (added during planning)

`TWO_FA_ISSUER = 'Nextpayments'` → `'OMNIPAYX'` — the issuer label merchants
see in Google Authenticator / 1Password when enrolling 2FA. User-facing brand
surface found after the spec's first inventory. Affects **new enrollments
only**: existing authenticator entries keep their old label and continue to
validate (the issuer is display metadata; TOTP secrets are untouched).

### 8. `README.md`

Update the env-var reference table: the `NEXT_PUBLIC_SITE_URL` row's fallback
`vnpayment.xyz` → `omnipayx.io`. The `NEXT_PUBLIC_API_URL` row (backend host)
kept the legacy domain at the time, annotated "not yet migrated" _(superseded
2026-07-15: now `api.omnipayx.io`)_. Also update the 2FA flow doc line that names the
otpauth issuer (`issuer \`Nextpayments\``→`issuer \`OMNIPAYX\``) to match §7.

---

## Out of scope

- **Phase 2 (UI/UX enterprise polish)** — landing/auth/dashboard visual detail,
  motion, trust signals, typography hierarchy. Separate brainstorm + spec
  after this ships.
- **`docs/branding-website-plan.md`** — the user's own planning doc for a
  _separate, not-yet-built_ marketing site repo. It references the old brand
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
  `.env.local`, `wrangler.jsonc` vars, `postman/`) — explicitly **kept as-is**
  in this phase per the user's instruction; only the frontend's own `SITE_URL`
  moved. _(Superseded 2026-07-15: the backend migrated and every config now
  points at `api.omnipayx.io`.)_
- **"Nextpayments" as the internal project/monorepo name** (README title +
  intro, `docs/API.md` title, `theme.css` header comment, `skills/`,
  `@nextpayments/*` package scopes) — internal naming, not product brand
  surface. Only its two user-facing occurrences change: the 2FA issuer (§7)
  and the README line documenting it (§8).

## Verification

- Grep the whole repo (excluding `node_modules` and build artifacts
  `.next*`/`.open-next`/`dist`) case-insensitively for `vnpayment` — expected
  residual hits, all intentional: the `NEXT_PUBLIC_API_URL` lines in
  `.env.example`, `.env.local` (gitignored), and `wrangler.jsonc` (backend
  not yet migrated); the annotated API row in `README.md`; `postman/` and
  `docs/branding-website-plan.md` (untracked, out of scope); and this spec +
  the implementation plan (historical text). Nothing else.
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
