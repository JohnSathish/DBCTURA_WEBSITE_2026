#!/bin/sh

export HOME=/app
export NPM_CONFIG_CACHE=/app/.npm
mkdir -p /app/.npm /app/data /app/prisma/public/uploads

if [ -x /app/node_modules/.bin/prisma ]; then
  /app/node_modules/.bin/prisma db push --skip-generate || \
    echo "WARN: prisma db push failed; site will start anyway" >&2
fi

exec node server.js
