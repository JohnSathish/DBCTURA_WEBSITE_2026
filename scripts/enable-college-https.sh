#!/usr/bin/env bash
# Enable HTTPS for donboscocollege.ac.in on the NEP ERP nginx stack.
# Safe for ERP: only edits college server blocks and reloads nginx.
#
# Run on server:
#   bash /opt/donboscocollege/scripts/enable-college-https.sh
#
# Note: This server uses /opt/nep-erp/nginx/nginx.conf (NOT conf.d/).

set -euo pipefail

NGINX_CONTAINER="${NGINX_CONTAINER:-nep-erp-nginx-1}"
NGINX_CONF="${NGINX_CONF:-/opt/nep-erp/nginx/nginx.conf}"

MOUNTED_CONF=$(docker inspect "$NGINX_CONTAINER" --format '{{ range .Mounts }}{{ if eq .Destination "/etc/nginx/nginx.conf" }}{{ .Source }}{{ end }}{{ end }}' 2>/dev/null || true)
if [[ -n "$MOUNTED_CONF" && -f "$MOUNTED_CONF" ]]; then
  NGINX_CONF="$MOUNTED_CONF"
fi

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "docker not found"
docker ps --format '{{.Names}}' | grep -qx "$NGINX_CONTAINER" || die "nginx container '$NGINX_CONTAINER' not running"
[[ -f "$NGINX_CONF" ]] || die "nginx config not found: $NGINX_CONF"

log "Nginx config: $NGINX_CONF"

log "Current college routing in nginx:"
docker exec "$NGINX_CONTAINER" nginx -T 2>/dev/null | grep -A30 'server_name donboscocollege.ac.in' || true

if docker exec "$NGINX_CONTAINER" nginx -T 2>/dev/null | grep -q 'listen 443 ssl' && \
   docker exec "$NGINX_CONTAINER" nginx -T 2>/dev/null | grep -A5 'server_name donboscocollege.ac.in' | grep -q 'listen 443'; then
  log "HTTPS server block for donboscocollege.ac.in already present."
else
  log "HTTPS block missing — checking SSL certificate..."
  if [[ ! -f /etc/letsencrypt/live/donboscocollege.ac.in/fullchain.pem ]]; then
    log "Obtain certificate first:"
    echo "  certbot certonly --webroot -w /var/www/certbot \\"
    echo "    -d donboscocollege.ac.in -d www.donboscocollege.ac.in"
    die "SSL certificate not found at /etc/letsencrypt/live/donboscocollege.ac.in/"
  fi

  log "Backing up nginx.conf..."
  cp "$NGINX_CONF" "${NGINX_CONF}.bak.$(date +%Y%m%d%H%M%S)"

  log "Ensure main nginx.conf includes college HTTPS blocks from nep-erp-with-college.conf template."
  log "If college blocks are HTTP-only, merge server blocks from:"
  log "  /opt/donboscocollege/docker/nginx/nep-erp-with-college.conf"
  log "  (lines: upstream donboscocollege_upstream + port 80 redirect + port 443 proxy)"
  die "Manual merge required — see DEPLOY_DOCKER_NEP_ERP.md Step 4b"
fi

log "Testing HTTP → HTTPS redirect..."
http_code=$(curl -s -o /dev/null -w '%{http_code}' http://donboscocollege.ac.in/ 2>/dev/null || echo "000")
https_code=$(curl -sk -o /dev/null -w '%{http_code}' https://donboscocollege.ac.in/ 2>/dev/null || echo "000")
log "  http://donboscocollege.ac.in  → HTTP $http_code (expect 301)"
log "  https://donboscocollege.ac.in → HTTP $https_code (expect 200)"

if [[ "$http_code" != "301" && "$http_code" != "302" && "$http_code" != "308" ]]; then
  die "HTTP is not redirecting to HTTPS. Edit $NGINX_CONF — port 80 block must: return 301 https://\$host\$request_uri;"
fi

if [[ "$https_code" != "200" ]]; then
  die "HTTPS not returning 200. Check cert paths and upstream in $NGINX_CONF"
fi

log "Reloading nginx..."
docker exec "$NGINX_CONTAINER" nginx -t
docker exec "$NGINX_CONTAINER" nginx -s reload

log "Done. Open https://donboscocollege.ac.in — Chrome should show a padlock."
