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
