# syntax=docker/dockerfile:1
# ============================================
# AkkuBooster Backend (Medusa 2.0) — Production
# ============================================

# ---- Stage 1: deps ----
FROM node:20-alpine AS deps
WORKDIR /app

# pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Workspace-Files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json backend/package.json
COPY storefront/package.json storefront/package.json
COPY studio/package.json studio/package.json
COPY packages packages

# Nur Backend-Dependencies installieren (workspace-aware)
RUN pnpm install --frozen-lockfile --filter backend...

# ---- Stage 2: builder ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/packages ./packages

# Workspace-Files (Lockfile wieder mitkopieren fuer pnpm-Skripte)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend ./backend

# Medusa Build (Admin + Server kompilieren)
WORKDIR /app/backend
RUN pnpm build

# ---- Stage 3: runner ----
FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate \
    && apk add --no-cache curl

ENV NODE_ENV=production

# Medusa baut nach .medusa/server — das ist der Production-Output
COPY --from=builder /app/backend/.medusa/server ./
COPY --from=builder /app/backend/package.json ./package.json

# Production-Dependencies fuer .medusa/server installieren
RUN pnpm install --prod

# Skripte (Migrations / Seeds) bleiben aus dem Backend-Source
COPY backend/src ./src

EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:9000/health || exit 1

# Migrations werden vor Start ausgefuehrt (siehe docker-compose entrypoint).
CMD ["sh", "-c", "npx medusa db:migrate && npx medusa start"]
