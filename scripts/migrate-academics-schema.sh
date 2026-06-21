#!/usr/bin/env bash
# Migrate academics tables (QuestionPaper, Syllabus) after schema redesign.
#
# Run ON THE SERVER after deploy when Question Bank shows:
#   "column main.QuestionPaper.academicYear does not exist"
#
#   bash /opt/donboscocollege/scripts/migrate-academics-schema.sh
#
# Safe: backs up SQLite first. Old QuestionPaper rows are dropped (re-upload via admin).

set -euo pipefail

COLLEGE_DIR="${COLLEGE_DIR:-/opt/donboscocollege}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
DB_PATH="/app/data/dev.db"

log() { printf '\n[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "docker not found"
cd "$COLLEGE_DIR" || die "Directory not found: $COLLEGE_DIR"

log "Pulling latest code..."
git pull origin main

log "Backing up production database..."
BACKUP_NAME="dev.db.bak.$(date +%Y%m%d%H%M%S)"
docker compose -f "$COMPOSE_FILE" --profile tools run --rm --build --entrypoint sh db-push -c \
  "cp ${DB_PATH} /app/data/${BACKUP_NAME} && ls -lh /app/data/${BACKUP_NAME}" \
  || die "Backup failed"
log "Backup saved as ${BACKUP_NAME} in donbosco-data volume"

log "Dropping legacy QuestionPaper table (old year/department schema)..."
docker compose -f "$COMPOSE_FILE" --profile tools run --rm --build --entrypoint sh db-push -c \
  "echo 'DROP TABLE IF EXISTS QuestionPaper;' | npx prisma db execute --stdin --schema prisma/schema.prisma" \
  || die "Failed to drop QuestionPaper table"

log "Applying current Prisma schema (rebuilds QuestionPaper + Syllabus)..."
docker compose -f "$COMPOSE_FILE" --profile tools run --rm --build db-push \
  || die "db push failed"

log "Fixing volume permissions for nextjs user..."
docker compose -f "$COMPOSE_FILE" exec -T web sh -c "chown -R nextjs:nodejs /app/data" 2>/dev/null || true

log "Restarting web container..."
docker compose -f "$COMPOSE_FILE" restart web

log "Waiting for app..."
sleep 3
code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/admin/login 2>/dev/null || echo "000")
log "Admin login: HTTP ${code}"

log "Migration complete."
log "Re-upload previous year question papers via /admin/question-bank (old rows were not migrated)."
log "Backup: ${BACKUP_NAME} (in Docker volume donbosco-data)"
