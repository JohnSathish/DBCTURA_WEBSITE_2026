#!/usr/bin/env bash
# Emergency recovery when BOTH college + ERP sites are down.
# Run ON THE SERVER as root:
#   bash /opt/donboscocollege/scripts/recover-sites.sh
#
# Restarts Docker stacks safely and reloads nginx. Prefer this over redeploying
# when sites are completely unreachable after reboot / failed nginx patch.

set -euo pipefail

COLLEGE_DIR="${COLLEGE_DIR:-/opt/donboscocollege}"
ERP_DIR="${ERP_DIR:-/opt/nep-erp}"
NGINX_CONTAINER="${NGINX_CONTAINER:-nep-erp-nginx-1}"
COLLEGE_CONTAINER="${COLLEGE_CONTAINER:-donboscocollege-web}"

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

log "1) Docker daemon"
systemctl start docker 2>/dev/null || true
systemctl is-active docker >/dev/null || die "Docker is not running"
docker info >/dev/null || die "Docker not responding"

log "2) Container status (before)"
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || true

log "3) Start ERP stack (web/api/nginx/db/redis/worker)"
if [[ -f "$ERP_DIR/docker-compose.yml" ]]; then
  cd "$ERP_DIR"
  docker compose up -d
elif [[ -f "$ERP_DIR/compose.yml" ]]; then
  cd "$ERP_DIR"
  docker compose up -d
else
  # Fallback: start known containers by name
  for c in nep-erp-postgres-1 nep-erp-redis-1 nep-erp-api-1 nep-erp-web-1 nep-erp-worker-1 "$NGINX_CONTAINER"; do
    docker start "$c" 2>/dev/null || true
  done
fi

log "4) Start college web on :3002"
if [[ -d "$COLLEGE_DIR" && -f "$COLLEGE_DIR/docker-compose.prod.yml" ]]; then
  cd "$COLLEGE_DIR"
  docker compose -f docker-compose.prod.yml up -d web
else
  docker start "$COLLEGE_CONTAINER" 2>/dev/null || true
fi

log "5) Wait for local ports"
for port in 3000 3001 3002 80 443; do
  code="000"
  for ((i=1; i<=40; i++)); do
    code=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 2 "http://127.0.0.1:${port}/" 2>/dev/null || echo "000")
    [[ "$code" != "000" ]] && break
    sleep 1
  done
  log "  port ${port}: HTTP ${code}"
done

log "6) Ensure college is on ERP nginx network"
if docker ps --format '{{.Names}}' | grep -qx "$NGINX_CONTAINER"; then
  ERP_NET=$(docker inspect "$NGINX_CONTAINER" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | awk '{print $1}')
  if [[ -n "$ERP_NET" ]] && docker ps --format '{{.Names}}' | grep -qx "$COLLEGE_CONTAINER"; then
    docker network connect "$ERP_NET" "$COLLEGE_CONTAINER" 2>/dev/null || true
    log "  network: $ERP_NET"
  fi
fi

log "7) Nginx config test + restart (shared reverse proxy)"
if docker ps --format '{{.Names}}' | grep -qx "$NGINX_CONTAINER"; then
  if docker exec "$NGINX_CONTAINER" nginx -t; then
    docker restart "$NGINX_CONTAINER"
    sleep 4
  else
    log "WARN: nginx -t failed — restoring newest backup if present"
    NGINX_CONF=$(docker inspect "$NGINX_CONTAINER" --format '{{ range .Mounts }}{{ if eq .Destination "/etc/nginx/nginx.conf" }}{{ .Source }}{{ end }}{{ end }}' 2>/dev/null || true)
    NGINX_CONF="${NGINX_CONF:-/opt/nep-erp/nginx/nginx.conf}"
    bak=$(ls -1t "${NGINX_CONF}".bak.* 2>/dev/null | head -1 || true)
    if [[ -n "$bak" && -f "$bak" ]]; then
      cp "$bak" "$NGINX_CONF"
      log "  restored $bak"
      docker restart "$NGINX_CONTAINER"
      sleep 4
    else
      die "nginx config invalid and no .bak found at ${NGINX_CONF}"
    fi
  fi
else
  die "nginx container $NGINX_CONTAINER is not running"
fi

log "8) Final checks"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
echo
curl -sI --connect-timeout 5 http://127.0.0.1:3000/ | head -3 || true
curl -sI --connect-timeout 5 http://127.0.0.1:3001/ | head -3 || true
curl -sI --connect-timeout 5 http://127.0.0.1:3002/ | head -3 || true
curl -skI --connect-timeout 5 --resolve donboscocollege.ac.in:443:127.0.0.1 https://donboscocollege.ac.in/ | head -5 || true

log "Done. If college still 502, run: bash /opt/donboscocollege/scripts/fix-college-nginx.sh"
