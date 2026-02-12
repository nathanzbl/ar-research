#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/ubuntu/emmalee_site"

cd "$APP_DIR"

echo "=== Installing dependencies ==="
npm run install:all

echo "=== Building ==="
npm run build

echo "=== Restarting app ==="
pm2 restart ecosystem.config.cjs

echo "=== Redeploy complete ==="
pm2 status
