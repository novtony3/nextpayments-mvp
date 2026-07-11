# Nextpayments — Project Documentation

Crypto payment gateway for businesses — frontend monorepo. Design inspiration: Gemini Desktop. Product inspiration: nowpayments.io.

Full spec & architecture decisions: see [PLAN.md](./PLAN.md).

> Consolidated documentation for the **nextpayments** monorepo — a crypto payment platform. Every status in the "Progress tracker" section is based on evidence read from the source code, not speculation.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Requirements & dependencies](#2-requirements-dependencies)
3. [Installation & running](#3-installation-running)
4. [Environment variables (.env)](#4-environment-variables-env)
5. [Monorepo structure](#5-monorepo-structure)
6. [Architecture & runtime flow](#6-architecture-runtime-flow)
7. [Authentication & account flows](#7-authentication-account-flows)
8. [API integration](#8-api-integration)
9. [Existing features](#9-existing-features)
10. [Progress tracker](#10-progress-tracker)
11. [Conventions & design system](#11-conventions-design-system)
12. [Notes & next steps](#12-notes-next-steps)
13. [Deployment (DevOps)](#13-deployment-devops)
14. [Troubleshooting](#14-troubleshooting)
15. [Roadmap](#15-roadmap)

---

## 1. Overview

**Nextpayments** is a crypto payment platform. It is a **frontend-only (UI/UX) monorepo** — the repo itself does not own a database; all data comes from an external "crypto-payment" backend over HTTP.

The monorepo contains **2 applications** and **a group of shared packages**:

| Component                          | Type                             | Role                                                                                     | Dev port |
| ---------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| `apps/merchant-app`                | Next.js 15 App Router (React 19) | Dashboard for merchants (sellers) — the main piece, with many features already wired     | **5001** |
| `apps/admin-dashboard`             | Vite 6 + React 19 SPA            | Back-office console for operators — currently just a UI scaffold with dummy data         | **5002** |
| `packages/ui` (`@nextpayments/ui`) | Shared React library             | UI primitives + utilities, used by both apps                                             | —        |
| `packages/config/*`                | 3 config packages                | `@nextpayments/tailwind-config`, `@nextpayments/eslint-config`, `@nextpayments/tsconfig` | —        |

**Core tech stack:**

- **Workspace management:** pnpm workspace (NO Turborepo — there is no `turbo.json`; root scripts call `pnpm -r` / `--filter` directly).
- **merchant-app:** Next.js `15.1.3`, React 19, next-intl (i18n `en`+`fr`), Tailwind v4, Zod + react-hook-form, framer-motion, three/@react-three (3D landing). NO state-management or data-fetching library (no Redux/Zustand/React Query/SWR) — data flows through Server Components / Server Actions.
- **admin-dashboard:** Vite 6, React 19, Zustand (state), i18next (i18n, `en` only), Tailwind v4. This is a pure client-side rendered SPA — no SSR, no router.
- **Important:** Neither app has any testing framework in any manifest.

**Architectural difference between the two apps:** merchant-app is Next.js (Server Components + Server Actions + SSR); admin-dashboard is a fully client-side Vite SPA. This is a deliberate choice, not a mistake.

---

## 2. Requirements & dependencies

### Prerequisites

| Tool    | Required version                                       | Evidence / notes                                                                                                                                                                                                 |
| ------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js | `>=20` (`engines` field); `20.x` or `22.x` recommended | Root `package.json` `engines.node: ">=20"`. Both `Dockerfile`s pin `node:22-alpine`. **No `.nvmrc`/`.node-version`** in the repo. The local machine currently runs v24.15.0, but that is NOT a repo requirement. |
| pnpm    | `>=9`, repo pins `11.1.2`                              | `engines.pnpm: ">=9"` + `packageManager: "pnpm@11.1.2"`. npm/yarn are explicitly forbidden (README). Corepack recommended: `corepack enable && corepack prepare pnpm@latest --activate`.                         |
| Git     | any                                                    | README                                                                                                                                                                                                           |

> **Local environment note (per auto-memory):** the machine's default node is v20, which breaks pnpm; the user uses nvm v22.22.2 on PATH. This is a personal-machine issue, not a repo requirement.

### Key dependencies and their roles

**merchant-app (`apps/merchant-app/package.json`):**

| Package                                                                   | Role                                                                  |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `next@15.1.3`, `react@^19`, `react-dom@^19`                               | Framework / runtime                                                   |
| `next-intl@^3.26.3`                                                       | i18n (`en` + `fr`, default `en`), configured in `src/i18n/routing.ts` |
| `next-themes@^0.4.4`                                                      | Dark/light theme (dark by default)                                    |
| `zod@^3.24.1` + `react-hook-form@^7.54.2` + `@hookform/resolvers@^3.10.0` | Form validation + boundary                                            |
| `framer-motion@^11.15.0`                                                  | Animation                                                             |
| `geist@^1.3.1`                                                            | Self-hosted font via `next/font`                                      |
| `lucide-react@^0.460.0`                                                   | Icons; `@web3icons/react@^4.1.17` for crypto/chain icons              |
| `qrcode.react@^4.2.0`                                                     | QR code for deposits / 2FA                                            |
| `sonner@^1.7.1`                                                           | Toast                                                                 |
| `three` + `@react-three/fiber` + `@react-three/drei`                      | 3D (visual landing)                                                   |

**admin-dashboard (`apps/admin-dashboard/package.json`):** `type: module`; `react@19`, `vite@^6.0.7` + `@vitejs/plugin-react`, `zustand@^5.0.3`, `i18next@^24` + `react-i18next@^15`, `lucide-react`, Tailwind v4 via `@tailwindcss/vite`.

**packages/ui:** `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`; React is a peer dep.

**Root:** dev-deps only — `prettier@^3.3.3` + `prettier-plugin-tailwindcss@^0.6.8` + `typescript@^5.6.3`.

---

## 3. Installation & running

### Installing from a clean clone

```bash
git clone <repo-url> nextpayments
cd nextpayments
pnpm install
```

`pnpm install` installs the entire workspace (root + every app + every package) in one shot (~550 packages). CI/deploy uses `pnpm install --frozen-lockfile`.

**Install configuration notes:**

- `pnpm-workspace.yaml` locks build scripts: only `esbuild`, `sharp`, `unrs-resolver` are allowed to run install scripts.
- `.npmrc`: `auto-install-peers=true`, `strict-peer-dependencies=false`, `shamefully-hoist=false`, `prefer-workspace-packages=true`, `fetch-retries=5`, `fetch-timeout=300000` (because the deploy host has a slow connection to the npm registry).

### Run / build / lint / typecheck / format command table

**Root (`package.json`):**

| Command                                    | Action                                                                   | Port        |
| ------------------------------------------ | ------------------------------------------------------------------------ | ----------- |
| `pnpm dev` / `pnpm dev:merchant`           | merchant-app dev (Turbopack)                                             | **5001**    |
| `pnpm dev:admin`                           | admin-dashboard dev (Vite)                                               | **5002**    |
| `pnpm dev:all`                             | both apps in parallel (`pnpm -r --parallel --stream dev`)                | 5001 + 5002 |
| `pnpm build`                               | build both apps (`pnpm -r build`) — compiles then exits, no server start | —           |
| `pnpm build:merchant` / `pnpm build:admin` | build a single app                                                       | —           |
| `pnpm start` / `pnpm start:merchant`       | merchant production server (`next start -p 5001`)                        | 5001        |
| `pnpm start:admin`                         | admin `vite preview`                                                     | 5002        |
| `pnpm lint`                                | `pnpm -r lint` (ESLint per package)                                      | —           |
| `pnpm format`                              | Prettier write `**/*.{ts,tsx,js,jsx,json,md}`                            | —           |
| `pnpm clean`                               | remove `node_modules`, `.next`, `.turbo`, `dist`                         | —           |

> **There is no `typecheck` script at the root.** Typecheck is per-package: `pnpm -r typecheck`.

**merchant-app (`apps/merchant-app/package.json`):**

| Command       | Action                                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `dev`         | `next dev --turbopack -p 5001`                                                                                                                |
| `dev:full`    | `../../scripts/dev-merchant.sh` — open the SSH tunnel, wait for backend health, then start dev (use when pages call the API)                  |
| `tunnel`      | `../../scripts/tunnel.sh` (subcommands `up\|down\|restart\|status\|wait`)                                                                     |
| `build`       | `next build` (output `standalone`)                                                                                                            |
| `build:check` | `NEXT_DIST_DIR=.next-check next build` — verification build into a separate directory so it does not clobber the running dev server's `.next` |
| `start`       | `next start -p 5001`                                                                                                                          |
| `lint`        | `next lint`                                                                                                                                   |
| `typecheck`   | `tsc --noEmit`                                                                                                                                |

**admin-dashboard (`apps/admin-dashboard/package.json`):**

| Command     | Action                                  |
| ----------- | --------------------------------------- |
| `dev`       | `vite`                                  |
| `build`     | `tsc --noEmit && vite build` → `dist/`  |
| `preview`   | `vite preview --port 5002 --strictPort` |
| `lint`      | `eslint "src/**/*.{ts,tsx}"`            |
| `typecheck` | `tsc --noEmit`                          |

> admin-dashboard uses its own flat ESLint 9 config (`eslint.config.js`), and does NOT use the shared `@nextpayments/eslint-config` (because the shared config is in the legacy eslintrc format that cannot be flat-extended). It is the only ESLint-CLI consumer in the workspace.

**Helper scripts (`scripts/`):**

- `dev-merchant.sh` — one-command dev launcher (tunnel up + wait + dev server).
- `tunnel.sh` — manages the background SSH tunnel `LOCAL_PORT 13000 → SSH_HOST 103.160.4.145 :REMOTE_PORT 3000`; health-checks `/api/health` for `"ok":true`. Overridable via env.
- `start-merchant.sh` — SSH into the deploy host to run `docker compose` (ops/deploy, not local dev).

**Docker:** `docker-compose-merchant-app.yml` (port `127.0.0.1:5001:5001`, env_file `envs/merchant-app.env.docker`, `API_PROXY_TARGET=http://crypto-payment-be:3000`) and `docker-compose-admin-dashboard.yml` (`127.0.0.1:5002:5002`). Both attach to the external network `backend`. Dockerfiles use `node:22-alpine`.

> **Default locale note:** opening `http://localhost:5001` triggers a 307 redirect to `/en` (next-intl default locale). Routes: `/en`, `/fr`, `/en/login`, `/en/register`, `/en/dashboard`...

> **UI-only phase:** per the README, no secret is required to build/run, but API calls (login, dashboard, 2FA, affiliate) will **502** if no backend is reachable.

---

## 4. Environment variables (.env)

**Only merchant-app reads env vars.** admin-dashboard does NOT read any env (verified: no `import.meta.env`/`VITE_` in `src`; the `VITE_API_URL` arg exists only in `docker-compose-admin-dashboard.yml`, defaults to `/api`, and is **not consumed** in the source).

Backend wiring is centralized in `apps/merchant-app/src/constants/api.ts` (`resolveBackendTarget()`), consumed by `next.config.ts` `rewrites()`. The browser always calls same-origin `/api/*` (`API_BASE_URL = '/api'`), Next rewrites to the backend → **no CORS**.

### Environment variable table

| Variable                                                              | Read in                                     | Purpose / default                                                                                                                                                         |
| --------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `API_PROXY_TARGET`                                                    | `src/constants/api.ts`                      | Highest-priority backend origin; override per machine, e.g. SSH tunnel `http://localhost:13000`. Docker sets `http://crypto-payment-be:3000`.                             |
| `NEXT_PUBLIC_API_URL`                                                 | `src/constants/api.ts`                      | Hosted backend when `API_PROXY_TARGET` is not set. `.env.local`/`.env.example` set `https://api.vnpayment.xyz` (legacy domain — backend not yet migrated to omnipayx.io). |
| (fallback)                                                            | `DEFAULT_API_PROXY_TARGET`                  | `http://localhost:3000` when both env vars are empty.                                                                                                                     |
| `NEXT_DIST_DIR`                                                       | `next.config.ts`                            | Change the `.next` build directory (used by `build:check`).                                                                                                               |
| `NEXT_PUBLIC_SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL` | `src/constants/site.ts`                     | Public origin for metadata/canonical/OG/sitemap; fallback `https://omnipayx.io`.                                                                                          |
| `NODE_ENV`                                                            | `src/lib/auth/session.ts`, `next.config.ts` | Marks the session cookie `secure` in production.                                                                                                                          |

**Backend base URL — priority order:**

```
API_PROXY_TARGET  →  NEXT_PUBLIC_API_URL  →  http://localhost:3000
```

> Env is read when Next starts up — **restart `pnpm dev`** after changing it.
> Existing env files: `apps/merchant-app/.env.example` (committed), `.env.local` (git-ignored), `envs/merchant-app.env.docker`.
> **Warning:** `.env.example` references `./SSH-README.md`, but this file **does not exist** at the root; the actual tunnel tooling is `scripts/tunnel.sh`.

---

## 5. Monorepo structure

```
nextpayments/
├── apps/
│   ├── merchant-app/                # Next.js 15 merchant dashboard (port 5001)
│   │   ├── next.config.ts           # rewrites() proxy /api/* → backend; output standalone; transpilePackages
│   │   ├── src/
│   │   │   ├── app/[locale]/         # App Router; every page lives under the [locale] segment
│   │   │   │   ├── (auth)/           # login, register, forgot/reset-password, verify-email
│   │   │   │   ├── (marketing)/      # landing (header+footer chrome)
│   │   │   │   ├── (protected)/      # dashboard with auth guard + shell
│   │   │   │   ├── layout.tsx        # root document layout: locale, fonts, providers, SEO
│   │   │   │   └── not-found.tsx, [...rest]/, ui-kit/
│   │   │   ├── app/api/diag/health/  # local Route Handler (NOT proxied)
│   │   │   ├── components/           # auth/, dashboard/, landing/ (+ landing/temp/), shared/
│   │   │   ├── lib/                  # per domain: types.ts + backend.ts + actions.ts
│   │   │   ├── constants/            # api.ts, routes.ts, auth.ts, fund.ts... (single source of truth)
│   │   │   ├── i18n/                 # routing.ts, request.ts, messages/{en,fr}.json
│   │   │   └── middleware.ts         # next-intl routing + header x-pathname
│   │   ├── .env.example / .env.local
│   │   └── Dockerfile
│   └── admin-dashboard/             # Vite 6 SPA admin (port 5002, EN-only)
│       ├── src/
│       │   ├── main.tsx, App.tsx     # mounts <AdminShell><Home/></AdminShell>, NO router
│       │   ├── pages/home.tsx        # the ONLY page (dummy data)
│       │   ├── components/layout/    # admin-shell, sidebar, topbar
│       │   ├── components/dashboard/ # stat-card
│       │   ├── store/ui-store.ts     # Zustand (sidebar collapse only)
│       │   ├── constants/            # dashboard.ts (DUMMY data), nav.ts
│       │   └── i18n/                 # react-i18next, en.json only
│       ├── Dockerfile + nginx.conf
├── packages/
│   ├── ui/                          # @nextpayments/ui — shared React primitives
│   │   └── src/{components,lib}/
│   └── config/
│       ├── tailwind/theme.css        # @nextpayments/tailwind-config — design tokens Gemini
│       ├── eslint/                   # @nextpayments/eslint-config (index.js, next.js)
│       └── tsconfig/                 # @nextpayments/tsconfig (base/nextjs/react-library.json)
├── scripts/                         # dev-merchant.sh, tunnel.sh, start-merchant.sh
├── envs/                            # merchant-app.env.docker
├── docs/                            # API.md, FUND-TOPUP.md, LANDING-WEB3-FLAG.md
├── skills/                          # engineering conventions (single source of truth)
├── postman/                         # crypto-payment-be.postman_collection.json (reference)
├── pnpm-workspace.yaml              # globs: apps/*, packages/*, packages/config/*
├── .npmrc, .prettierrc
└── package.json                     # root scripts (pnpm -r / --filter)
```

> **Note:** `packages/config` is not a package — its 3 subdirectories (`tailwind`, `eslint`, `tsconfig`) are the packages, matching the `packages/config/*` glob. `packages/ui` has no build step — merchant transpiles it directly via `transpilePackages: ['@nextpayments/ui']`.

---

## 6. Architecture & runtime flow

### The two architectural pillars of merchant-app

1. **Locale-first routing** via next-intl: every route lives under `app/[locale]/...` with `localePrefix: 'always'`, locales `['en','fr']`, default `en`.
2. **Backend isolation:** the browser NEVER sees the real backend origin. The client calls same-origin `/api/*` → `next.config.ts` `rewrites()` forwards to the backend; the server calls the upstream directly. Result: no CORS, and the backend host is hidden from the client.

### Server vs Client Components pattern

The app follows a clear **server-fetch / client-interactivity** split:

- **Pages are async Server Components** — they read `params`/`searchParams` (both Promise-wrapped in Next 15, must be `await`ed), call a reader from `lib/<domain>/backend.ts`, and pass the serializable result down to a `*-view` client component.
- **`lib/<domain>/backend.ts` are `server-only` readers** — they import `'server-only'`, read the token via `getAccessToken()`, and call upstream via `backendFetch`. **Readers return a result rather than throwing**: a down tunnel or wrong shape yields `{ ok: false, reason: 'error' }` instead of 500-ing the whole layout.
- **Mutations are Server Actions** (`'use server'` in `actions.ts`) — the ONLY place that writes tokens. They re-validate input with Zod at the boundary and write tokens into **httpOnly cookies** via `writeSession`.
- **Two core fetches by side:**
  - Server: `backendFetch(route, init)` (`lib/server/backend-fetch.ts`) — `cache: 'no-store'`, returns `{ ok, status, raw }`, and **throws on transport error** to distinguish from an HTTP error.
  - Client: `apiFetch<T>(route, init)` (`lib/api.ts`) — same-origin, throws `ApiRequestError`. **Currently no consumer** — it is reserve infrastructure for future client GETs.

### Middleware

`src/middleware.ts` wraps next-intl's `createMiddleware(routing)` and adds the header **`x-pathname`** = `request.nextUrl.pathname`. This header is the mechanism by which Server Components (the `(protected)` guard) learn the requested path in order to build `returnTo`. The middleware does NOT redirect auth itself — auth gating lives in the `(protected)` layout.

> **Important subtlety (JWT approval token):** `config.matcher` excludes `api`, `_next`, `_vercel`, metadata routes, and static files by **known file extension** (`\.(?:txt|xml|...|map)$`). It does NOT use a "any path with a dot" exclusion (`.*\..*`) because the withdrawal approval token is a JWT (`header.payload.signature`) carried as a **path segment** in `/withdraw/approve/<jwt>`. A `.*\..*`-style exclusion previously broke locale routing + `x-pathname` on this route (fixed in commit `9851252`).

### End-to-end request flow (example `/en/transactions?tab=sent&coin=BTC&page=2`)

```
[Browser]  GET /en/transactions?tab=sent&coin=BTC&page=2
    │
    ▼
1. middleware.ts ── next-intl normalize /en, set header x-pathname:/en/transactions
    │
    ▼
2. app/[locale]/layout.tsx ── await params, validate 'en' (else notFound),
       setRequestLocale, getMessages, wrap NextIntlClientProvider → Providers
    │
    ▼
3. (protected)/layout.tsx (GUARD) ── getHeaderUser() → getCurrentUser()
       (cache(), reads np_access cookie, validates via backendMe = GET /user/me)
       │  user null? → read x-pathname, strip locale, redirect LOGIN?returnTo=/transactions
       │  user ok?   → render <DashboardShell user>
    ▼
4. (protected)/transactions/page.tsx ── await searchParams, parse tab/coin/page (Zod),
       call backendFundHistory('sent', { page:2, limit, coin:'BTC' })
    │
    ▼
5. lib/fund/backend.ts ── map tab→API_ROUTES (sent→FUND_WITHDRAW_HISTORY),
       backendFetch + Authorization: Bearer <token>, validate envelope + paginated schema
       → { ok:true, data: toPaginatedPage(...) }  or  { ok:false, reason } (no throw)
    │
    ▼
6. <TransactionsView result> ── pick placeholder/data/error state → <TransactionsTable rows>
    │
    ▼
7. [Client] change tab/coin/page → router.push(...) (locale-safe useRouter)
       → back to step 1 on the server, re-render the table.
       Mutation (cancel withdraw) → Server Action → router.refresh()
```

### Loading / Error / Empty state / Pagination

- **Loading:** there is a `loading.tsx` for `(auth)` (full-screen loader) and for `(protected)` (`ProtectedLoading` renders INSIDE the already-painted shell — navigating shows the shell immediately, with only a spinner in the content area).
- **Error boundary:** **there is NO `error.tsx` file anywhere** (verified). This is intentional — the reader returns `{ ok:false }` and the view renders a degraded notice. Note, however, that there is no React error boundary as a fallback layer for unexpected throws.
- **Empty/error in the view:** `*-view`/`*-table` branches on the result — `Notice` tone `info` for the placeholder, the table for `ok`, `Notice` tone `danger` ("never 500") on failure; `EmptyState` when `rows.length === 0`.
- **Pagination:** the standard shape is defined once in `lib/pagination.ts`. Page state lives **in the URL** (`?page=`, `?tab=`, `?coin=`) → server-driven paging; changing a filter resets to page 1.

### Noteworthy runtime details

- **Explicit session recovery at the login boundary:** because layouts cannot write cookies, when the access cookie is gone but the refresh cookie remains, the login page renders `<SessionRecover>`, which calls `refreshAction()` then `router.replace(returnTo)`.
- **The withdrawal-approval route** lives under `(protected)` so the guard forces a session before the PUT approval; the JWT travels as a path segment (not a query) to survive the login bounce.
- **`/api/diag/health`** is a local Route Handler (`force-dynamic`) that probes the backend `/api/health`; the `/api/diag/*` prefix is excluded from the proxy rewrite.
- **Landing A/B flag:** `(marketing)/page.tsx` is `force-dynamic`, renders `<LandingTemp>` (the web3 redesign) **by default**, and only switches to `<LandingOriginal>` when `?temp=1`.

---

## 7. Authentication & account flows

The app uses a **fully custom server-side auth stack** built on Next.js Server Actions + httpOnly cookies. There is **NO NextAuth/Auth.js** (verified). Tokens are handled entirely server-side; tokens NEVER reach client JS.

### Cookie & session

- **Cookies** (`constants/auth.ts` `SESSION_COOKIE`): `np_access` and `np_refresh`. Options (`lib/auth/session.ts`): `{ httpOnly: true, sameSite: 'lax', secure: NODE_ENV === 'production', path: '/' }`.
- **Lifetimes** (`SESSION_MAX_AGE`): access **15 minutes**, refresh **7 days**. This is a client-side cap (the backend does not publish the real TTL).
- **Reading/writing tokens** (server-side only, `lib/auth/session.ts`): `getAccessToken()`/`getRefreshToken()`, `writeSession(tokens)`, `clearSession()`, `getCurrentUser()` (`cache()`d, validated via `GET /user/me`, null on failure), `getHeaderUser()` (derives `HeaderUser { email, displayName, emailVerified }`).
- **Route protection** (`(protected)/layout.tsx`): the guard gates on **validated identity** (not just cookie existence) — a stale token redirects to login with `?returnTo=<locale-stripped pathname>`. **Refresh does NOT happen in the layout** (the layout cannot mutate cookies) → refresh happens on the login page via `<SessionRecover>`.
- **Safe `returnTo`** (`lib/auth/return-to.ts`): `safeReturnTo` only accepts internal paths with a single leading `/` (preventing open redirects), and rejects `/login`/`/register` (preventing loops).

### Register — step by step

1. `RegisterForm` validates name/email/password/confirm + `agreeTerms` (client-only, not sent to the backend) → `registerAction({ userName, email, password, referralId? })`.
2. `backendRegister` (`POST /user/register`); `referralId` is only sent when non-empty (the backend rejects `""`/null with `USER005`).
3. The backend issues tokens but the account is not yet verified — the action **discards the tokens** and returns `{ ok, email }`. `emailTaken` = `USER004`.
4. The form routes to `verify-email?email=` ("check your email"). No auto-login.

### Login — step by step

1. `LoginForm` step 1 → `loginAction({ email, password, token2fa: '' })`.
2. `backendLogin` (`POST /user/login`). On success: `writeSession({ accessToken, refreshToken })`, returns `displayName`.
3. Error mapping: `USER010` → `twoFaRequired` (the form switches to the code-entry step and re-submits with the code); `USER007` → `emailNotVerified`; `USER006` → `noAccount`; everything else → `invalid`; transport → `error`.
4. On success: toast, `router.push(returnTo ?? '/home')`, `router.refresh()`.

> **Google sign-in/sign-up is disabled** (commented out) on both login and register. `SocialButtons` is only a mock (`setTimeout` faking a redirect) and currently does not render.

### Email verification — step by step

1. The user clicks the email link → `/verify-email?hash=…`.
2. `VerifyEmailConfirm` calls `verifyEmailAction(hash)` once (guarded against StrictMode via `useRef`) → `backendVerifyEmail` (`GET /user/verify-email?hash=`, no auth — the hash self-authorizes).
3. success → "verified" + a login CTA; invalid → "link expired"; error → retry. **No session is written.**

> **There is no "resend verification email" action** anywhere — `email-verification-card.tsx` only shows status + hint text (pure copy). `verify-banner.tsx` shows a banner for unverified accounts.

### 2FA (TOTP / Google Authenticator) — step by step

Managed within Pay Settings (NOT a separate route). The page reads state via `loadSecurityState()` (`GET /user/me` → `gaEnabled`, `emailVerified`, `email`).

**Enable:**

1. `begin2faSetupAction()` → `backendGet2faKey` (`GET /user/get-2fa-key`) returns `secret2FAKey` (base32); the action builds an `otpauth://` URI locally (`buildOtpauthUri`, issuer `OMNIPAYX`) → the QR is rendered locally with `QRCodeSVG` (the secret is not exposed to any third-party renderer).
2. The user scans/enters the secret, submits their **current password + a 6-digit code** → `enable2faAction` → `backendEnable2fa` (`PUT /user/enable-2fa`). `USER019` (already enabled) is treated as success.

**Disable:** the same form → `disable2faAction` → `backendDisable2fa` (`PUT /user/disable-2fa`), also requiring password + code.

**2FA at login:** `loginAction` always sends `token2fa` (empty at step 1). The backend rejects with `USER010` → the action returns `twoFaRequired` → the form switches to the code step. Constants: `TWO_FA_CODE_LENGTH = 6`, `TWO_FA_CODE_PATTERN = /^\d{6}$/`.

### Password reset — step by step

1. `/forgot-password` → `forgotPasswordAction` → `backendForgotPassword` (`GET /user/forgot-password?email=`). **Always reports success** (anti account-enumeration); the backend mails `…/reset-password?token=`.
2. The link → `/reset-password?token=` → `ResetPasswordForm` → `resetPasswordAction({ token, password })` → `backendResetPassword` (`PUT /user/reset-password`). The token is single-use; invalid/expired → "request new link"; success → route to login. **No session is written.**

**Change password (logged in):** `change-password-card.tsx` → `changePasswordAction` → `backendChangePassword` (`PUT /user/change-password`). The backend **rotates the access token** in the response; the action re-persists it via `writeSession({ accessToken })`. Field errors: `USER018` → old-password, `USER021` → new-password.

### Withdrawal approval token (JWT) — auth-related flow

- Email link: `${appBaseUrl}/<locale>/withdraw/approve/<jwt>`. The route lives under `(protected)` so the guard forces a session. Logged-out → bounce to login with the full pathname (including the token) as `returnTo`.
- The token travels as a **path segment** (not a query) because `x-pathname` only preserves the pathname.
- `WithdrawApproval` fires `approveWithdrawAction(token)` **only when "Approve" is clicked** (transferring money → no auto-fire) → `backendApproveWithdraw` (`PUT /fund/withdraw/:token`). It requires **the user's JWT** (`Authorization: Bearer <np_access>`); a missing session → `401 USER016`.

> **Backend error codes (`USER00x`)** were probed live against the backend on **2026-06-01** (per a comment in the source) — they reflect observed behavior, not a published spec.

---

## 8. API integration

### API layer overview

merchant-app talks to **a single external "crypto-payment" backend**. **No GraphQL, no per-feature REST handlers inside Next** — every call goes through one of two thin fetch wrappers, and most are server-side.

- **Base URL:** the browser always calls `API_BASE_URL = '/api'` (same-origin). `next.config.ts` rewrites `/api/:path` → `${target}/api/:path`, **excluding `/api/diag/*`** (regex `/api/:path((?!diag).*)`).
- **Target precedence:** `API_PROXY_TARGET` → `NEXT_PUBLIC_API_URL` → `http://localhost:3000`.
- **Auth mechanism:** the access token is sent as `Authorization: Bearer <accessToken>` on protected calls (server-side only; the client NEVER attaches the token). The token is stored in httpOnly cookies.

### Response envelope & error

- **Envelope** (`envelopeSchema`, `.passthrough()`): `{ success: boolean, message?, error?: { code?, message? } }`. **The HTTP status is usually 200 even when the logic fails — always branch on `success`, not the HTTP code.** Errors return `{ success:false, error:{ status, code, message } }`.
- **Paginated envelope** (`paginatedSchema(row)` / `toPaginatedPage()`): the backend's `{ data: { data: Row[], total, totalPages, page, limit } }` → flattened to `{ rows, total, totalPages, page, limit }`. Common params: `page` (1-based), `limit`, + `coin`/`status`/`level`/`integrationId`.
- **Error class:** `AuthError(message, code?)` carries `error.code`; each domain has `ensureOk(ok, json, fallback)` which throws `AuthError` when `!ok || !success`.

### Error code table (backend code → i18n key)

| Domain       | Codes                                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login        | `USER006` no account, `USER007` email not verified                                                                                                                                                                                                |
| 2FA login    | `USER010` (challenge)                                                                                                                                                                                                                             |
| Security     | `USER007` emailNotVerified, `USER009` wrongPassword, `USER010` invalid2faCode, `USER018` wrongOldPassword, `USER019` twoFaAlreadyEnabled, `USER021` passwordTooShort                                                                              |
| Register     | `USER004` email taken, `USER005` invalid referral                                                                                                                                                                                                 |
| Fund         | `FUER001` invalid network, `FUER002` invalid coin, `FUER005` invalid amount, `FUER006` not supported, `FUER007` amount below min, `FUER008` insufficient balance. (`FUER011` only in a comment, not in the map — cancel fail → generic `invalid`) |
| Integrations | `INER001` nameRequired, `INER002` nameTaken, `INER004` invalidUrl                                                                                                                                                                                 |
| Orders       | `ORER001` invalidAmount, `ORER002` invalidCoin, `ORER003` notFound (HMAC path, not reachable from the browser)                                                                                                                                    |

### Endpoints by domain

> The method/path is the upstream route (served under `/api`).

#### Health / diagnostics

| Endpoint  | Method | Purpose                           | Client                            | UI consumer                                    |
| --------- | ------ | --------------------------------- | --------------------------------- | ---------------------------------------------- |
| `/health` | GET    | Probe backend liveness via tunnel | `backendFetch(API_ROUTES.HEALTH)` | `app/api/diag/health/route.ts` (local handler) |

#### Auth / user (`lib/auth/backend.ts`)

| Endpoint                       | Method | Purpose                                         | Client                             | UI consumer                                           |
| ------------------------------ | ------ | ----------------------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| `/user/login`                  | POST   | Login (`email,password,token2fa`)               | `backendLogin`                     | `loginAction` → login form                            |
| `/user/register`               | POST   | Register (omit `referralId` when empty)         | `backendRegister`                  | `registerAction` → register-form                      |
| `/user/refresh-token`          | POST   | Rotate token pair                               | `backendRefresh`                   | `refreshAction`                                       |
| `/user/logout`                 | DELETE | Logout (best-effort)                            | `backendLogout`                    | `logoutAction`                                        |
| `/user/me`                     | GET    | Current user                                    | `backendMe`                        | `getCurrentUser`/`getHeaderUser`; `loadSecurityState` |
| `/user/verify-email?hash=`     | GET    | Consume hash to verify email                    | `backendVerifyEmail`               | `verifyEmailAction`                                   |
| `/user/forgot-password?email=` | GET    | Send reset mail (anti-enumeration)              | `backendForgotPassword`            | `forgotPasswordAction`                                |
| `/user/reset-password`         | PUT    | Set a new password via token                    | `backendResetPassword`             | `resetPasswordAction`                                 |
| `/user/change-password`        | PUT    | Change password (returns rotated `accessToken`) | `backendChangePassword` (security) | `changePasswordAction`                                |
| `/user/get-2fa-key`            | GET    | Begin 2FA setup (`secret2FAKey`)                | `backendGet2faKey`                 | `begin2faSetupAction`                                 |
| `/user/enable-2fa`             | PUT    | Enable 2FA (`password,token2fa`)                | `backendEnable2fa`                 | `enable2faAction`                                     |
| `/user/disable-2fa`            | PUT    | Disable 2FA                                     | `backendDisable2fa`                | `disable2faAction`                                    |

#### Fund — balances (`lib/fund/backend.ts`)

| Endpoint                  | Method | Purpose                              | Client                                    | UI consumer                   |
| ------------------------- | ------ | ------------------------------------ | ----------------------------------------- | ----------------------------- |
| `/fund/balance?coin=`     | GET    | **Spendable** balance (withdrawable) | `backendBalance` → `loadSpendableBalance` | withdraw form "available"/Max |
| `/fund/fee-balance?coin=` | GET    | Gas/fee reserve balance              | `backendFeeBalance` → `loadFundBalance`   | balances-view                 |

> Both query each coin in `FUND_BALANCE_COINS` in parallel via `Promise.allSettled` (one coin failing is still accepted as long as at least one succeeds).

#### Fund — deposit / address

| Endpoint                 | Method | Purpose                                                            | Client                                      | UI consumer                                                      |
| ------------------------ | ------ | ------------------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------- |
| `/fund/get-address`      | POST   | **Spendable** deposit address (`type:"user"`, NOT the fee address) | `backendGetDepositAddress`                  | `getDepositAddressAction` → deposit-panel                        |
| `/fund/validate-address` | POST   | Check the destination address (soft/advisory)                      | `backendValidateAddress`                    | `validateAddressAction` → withdraw-sheet (does not block submit) |
| `/fund/get-fee-address`  | POST   | Fee/gas reserve address                                            | **route defined but no client fn calls it** | —                                                                |

#### Fund — withdraw + approval/cancel

| Endpoint                     | Method | Purpose                                                                                           | Client                   | UI consumer                                                      |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------- |
| `/fund/withdraw`             | POST   | Withdrawal request (`network,coin,address,memo,amount,token2fa`); backend mails the approval link | `backendWithdraw`        | `requestWithdrawAction` → withdraw-sheet                         |
| `/fund/withdraw/:token`      | PUT    | Approve a withdrawal via single-use email token (requires the user JWT)                           | `backendApproveWithdraw` | `approveWithdrawAction` → withdraw-approval                      |
| `/fund/withdraw/:withdrawId` | DELETE | Cancel a pending withdrawal (id = the row's Mongo `_id`)                                          | `backendCancelWithdraw`  | `cancelWithdrawAction` → withdraw-cancel-button (`pending` only) |

#### Fund — history

| Endpoint                                 | Method | Purpose                    | Client                                      | UI consumer       |
| ---------------------------------------- | ------ | -------------------------- | ------------------------------------------- | ----------------- |
| `/fund/deposit-history?page&limit&coin`  | GET    | Deposits (paginated)       | `backendFundHistory` (tab `all`/`received`) | transactions-view |
| `/fund/withdraw-history?page&limit&coin` | GET    | Withdrawals                | `backendFundHistory` (tab `sent`)           | transactions page |
| `/fund/balance-history?page&limit&coin`  | GET    | Balance/conversion history | `backendFundHistory` (tab `conversions`)    | transactions page |

> The `all` tab **temporarily uses deposit-history** until a unified endpoint exists; the `invoices`/`payments` tabs have no endpoint → `{ ok:false, reason:'unsupported' }`.

#### Integrations (`lib/integrations/backend.ts`)

| Endpoint                            | Method | Purpose                                                                       | Client                                            | UI consumer                                     |
| ----------------------------------- | ------ | ----------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| `/integrations`                     | POST   | Create an integration (returns `{integration, ipnSecret}`, secret shown once) | `backendCreateIntegration`                        | `createIntegrationAction`/`...WithApiKeyAction` |
| `/integrations`                     | GET    | List (paginated)                                                              | `backendListIntegrations` → `loadIntegrationList` | integrations page                               |
| `/integrations/:id`                 | GET    | A single integration                                                          | `backendGetIntegration`                           | integrations actions                            |
| `/integrations/:id`                 | PUT    | Update the provided fields (`name,siteUrl,ipnUrl,isActive`)                   | `backendUpdateIntegration`                        | `updateIntegrationAction`                       |
| `/integrations/:id`                 | DELETE | Soft delete                                                                   | `backendDeleteIntegration`                        | `deleteIntegrationAction`                       |
| `/integrations/:id/api-keys`        | POST   | Mint an API key (`{label}`, returns `privateKey` once)                        | `backendCreateApiKey`                             | `createApiKeyAction` → secret-reveal            |
| `/integrations/:id/api-keys`        | GET    | List API keys                                                                 | `backendListApiKeys` → `loadIntegrationApiKeys`   | manage sheet                                    |
| `/integrations/:id/api-keys/:keyId` | DELETE | Revoke an API key                                                             | `backendRevokeApiKey`                             | `revokeApiKeyAction`                            |

#### Orders (JWT dashboard reads only, `lib/orders/backend.ts`)

| Endpoint                                     | Method | Purpose                                                | Client                                              | UI consumer       |
| -------------------------------------------- | ------ | ------------------------------------------------------ | --------------------------------------------------- | ----------------- |
| `/orders/me?page&limit&status&integrationId` | GET    | Orders of the logged-in user                           | `backendListOrdersForUser` → `loadOrderListForUser` | orders-table      |
| `/orders/me/stats?integrationId`             | GET    | Stats (`totalOrders, paidOrders, byCoin[], totalUsdt`) | `backendOrderStats` → `loadOrderStats`              | order-stats-panel |

> **Important gap:** there is NO JWT route `GET /orders/me/:orderId`. `loadOrderForUser` (for `orders/[orderId]`) **emulates** the detail by paging `/orders/me` (capped at `199×5`) and matching `orderId`. The HMAC routes (`POST/GET /orders`, `GET /orders/:orderId`) are server-to-server and are NEVER called from the browser.

#### Affiliate (`lib/affiliate/backend.ts` — loaders only)

| Endpoint                               | Method | Purpose                    | Client                | UI consumer    |
| -------------------------------------- | ------ | -------------------------- | --------------------- | -------------- |
| `/affiliate/totals`                    | GET    | Aggregates (`{totals:[]}`) | `loadAffiliateTotals` | affiliate page |
| `/affiliate/downline?page&limit&level` | GET    | Downline (paginated)       | `loadDownline`        | affiliate page |
| `/affiliate/commissions?page&limit`    | GET    | Commissions (paginated)    | `loadCommissions`     | affiliate page |

#### Backend-only (documented, not called by the FE)

`POST /fund/notify`, `POST /fund/confirm-withdrawal` (wallet webhook, IP-restricted), `POST /webhooks/wallet` (header `X-Webhook-Secret`). `INTEGRATION_API_URL = 'https://api.nextpayments.io'` is a **placeholder**.

> **Contract documentation:** `docs/API.md` (306 lines, authoritative). The reference source of origin is the Postman collection `postman/crypto-payment-be.postman_collection.json`. **Note:** `docs/API.md` §5 still lists Fund & Affiliate as "not wired" — **stale relative to the code** (the code already has full clients + UI for Fund and Affiliate).

---

## 9. Existing features

### Public / Marketing

- **Landing (A/B web3 vs original):** `(marketing)/page.tsx`. By default renders `LandingTemp` (the web3 redesign in `components/landing/temp/`); `?temp=1` → `LandingOriginal`. **Data source:** no API (presentational page).
- **SEO/PWA scaffolding:** `manifest.ts`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `icon.tsx`, `apple-icon.tsx`. No API.
- **Not-found/catch-all:** `not-found.tsx`, `[...rest]/page.tsx`.

### Auth

- Login (2FA + email-not-verified branch), Register, Verify-email (link), Forgot/Reset password, Change password — **data source:** `POST/PUT /user/*`. Social sign-in is a placeholder only.

### Home / Overview (`/home`)

- 4 stat cards + recent paid-orders + quick actions + per-coin breakdown. **Data source:** `GET /orders/me/stats` + `GET /orders/me` (fetched in parallel).

### Wallet / Balances (`/dashboard`)

- **Balances list:** `GET /fund/balance` (spendable). **Deposit:** `POST /fund/get-address` → QR + address. **Withdraw:** `POST /fund/withdraw` (email-approval). **Approval:** `PUT /fund/withdraw/:token`. **Cancel:** `DELETE /fund/withdraw/:_id` (pending-only).

### Transactions (`/transactions`)

- Tabs All / Received / Sent / Conversions (4 real endpoints) + Invoices / Payments (placeholder). **Data source:** `GET /fund/{deposit,withdraw,balance}-history`.

### Orders (`/orders`)

- List (`GET /orders/me`), Stats (`GET /orders/me/stats`), Detail (emulated page-walk of `/orders/me`).

### Affiliate (`/affiliate`)

- Totals (`GET /affiliate/totals`), Downline (`GET /affiliate/downline`), Commissions (`GET /affiliate/commissions`).

### Integrations (`/integrations`)

- List + Add (auto API key) + Manage (settings + API keys). **Data source:** `GET/POST/PUT/DELETE /integrations(/:id)(/api-keys)`. Webhooks panel (single-ipnUrl), Webhooks History (placeholder).

### Security / Account (`/pay-settings`)

- **Note:** the `paySettings` route renders a **Security hub**, not payment-settings. Change password, 2FA, Email verification status (read-only), Appearance (theme). **Data source:** `GET /user/me` + the security actions.

### Placeholder sections

- Invoicing (`/invoicing`), Quick POS (`/quick-pos`), Support (`/support`) — render `ComingSoon`. No data source.

### Admin Dashboard (`apps/admin-dashboard`)

- A single Overview (4 stat cards + recent transactions). **Data source:** hardcoded `OVERVIEW_STATS` + `RECENT_TX` (`constants/dashboard.ts`, dummy data). No API, no router, no auth.

---

## 10. Progress tracker

> **Legend:** ✅ Done · 🟡 Partial · ⬜ Not started / Placeholder
>
> Classification convention (based on evidence from the specialist features): nav `backed:false` or a `ComingSoon` page = ⬜; a provisional `z.record`/`.passthrough()` schema (backend contract unconfirmed), soft-validate, a partially-disabled feature, a missing endpoint, or a stopgap lookup = 🟡; fully wired with real endpoints + recent git work = ✅.

### Auth

| Feature / Task                                              | Status | Notes (evidence)                                                                         |
| ----------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| Login (2FA + email-not-verified branch)                     | ✅     | `loginAction` maps `USER010/007/006`; `POST /user/login`                                 |
| Register                                                    | ✅     | `registerAction`; intentionally discards the token after register; `POST /user/register` |
| Verify email (link)                                         | ✅     | commits `275624d`, `2536a4e`; `GET /user/verify-email`                                   |
| Forgot password                                             | ✅     | commit `6cfbedb`; anti-enumeration; `GET /user/forgot-password`                          |
| Reset password                                              | ✅     | commit `6cfbedb`; `PUT /user/reset-password`                                             |
| Session plumbing (httpOnly cookie, refresh, SessionRecover) | ✅     | `lib/auth/session.ts`, `refreshAction`                                                   |
| Social sign-in (Google)                                     | ⬜     | `social-buttons.tsx` mock-only, commented out, no OAuth route in `API_ROUTES`            |
| Resend verification email                                   | ⬜     | No action; `email-verification-card.tsx` only shows hint copy                            |

### Shell / Layout

| Feature / Task                       | Status | Notes (evidence)                                           |
| ------------------------------------ | ------ | ---------------------------------------------------------- |
| Auth guard + dashboard shell         | ✅     | `(protected)/layout.tsx` gates on validated identity       |
| Verify banner                        | ✅     | `SHOW_VERIFY_BANNER && !user.emailVerified`                |
| Language switcher / theme toggle     | ✅     | `language-switcher.tsx`, `theme-toggle.tsx`                |
| Topbar display-currency ($) selector | 🟡     | commented out, `TODO: re-enable` in `dashboard-topbar.tsx` |
| Sidebar "New Transaction" button     | ⬜     | renders with no `onClick` (decorative)                     |

### Home / Orders

| Feature / Task | Status | Notes (evidence)                                                                     |
| -------------- | ------ | ------------------------------------------------------------------------------------ |
| Home overview  | ✅     | `GET /orders/me/stats` + `/orders/me` in parallel                                    |
| Orders list    | ✅     | `GET /orders/me`; lifecycle confirmed; `.passthrough()` schema grounded              |
| Order stats    | ✅     | `GET /orders/me/stats`; tight schema                                                 |
| Order detail   | 🟡     | NO detail endpoint; `loadOrderForUser` page-walks `/orders/me` (cap 199×5) — stopgap |

### Fund / Wallet

| Feature / Task                 | Status | Notes (evidence)                                                                                                              |
| ------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Withdraw approval (email link) | ✅     | commit `cc927ce`; `PUT /fund/withdraw/:token`; token path-segment                                                             |
| Withdraw cancel                | ✅     | commits `710a951`/`b8b8e6d`/`7b08233`; uses Mongo `_id`, pending-only                                                         |
| Balances list                  | 🟡     | `balanceRowSchema = z.record(...)` provisional; Send icon commented out                                                       |
| Deposit / Topup                | 🟡     | `getAddressResponseSchema.data` loose `z.record`; doc-comment stale (says `get-fee-address` but the code calls `get-address`) |
| Withdraw (request)             | 🟡     | validate-address is soft/advisory only; row contract not certain                                                              |

### Transactions

| Feature / Task             | Status | Notes (evidence)                                                                        |
| -------------------------- | ------ | --------------------------------------------------------------------------------------- |
| Tab All                    | 🟡     | `TAB_ROUTE.all` **temporarily** uses deposit-history; `transactionRowSchema = z.record` |
| Tab Received               | 🟡     | `GET /fund/deposit-history`; row contract `z.record` provisional                        |
| Tab Sent (+ cancel column) | 🟡     | `GET /fund/withdraw-history`; row contract provisional                                  |
| Tab Conversions            | 🟡     | `GET /fund/balance-history`; row contract provisional                                   |
| Tab Invoices               | ⬜     | `kind:'placeholder'`; no endpoint                                                       |
| Tab Payments               | ⬜     | `kind:'placeholder'`; no endpoint                                                       |

### Affiliate

| Feature / Task    | Status | Notes (evidence)                                                                         |
| ----------------- | ------ | ---------------------------------------------------------------------------------------- |
| Totals strip      | 🟡     | `GET /affiliate/totals`; `.passthrough()` schema + all-optional (not covered by Postman) |
| Downline table    | 🟡     | `GET /affiliate/downline`; provisional schema                                            |
| Commissions table | 🟡     | `GET /affiliate/commissions`; provisional schema                                         |

### Integrations

| Feature / Task                           | Status | Notes (evidence)                                                                                          |
| ---------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| Integrations list                        | ✅     | `GET /integrations`                                                                                       |
| Add integration (+ auto API key)         | ✅     | `POST /integrations` then `.../api-keys`, fallback `ok:'partial'`                                         |
| Manage integration (settings + API keys) | ✅     | update/delete/list-keys/revoke all wired                                                                  |
| Webhooks panel (multi-row)               | 🟡     | the backend only stores 1 `ipnUrl`; only the first non-empty URL is persisted; gear button non-functional |
| Webhooks History tab                     | ⬜     | empty state; no browser-facing endpoint                                                                   |
| Doc-link banner URLs                     | ⬜     | `DOC_LINKS` are all `'#'`                                                                                 |

### Security / Account

| Feature / Task                   | Status | Notes (evidence)                                                     |
| -------------------------------- | ------ | -------------------------------------------------------------------- |
| Change password                  | ✅     | `PUT /user/change-password`; rotate + re-persist token               |
| 2FA enable/disable               | ✅     | `GET get-2fa-key` + `PUT enable/disable-2fa`; QR local               |
| Email verification status (card) | 🟡     | read-only; no resend action (the doc itself admits "not wired here") |
| Appearance (theme)               | ✅     | `appearance-card.tsx`                                                |

### Placeholder pages

| Feature / Task           | Status | Notes (evidence)                                           |
| ------------------------ | ------ | ---------------------------------------------------------- |
| Invoicing (`/invoicing`) | ⬜     | `ComingSoon`, nav `backed:false`                           |
| Quick POS (`/quick-pos`) | ⬜     | `ComingSoon`, nav `backed:false`                           |
| Support (`/support`)     | ⬜     | `ComingSoon` stub; nav says `backed:true` **inaccurately** |

### Admin Dashboard (`apps/admin-dashboard`)

| Feature / Task                                | Status | Notes (evidence)                                                           |
| --------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| Overview page (UI shell)                      | 🟡     | shell complete but **dummy data** (`OVERVIEW_STATS`/`RECENT_TX` hardcoded) |
| Data layer (fetch / API)                      | ⬜     | no `fetch`/`axios`/env; `VITE_API_URL` declared but not consumed           |
| Routing                                       | ⬜     | no router; nav `#`; active item hardcoded to the first                     |
| Transactions / Merchants / Payouts / Settings | ⬜     | 4/5 sections in the nav **do not exist** as pages                          |
| Auth / interactivity                          | ⬜     | the search input does nothing; only the sidebar collapse works             |

### Summary

- ✅ **Done:** **20** — Login, Register, Verify-email, Forgot, Reset, Session plumbing, Auth guard/shell, Verify banner, Lang/theme, Home, Orders list, Order stats, Withdraw approval, Withdraw cancel, Integrations list, Add-integration, Manage-integration, Change password, 2FA, Appearance.
- 🟡 **Partial:** **17** — Topbar currency, Order detail, Balances, Deposit, Withdraw request, Transactions ×4 (All/Received/Sent/Conversions), Affiliate ×3, Webhooks panel, Email-verification card, Admin Overview shell.
- ⬜ **Not started / Placeholder:** **17** — Social sign-in, Resend verify, Sidebar "New Transaction", Tab Invoices, Tab Payments, Webhooks History, Doc-links, Invoicing, Quick POS, Support, + Admin (data layer, routing, 4 sections, auth/interactivity).

**Recommended next step (one line):** Prioritize **hardening the provisional Zod `z.record`/`.passthrough()` schemas for Fund/Transactions/Affiliate** against a seeded backend account — this is the lowest-risk way to move many 🟡 to ✅; in parallel, add a `GET /orders/me/:orderId` endpoint to remove the page-walk stopgap.

---

## 11. Conventions & design system

### Shared packages

- `packages/ui` (`@nextpayments/ui`): framework-agnostic React primitives. 3 hard rules (`packages/ui/README.md`): (1) **no framework-specific imports** (`next/image`/`next/link`/`next/font` are forbidden — pass them in via props); (2) **pure components** — no fetch, no global state, no env; (3) add components in the Shadcn style (copy → customize). `cn()` merges classes, variants via `class-variance-authority`, default radius `rounded-xl`. The exports map is **wildcard** (`@nextpayments/ui/components/<name>`, `/lib/<name>`), no barrel index.

### `@nextpayments/ui` component inventory

| Component               | Role                                                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button` (`button.tsx`) | CVA button core; variants `primary`/`gradient`/`secondary`/`outline`/`ghost`/`subtle`/`destructive`/`link`; sizes `sm..xl,icon`; `loading`, icon slots; a hand-written `Slot` for `asChild` (avoiding radix) |
| `ButtonGroup`           | Merges adjacent Buttons into a single control                                                                                                                                                                |
| `IconButton`            | A `Button` wrapper defaulting to `icon`+`ghost`, enforcing `aria-label`                                                                                                                                      |
| `ActionIcon`            | Icon-only button for table rows; tone `default`/`danger`                                                                                                                                                     |
| `Card`                  | Borderless rounded surface (elevation); ambient glow following the cursor (CSS var, no re-render)                                                                                                            |
| `Checkbox`              | Hidden native checkbox + a styled box via `peer-*`; RHF `register()` spreads straight in                                                                                                                     |
| `DataTable<Row>`        | A generic horizontally-scrolling table, driven by `DataTableColumn<Row>[]` + `getRowKey`                                                                                                                     |
| `EmptyState`            | A centered empty block (icon chip + title + desc + action)                                                                                                                                                   |
| `Notice`                | Inline card, tone `info`/`danger`/`warning`; composes `Card` (`glow=false`)                                                                                                                                  |
| `Pagination`            | Prev/number/next pager (renders all numbers); label-driven for i18n                                                                                                                                          |
| `SearchInput`           | A glass search field + magnifier; enforces `aria-label`                                                                                                                                                      |
| `SelectField`           | A glass dropdown over a native `<select>` + chevron                                                                                                                                                          |
| `Sheet`                 | An accessible bottom sheet (slide-up); focus trap, Esc/backdrop, scroll-lock, reduced-motion; exports `SHEET_TRANSITION_MS` (440ms)                                                                          |
| `TabbedSheet`           | `Sheet` + `Tabs`; lazy-mounts the panel, keeps it mounted (hidden) when switching                                                                                                                            |
| `Tabs`                  | An underlined tab bar, roving arrow-key nav                                                                                                                                                                  |
| `ToggleSwitch`          | An accessible on/off switch (`role="switch"`)                                                                                                                                                                |

**Utilities (`packages/ui/src/lib`):** `cn(...)` (clsx + tailwind-merge dedupe), `useSheetSnapshot<T>(value)` (keeps the last non-null value through the sheet-close animation).

### "Gemini" design tokens (`packages/config/tailwind/theme.css`)

Tailwind v4 CSS-first (`@theme {}`), imported once after `@import "tailwindcss"`. Concept: **monochrome + one blue accent**; the multi-stop aurora gradient is reserved for the logo + hero (CTA/headline).

| Token group            | Key values                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brand                  | `--color-brand-blue: #4796e3` (primary accent), `--color-brand-lilac: #9b72cb`, `--color-brand-coral: #d96570` (+ cyan/yellow/orange for the conic logo)     |
| Accent                 | `--color-accent` (from brand-blue), `--color-accent-soft` (16% mix), `--color-accent-strong` (26% mix) — everything interactive uses the accent, NO gradient |
| Surface (dark default) | `--color-bg: #0a0a0a`, `--color-surface: #131313`, `--color-surface-elevated: #17181a`; border `#1f1f20`/`#2a2b2d`                                           |
| Glass                  | `--glass-fill`, `--glass-fill-strong`, `--glass-border` (white 12%), `--glass-highlight` (white 8%) + `backdrop-blur`                                        |
| Text                   | `--color-text: #e8e8e8`, `--color-text-muted: #9aa0a6`, `--color-text-subtle: #5f6368`                                                                       |
| Aurora                 | `--color-aurora` (blue→indigo `#0a1f63`), `--color-aurora-alt` (emerald twin)                                                                                |
| Status                 | `--color-success #81c995`, `--color-warning #fdd663`, `--color-danger #f28b82`, `--color-info #4796e3` (**pinned blue** even when the accent differs)        |
| Radii                  | `--radius-xs` 6px → `--radius-2xl` 24px                                                                                                                      |
| Interaction            | `--interaction-duration: 180ms`, `--interaction-easing: cubic-bezier(0.16,1,0.3,1)`                                                                          |
| Typography             | `--font-sans` (Inter), `--font-mono` (JetBrains Mono)                                                                                                        |

- **Light/dark:** dark is the default (`:root`); light overrides in `@layer base` scoped to `.light`/`:root[data-theme='light']` (`--color-bg: #f0f4f9`...).
- **Custom accents:** 7 overrides `:root[data-accent='…']` (`violet`/`emerald`/`rose`/`amber`/`cyan`/`indigo`/`teal`) only change `--color-brand-blue` → retuning the entire identity. **Must stay in sync** with `ACCENT_PALETTES` (`constants/theme.ts`) and the allow-list in `accent-script.tsx`.
- **`@utility` helpers:** `bg/text-brand-gradient` (logo/hero), `text-aurora-gradient`, `bg-gemini-ambient`, `row-interactive`, `action-icon`, `action-icon-danger`.

### Engineering conventions (`skills/*/SKILL.md` — single source of truth)

| Skill                       | Summary                                                                                                                                                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| nextpayments-conventions    | Master rules: no-hardcoding (constants in `src/constants`, copy via i18n, colors via tokens), Gemini design, i18n parity (en+fr; Vietnamese removed), locale-safe routing via `@/i18n/routing` + `ROUTES`, output-validation gate (§6) gates every commit |
| component-reuse             | Mandatory first step for every UI task: search `packages/ui` + the app's `components/` + utils, reuse/extend before building new                                                                                                                          |
| frontend-clean-architecture | Layering inward (config → ui → constants → feature → thin routes); DRY-by-extraction; single-responsibility (fetch OR render); zod-at-the-edge; Server-Components-by-default                                                                              |
| react-nextjs-best-practices | React 19/Next 15: SC by default + `'use client'` at the leaf; avoid `useEffect` for derivable state; Actions/`useActionState`/`useOptimistic`; `await params/searchParams`; budgets (Landing LCP <2.0s, CLS <0.1, JS <200KB gzip)                         |
| type-safety                 | Strict TS: no `any`/implicit-any/`as any`/`@ts-ignore`; types from `as const`/`z.infer`; discriminated unions; `tsc --noEmit` must pass                                                                                                                   |
| modern-javascript           | ES2015+ idioms; no `var`/IIFE/prototype/`.then`; React = function components + hooks                                                                                                                                                                      |
| git-teamwork                | No commits on `main`/`dev`; branch `<author>/<type>/<feature_name>` from a freshly-pulled `dev`; green gate per commit; merge `--no-ff` into `dev`; **push ONLY after confirming with the user**                                                          |
| code-formatting             | Prettier is the sole authority; match `.prettierrc` (`semi`, `singleQuote`, `tabWidth:2`, `trailingComma:all`, `printWidth:100`, tailwind plugin); run `pnpm format` before every commit                                                                  |

**tsconfig (`@nextpayments/tsconfig/base.json`):** `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `target ES2022`, `module ESNext`, `moduleResolution Bundler`, `isolatedModules`. `nextjs.json` (jsx preserve, noEmit); `react-library.json` (jsx react-jsx, emits declarations).

**eslint (`@nextpayments/eslint-config`, CommonJS):** `index.js` base (`@typescript-eslint/parser` + recommended; `no-unused-vars` warn `^_`; `consistent-type-imports`; `no-console` warns for `warn`/`error`); `next.js` extends + `next/core-web-vitals` + `next/typescript`.

> **Note:** **There is no `PLAN.md` file** in the repo (verified with `find`/`grep`). The skills reference "PLAN.md §x" as a conceptual authority, but that doc is not currently on disk — the actual rules live in `skills/nextpayments-conventions/SKILL.md`. Existing docs: `docs/API.md`, `docs/FUND-TOPUP.md`, `docs/LANDING-WEB3-FLAG.md`, `skills/README.md`.

---

## 12. Notes & next steps

### Provisional schemas to harden (high priority)

| Location                                            | Issue                                                                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `lib/fund/types.ts` `balanceRowSchema`              | `z.record(z.string(), z.unknown())` — shape not yet observed (empty account)                                         |
| `lib/fund/types.ts` `transactionRowSchema`          | `z.record(...)` "intentionally loose" — tighten once a real transaction surfaces                                     |
| `lib/fund/types.ts` `getAddressResponseSchema.data` | loose `z.record`; address extracted defensively                                                                      |
| `lib/affiliate/types.ts`                            | row schema `.passthrough()` + all-optional — not covered by Postman; adjust field names once a seeded account exists |

### Placeholder tabs / pages to implement

- Transactions: tabs **Invoices**, **Payments** (no endpoint yet).
- Integrations: tab **Webhooks History** (no browser-facing endpoint yet).
- Pages: **Invoicing**, **Quick POS**, **Support** (currently `ComingSoon`).
- Admin dashboard: data layer + router + 4 sections (Transactions/Merchants/Payouts/Settings) + auth.

### Missing endpoints / stopgaps

- **`GET /orders/me/:orderId`** — does not exist yet; order detail currently page-walks `/orders/me` (cap ~1k orders). Add a detail route to remove the stopgap.
- **`/fund/get-fee-address`** — the route constant `FUND_GET_FEE_ADDRESS` is defined but **no client fn** calls it.
- **`apiFetch`** (client transport) — **no consumer**; reserve infrastructure for future client GETs.

### Inconsistencies to clean up

- `deposit-panel.tsx`'s doc-comment says `POST /fund/get-fee-address` but the code correctly calls `/fund/get-address` (commit `d5538b8`).
- `constants/dashboard.ts` marks `support` as `backed:true` while the page is a `ComingSoon` stub — an inaccurate flag.
- `docs/API.md` §5 is stale: it lists Fund & Affiliate as "not wired" while the code is fully wired — update the doc.
- Temporarily-disabled features: the balance-row **Send icon** (`TODO: re-enable withdraw`), the topbar **currency selector** (`TODO: re-enable`).

### Other technical gaps

- **No React error boundary** (`error.tsx`) anywhere — resilience relies entirely on readers returning a result. Consider adding `error.tsx` as a fallback layer for unexpected throws.
- **No testing framework** in any app.
- **The landing has 2 coexisting compositions** (`LandingTemp` + `LandingOriginal` via the A/B flag) — `page.tsx`'s doc-comment notes that the flag + the redundant composition should be removed once one design is settled.
- **Resend verification email**: no Server Action yet — `email-verification-card.tsx` is copy only. Needs implementation if the flow is to be complete.
- **Cookie TTL** (15min/7d) is a client-side cap, not authoritative — the backend does not publish the real TTL.

---

## 13. Deployment (DevOps)

This is a **pnpm workspace monorepo** with two independently deployable apps:

| App               | Path                   | Type                             | Build output | Runtime                       |
| ----------------- | ---------------------- | -------------------------------- | ------------ | ----------------------------- |
| `merchant-app`    | `apps/merchant-app`    | Next.js 15 (App Router, SSR/SSG) | `.next/`     | Node.js server (`next start`) |
| `admin-dashboard` | `apps/admin-dashboard` | Vite SPA (static)                | `dist/`      | Any static host / CDN         |

**Baseline requirements (all targets):** Node.js `20.x` LTS, `pnpm` (pin `11.1.2`,
enable via `corepack enable`). Always `pnpm install --frozen-lockfile` in CI.
Deploy the two apps as **separate projects/domains** (e.g.
`app.example.com` for merchant, `admin.example.com` for admin).

### Option A — Vercel (recommended)

Create **two** Vercel projects from the same repo, both with **Root Directory**
left at the repo root (monorepo) and these overrides:

**Merchant (`merchant-app`):**

- Framework Preset: **Next.js**
- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm build:merchant`
- Output: auto-detected (`apps/merchant-app/.next`)
- Root Directory: `apps/merchant-app` (enable "Include files outside root" so
  workspace packages resolve), or keep repo root + the build command above.

**Admin (`admin-dashboard`):**

- Framework Preset: **Vite**
- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm build:admin`
- Output Directory: `apps/admin-dashboard/dist`
- It is a SPA → add a catch-all rewrite to `index.html`
  (`{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`).

Set the **Production Branch** to `main`; PR previews work out of the box.
Use Vercel "Ignored Build Step" with `git diff --quiet HEAD^ HEAD ./apps/<app>`
so each project only rebuilds when its app (or shared `packages/`) changes.

### Option B — Docker

**Merchant (Node server):** multi-stage build — `pnpm install --frozen-lockfile`
→ `pnpm build:merchant` → run `pnpm --filter merchant-app start` (binds `:5001`,
override with `-p $PORT`). Base image `node:20-alpine`, enable corepack. Expose
the port behind your reverse proxy/load balancer; the app is stateless so scale
horizontally freely.

**Admin (static):** build with `pnpm build:admin`, then serve
`apps/admin-dashboard/dist` from **nginx** (or any static server) with an SPA
fallback (`try_files $uri /index.html;`). Can also go to S3 + CloudFront, GitHub
Pages, Netlify, Cloudflare Pages, etc. — it is fully static.

### CI/CD pipeline (generic)

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm -r typecheck          # tsc --noEmit per package
pnpm -r lint               # ESLint per package
pnpm build                 # builds BOTH apps (pnpm -r build)
# then deploy:
#   merchant -> Node host running `pnpm --filter merchant-app start`
#   admin    -> upload apps/admin-dashboard/dist to static host/CDN
```

Build the two apps in parallel jobs when possible; cache `~/.local/share/pnpm`
(or the pnpm store) and each app's build cache (`apps/merchant-app/.next/cache`).

### Environment variables

For the actual list of environment variables (backend `API_BASE_URL`, `NEXT_PUBLIC_API_URL`, …) see **[§4. Environment variables](#4-environment-variables-env)**. Notes for injecting env at deploy time:
Next.js needs `NEXT_PUBLIC_*` for client-exposed values at **build time**; the
Vite app needs `VITE_*` (also build-time, baked into the static bundle). Inject
them per environment in the CI/host, never commit `.env`.

### Operational notes

- Geist fonts are **self-hosted** in merchant via `next/font` → no external font
  network dependency at build/runtime. Admin still pulls Google Fonts at runtime.
- Health check: `GET /` on merchant returns `307 → /<defaultLocale>`; treat
  `2xx/3xx` as healthy. Admin: `GET /` returns the static `index.html` (`200`).
- Never run `build` against an app while its `dev` server is live (it rewrites
  `.next` and crashes the running dev process). CI/hosts are unaffected.
- `merchant-app` is stateless (no DB/session this phase) → safe to autoscale.

---

## 14. Troubleshooting

**`pnpm install` reports `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`**
Ensure `pnpm-workspace.yaml` has all three globs:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'packages/config/*'
```

**`Ignored build scripts: esbuild, sharp, unrs-resolver`**
Already allowlisted in `pnpm-workspace.yaml` (`allowBuilds` / `onlyBuiltDependencies`).
If it still warns, re-run:

```bash
pnpm install
```

**Fonts at build time (merchant)**
Merchant uses `geist` (Vercel), self-hosted via `next/font` — **no network
needed** at build. Admin still loads Inter/JetBrains from Google Fonts in
`apps/admin-dashboard/index.html` (needs network on first load; self-host if offline).

**Port 5001 / 5002 in use**

```bash
# Temporarily run on another port
pnpm --filter merchant-app dev -- -p 5050

# Or find and kill the process holding the port
lsof -ti:5001,5002 | xargs kill -9
```

**Hot reload not working on macOS**
Raise the file-watcher limit: `ulimit -n 4096` before running `pnpm dev`.

**White flash on theme reload**
Handled via `suppressHydrationWarning` + `next-themes`. If it still happens,
check for an interfering browser extension.

**Admin `vite preview` exits with "Port 5002 is already in use"**
`strictPort` is intentional (deterministic admin port). Free it:
`lsof -ti:5002 | xargs kill`.

---

## 15. Roadmap

> For the current per-feature status, see **[§10. Progress tracker](#10-progress-tracker)**. The section below is the long-term product roadmap (reference `PLAN.md`).

The current sprint focuses on Landing + Auth (merchant) and the basic Admin
dashboard. Next sprints:

1. Merchant Dashboard (sidebar, invoices, API keys)
2. Checkout Widget (`/checkout/[id]`, state machine Pending → Confirming → Success)
3. Admin Dashboard expansion (transaction ledger with virtualization, merchant mgmt)
4. MSW + TanStack Query for real async flows, Vitest + Playwright

Full roadmap: `PLAN.md` section 10.
