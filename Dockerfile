# ═══════════════════════════════════════════════════════════════
# GG LOOP PLATFORM - PRODUCTION DOCKER IMAGE
# ═══════════════════════════════════════════════════════════════

# ────────────────────────────────────────────────────────────────
# STAGE 1: Builder - Compile TypeScript and build React
# ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install native dependencies for bcrypt and better-sqlite3
RUN apk add --no-cache python3 make g++ curl

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# Copy all source code
COPY . .

# Build frontend (Vite) and backend (esbuild)
RUN npm run build

# Verify build artifacts exist
RUN test -f dist/index.js || (echo "ERROR: Backend build failed - dist/index.js missing" && exit 1)
RUN test -d dist/assets || (echo "ERROR: Frontend build failed - dist/assets missing" && exit 1)

# ────────────────────────────────────────────────────────────────
# STAGE 2: Production - Minimal runtime image
# ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Add curl for healthchecks and dumb-init for proper signal handling
RUN apk add --no-cache curl dumb-init python3 make g++

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --production --legacy-peer-deps && \
    npm cache clean --force

# Copy built artifacts from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Copy server source (needed for runtime)
COPY --chown=nodejs:nodejs server ./server
COPY --chown=nodejs:nodejs shared ./shared

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Add metadata labels
LABEL org.opencontainers.image.title="GG Loop Platform" \
      org.opencontainers.image.description="Gaming rewards and community engagement platform" \
      org.opencontainers.image.vendor="GG Loop" \
      org.opencontainers.image.source="https://github.com/djjrip/gg-loop-platform"

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init for proper signal handling (graceful shutdown)
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/index.js"]
