# AkkuBooster — Shopify → Medusa 2.0 Migration Plan

> **Ziel:** akkubooster.de von Shopify auf Medusa 2.0 umstellen, Design/UX
> orientiert an batterybros.de, mit vollem Funktionsumfang zum Launch.

---

## 1. Entscheidungen (fixiert)

| Bereich | Entscheidung |
|---|---|
| Scope | Voller Funktionsumfang wie Referenz |
| Must-Haves | KI-Foto-Diagnose, Symptom-Navigator, Live Repair-Tracking, 110+ Marken |
| Hosting FE | Vercel |
| Hosting BE | Railway |
| Datenbank | Supabase (Postgres) |
| Repo | Monorepo (pnpm workspaces) |
| Regionen | DE, AT, CH |
| Sprache | Deutsch (i18n vorbereitet) |

---

## 2. Tech-Stack

### Backend (`/backend`)
- **Medusa 2.0** (Node 20+, TypeScript)
- **PostgreSQL** via Supabase
- **Redis** (Upstash) für Events, Cache, Workflows
- **Stripe** (Karte, Klarna, Apple/Google Pay, SEPA)
- **PayPal**
- **DHL** Versand-Provider
- **Resend** für Transaktions-Emails
- **S3-kompatibles Storage** (Supabase Storage oder R2) für Bilder
- **MeiliSearch** (Railway oder Self-Hosted) für Such-Index

### Storefront (`/storefront`)
- **Next.js 15** App Router, TypeScript
- **Tailwind CSS v4**
- **shadcn/ui** Komponenten
- **next-themes** Dark/Light Mode
- **next-intl** i18n Vorbereitung
- **Framer Motion** Animationen

### Custom Module Backend
- `brand` — Hersteller (Bosch, Bosch, Shimano, …)
- `vehicle-model` — Fahrzeugmodelle pro Marke
- `symptom` — Symptom-Katalog mit Empfehlungen
- `repair-order` — Reparatur-Workflow & Status-Tracking
- `diagnosis` — KI-Foto-Diagnose Ergebnisse
- `compatibility` — Marke/Modell → kompatible Akkus/Services

### AI
- **Claude Sonnet 4.6** via `@anthropic-ai/sdk` für KI-Foto-Diagnose

---

## 3. Datenmodell (Custom Modules)

### `Brand`
```
id, handle, name, logo_url, description, country, founded_year,
is_featured, product_count, created_at, updated_at
```

### `VehicleModel`
```
id, brand_id (FK), name, type (ebike|escooter|ecargo|emoped),
year_from, year_to, battery_voltage, battery_capacity_wh,
image_url, metadata, created_at
```

### `Symptom`
```
id, handle, title, description, severity (info|warning|critical),
icon, recommended_service_id, diagnostic_questions (jsonb),
related_products (array), created_at
```

### `RepairOrder`
```
id, order_id (Medusa Order FK), customer_id, status
  (received|diagnosing|quoted|approved|in_repair|testing|shipped|completed),
brand_id, vehicle_model_id, symptoms (array),
intake_photos (array of urls), diagnosis_id (FK),
quote_amount, final_amount, warranty_until,
tracking_number, tracking_url,
notes, timeline (jsonb — status changes w/ timestamps),
created_at, updated_at
```

### `Diagnosis`
```
id, repair_order_id (FK), photos (array),
ai_brand_detected, ai_model_detected, ai_damage_description,
ai_confidence, ai_recommended_services (array),
technician_notes, created_at
```

---

## 4. API Routes (Custom)

### Public (`/storefront` nutzt diese)
- `GET /store/brands` — Liste Marken (paginiert, filterbar)
- `GET /store/brands/:handle` — Brand-Detailseite
- `GET /store/symptoms` — Symptom-Liste
- `GET /store/symptoms/:handle` — Symptom-Detail + Empfehlung
- `POST /store/diagnosis/ai-photo` — KI-Foto-Diagnose Upload + Analyse
- `POST /store/repair-orders` — Reparatur-Auftrag anlegen
- `GET /store/repair-orders/:id` — Status (für authentifizierten Kunden)
- `GET /store/vehicle-models?brand=` — Modelle pro Marke

### Admin (nur `/app`)
- `POST /admin/repair-orders/:id/status` — Status ändern
- `POST /admin/repair-orders/:id/quote` — Angebot erstellen
- `POST /admin/diagnosis/:id/review` — Techniker-Review

---

## 5. Storefront-Seiten

