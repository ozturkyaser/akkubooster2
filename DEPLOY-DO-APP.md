# 🚀 Deployment-Guide — DigitalOcean App Platform

Vollautomatisches Deployment via Git-Push. Kein SSH, kein Docker-Wissen noetig.

---

## 📋 Architektur

```
Internet
  ├─ dev.akkubooster.de        →  storefront (Next.js)        $12/mo
  └─ admin.dev.akkubooster.de  →  backend    (Medusa)         $12/mo
                                       │
                                       ▼
                              akkubooster-db (Postgres)       $15/mo
                                                              ─────
                                                       Total ~$39/mo
```

**Sanity Studio** wird separat auf `*.sanity.studio` gehostet (kostenlos).

> Hinweis: App Platform erfordert keinen Redis — Medusa nutzt In-Memory Event Bus (OK fuer Dev/kleine Shops).
> Fuer Production-Last spaeter `redis: managed-redis` ergaenzen (~$15/mo).

---

## ⚡ Schnellstart (5 Minuten)

### 1. doctl CLI installieren
```bash
brew install doctl
doctl auth init       # API-Token aus DO Dashboard → API → Personal access tokens (write-Scope)
```

### 2. App erstellen
Im Repo-Root:
```bash
doctl apps create --spec .do/app.yaml
```

Die Ausgabe enthaelt eine `APP_ID` — speichere die irgendwo (oder spaeter via `doctl apps list`).

### 3. ENV-Secrets im DO Dashboard nachtragen

DO Dashboard → **Apps → akkubooster → Settings → App-Level Environment Variables**:

#### Backend Component
| Key                       | Wert generieren mit                    |
|---------------------------|----------------------------------------|
| `JWT_SECRET`              | `openssl rand -base64 64`              |
| `COOKIE_SECRET`           | `openssl rand -base64 64`              |
| `STRIPE_API_KEY`          | aus Stripe Dashboard                   |
| `STRIPE_WEBHOOK_SECRET`   | aus Stripe Dashboard                   |
| `PAYPAL_CLIENT_ID`        | aus PayPal Developer                   |
| `PAYPAL_CLIENT_SECRET`    | aus PayPal Developer                   |
| `ANTHROPIC_API_KEY`       | aus console.anthropic.com              |
| `RESEND_API_KEY`          | aus resend.com                         |

#### Storefront Component
| Key                                  | Wert                                          |
|--------------------------------------|-----------------------------------------------|
| `SANITY_API_READ_TOKEN`              | aus sanity.io/manage → API → Tokens          |
| `NEXT_PUBLIC_STRIPE_KEY`             | aus Stripe Dashboard                          |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID`       | aus PayPal Developer                          |
| `REVALIDATE_SECRET`                  | `openssl rand -hex 32`                        |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | **erst nach Schritt 5 setzen**                |

> ⚠️ Alle Keys mit echten Secrets als **Type: SECRET** markieren — werden dann verschluesselt gespeichert.

### 4. DNS bei deinem Provider

DO gibt nach App-Erstellung einen DNS-Wert vor (entweder eine IP oder `*.ondigitalocean.app` CNAME). Im DO Dashboard unter **Settings → Domains** zu sehen.

Dann bei deinem DNS-Provider (z.B. Strato, Hetzner, Cloudflare):

| Type  | Name        | Value                                   |
|-------|-------------|-----------------------------------------|
| CNAME | `dev`       | `<dein-app>.ondigitalocean.app`         |
| CNAME | `admin.dev` | `<dein-app>.ondigitalocean.app`         |

DO macht TLS automatisch via Let's Encrypt — kann 5-15 min dauern.

### 5. Admin-User + Publishable Key

Nach erstem erfolgreichem Deploy (siehe DO Dashboard → Activity):

```bash
# Console im Backend-Container oeffnen
doctl apps create-deployment <APP_ID>           # Re-Deploy nach ENV-Aenderung
# Oder im DO Dashboard: backend → Console
```

Im Browser **Console** des `backend`-Service oeffnen und ausfuehren:
```bash
npx medusa user -e admin@akkubooster.de -p "DEIN_STARKES_PASSWORT"
```

Dann:
1. https://admin.dev.akkubooster.de/app oeffnen → einloggen
2. **Settings → Publishable API Keys → Create**
3. Den Key kopieren
4. Im DO Dashboard bei Storefront-Component als `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (Type: SECRET) eintragen
5. **Apps → ... → Actions → Deploy** (Storefront muss neu gebaut werden, weil der Key build-time eingebacken wird!)

