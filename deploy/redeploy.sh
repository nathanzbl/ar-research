#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/ubuntu/ar-research"

cd "$APP_DIR"

echo "=== Installing dependencies ==="
npm run install:all

echo "=== Building ==="
npm run build

echo "=== Restarting app ==="
pm2 restart ecosystem.config.cjs

echo "=== Redeploy complete ==="
pm2 status
