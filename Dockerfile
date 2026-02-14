# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY src ./src
RUN bun build ./src/index.ts --outdir ./dist --target node

# Runtime stage
FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

# /app/data will be mounted as volume for persistence
RUN mkdir -p /app/data

ENV NODE_ENV=production

CMD ["bun", "run", "dist/index.js"]
