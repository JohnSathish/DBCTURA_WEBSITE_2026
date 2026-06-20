#!/bin/sh
set -e

export HOME=/app
export NPM_CONFIG_CACHE=/app/.npm
mkdir -p /app/.npm

if [ -x /app/node_modules/.bin/prisma ]; then
  /app/node_modules/.bin/prisma db push --skip-generate
fi

exec node server.js
