#!/usr/bin/env bash
set -euo pipefail

DOMAIN="menu.byuisresearch.com"
APP_DIR="/home/ubuntu/emmalee_site"

echo "=== Installing Node.js 20 via NodeSource ==="
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "Node $(node -v) installed"

echo "=== Installing nginx and certbot ==="
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "=== Installing PM2 globally ==="
sudo npm install -g pm2

echo "=== Building the project ==="
cd "$APP_DIR"
mkdir -p logs
npm run install:all
npm run build

echo "=== Configuring nginx ==="
sudo cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/emmalee-site
sudo ln -sf /etc/nginx/sites-available/emmalee-site /etc/nginx/sites-enabled/emmalee-site
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "=== Obtaining SSL certificate ==="
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --redirect --email admin@byuisresearch.com

echo "=== Starting app with PM2 ==="
cd "$APP_DIR"
pm2 start ecosystem.config.cjs
pm2 save

echo "=== Setting up PM2 startup hook ==="
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash

echo "=== Setup complete ==="
echo "Visit https://$DOMAIN to verify"
