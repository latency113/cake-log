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

RUN apt-get update && apt-get install -y curl ca-certificates gnupg --no-install-recommends \
    && install -d /usr/share/postgresql-common/pgdg \
    && curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt trixie-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update && apt-get install -y postgresql-client-18 --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/providers/database/generated ./src/providers/database/generated

EXPOSE 3001
ENV PORT=3001
CMD [ "bun", "start" ]