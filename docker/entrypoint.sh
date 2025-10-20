#!/bin/sh
set -e

if [ -n "${PNPM_HOME:-}" ]; then
  export PATH="$PNPM_HOME:$PATH"
fi

if [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile
else
  pnpm install
fi

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

exec pnpm dev --host 0.0.0.0 --port "${PORT:-5173}"