| Route | Beschreibung |
|---|---|
| `/` | Homepage (16 Sektionen wie Referenz) |
| `/marken` | Marken-Übersicht (110+) |
| `/marken/[handle]` | Marken-Detail (Services + kompatible Akkus) |
| `/symptome` | Symptom-Navigator (Grid) |
| `/symptome/[handle]` | Symptom-Detail + Empfehlung |
| `/reparatur` | Reparatur-Service Übersicht |
| `/ersatzakku` | Ersatzakku-Kauf |
| `/ki-check` | KI-Foto-Diagnose (Upload-Flow) |
| `/ratgeber` | Blog/Guides |
| `/ratgeber/[slug]` | Blog-Artikel |
| `/vergleich` | Reparatur vs. Neukauf Vergleichs-Tool |
| `/b2b` | B2B Portal |
| `/ueber-uns` | About |
| `/kontakt` | Kontakt |
| `/werkstatt-berlin` | Lokale Werkstatt-Seite |
| `/faq` | FAQ Accordion |
| `/account` | Kundenkonto |
| `/account/bestellungen` | Bestell-Historie |
| `/account/reparatur/[id]` | Live Repair-Tracking |
| `/checkout/*` | Warenkorb & Checkout |
| `/legal/*` | Impressum, AGB, DSGVO, Batteriegesetz, Widerruf |

---

## 6. Homepage-Sektionen (mapped)

1. **Header** — Logo, Nav (Reparatur, Ersatzakku, Marken, Symptome, Ratgeber, Vergleich, B2B), Search, Account, Cart
2. **Hero** — Headline, Subline, Dual-CTA (KI-Check + Marke wählen)
3. **Device-Selector** — Toggle (E-Bike / E-Scooter / E-Cargo) + Marken-Quicklinks
4. **Key-Stats** — 4 Zahlen (reparierte Akkus, Zufriedenheit, 24h-Diagnose, Versand)
5. **Positionierung** — Text mit 110+ Marken, ab-Preis
6. **Service-Cards** — 4 Cards (Reparatur, Ersatzakku, Kostenlos-Check, B2B)
7. **4-Schritte-Prozess** — Timeline (Einsenden → Diagnose → Reparatur → Rückversand)
8. **Marken-Grid** — 50+ Logos mit "Alle anzeigen" Link
9. **Symptom-Grid** — 10 klickbare Problemkategorien
10. **Warum-wir** — Vergleichstabelle vs. Wettbewerb
11. **Testimonials** — Bewertungs-Karussell
12. **Trust-Indicators** — 6 USPs (Zertifikat, KI, Versand, Preise, Nachhaltigkeit, Tracking)
13. **Foto-Upload-CTA** — Große CTA für KI-Check
14. **FAQ** — Accordion, 6-8 Fragen
15. **Final CTA** — Dual-Button (Check + Marke)
16. **Footer** — 4 Spalten (Service, Wissen, Legal, Kontakt) + Social

---

## 7. KI-Foto-Diagnose Flow

```
User auf /ki-check
  ↓
Upload 1-3 Fotos (drag & drop, max 10MB)
  ↓
POST /store/diagnosis/ai-photo
  ↓ Backend
  1. Bilder zu S3 hochladen
  2. Claude Vision API: Brand, Model, Damage, Confidence
  3. Matching gegen Brand + VehicleModel Tabelle
  4. Empfohlene Services bestimmen
  5. Diagnosis-Record speichern
  ↓
Response: { brand, model, damage, confidence, recommended_services }
  ↓
Frontend: Ergebnis-Karte + CTA "Reparatur-Auftrag starten"
  ↓
Wenn Kunde fortsetzt → RepairOrder anlegen (Status: received)
```

**System-Prompt für Claude Vision:** strukturiert, erzwingt JSON-Output mit
`brand`, `model`, `visible_damage`, `confidence_score`, `suggested_services`.

---

## 8. Migrations-Strategie (Shopify → Medusa)

### Export aus Shopify
- Admin → Products (CSV)
- Admin → Customers (CSV, DSGVO!)
- Admin → Orders (CSV) — nur Referenz, nicht live-migrieren
- Bilder per `shopify-download-script` oder manuell
- Collection/Marken-Mapping

### Import in Medusa
- Script `/backend/src/scripts/import-shopify.ts`
  - Marken aus Shopify-Collections → `Brand` Module
  - Produkte (Service-Produkte) → Medusa Products
  - Bilder S3-Upload
  - Kunden → Medusa Customer (passwordless, nächster Login = Reset)
- **Alte Bestellungen bleiben read-only in Shopify** (archiv), nicht migriert

### SEO / 301 Redirects
- URL-Map alt → neu in `/storefront/middleware.ts`
- Sitemap.xml neu generieren
- Google Search Console Property-Change

---

## 9. Datenschutz / Legal DE

