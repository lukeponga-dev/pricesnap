# Multi-stage production Dockerfile for PriceSnap
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code and configuration
COPY . .

# Run production build (Vite client + esbuild bundled server.cjs)
RUN npm run build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies and built assets
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Security: run as non-root user
USER node

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
