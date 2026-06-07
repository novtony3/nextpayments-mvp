import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { API_BASE_URL, DEFAULT_API_PROXY_TARGET } from './src/constants/api';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Browser calls stay same-origin under `/api/*`; Next forwards them to the
// backend reached via the SSH tunnel. Override the target per machine with
// the API_PROXY_TARGET env (e.g. http://localhost:13000 if you tunnel to a
// non-3000 local port). Keeps the upstream origin server-side → no CORS.
const apiProxyTarget = process.env.API_PROXY_TARGET ?? DEFAULT_API_PROXY_TARGET;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Build output dir. Defaults to `.next` (dev + production/CI). A verification
  // build run WHILE `next dev` is live must NOT share `.next` — the build
  // rewrites the manifests the running dev server reads, which spams
  // `ENOENT app-build-manifest.json` and breaks the page. Set NEXT_DIST_DIR
  // (e.g. `pnpm build:check`) to send such builds to a separate folder.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // Produces a self-contained .next/standalone/ bundle for Docker (no full node_modules needed)
  output: 'standalone',
  transpilePackages: ['@nextpayments/ui'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async rewrites() {
    // Proxy every `/api/*` call to the backend EXCEPT `/api/diag/*`, which
    // are local App Router diagnostic handlers (an afterFiles rewrite would
    // otherwise shadow them and proxy the diagnostic itself).
    return [
      {
        source: `${API_BASE_URL}/:path((?!diag).*)`,
        destination: `${apiProxyTarget}${API_BASE_URL}/:path`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