- DSGVO: Datenschutzerklärung, Cookie-Banner (Consent Mode v2)
- Impressum (§5 TMG)
- AGB, Widerrufsbelehrung
- **Batteriegesetz (BattG)** Hinweise Pflicht!
- VerpackG Registrierung verweisen
- Transparenzerklärung KI (Claude Vision nutzt keine Nutzerdaten zum Training)

---

## 10. Repo-Struktur

```
/akkubooster
├── PLAN.md                    ← dieser Plan
├── README.md
├── package.json               (monorepo root)
├── pnpm-workspace.yaml
├── .gitignore
├── .env.example
├── .nvmrc
│
├── backend/                   Medusa 2.0
│   ├── src/
│   │   ├── modules/
│   │   │   ├── brand/
│   │   │   ├── vehicle-model/
│   │   │   ├── symptom/
│   │   │   ├── repair-order/
│   │   │   └── diagnosis/
│   │   ├── api/
│   │   │   ├── store/
│   │   │   └── admin/
│   │   ├── workflows/
│   │   ├── subscribers/
│   │   ├── jobs/
│   │   └── scripts/
│   │       └── import-shopify.ts
│   ├── medusa-config.ts
│   └── package.json
│
├── storefront/                Next.js 15
│   ├── src/
│   │   ├── app/
│   │   │   ├── (main)/
│   │   │   ├── (checkout)/
│   │   │   ├── account/
│   │   │   └── api/
│   │   ├── components/
│   │   │   ├── ui/            (shadcn)
│   │   │   ├── layout/
│   │   │   ├── home/          (16 Sektionen)
│   │   │   ├── brand/
│   │   │   ├── symptom/
│   │   │   ├── diagnosis/     (KI-Upload)
│   │   │   └── repair-tracker/
│   │   ├── lib/
│   │   │   ├── medusa-client.ts
│   │   │   └── utils.ts
│   │   └── styles/
│   ├── public/
│   ├── tailwind.config.ts
│   └── package.json
│
└── packages/                  (optional shared)
    └── types/                 Shared TS types
```

---

## 11. Umsetzungs-Phasen

| Phase | Inhalt | Artefakt |
|---|---|---|
| **0 — Setup** | Monorepo, Repo-Struktur, .env | dieser Commit |
| **1 — Backend Skeleton** | Medusa init, DB connect, Basic Auth | lauffähiges `/backend` |
| **2 — Custom Modules** | Brand, VehicleModel, Symptom, RepairOrder, Diagnosis | 5 Module + Migrations |
| **3 — Admin API** | Routen für RepairOrder Verwaltung | Admin-Routes |
| **4 — Store API** | Public Endpoints | Store-Routes |
| **5 — Shopify Import** | Daten migrieren | Script |
| **6 — Storefront Skeleton** | Next.js init, Theme, Layout | lauffähiges `/storefront` |
| **7 — Homepage** | Alle 16 Sektionen | `/` |
| **8 — Marken & Symptome** | Listing + Detail Pages | `/marken`, `/symptome` |
| **9 — KI-Diagnose** | Upload-UI + Anthropic Integration | `/ki-check` |
| **10 — Checkout** | Cart, Checkout, Payment | funktionierender Kaufflow |
| **11 — Account + Tracking** | Login, Order-Historie, Repair-Tracker | `/account/*` |
| **12 — Content** | Blog, FAQ, Legal, Footer-Seiten | CMS + statische Seiten |
| **13 — QA, SEO, a11y** | Tests, Lighthouse, WCAG | grüner Lighthouse |
| **14 — Go-Live** | DNS, Monitoring, Sentry | live |

---

## 12. Secrets / ENV

```
# Backend
DATABASE_URL=postgres://...       (Supabase)
REDIS_URL=...                     (Upstash)
JWT_SECRET=
COOKIE_SECRET=
STRIPE_API_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
RESEND_API_KEY=
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
ANTHROPIC_API_KEY=
MEDUSA_ADMIN_CORS=
STORE_CORS=

# Storefront
NEXT_PUBLIC_MEDUSA_BACKEND_URL=
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_KEY=
NEXT_PUBLIC_BASE_URL=
```

---

## 13. Was ich von dir noch brauche

| Was | Wann |
|---|---|
| Shopify Admin Access ODER Export-CSVs (Products, Customers, Collections) | vor Phase 5 |
| Logo, Brand-Assets, Schriftarten (falls vorhanden) | vor Phase 7 |
| Finale Liste der Symptome (10+) | vor Phase 2 |
| Liste zusätzlicher Marken (Ziel 110+) | vor Phase 5 |
| Preise pro Service (Zellentausch, Balancing, Diagnose, Boost) | vor Phase 5 |
| Supabase Projekt (Organization wählen) | vor Phase 1 |
| Stripe Account + API Keys | vor Phase 10 |
| Anthropic API Key | vor Phase 9 |
