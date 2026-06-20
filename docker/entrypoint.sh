#!/bin/sh
set -e

# db-push / admin-password run as root and leave SQLite owned by root; app runs as nextjs.
chown -R nextjs:nodejs /app/data /app/public/uploads 2>/dev/null || true

exec gosu nextjs node server.js
