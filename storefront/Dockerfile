# syntax=docker/dockerfile:1
# ============================================
# AkkuBooster Storefront (Next.js 15) — Production
# ============================================

# ---- Stage 1: deps ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY storefront/package.json storefront/package.json
COPY backend/package.json backend/package.json
COPY studio/package.json studio/package.json
COPY packages packages

RUN pnpm install --frozen-lockfile --filter storefront...

# ---- Stage 2: builder ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/storefront/node_modules ./storefront/node_modules
COPY --from=deps /app/packages ./packages

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY storefront ./storefront

# Build-time ENV (NEXT_PUBLIC_* werden in den Client-Bundle gebacken)
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_REGION
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ARG NEXT_PUBLIC_SANITY_STUDIO_URL
ARG NEXT_PUBLIC_STRIPE_KEY
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION
ENV NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID
ENV NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET
ENV NEXT_PUBLIC_SANITY_STUDIO_URL=$NEXT_PUBLIC_SANITY_STUDIO_URL
ENV NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/storefront
RUN pnpm build

# ---- Stage 3: runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache curl \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone-Output von Next.js (siehe next.config.js: output: "standalone")
COPY --from=builder --chown=nextjs:nodejs /app/storefront/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/storefront/.next/static ./storefront/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/storefront/public ./storefront/public

USER nextjs
EXPOSE 8001
ENV PORT=8001
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:8001 || exit 1

CMD ["node", "storefront/server.js"]
