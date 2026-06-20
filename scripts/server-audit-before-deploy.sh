#!/usr/bin/env bash
# Run ON THE SERVER before deploying Don Bosco College website.
# Usage: bash server-audit-before-deploy.sh
#
# Does NOT change anything — read-only audit.

set -euo pipefail

echo "=============================================="
echo " Don Bosco deploy — pre-flight audit (read-only)"
echo " Server: $(hostname -f 2>/dev/null || hostname)"
echo " Date:   $(date -Is)"
echo "=============================================="
echo

echo "=== 1. Listening ports (look for ERP / Node / web) ==="
if command -v ss >/dev/null 2>&1; then
  ss -tlnp
else
  netstat -tlnp
fi
echo

echo "=== 2. PM2 processes (DO NOT stop/restart apps you don't own) ==="
if command -v pm2 >/dev/null 2>&1; then
  pm2 list || true
else
  echo "PM2 not installed"
fi
echo

echo "=== 3. Web server ==="
for svc in nginx lsws openlitespeed; do
  systemctl is-active "$svc" 2>/dev/null && echo "$svc: active" || true
done
echo "--- Nginx sites-enabled ---"
ls -la /etc/nginx/sites-enabled 2>/dev/null || echo "(no nginx sites-enabled)"
echo "--- OpenLiteSpeed ---"
ls /usr/local/lsws/conf/vhosts 2>/dev/null || echo "(no OLS vhosts dir)"
echo

echo "=== 4. /var/www contents ==="
ls -la /var/www 2>/dev/null || echo "(no /var/www)"
echo

echo "=== 5. Port 3000 / 3001 / 3002 (common app ports) ==="
for p in 3000 3001 3002; do
  echo -n "Port $p: "
  if ss -tlnp 2>/dev/null | grep -q ":$p "; then
    ss -tlnp | grep ":$p " || true
  else
    echo "FREE"
  fi
done
echo

echo "=== 6. CyberPanel / nghttpx (often uses 3000) ==="
pgrep -a nghttpx 2>/dev/null || echo "(nghttpx not running)"
echo

echo "=== 7. Docker containers (if any) ==="
docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}' 2>/dev/null || echo "(docker not used or not installed)"
echo

echo "=== 8. Existing donboscocollege folder ==="
if [ -d /var/www/donboscocollege ]; then
  ls -la /var/www/donboscocollege | head -15
  echo "..."
  [ -f /var/www/donboscocollege/.env ] && echo ".env exists (not shown)"
else
  echo "Not deployed yet — safe to clone to /var/www/donboscocollege"
fi
echo

echo "=============================================="
echo " SAFE DEPLOY RULES (Don Bosco vs existing ERP)"
echo "=============================================="
cat <<'RULES'

1. DO NOT touch the ERP app folder, PM2 name, or Nginx vhost for the ERP domain.
2. DO NOT use port 3000 (often CyberPanel/nghttpx or ERP).
3. Don Bosco uses port 3001 ONLY (ecosystem.config.js) — pick 3002 if 3001 is taken.
4. DO NOT run: pm2 restart all, pm2 delete all, systemctl restart nginx (without nginx -t first).
5. Add a NEW vhost for donboscocollege.ac.in → proxy to 127.0.0.1:3001
6. DO NOT set default_server on the Don Bosco Nginx block (keeps ERP as default if needed).
7. Use: pm2 start ecosystem.config.js  (app name: donbosco)
8. Use: pm2 restart donbosco  (only this app when updating)

After audit, note which ports are FREE and which PM2 apps exist before deploying.
RULES

echo
echo "Audit complete."
