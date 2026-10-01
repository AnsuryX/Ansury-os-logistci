# ====================================================================
# ANSURY LOGISTICS OS — ENTERPRISE PRODUCTION DOCKERFILE
# Multi-stage production build optimized for Coolify & Container PaaS
# ====================================================================

# --------------------------------------------------------------------
# Stage 1: Build Frontend Assets
# --------------------------------------------------------------------
FROM node:22-slim AS builder

WORKDIR /app

# Install build essentials if needed
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Install package dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy application source code
COPY . .

# Build-time environment (injected as build args by Coolify)
# Client bundle only ever sees VITE_* publishable values — never service-role secrets.
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_PUBLISHABLE_KEY=""
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

# Build Vite production bundle to /app/dist
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production Runtime
# --------------------------------------------------------------------
FROM node:22-slim AS runner

WORKDIR /app

# Ensure security environment
ENV NODE_ENV=production
ENV PORT=3000

# curl is required by platform-injected (Coolify) container health probes
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Install runtime dependencies only
COPY package*.json ./
RUN npm install --omit=dev && npm install -g tsx || npm install

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy server entrypoint and essential configuration
COPY server.ts ./
COPY tsconfig.json ./
COPY .env.example ./

# Copy public static assets
COPY public ./public

# Expose standard application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode < 400) process.exit(0); else process.exit(1);})"

# Start production server
CMD ["npx", "tsx", "server.ts"]
