#!/usr/bin/env bash
# Fix nginx routing for donboscocollege.ac.in ONLY.
# Safe for ERP: reloads nginx only — does NOT restart nep-erp-web or nep-erp-api.
#
# Run on server:
#   bash /opt/donboscocollege/scripts/fix-college-nginx.sh
#
# Use after any college container rebuild, or when the main site shows 502.

set -euo pipefail

COLLEGE_DIR="${COLLEGE_DIR:-/opt/donboscocollege}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
NGINX_CONTAINER="${NGINX_CONTAINER:-nep-erp-nginx-1}"
COLLEGE_CONTAINER="${COLLEGE_CONTAINER:-donboscocollege-web}"
NGINX_CONF="${NGINX_CONF:-/opt/nep-erp/nginx/nginx.conf}"

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "docker not found"
docker ps --format '{{.Names}}' | grep -qx "$NGINX_CONTAINER" || die "nginx container '$NGINX_CONTAINER' not running"
[[ -f "$NGINX_CONF" ]] || die "nginx config not found: $NGINX_CONF"

probe_from_nginx() {
  local url="$1"
  docker exec "$NGINX_CONTAINER" sh -c "wget -q --spider --timeout=5 '$url' 2>/dev/null || curl -sf --max-time 5 -o /dev/null '$url'" 2>/dev/null
}

log "Ensuring college app container is running..."
cd "$COLLEGE_DIR" || die "Directory not found: $COLLEGE_DIR"
if ! docker ps --format '{{.Names}}' | grep -qx "$COLLEGE_CONTAINER"; then
  log "College container not running — starting it..."
  docker compose -f "$COMPOSE_FILE" up -d web
  sleep 5
fi
docker ps --format '{{.Names}}\t{{.Status}}' | grep "$COLLEGE_CONTAINER" || die "College container '$COLLEGE_CONTAINER' not running"

log "Checking college app on host port 3002..."
host_ok=0
for ((i=1; i<=30; i++)); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/ 2>/dev/null || echo "000")
  if [[ "$code" =~ ^(200|301|302|307|308)$ ]]; then
    host_ok=1
    log "Host port 3002: HTTP $code"
    break
  fi
  sleep 1
done
[[ "$host_ok" -eq 1 ]] || die "College app not responding on http://127.0.0.1:3002 — run: docker compose -f $COMPOSE_FILE logs --tail=50 web"

log "Connecting college container to ERP nginx network..."
ERP_NET=$(docker inspect "$NGINX_CONTAINER" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | awk '{print $1}')
[[ -n "$ERP_NET" ]] || die "Could not detect ERP Docker network"
docker network connect "$ERP_NET" "$COLLEGE_CONTAINER" 2>/dev/null || true
log "ERP network: $ERP_NET"

log "Choosing stable upstream (tested from inside nginx)..."
UPSTREAM_HOST=""
for candidate in "donboscocollege-web:3000" "host.docker.internal:3002" "172.17.0.1:3002"; do
  log "  trying http://${candidate}/ ..."
  if probe_from_nginx "http://${candidate}/"; then
    UPSTREAM_HOST="$candidate"
    log "  selected: ${candidate}"
    break
  fi
done

if [[ -z "$UPSTREAM_HOST" ]]; then
  log "WARN: nginx probe failed for all candidates — using host.docker.internal:3002 (host port is up)"
  UPSTREAM_HOST="host.docker.internal:3002"
fi

log "Patching ${NGINX_CONF} (remove zone/resolve cache, set stable server)..."
cp "$NGINX_CONF" "${NGINX_CONF}.bak.$(date +%Y%m%d%H%M%S)"

python3 - "$NGINX_CONF" "$UPSTREAM_HOST" <<'PY'
import re, sys
path, host = sys.argv[1], sys.argv[2]
text = open(path, encoding="utf-8").read()
block = (
    "  upstream donboscocollege_upstream {\n"
    f"    server {host};\n"
    "  }"
)
new, n = re.subn(
    r"  upstream donboscocollege_upstream \{.*?\n  \}",
    block,
    text,
    count=1,
    flags=re.DOTALL,
)
if n != 1:
    raise SystemExit("donboscocollege_upstream block not found in nginx.conf")
open(path, "w", encoding="utf-8").write(new)
print(f"Replaced upstream block with server {host};")
PY

log "Reloading nginx (ERP web/api untouched)..."
docker exec "$NGINX_CONTAINER" nginx -t
docker exec "$NGINX_CONTAINER" nginx -s reload

sleep 2

log "Active upstream in running nginx:"
docker exec "$NGINX_CONTAINER" nginx -T 2>/dev/null | grep -A4 'upstream donboscocollege_upstream'

code=$(curl -sk --resolve donboscocollege.ac.in:443:127.0.0.1 -o /dev/null -w '%{http_code}' https://donboscocollege.ac.in/ 2>/dev/null || echo "000")
log "College site (local HTTPS): HTTP ${code}"

if [[ "$code" != "200" ]]; then
  log "Still failing — restarting nginx container only (not ERP)..."
  docker restart "$NGINX_CONTAINER"
  sleep 4
  code=$(curl -sk --resolve donboscocollege.ac.in:443:127.0.0.1 -o /dev/null -w '%{http_code}' https://donboscocollege.ac.in/ 2>/dev/null || echo "000")
  log "College site after nginx restart: HTTP ${code}"
fi

[[ "$code" == "200" ]] || die "College site still HTTP ${code}. Check: docker logs ${NGINX_CONTAINER} --tail=30"

log "Done. ERP subdomains (erp.*, admissions.*, library.*) were not restarted."
