# Multi-stage Dockerfile for NestJS (TypeScript) + TypeORM
#
## Build stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (e.g., bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Remove dev dependencies but keep compiled native modules
RUN npm prune --omit=dev

## Runtime stage
FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy only what is needed to run
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Default port; can be overridden by environment
ENV PORT=3013
EXPOSE 3013

# Start the application
CMD ["node", "dist/main.js"]


