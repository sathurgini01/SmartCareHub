# ── Stage 1: Install dependencies ─────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ── Stage 2: Production image ──────────────────────────────────────────────
FROM node:18-alpine AS production
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create uploads directory
RUN mkdir -p src/uploads && chown -R appuser:appgroup /app

# Copy only production node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

RUN chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=production
EXPOSE 5002

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5002/api/patients/ || exit 1

CMD ["node", "server.js"]
