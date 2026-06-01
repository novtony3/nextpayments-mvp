#!/usr/bin/env bash
# =============================================================================
# tunnel.sh
# Manage a background SSH tunnel from this machine's `LOCAL_PORT` to the
# deploy server's `REMOTE_PORT` (the backend's loopback port). The Next
# rewrite + `apps/merchant-app/.env.local` (`API_PROXY_TARGET`) target the
# local end of this tunnel, so the dev server only works when the tunnel is up.
#
# Usage:
#   ./scripts/tunnel.sh up         # start (idempotent — no-op if already up)
#   ./scripts/tunnel.sh down       # stop
#   ./scripts/tunnel.sh restart    # down + up
#   ./scripts/tunnel.sh status     # report pid + port reachability
#   ./scripts/tunnel.sh wait       # block until health endpoint answers OK
#
# Overridable env vars (defaults match scripts/start-merchant.sh):
#   SSH_HOST, SSH_USER, SSH_PORT, SSH_IDENTITY, REMOTE_PORT, LOCAL_PORT,
#   HEALTH_PATH, WAIT_TIMEOUT_SECS
# =============================================================================
set -euo pipefail

SSH_HOST="${SSH_HOST:-103.160.4.145}"
SSH_USER="${SSH_USER:-motmi}"
SSH_PORT="${SSH_PORT:-22}"
SSH_IDENTITY="${SSH_IDENTITY:-$HOME/.ssh/id_ed25519}"
REMOTE_PORT="${REMOTE_PORT:-3000}"
LOCAL_PORT="${LOCAL_PORT:-13000}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
WAIT_TIMEOUT_SECS="${WAIT_TIMEOUT_SECS:-20}"

PID_FILE="/tmp/np-tunnel-${LOCAL_PORT}.pid"
LOG_FILE="/tmp/np-tunnel-${LOCAL_PORT}.log"
HEALTH_URL="http://localhost:${LOCAL_PORT}${HEALTH_PATH}"

ACTION="${1:-status}"

pid_alive() {
  local pid="$1"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

read_pid() {
  [[ -f "$PID_FILE" ]] && cat "$PID_FILE" || true
}

port_open() {
  # nc -z returns 0 when the TCP port accepts a connection.
  nc -z -w1 127.0.0.1 "$LOCAL_PORT" 2>/dev/null
}

up() {
  local pid
  pid="$(read_pid)"
  if pid_alive "$pid" && port_open; then
    echo "✓ tunnel already up (pid ${pid}, :${LOCAL_PORT} → ${SSH_HOST}:${REMOTE_PORT})"
    return 0
  fi

  # Stale pidfile or dead process — clean before retry.
  if [[ -n "$pid" ]] && ! pid_alive "$pid"; then
    rm -f "$PID_FILE"
  fi

  echo "▸ opening tunnel ${SSH_USER}@${SSH_HOST}:${SSH_PORT} :: local ${LOCAL_PORT} → remote ${REMOTE_PORT}"
  # -N: no remote command. -f: background after auth. ExitOnForwardFailure: bail
  # if local port can't be bound. ServerAliveInterval: kill stuck sessions fast.
  ssh \
    -i "$SSH_IDENTITY" \
    -p "$SSH_PORT" \
    -N -f \
    -o ExitOnForwardFailure=yes \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -L "${LOCAL_PORT}:localhost:${REMOTE_PORT}" \
    "${SSH_USER}@${SSH_HOST}" \
    > "$LOG_FILE" 2>&1

  # Resolve the forked PID by matching the forward spec. macOS pgrep needs -f.
  local resolved
  resolved="$(pgrep -f "ssh .* -L ${LOCAL_PORT}:localhost:${REMOTE_PORT} ${SSH_USER}@${SSH_HOST}" | head -n1)"
  if [[ -z "$resolved" ]]; then
    echo "✗ failed to locate tunnel process — see ${LOG_FILE}" >&2
    return 1
  fi
  echo "$resolved" > "$PID_FILE"
  echo "✓ tunnel up (pid ${resolved})"
}

down() {
  local pid
  pid="$(read_pid)"
  if pid_alive "$pid"; then
    echo "▸ killing tunnel pid ${pid}"
    kill "$pid" || true
  fi
  # Best-effort sweep in case the pidfile is missing.
  pkill -f "ssh .* -L ${LOCAL_PORT}:localhost:${REMOTE_PORT} ${SSH_USER}@${SSH_HOST}" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo "✓ tunnel down"
}

status() {
  local pid
  pid="$(read_pid)"
  if pid_alive "$pid"; then
    echo "pid:    ${pid}"
  else
    echo "pid:    (none)"
  fi
  if port_open; then
    echo "port:   :${LOCAL_PORT} open"
  else
    echo "port:   :${LOCAL_PORT} closed"
  fi
  if command -v curl >/dev/null 2>&1; then
    local code
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$HEALTH_URL" || echo 000)"
    echo "health: ${HEALTH_URL} → ${code}"
  fi
}

wait_for_health() {
  local deadline=$((SECONDS + WAIT_TIMEOUT_SECS))
  while (( SECONDS < deadline )); do
    if port_open && curl -s --max-time 2 "$HEALTH_URL" | grep -q '"ok":true'; then
      echo "✓ backend reachable via tunnel (${HEALTH_URL})"
      return 0
    fi
    sleep 1
  done
  echo "✗ timed out after ${WAIT_TIMEOUT_SECS}s waiting for ${HEALTH_URL}" >&2
  return 1
}

case "$ACTION" in
  up)      up ;;
  down)    down ;;
  restart) down; up ;;
  status)  status ;;
  wait)    wait_for_health ;;
  *)
    echo "Usage: $0 {up|down|restart|status|wait}" >&2
    exit 2
    ;;
esac
