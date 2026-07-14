# Rebrand VNPayment → OMNIPAYX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Swap the product brand from VNPayment/vnpayment.xyz to OMNIPAYX/omnipayx.io across logo, SEO/metadata, i18n strings, and docs — frontend only; the backend API domain stays.

**Architecture:** All brand identity funnels through one SSOT file (`apps/merchant-app/src/constants/site.ts`); the logo, favicon, Apple icon, OG card, manifest, robots, sitemap, and JSON-LD all derive from it. The work is therefore a constants + i18n-strings swap plus stale-comment cleanup — no new components, no layout changes.

**Tech Stack:** Next.js 15 App Router (merchant-app), Vite + React SPA (admin-dashboard), next-intl style JSON catalogs, Tailwind v4 tokens (untouched), pnpm workspace.

**Spec:** `docs/superpowers/specs/2026-07-11-rebrand-omnipayx-design.md` (committed on this branch).

## Global Constraints

- Brand name: `OMNIPAYX` (all caps). Monogram: `OX`. Frontend domain: `https://omnipayx.io`. Twitter/X: `@omnipayx`.
- **Backend API domain was out of scope in this phase** — `NEXT_PUBLIC_API_URL` untouched in `.env.example`, `.env.local`, `wrangler.jsonc`, and `postman/` (user's explicit call at the time: backend not yet migrated). _(Superseded 2026-07-15: backend migrated to `https://api.omnipayx.io`.)_
- Colors/theme/gradient stops unchanged. Tagline (`Crypto Payment Gateway`), OG subline, fee copy (`0.5%` / `0.1%`) unchanged. No messaging rewrites — only the brand token inside existing copy changes.
- Branch: `tai/chore/rebrand-omnipayx` (already exists, based on `dev`, holds the spec commits). Never commit on `dev`/`main`.
- Validation gate GREEN before every commit: `pnpm --filter merchant-app typecheck` + `lint`, prettier on touched files, i18n parity (en = fr key sets). `pnpm --filter admin-dashboard typecheck` + `lint` when admin files change.
- Working tree contains unrelated untracked items — `docs/branding-website-plan.md`, `postman/` — NEVER stage them (`git add` specific paths only, review `git diff --cached` before each commit).
- End every commit message with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- There is no unit-test runner in this repo. The verification cycle per task = typecheck/lint gate + targeted grep with expected output (spelled out in each task) + build/preview checks in the final task.

---

### Task 1: SSOT brand constants (`site.ts`)

**Files:**

- Modify: `apps/merchant-app/src/constants/site.ts` (lines 12, 15, 30–32, 75, 79, 92)

**Interfaces:**

- Consumes: nothing (this is the root of the dependency graph).
- Produces: `BRAND_NAME = 'OMNIPAYX'`, `BRAND_MONOGRAM = 'OX'`, `SITE_URL` fallback `https://omnipayx.io`, `TWITTER_HANDLE = '@omnipayx'` — every metadata/logo/OG surface picks these up with zero further changes. All other exports keep their exact current names and values.

- [ ] **Step 1: Apply the six value swaps**

Current → new, exact lines:

```ts
// line 12
export const BRAND_NAME = 'VNPayment';
// becomes
export const BRAND_NAME = 'OMNIPAYX';

// line 15
export const BRAND_MONOGRAM = 'VN';
// becomes
export const BRAND_MONOGRAM = 'OX';

// lines 30–32 (only the brand token changes)
export const BRAND_DESCRIPTION =
  `Accept crypto payments on every chain. Integrate the VNPayment gateway in ` +
  `minutes — 300+ coins, no KYC, one flat ${FEE_RATE} fee, plus ${REFERRAL_RATE} referral rewards.`;
// becomes
export const BRAND_DESCRIPTION =
  `Accept crypto payments on every chain. Integrate the OMNIPAYX gateway in ` +
  `minutes — 300+ coins, no KYC, one flat ${FEE_RATE} fee, plus ${REFERRAL_RATE} referral rewards.`;

// line 75 (the SITE_URL fallback, last operand of the `||` chain)
  'https://vnpayment.xyz'
// becomes
  'https://omnipayx.io'

// line 79
export const TWITTER_HANDLE = '@vnpayment';
// becomes
export const TWITTER_HANDLE = '@omnipayx';

// line 92 (last entry of SEO_KEYWORDS)
  'VNPayment',
// becomes
  'OMNIPAYX',
```

Everything else in the file (tagline, OG subline, fee rates, gradient stops, bg colors, theme color, OG size, sitemap paths, all comments) stays byte-identical.

- [ ] **Step 2: Verify no old tokens remain in the file**

Run: `grep -in "vnpayment\|'VN'" apps/merchant-app/src/constants/site.ts`
Expected: no output (exit code 1).

- [ ] **Step 3: Gate**

Run from repo root:

```bash
pnpm --filter merchant-app typecheck && pnpm --filter merchant-app lint
pnpm exec prettier --check apps/merchant-app/src/constants/site.ts
```

Expected: typecheck silent PASS, lint "No ESLint warnings or errors", prettier "All matched files use Prettier code style!".

- [ ] **Step 4: Commit**

```bash
git add apps/merchant-app/src/constants/site.ts
git diff --cached --stat   # exactly 1 file
git commit -m "feat(brand): rebrand SSOT constants to OMNIPAYX (omnipayx.io)

BRAND_NAME/MONOGRAM/DESCRIPTION, SITE_URL fallback, Twitter handle,
and SEO keywords. Logo, favicon, OG card, manifest, robots, sitemap,
and JSON-LD all derive from these — no other code changes needed.
Backend API domain intentionally untouched (not yet migrated).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Retire stale "NP" naming in logo + icon/OG comments

**Files:**

- Modify: `apps/merchant-app/src/components/shared/logo.tsx`
- Modify: `apps/merchant-app/src/app/icon.tsx` (comment only, line 5)
- Modify: `apps/merchant-app/src/app/opengraph-image.tsx` (comment only, line 18)

**Interfaces:**

- Consumes: `BRAND_GRADIENT_STOPS`, `BRAND_MONOGRAM`, `BRAND_NAME` from Task 1's file (unchanged export names).
- Produces: `Logo` component keeps its exact public props (`className`, `textClassName`, `iconOnly`, `size`) — consumers are untouched. `MonogramMark` stays private to `logo.tsx`.

Rationale (slightly extends spec §2 per its own stated rule — "reference the current monogram concept generically instead of hardcoding letters in prose"): `logo.tsx` names its private tile component `NPMark` with an "NP" monogram comment and a `np-logo-gradient` DOM id — all stale two-renames-ago branding that would read as bugs next to an "OX" monogram.

- [ ] **Step 1: Confirm `NPMark` is private to logo.tsx**

Run: `grep -rn "NPMark\|np-logo-gradient" apps/merchant-app/src --include="*.ts" --include="*.tsx"`
Expected: hits ONLY inside `apps/merchant-app/src/components/shared/logo.tsx`. If any other file hits, STOP and report — do not rename.

- [ ] **Step 2: Edit `logo.tsx`**

```tsx
// current
const GRADIENT_ID = 'np-logo-gradient';

/**
 * NPMark — the "NP" monogram in a rounded-square tile filled with the
 * signature cyan → blue → coral → gold sweep (the only gradient the design
 * system allows besides the aurora). Drawn as SVG so it stays crisp at every
 * size and mirrors the raster favicon / OG card, which share the same stops
 * via `BRAND_GRADIENT_STOPS`.
 */
function NPMark({ size = 22 }: { size?: number }) {
```

becomes

```tsx
const GRADIENT_ID = 'brand-logo-gradient';

/**
 * MonogramMark — the brand monogram in a rounded-square tile filled with the
 * signature cyan → blue → coral → gold sweep (the only gradient the design
 * system allows besides the aurora). Drawn as SVG so it stays crisp at every
 * size and mirrors the raster favicon / OG card, which share the same stops
 * via `BRAND_GRADIENT_STOPS`.
 */
function MonogramMark({ size = 22 }: { size?: number }) {
```

and the single usage inside `Logo`:

```tsx
      <NPMark size={size} />
// becomes
      <MonogramMark size={size} />
```

- [ ] **Step 3: Edit the two comments**

`apps/merchant-app/src/app/icon.tsx` line 5:

```tsx
// Dynamically-generated favicon — the "NP" monogram on the brand gradient.
// becomes
// Dynamically-generated favicon — the brand monogram on the brand gradient.
```

`apps/merchant-app/src/app/opengraph-image.tsx` line 18:

```tsx
// Dark canvas with the NP tile, wordmark, and the headline fee proposition —
// becomes
// Dark canvas with the monogram tile, wordmark, and the headline fee proposition —
```

- [ ] **Step 4: Verify + gate**

```bash
grep -rn "NPMark\|np-logo-gradient\|\"NP\"\|NP tile" apps/merchant-app/src --include="*.ts" --include="*.tsx"
```

Expected: no output.

```bash
pnpm --filter merchant-app typecheck && pnpm --filter merchant-app lint
pnpm exec prettier --check apps/merchant-app/src/components/shared/logo.tsx apps/merchant-app/src/app/icon.tsx apps/merchant-app/src/app/opengraph-image.tsx
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/merchant-app/src/components/shared/logo.tsx apps/merchant-app/src/app/icon.tsx apps/merchant-app/src/app/opengraph-image.tsx
git diff --cached --stat   # exactly 3 files
git commit -m "chore(brand): retire stale NP monogram naming in logo and icon/OG comments

NPMark → MonogramMark (private to logo.tsx), np-logo-gradient →
brand-logo-gradient, and two prose comments that hardcoded the old
letters. No behavior change; Logo's public props untouched.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Merchant i18n catalogs (en + fr)

**Files:**

- Modify: `apps/merchant-app/src/i18n/messages/en.json` (lines 3, 15, 167)
- Modify: `apps/merchant-app/src/i18n/messages/fr.json` (lines 3, 15, 167)

**Interfaces:**

- Consumes: nothing from other tasks (independent of Task 1/2).
- Produces: the three localized brand strings all UI copy reads via `t('common.appName')`, `t('meta.description')`, `t('landing.footer.copyright')`. Key paths unchanged — only values.

- [ ] **Step 1: Edit `en.json` — three values, keys untouched**

```json
    "appName": "VNPayment",
```

becomes

```json
    "appName": "OMNIPAYX",
```

```json
    "description": "Accept crypto payments on every chain with VNPayment. Integrate the gateway in minutes: 300+ coins, no KYC, one flat 0.5% fee, plus 0.1% referral rewards."
```

becomes

```json
    "description": "Accept crypto payments on every chain with OMNIPAYX. Integrate the gateway in minutes: 300+ coins, no KYC, one flat 0.5% fee, plus 0.1% referral rewards."
```

```json
      "copyright": "© 2026 VNPayment. All rights reserved."
```

becomes

```json
      "copyright": "© 2026 OMNIPAYX. All rights reserved."
```

- [ ] **Step 2: Edit `fr.json` — same three keys, French wording otherwise untouched**

```json
    "appName": "VNPayment",
```

becomes

```json
    "appName": "OMNIPAYX",
```

```json
    "description": "Acceptez les paiements crypto sur toutes les chaînes avec VNPayment. Intégrez la passerelle en quelques minutes : 300+ cryptos, sans KYC, des frais fixes de 0,5 % et 0,1 % de récompenses de parrainage."
```

becomes

```json
    "description": "Acceptez les paiements crypto sur toutes les chaînes avec OMNIPAYX. Intégrez la passerelle en quelques minutes : 300+ cryptos, sans KYC, des frais fixes de 0,5 % et 0,1 % de récompenses de parrainage."
```

```json
      "copyright": "© 2026 VNPayment. Tous droits réservés."
```

becomes

```json
      "copyright": "© 2026 OMNIPAYX. Tous droits réservés."
```

- [ ] **Step 3: i18n parity + no-residue check**

Run from repo root:

```bash
python3 - <<'EOF'
import json
def keys(o, p=''):
    if isinstance(o, dict):
        s = set()
        for k, v in o.items():
            s |= keys(v, f'{p}.{k}')
        return s
    return {p}
en = keys(json.load(open('apps/merchant-app/src/i18n/messages/en.json')))
fr = keys(json.load(open('apps/merchant-app/src/i18n/messages/fr.json')))
print('PARITY OK' if en == fr else f'MISSING in fr: {sorted(en-fr)}\nEXTRA in fr: {sorted(fr-en)}')
EOF
grep -in "vnpayment" apps/merchant-app/src/i18n/messages/en.json apps/merchant-app/src/i18n/messages/fr.json
```

Expected: `PARITY OK`, and the grep prints nothing.

- [ ] **Step 4: Gate**

```bash
pnpm --filter merchant-app typecheck && pnpm --filter merchant-app lint
pnpm exec prettier --check apps/merchant-app/src/i18n/messages/en.json apps/merchant-app/src/i18n/messages/fr.json
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/merchant-app/src/i18n/messages/en.json apps/merchant-app/src/i18n/messages/fr.json
git diff --cached --stat   # exactly 2 files
git commit -m "feat(i18n): swap brand token to OMNIPAYX in en/fr messages

appName, meta.description, landing.footer.copyright — brand name only,
surrounding copy untouched in both locales (en = fr parity kept).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 2FA issuer label (flagged addition beyond the spec inventory)

**Files:**

- Modify: `apps/merchant-app/src/constants/auth.ts` (line 38)

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: `TWO_FA_ISSUER = 'OMNIPAYX'` — consumed only by `src/lib/security/types.ts:59` (URL-encoded into the `otpauth://` enrollment URI). Export name and type (`as const`) unchanged.

Context: this is the account label merchants see in Google Authenticator / 1Password. It currently says "Nextpayments" (the internal project name leaking into a user-facing surface). Changing it affects **new 2FA enrollments only** — existing authenticator entries keep their old label and keep validating (the issuer is display metadata; the TOTP secret is untouched). The constant's doc comment says "keep it stable" — a deliberate one-time rebrand is the sanctioned exception; update the comment so the next reader knows it changed with the rebrand.

- [ ] **Step 1: Edit `auth.ts`**

```ts
/**
 * Issuer label encoded into the `otpauth://` URI shown in the QR code.
 * Authenticator apps group accounts under this string — keep it stable.
 */
export const TWO_FA_ISSUER = 'Nextpayments' as const;
```

becomes

```ts
/**
 * Issuer label encoded into the `otpauth://` URI shown in the QR code.
 * Authenticator apps group accounts under this string — keep it stable.
 * (Rebranded with OMNIPAYX, 2026-07: pre-rebrand enrollments keep the old
 * label in their authenticator app but continue to validate.)
 */
export const TWO_FA_ISSUER = 'OMNIPAYX' as const;
```

- [ ] **Step 2: Gate**

```bash
pnpm --filter merchant-app typecheck && pnpm --filter merchant-app lint
pnpm exec prettier --check apps/merchant-app/src/constants/auth.ts
```

Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/merchant-app/src/constants/auth.ts
git diff --cached --stat   # exactly 1 file
git commit -m "feat(security): brand 2FA issuer as OMNIPAYX

New enrollments show OMNIPAYX in authenticator apps; existing entries
keep their old label and continue to validate (display metadata only).

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Admin dashboard title + app name

**Files:**

- Modify: `apps/admin-dashboard/src/i18n/locales/en.json` (line 3)
- Modify: `apps/admin-dashboard/index.html` (line 6)

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: `common.appName = "OMNIPAYX"` consumed by `<BrandMark appName={t('common.appName')} suffix={t('common.appSuffix')} />` in `src/components/layout/sidebar.tsx` — renders "OMNIPAYX Admin". `common.appSuffix` (`"Admin"`) unchanged.

- [ ] **Step 1: Edit `en.json` line 3**

```json
    "appName": "Nextpayments",
```

becomes

```json
    "appName": "OMNIPAYX",
```

(`"appSuffix": "Admin"` on line 4 stays.)

- [ ] **Step 2: Edit `index.html` line 6**

```html
<title>Nextpayments Admin</title>
```

becomes

```html
<title>OMNIPAYX Admin</title>
```

- [ ] **Step 3: Gate (admin app)**

```bash
grep -rn "Nextpayments" apps/admin-dashboard/src apps/admin-dashboard/index.html
pnpm --filter admin-dashboard typecheck && pnpm --filter admin-dashboard lint
pnpm exec prettier --check apps/admin-dashboard/src/i18n/locales/en.json apps/admin-dashboard/index.html
```

Expected: grep prints nothing; typecheck/lint/prettier PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/admin-dashboard/src/i18n/locales/en.json apps/admin-dashboard/index.html
git diff --cached --stat   # exactly 2 files
git commit -m "feat(admin): rebrand admin app to OMNIPAYX Admin

Sidebar BrandMark appName + static document title.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: README — env-var table + 2FA issuer doc line

**Files:**

- Modify: `README.md` (lines 178, 181, and 366)

**Interfaces:**

- Consumes: Task 4's `TWO_FA_ISSUER = 'OMNIPAYX'` (line 366 documents that value).
- Produces: docs only — no code contract.

- [ ] **Step 1: Update the `NEXT_PUBLIC_SITE_URL` row (line 181) — new domain**

The third cell currently reads:

```
Public origin for metadata/canonical/OG/sitemap; fallback `https://vnpayment.xyz`.
```

becomes

```
Public origin for metadata/canonical/OG/sitemap; fallback `https://omnipayx.io`.
```

- [ ] **Step 2: Annotate the `NEXT_PUBLIC_API_URL` row (line 178) — domain kept, mark as legacy**

The third cell currently reads:

```
Hosted backend when `API_PROXY_TARGET` is not set. `.env.local`/`.env.example` set `https://api.omnipayx.io`.
```

becomes

```
Hosted backend when `API_PROXY_TARGET` is not set. `.env.local`/`.env.example` set `https://api.omnipayx.io` (legacy domain at the time — the backend has since migrated).
```

Keep the table's column pipes aligned per the file's existing style (the surrounding rows are padded with spaces; re-pad if the row width changes — prettier formats markdown tables on `--write`, so running prettier below settles alignment).

- [ ] **Step 3: Update the 2FA issuer doc line (line 366) — documents Task 4's value**

The 2FA "Enable" flow description currently reads (one long list item):

```
1. `begin2faSetupAction()` → `backendGet2faKey` (`GET /user/get-2fa-key`) returns `secret2FAKey` (base32); the action builds an `otpauth://` URI locally (`buildOtpauthUri`, issuer `Nextpayments`) → the QR is rendered locally with `QRCodeSVG` (the secret is not exposed to any third-party renderer).
```

Change ONLY the issuer token:

```
issuer `Nextpayments`
```

becomes

```
issuer `OMNIPAYX`
```

- [ ] **Step 4: Gate**

```bash
pnpm exec prettier --write README.md
git diff README.md   # confirm ONLY the three intended edits (plus any table re-padding on those rows) changed
command grep -n "vnpayment" README.md
command grep -n "Nextpayments" README.md
```

Expected: `vnpayment` shows exactly one hit — line ~178, the annotated API row. `Nextpayments` shows exactly two hits — lines 1 and 33 (the internal project/monorepo name, intentionally kept per spec out-of-scope), and NOT line 366.

- [ ] **Step 5: Commit**

```bash
git add README.md
git diff --cached --stat   # exactly 1 file
git commit -m "docs(readme): point site domain at omnipayx.io; mark API domain legacy

Also update the documented 2FA otpauth issuer to OMNIPAYX (matches
TWO_FA_ISSUER). API domain row kept on the legacy domain, annotated
as legacy — backend not yet migrated at the time.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Full verification sweep (builds + rendered output)

**Files:**

- Create/Modify: none (verification only; fixes loop back into the owning task's file set with a `fix:` commit).

**Interfaces:**

- Consumes: everything above.

- [ ] **Step 1: Repo-wide residual grep**

Use `command grep` (plain BSD/GNU grep) throughout this step: some agent
environments shim `grep` to an ignore-aware tool that silently skips
gitignored files like `.env.local`, which would make the expected list appear
to mismatch.

```bash
command grep -rni "vnpayment" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.next-check --exclude-dir=.open-next --exclude-dir=dist .
```

(`.next-check` and `dist` are produced by Step 2's builds and legitimately
contain the old API domain baked in from `.env.local` — the exclusions keep
this sweep deterministic whether it runs before or after the builds.)

Expected hits — EXACTLY these, nothing else:

- `README.md` — 1 hit (annotated `NEXT_PUBLIC_API_URL` row, intentional)
- `apps/merchant-app/.env.example` + `apps/merchant-app/.env.local` — API URL, intentional (if `.env.local` is missing from the output, your grep is honoring .gitignore — confirm directly: `command grep -n vnpayment apps/merchant-app/.env.local` → 1 hit)
- `apps/merchant-app/wrangler.jsonc` — API URL var, intentional
- `postman/test.js` — untracked scratch, API URL, out of scope
- `docs/branding-website-plan.md` — untracked planning doc, out of scope
- `docs/superpowers/specs/2026-07-11-rebrand-omnipayx-design.md` + `docs/superpowers/plans/2026-07-11-rebrand-omnipayx.md` — historical spec/plan text, intentional

Also:

```bash
command grep -rn "Nextpayments" apps/ --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.next-check --exclude-dir=.open-next --exclude-dir=dist
command grep -rn "'VNPayment'\|\"VNPayment\"" apps/ --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.next-check --exclude-dir=.open-next --exclude-dir=dist
```

Expected: no output from either. (The build-artifact exclusions matter: a
running dev server's `.next/` cache retains old-brand chunks/sourcemaps until
a full rebuild — those are not source residuals. "Nextpayments" outside
`apps/` — README title/intro, `docs/API.md`, `theme.css` header, `skills/`,
`@nextpayments/*` package scopes — is the internal project name and stays,
per the spec's out-of-scope list.)

- [ ] **Step 2: Production builds**

```bash
pnpm --filter merchant-app build:check
pnpm --filter admin-dashboard build
```

Expected: both succeed. (`build:check` uses `NEXT_DIST_DIR=.next-check` so it never clobbers a running dev server's `.next`. The admin build is extra assurance beyond the spec's verification list — it subsumes the admin typecheck the spec does require, since `build` = `tsc --noEmit && vite build`.)

- [ ] **Step 3: Rendered-output checks (merchant)**

Start the dev server (`pnpm dev` → port 5001), then:

```bash
curl -s http://localhost:5001/en | grep -o '<title>[^<]*</title>'
# expect: <title>OMNIPAYX — Crypto Payment Gateway</title>
curl -s http://localhost:5001/en | grep -c 'OMNIPAYX. All rights reserved'
# expect: 1 (footer copyright)
curl -s http://localhost:5001/fr | grep -c 'OMNIPAYX. Tous droits réservés'
# expect: 1
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5001/icon
# expect: 200 image/png   (favicon route renders with the new OX monogram)
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5001/opengraph-image
# expect: 200 image/png
curl -s http://localhost:5001/en | grep -c 'omnipayx.io'
# expect: >= 1 (canonical/OG URLs; note: on localhost SITE_URL falls back to the new domain only when NEXT_PUBLIC_SITE_URL is unset)
```

- [ ] **Step 4: Visual check in the browser preview**

Open `http://localhost:5001/en`: header logo shows the gradient "OX" tile + "OMNIPAYX" wordmark; tab title and favicon updated; footer reads "© 2026 OMNIPAYX. All rights reserved." Repeat on `/fr`. Then `pnpm dev:admin` and confirm the sidebar reads "OMNIPAYX Admin" and the tab title matches. Screenshot both for the user.

- [ ] **Step 5: Report**

Present: residual-grep table (each hit + why it's intentional), build results, curl outputs, screenshots. Do NOT push or merge to `dev` — pushing/merging is a separate user-confirmed step per the git-teamwork skill.

---

## Explicitly NOT in this plan

- `NEXT_PUBLIC_API_URL` anywhere (`.env.example`, `.env.local`, `wrangler.jsonc`, `postman/`) — backend domain stays until the backend migrates.
- Color palette, gradients, tagline, fee copy, landing messaging.
- `@nextpayments/*` package scopes, workspace/package names, `wrangler.jsonc` worker name (`crypto-payment-fe`) — internal identifiers.
- `docs/branding-website-plan.md` — user's own doc for a separate future repo.
- Phase 2 UI/UX enterprise polish — separate brainstorm + spec after this ships.
- Pushing or merging into `dev` — user confirmation required first.
