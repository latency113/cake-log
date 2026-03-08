FROM --platform=linux/amd64 oven/bun:1 AS builder
WORKDIR /app
COPY ./package.json ./bun.lock ./
COPY .env .env
RUN bun i
COPY . .
RUN bun x prisma generate
RUN bun run build
# CMD [ "bun", "start" ]

FROM --platform=linux/amd64 oven/bun:1 AS app
WORKDIR /app
COPY ./package.json ./bun.lock ./
COPY .env .env
RUN bun install
RUN apt-get update && apt-get install -y ca-certificates gnupg2 curl lsb-release --no-install-recommends && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /etc/apt/keyrings/postgresql.asc && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/postgresql.asc] http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list >/dev/null && \
    apt-get update && \
    apt-get install -y postgresql-client-18
EXPOSE 3001
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/src/providers/database/generated /app/src/providers/database/generated
CMD [ "bun", "start" ]
