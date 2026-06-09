# syntax=docker/dockerfile:1
# =============================================================================
# admin-dashboard/Dockerfile
# Multi-stage: pnpm monorepo builder → nginx:alpine static server
#
# Build context: repo root (crypto-payment-fe/)
#   docker build -f apps/admin-dashboard/Dockerfile .
#
# Build args (all optional — baked into static bundle at build time):
#   VITE_API_URL   Base URL of the payment backend  (default: /api)
# =============================================================================

# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

# Pin pnpm to match packageManager field in package.json (pnpm 11 requires Node >=22.13)
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/                  ./packages/
COPY apps/admin-dashboard/package.json ./apps/admin-dashboard/

# Install all workspace deps (frozen — no drift). Persist the pnpm store across
# builds (BuildKit cache mount) so deps aren't re-downloaded every deploy — the
# deploy host's link to npm is slow/flaky. `.npmrc` raises fetch timeout/retries.
# Requires BuildKit (Docker ≥23 default).
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --store-dir=/pnpm/store

# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM deps AS builder

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Copy app source (after deps for cache efficiency)
COPY apps/admin-dashboard/ ./apps/admin-dashboard/

# Build — outputs to apps/admin-dashboard/dist/
RUN pnpm --filter admin-dashboard build

# ── Stage 3: runner (nginx) ───────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config and default html
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy custom nginx config
COPY apps/admin-dashboard/nginx.conf /etc/nginx/conf.d/app.conf

# Copy static build output
COPY --from=builder /app/apps/admin-dashboard/dist /usr/share/nginx/html

# nginx listens on 5002 (matches local dev port)
EXPOSE 5002

# Use non-root nginx — nginx:alpine has the 'nginx' user (uid 101) built in.
# The config must use ports > 1024 or we must run as root. 5002 is fine.
# nginx master process stays as root to bind, workers drop to nginx user.

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5002/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