---

## 🔁 Updates ausrollen

```bash
git push origin main
```

**Das war's.** App Platform sieht den Push, baut neu, deployed. Fortschritt in DO Dashboard → Activity.

---

## 🛠️ Spec-Aenderungen

Wenn du was an `.do/app.yaml` aenderst:

```bash
doctl apps update <APP_ID> --spec .do/app.yaml
```

Oder DO Dashboard → App → **Settings → App Spec → Edit**.

---

## 🌐 Sanity Studio deployen (separat, kostenlos)

Lokal (nicht in DO):
```bash
cd studio
pnpm install
npx sanity login
npx sanity deploy
# Hostname waehlen, z.B.: akkubooster
```

→ erreichbar unter `https://akkubooster.sanity.studio`.

---

## 🔔 Sanity → Storefront Live-Revalidate (optional)

Sanity Manage → API → Webhooks → Create:
- **URL**: `https://dev.akkubooster.de/api/revalidate?secret=<REVALIDATE_SECRET>`
- **Trigger**: Create / Update / Delete
- **Filter**: `_type in ["brandContent", "productContent", "homePage", "repairSettings"]`

---

## 💸 Kosten-Optimierung

| Setup                          | Pro Monat      |
|--------------------------------|----------------|
| **Aktuelle Spec**              | ~$39/mo        |
| Backend `basic-xxs` (512 MB)*  | -$5/mo (riskant fuer Medusa) |
| Postgres → eigener Container im Backend | -$15/mo (verliert Auto-Backup) |

*) Medusa Builds koennen mit 512 MB OOM-killen — nicht empfohlen.

**Alternative**: Single-VPS via Docker Compose (siehe [`DEPLOY.md`](./DEPLOY.md)) → ~$24/mo.

---

## 🧰 Troubleshooting

| Problem                                  | Loesung                                                          |
|------------------------------------------|------------------------------------------------------------------|
| Build schlaegt fehl: "out of memory"     | Instance-Size temporaer auf `basic-s` (2 GB) hochsetzen, danach zurueck |
| `health_check` failed                    | Logs in DO Dashboard pruefen → meist `JWT_SECRET`/`COOKIE_SECRET` fehlt |
| Storefront zeigt "missing publishable key" | Schritt 5 nicht ausgefuehrt — Key setzen + Storefront neu deployen |
| `cannot find module '@akkubooster/sanity-shared'` | Workspace-Symlinks: Pruefen ob `pnpm install --filter ...` im Dockerfile alle deps zieht |
| TLS-Cert kommt nicht                     | DNS pruefen mit `dig dev.akkubooster.de`, CNAME muss auf `*.ondigitalocean.app` zeigen |

---

## 🔐 Backup (managed Postgres)

App Platform Dev-Database hat **keine** Auto-Backups. Manuell taeglich:
```bash
doctl databases backups list <DB_CLUSTER_ID>     # Liste
# Manuell triggern:
doctl databases connection <DB_CLUSTER_ID>       # Conn-String holen
pg_dump <CONN_STRING> | gzip > backup-$(date +%F).sql.gz
```

Fuer echtes Production: Database auf `production: true` stellen → +$15/mo, dafuer Auto-Backups + 99.95% SLA.

---

## 📞 Wann was nutzen?

| Use-Case                              | Empfehlung               |
|---------------------------------------|--------------------------|
| Dev-Phase / kleine Shops              | **App Platform** (diese Anleitung) |
| Volle Kontrolle, billig               | Docker Compose + VPS ([DEPLOY.md](./DEPLOY.md)) |
| Hochverfuegbar, mehrere Regionen      | App Platform Production-Tier |
