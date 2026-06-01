# Nextpayments

Crypto payment gateway for businesses — frontend monorepo (UI/UX only, dummy data).
Design inspiration: Gemini Desktop. Product inspiration: nowpayments.io.

Full spec & architecture decisions: see [PLAN.md](./PLAN.md).

---

## Environment requirements

| Tool    | Version                  | Notes                          |
| ------- | ------------------------ | ------------------------------ |
| Node.js | ≥ 20 LTS                 | `20.x` or `22.x` recommended   |
| pnpm    | ≥ 9 (repo pins `11.1.2`) | Required — do not use npm/yarn |
| Git     | any                      |                                |

Quick check:

```bash
node --version    # v20.x.x or newer
pnpm --version    # 9.x.x or newer
```

If you don't have `pnpm`, install it via [corepack](https://nodejs.org/api/corepack.html)
(bundled with Node 16+) or npm:

```bash
# Option A — corepack (recommended)
corepack enable
corepack prepare pnpm@latest --activate

# Option B — npm
npm install -g pnpm@latest
```

---

## Install

```bash
git clone <repo-url> nextpayments
cd nextpayments
pnpm install
```

The first install downloads ~550 packages (~1–2 min depending on network). After it finishes:

- `node_modules/` at the root and in each workspace
- `pnpm-lock.yaml` at the root (committed to git)
- Build scripts for `esbuild`, `sharp`, and `unrs-resolver` are pre-allowlisted
  in `pnpm-workspace.yaml`

---

## Development

Project port convention:

| App                      | Port     | Status |
| ------------------------ | -------- | ------ |
| `merchant-app` (Next.js) | **5001** | Ready  |
| `admin-dashboard` (Vite) | **5002** | Ready  |

Run merchant-app:

```bash
pnpm dev
# or explicitly:
pnpm dev:merchant
```

**Full-stack dev (recommended — needs the backend):** brings up the SSH tunnel
to the backend, waits for it to answer, then starts the dev server. Use this
when any page hits the API (login, dashboard, 2FA, affiliate, …) — without the
tunnel those calls 502.

```bash
pnpm --filter merchant-app dev:full
```

Manage the tunnel on its own with `pnpm --filter merchant-app tunnel <up|down|status|wait>`
(see `scripts/tunnel.sh`). Override host/port via env, e.g. `LOCAL_PORT=13000`.

Open in the browser:

- `http://localhost:5001` → redirects to `http://localhost:5001/en` (default locale)
- `http://localhost:5001/en` — landing (English)
- `http://localhost:5001/fr` — landing (French)
- `http://localhost:5001/en/login` — login page (dummy auth)
- `http://localhost:5001/en/register` — register page (dummy)
- `http://localhost:5001/en/dashboard` — placeholder

Run admin-dashboard:

```bash
pnpm dev:admin            # http://localhost:5002 (English only)
```

Merchant dev server uses **Turbopack** (`next dev --turbopack`) — near-instant
hot reload. Admin uses Vite (instant HMR).

### Temporary port change

```bash
pnpm --filter merchant-app dev -- -p 5050
```

To change it permanently, edit the `dev`/`start` scripts in
`apps/merchant-app/package.json` (and `vite.config.ts` for admin).

---

## Production build

```bash
# Build merchant-app only
pnpm build:merchant

# Build admin-dashboard only
pnpm build:admin

# Build the whole workspace (merchant-app + admin-dashboard)
pnpm build
```

> **Important:** `pnpm build` only **compiles and exits** — it does NOT run a
> server. After building you must `start` (not `dev`) to run the app. Do not run
> `build` while the same app's `dev` server is running: `next build` overwrites
> the in-use `.next` and crashes the running dev server. Never run build and dev
> in parallel on the same app.

Run the production bundles locally (after `build`):

```bash
pnpm start              # = start:merchant — merchant-app on :5001
pnpm start:merchant     # merchant-app (next start) — :5001
pnpm start:admin        # admin-dashboard (vite preview) — :5002
```

Output: merchant in `apps/merchant-app/.next/`, admin in `apps/admin-dashboard/dist/`.
If `:5001`/`:5002` is occupied (a dev server is still running):
`lsof -ti:5001,5002 | xargs kill`.

---

## Deployment (DevOps)

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

UI-only phase — **no secrets or runtime env are required** to build or run
either app. When backend integration lands, follow framework conventions:
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

## Folder structure

```text
nextpayments/
├── apps/
│   ├── merchant-app/          # Next.js 15 App Router — main UI (landing + auth)
│   └── admin-dashboard/       # Vite + React + Zustand — admin (English only)
├── packages/
│   ├── ui/                    # Shared components (framework-agnostic: Button, Card)
│   └── config/
│       ├── tsconfig/          # TypeScript base configs
│       ├── eslint/            # ESLint shared configs
│       └── tailwind/          # Tailwind v4 preset (theme.css with Gemini tokens)
├── skills/                    # Agent-agnostic engineering rules (see skills/README.md)
├── .claude/skills/            # Symlinks → ../../skills (Claude Code discovery)
├── PLAN.md                    # Full spec
├── README.md                  # This file
├── package.json               # Root workspace + scripts
├── pnpm-workspace.yaml         # Workspace globs + allowBuilds
└── pnpm-lock.yaml
```

