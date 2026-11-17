# Stage 1: Builder
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun x prisma generate
RUN bun run build

# Stage 2: Production App
FROM oven/bun:1 AS app
WORKDIR /app

# ติดตั้ง postgresql-client
RUN apt-get update && apt-get install -y postgresql-client --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/providers/database/generated ./src/providers/database/generated

EXPOSE 3001
ENV PORT=3001
CMD [ "bun", "start" ]