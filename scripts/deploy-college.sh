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

log "Fixing college nginx upstream (ERP web/api not restarted)..."
bash "$COLLEGE_DIR/scripts/fix-college-nginx.sh"

log "Deploy complete."
log "Open: https://donboscocollege.ac.in/admin/login"
log "If still 502, run: docker compose -f $COMPOSE_FILE logs --tail=50 web"
log ""
log "Applying database schema (--build ensures latest prisma/schema.prisma)..."
docker compose -f "$COMPOSE_FILE" --profile tools run --rm --build db-push || \
  log "WARN: db-push failed — if Question Bank shows missing columns, run: bash scripts/migrate-academics-schema.sh"
