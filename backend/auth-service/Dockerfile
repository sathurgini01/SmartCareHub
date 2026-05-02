# ── Stage 1: Install dependencies ─────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ── Stage 2: Production image ──────────────────────────────────────────────
FROM node:18-alpine AS production
WORKDIR /app

# Non-root user for security
RUN apk add --no-cache ca-certificates
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Ownership to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=production
EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5001/ || exit 1

CMD ["node", "src/server.js"]
