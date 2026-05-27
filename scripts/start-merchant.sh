#!/usr/bin/env bash
# =============================================================================
# start-merchant.sh
# SSH into the deploy server and (re)start the merchant-app container.
#
# Usage:
#   ./scripts/start-merchant.sh                 # rebuild + up
#   ACTION=restart ./scripts/start-merchant.sh  # restart only (no rebuild)
#   ACTION=status  ./scripts/start-merchant.sh  # just show status
#   ACTION=logs    ./scripts/start-merchant.sh  # tail logs
#
# Override any value via env var.
# =============================================================================
set -euo pipefail

# --- Connection ---------------------------------------------------------------
SSH_HOST="${SSH_HOST:-103.160.4.145}"
SSH_USER="${SSH_USER:-motmi}"
SSH_PORT="${SSH_PORT:-22}"

# --- Remote layout ------------------------------------------------------------
REMOTE_DIR="${REMOTE_DIR:-/opt/merchant-app}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose-merchant-app.yml}"
SERVICE="${SERVICE:-merchant-app}"

# --- Action -------------------------------------------------------------------
ACTION="${ACTION:-up}"   # up | restart | status | logs

echo "→ ${SSH_USER}@${SSH_HOST}:${SSH_PORT}"
echo "→ ${REMOTE_DIR} :: ${COMPOSE_FILE} :: ${SERVICE} :: action=${ACTION}"
echo

# --- Run ----------------------------------------------------------------------
ssh -p "$SSH_PORT" \
    -o ServerAliveInterval=30 \
    "${SSH_USER}@${SSH_HOST}" \
    REMOTE_DIR="$REMOTE_DIR" \
    COMPOSE_FILE="$COMPOSE_FILE" \
    SERVICE="$SERVICE" \
    ACTION="$ACTION" \
    'bash -se' <<'REMOTE'
set -euo pipefail
cd "$REMOTE_DIR"
DC=(sudo docker compose -f "$COMPOSE_FILE")

case "$ACTION" in
  up)
    echo "▸ docker compose up -d --build $SERVICE"
    "${DC[@]}" up -d --build "$SERVICE"
    ;;
  restart)
    echo "▸ docker compose restart $SERVICE"
    "${DC[@]}" restart "$SERVICE"
    ;;
  status)
    :
    ;;
  logs)
    "${DC[@]}" logs -f --tail=200 "$SERVICE"
    exit 0
    ;;
  *)
    echo "Unknown ACTION=$ACTION (use: up | restart | status | logs)" >&2
    exit 2
    ;;
esac

echo
echo "▸ status"
"${DC[@]}" ps "$SERVICE"
REMOTE

echo
echo "✓ done"
