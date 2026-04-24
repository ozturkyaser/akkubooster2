# AkkuBooster

Medusa 2.0 Commerce-Plattform für AkkuBooster — E-Bike & E-Scooter Akku-Reparatur,
Zellentausch, Diagnose. Migration von Shopify mit Design-Referenz batterybros.de.

## Struktur

```
akkubooster/
├── backend/      Medusa 2.0 (Node, TypeScript)
├── storefront/   Next.js 15 Storefront
└── PLAN.md       Detaillierter Migrationsplan
```

## Stack

- **Backend:** Medusa 2.0, PostgreSQL (Supabase), Redis (Upstash)
- **Storefront:** Next.js 15, Tailwind v4, shadcn/ui
- **Payments:** Stripe, PayPal
- **AI:** Claude Sonnet 4.6 (Foto-Diagnose)
- **Search:** MeiliSearch
- **Hosting:** Vercel (FE) + Railway (BE) + Supabase (DB)

## Entwicklung

```bash
pnpm install
pnpm dev          # startet backend + storefront parallel
```

Siehe `PLAN.md` für den vollständigen Migrationsplan.
