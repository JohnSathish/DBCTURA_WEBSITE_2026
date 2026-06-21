#!/usr/bin/env bash
# Deploy Don Bosco College website and fix nginx 502 after container rebuild.
#
# Run ON THE SERVER as root:
#   bash /opt/donboscocollege/scripts/deploy-college.sh
#
# Safe for ERP: does NOT restart nep-erp-web/api, only reloads nginx.

set -euo pipefail

COLLEGE_DIR="${COLLEGE_DIR:-/opt/donboscocollege}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
NGINX_CONTAINER="${NGINX_CONTAINER:-nep-erp-nginx-1}"
COLLEGE_CONTAINER="${COLLEGE_CONTAINER:-donboscocollege-web}"
MAX_WAIT="${MAX_WAIT:-120}"

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "docker not found"
docker ps --format '{{.Names}}' | grep -qx "$NGINX_CONTAINER" || die "nginx container '$NGINX_CONTAINER' not running"
docker ps --format '{{.Names}}' | grep -qx "$COLLEGE_CONTAINER" || log "College container not running yet — will start it"

cd "$COLLEGE_DIR" || die "Directory not found: $COLLEGE_DIR"

log "Pulling latest code..."
git pull origin main

log "Building and starting college web container (port 3002)..."
docker compose -f "$COMPOSE_FILE" up -d --build web

log "Waiting for app on http://127.0.0.1:3002 (max ${MAX_WAIT}s)..."
ready=0
for ((i=1; i<=MAX_WAIT; i++)); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/ 2>/dev/null || echo "000")
  if [[ "$code" =~ ^(200|301|302|307|308)$ ]]; then
    ready=1
    log "College app responding: HTTP $code"
    break
  fi
  sleep 1
done
[[ "$ready" -eq 1 ]] || die "College app did not become ready on port 3002. Check: docker compose -f $COMPOSE_FILE logs --tail=80 web"

log "Connecting college container to ERP nginx Docker network..."
ERP_NET=$(docker inspect "$NGINX_CONTAINER" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | awk '{print $1}')
[[ -n "$ERP_NET" ]] || die "Could not detect ERP Docker network from $NGINX_CONTAINER"
docker network connect "$ERP_NET" "$COLLEGE_CONTAINER" 2>/dev/null || true
log "ERP network: $ERP_NET"

log "Verifying nginx can reach college container by name..."
if docker exec "$NGINX_CONTAINER" wget -qO- --timeout=5 "http://${COLLEGE_CONTAINER}:3000/" 2>/dev/null | head -c 80 >/dev/null; then
  UPSTREAM="server ${COLLEGE_CONTAINER}:3000;"
  log "Using Docker DNS upstream: ${COLLEGE_CONTAINER}:3000"
else
  COLLEGE_IP=$(docker network inspect "$ERP_NET" -f "{{range .Containers}}{{if eq .Name \"${COLLEGE_CONTAINER}\"}}{{.IPv4Address}}{{end}}{{end}}" | cut -d/ -f1)
  [[ -n "$COLLEGE_IP" ]] || die "Could not resolve ${COLLEGE_CONTAINER} IP on network $ERP_NET"
  UPSTREAM="server ${COLLEGE_IP}:3000;"
  log "Using container IP upstream: ${COLLEGE_IP}:3000"
fi

patch_upstream() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  grep -q 'donboscocollege_upstream' "$file" || return 0
  cp "$file" "${file}.bak.$(date +%Y%m%d%H%M%S)"
  sed -i "/upstream donboscocollege_upstream/,/^  }/ s|server .*;|${UPSTREAM}|" "$file"
  log "Patched upstream in: $file"
}

NGINX_CONF=$(docker inspect "$NGINX_CONTAINER" --format '{{ range .Mounts }}{{ if eq .Destination "/etc/nginx/nginx.conf" }}{{ .Source }}{{ end }}{{ end }}')
[[ -n "$NGINX_CONF" ]] && patch_upstream "$NGINX_CONF"

for conf in /opt/nep-erp/nginx/conf.d/*.conf /opt/nep-erp/nginx/nginx.conf; do
  patch_upstream "$conf"
done

log "Testing and reloading nginx..."
docker exec "$NGINX_CONTAINER" nginx -t
docker exec "$NGINX_CONTAINER" nginx -s reload

log "Final checks..."
docker compose -f "$COMPOSE_FILE" ps
curl -s -o /dev/null -w "  localhost:3002  → HTTP %{http_code}\n" http://127.0.0.1:3002/
curl -sk -o /dev/null -w "  https site      → HTTP %{http_code}\n" https://donboscocollege.ac.in/ || true

log "Deploy complete."
log "Open: https://donboscocollege.ac.in/admin/login"
log "If still 502, run: docker compose -f $COMPOSE_FILE logs --tail=50 web"
