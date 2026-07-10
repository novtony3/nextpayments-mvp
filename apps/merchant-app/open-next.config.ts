import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// OpenNext adapter config for deploying merchant-app to Cloudflare Workers.
// Minimal setup for a first deploy: no incremental cache / R2 / KV bindings.
// To enable ISR/Data-cache persistence later, add an `incrementalCache`
// (e.g. r2IncrementalCache) here and bind the matching R2 bucket in
// wrangler.jsonc. See https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({});
