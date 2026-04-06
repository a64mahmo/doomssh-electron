#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
FRONTEND="$ROOT/frontend"

# ── Colors ─────────────────────────────────────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

log()  { echo -e "${CYAN}[run]${RESET} $*"; }
ok()   { echo -e "${GREEN}[run]${RESET} $*"; }
warn() { echo -e "${YELLOW}[run]${RESET} $*"; }
err()  { echo -e "${RED}[run]${RESET} $*"; }

# ── Install deps if node_modules missing ───────────────────────────────────────
if [ ! -d "$ROOT/node_modules" ]; then
  log "Installing root dependencies..."
  (cd "$ROOT" && npm install)
fi

if [ ! -d "$FRONTEND/node_modules" ]; then
  log "Installing frontend dependencies..."
  (cd "$FRONTEND" && npm install)
fi

# ── Cleanup on exit ────────────────────────────────────────────────────────────
PIDS=()

cleanup() {
  warn "Shutting down..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null
}
trap cleanup EXIT INT TERM

# ── Start frontend ─────────────────────────────────────────────────────────────
log "Starting DoomSSH frontend on :3000..."
(cd "$FRONTEND" && npm run dev) &
PIDS+=($!)

ok "Service started. Press Ctrl+C to stop."
ok "  Local → http://localhost:3000"

# ── Wait ───────────────────────────────────────────────────────────────────────
wait
