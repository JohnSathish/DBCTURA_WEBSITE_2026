# Production image for Don Bosco College (Next.js standalone)
FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Next.js collects route data at build time; prisma.ts requires DATABASE_URL.
ENV DATABASE_URL="file:./prisma/dev.db"
RUN npx prisma db push
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV HOME=/app
ENV NPM_CONFIG_CACHE=/app/.npm

RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/* \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib/prisma-generated ./lib/prisma-generated
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY docker/entrypoint.sh /app/docker/entrypoint.sh

RUN mkdir -p prisma public/uploads /app/data /app/.npm && \
    chmod +x /app/docker/entrypoint.sh && \
    chown -R nextjs:nodejs prisma public/uploads /app/data /app/.npm /app/docker

EXPOSE 3000

ENTRYPOINT ["/app/docker/entrypoint.sh"]
