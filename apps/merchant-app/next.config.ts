import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { API_BASE_URL, resolveBackendTarget } from './src/constants/api';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Browser calls stay same-origin under `/api/*`; Next forwards them to the
// backend. The target is NEXT_PUBLIC_API_URL (the hosted API), overridable per
// machine with API_PROXY_TARGET (e.g. http://localhost:13000 for an SSH
// tunnel). Keeps the upstream origin off the client wire → no CORS.
const apiProxyTarget = resolveBackendTarget();

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

// Enables `getCloudflareContext()` (env vars / bindings) during `next dev`.
// No-op in production builds and on the deployed Worker.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
void initOpenNextCloudflareForDev();
