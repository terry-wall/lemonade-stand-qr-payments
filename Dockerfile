FROM node:22-slim AS builder
ENV DEBIAN_FRONTEND=noninteractive
RUN (test -f /var/lib/dpkg/statoverride && sed -i '/messagebus/d' /var/lib/dpkg/statoverride || true) && \
    apt-get update && apt-get install -y --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" dumb-init libssl3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build
# Fail here rather than shipping an image that crash-loops at startup: the
# runtime stage copies these two binaries and cannot download replacements.
RUN test -x node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x && \
    test -f node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node

FROM node:22-slim
ENV DEBIAN_FRONTEND=noninteractive
RUN (test -f /var/lib/dpkg/statoverride && sed -i '/messagebus/d' /var/lib/dpkg/statoverride || true) && \
    apt-get update && apt-get install -y --no-install-recommends -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" dumb-init libssl3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Copy standalone output
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# Copy Prisma runtime files (engine + schema + migrations)
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=node:node /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=node:node /app/prisma ./prisma
ENV PORT=3000 NODE_ENV=production HOSTNAME=0.0.0.0
# Guarantee the engine directory exists and belongs to the runtime user. COPY
# --chown only covers copied content, so a differently-built tree can leave this
# root-owned and Prisma then fails with "Can't write to .../@prisma/engines".
RUN mkdir -p /app/node_modules/@prisma/engines && \
    chown -R node:node /app/node_modules/@prisma /app/node_modules/.prisma
# Point Prisma at the engines copied above. Without these it probes for them and
# falls back to downloading into node_modules, which fails as non-root with
# "Can't write to /app/node_modules/@prisma/engines".
ENV PRISMA_SCHEMA_ENGINE_BINARY=/app/node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x \
    PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:'+process.env.PORT+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
ENTRYPOINT ["dumb-init", "--"]
# Apply pending migrations, then start. `migrate deploy` only replays committed
# migrations — unlike `db push --accept-data-loss`, it will never drop a column.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