Architecture rationale + why each package is split out: see `PLAN.md` section 2.

---

## Main scripts

From the repo root:

| Command                                                      | Effect                                                               |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `pnpm dev`                                                   | Alias for `dev:merchant` (default — runs merchant-app)               |
| `pnpm dev:merchant`                                          | Run merchant-app dev only (port 5001, Turbopack)                     |
| `pnpm --filter merchant-app dev:full`                        | Tunnel up + wait for backend, then run merchant-app dev (full-stack) |
| `pnpm --filter merchant-app tunnel <up\|down\|status\|wait>` | Manage the SSH tunnel to the backend                                 |
| `pnpm dev:admin`                                             | Run admin-dashboard dev only (port 5002, Vite)                       |
| `pnpm dev:all`                                               | Run **every** workspace app with a `dev` script, in parallel         |
| `pnpm build`                                                 | Build the whole workspace (both apps)                                |
| `pnpm build:merchant`                                        | Build merchant-app only                                              |
| `pnpm build:admin`                                           | Build admin-dashboard only                                           |
| `pnpm start`                                                 | Alias for `start:merchant` — serve built merchant on :5001           |
| `pnpm start:merchant`                                        | Serve built merchant-app (`next start`) — :5001                      |
| `pnpm start:admin`                                           | Serve built admin-dashboard (`vite preview`) — :5002                 |
| `pnpm lint`                                                  | Lint the whole workspace                                             |
| `pnpm format`                                                | Prettier-format all source                                           |
| `pnpm clean`                                                 | Remove `node_modules`, `.next`, `dist` in every package              |

### Run both apps in parallel

```bash
pnpm dev:all
```

This uses `pnpm -r --parallel --stream` to start `merchant-app` (port **5001**)
and `admin-dashboard` (port **5002**) together in one terminal, with each app's
name prefixed on its log lines. They use different ports, so there is no
conflict. Open two browser tabs:

- `http://localhost:5001` — Merchant
- `http://localhost:5002` — Admin

Prefer two terminals for cleaner logs? Open two tabs:

```bash
# Terminal 1
pnpm dev:merchant

# Terminal 2
pnpm dev:admin
```

### Run a single app's scripts

```bash
pnpm --filter merchant-app <script>
# e.g.
pnpm --filter merchant-app typecheck
pnpm --filter admin-dashboard lint
```

---

## Tech stack summary

**Merchant App (`apps/merchant-app`):**

- Next.js 15.1.3 (App Router) + React 19
- Tailwind CSS v4 + shadcn/ui conventions
- next-themes (dark by default) + next-intl v3 (path-based `/en`, `/fr`)
- Framer Motion (scroll + ambient animations)
- react-hook-form + zod (form validation)
- lucide-react (icons)
- Geist Sans + Geist Mono (Vercel `geist` package, self-hosted via `next/font`)

**Admin Dashboard (`apps/admin-dashboard`):**

- Vite + React 19 + TypeScript
- Zustand (UI state) + react-i18next (**English only** for now)
- Reuses the shared Gemini design tokens + `@nextpayments/ui`

**Shared (`packages/`):**

- `@nextpayments/ui` — Button family, `Card` (ambient hover glow), `cn()`
- `@nextpayments/tailwind-config` — `theme.css` defining Gemini design tokens
- `@nextpayments/tsconfig` — base / nextjs / react-library
- `@nextpayments/eslint-config` — base + Next.js preset (legacy eslintrc; the
  admin app uses its own flat `eslint.config.js`)

**Engineering rules:** reusable, agent-agnostic skills live in [`/skills`](./skills/README.md)
(no-hardcoding, design system, component reuse, clean architecture,
React/Next best practices, git teamwork). `.claude/skills/*` symlink to them.

---

## Dummy login

There is no real backend in this phase. Login is validated client-side against
dummy users in `apps/merchant-app/src/constants/dummy-users.ts`:

| Email                   | Password    |
| ----------------------- | ----------- |
| `demo@nextpayments.io`  | `demo1234`  |
| `admin@nextpayments.io` | `admin1234` |

On success the app navigates to the **homepage** (`/`). The "Continue with
Google" button is fake UI — clicking it redirects to the homepage after ~1s.

---

## Code conventions

- Files: `kebab-case.tsx`
- Components: `PascalCase`; Server Component by default, add `'use client'`
  only when hooks/events are needed
- Imports: use the `@/...` alias (configured in tsconfig)
- No `next/*` imports inside `packages/ui` (keep it framework-agnostic for the
  Vite admin app)
- No hardcoded literals — extract to constants/tokens (see `skills/`)
- Details: see `PLAN.md` section 11

---

## Troubleshooting

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

## Roadmap

The current sprint focuses on Landing + Auth (merchant) and the basic Admin
dashboard. Next sprints:

1. Merchant Dashboard (sidebar, invoices, API keys)
2. Checkout Widget (`/checkout/[id]`, state machine Pending → Confirming → Success)
3. Admin Dashboard expansion (transaction ledger with virtualization, merchant mgmt)
4. MSW + TanStack Query for real async flows, Vitest + Playwright

Full roadmap: `PLAN.md` section 10.
