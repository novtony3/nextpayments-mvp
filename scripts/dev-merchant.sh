#!/usr/bin/env bash
# =============================================================================
# dev-merchant.sh
# One-shot dev launcher: bring the SSH tunnel up, wait for the backend to
# answer through it, then start the merchant-app dev server. Without the
# tunnel the Next /api/* rewrites have nowhere to go, so every login or
# protected page would 502.
#
# Usage: ./scripts/dev-merchant.sh
#
# Same env-var overrides as scripts/tunnel.sh apply.
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/tunnel.sh" up
"$ROOT_DIR/scripts/tunnel.sh" wait

echo
echo "▸ starting merchant-app dev server"
exec pnpm --filter merchant-app dev
