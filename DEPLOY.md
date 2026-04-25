# 🚀 Deployment-Guide — AkkuBooster auf Digital Ocean

End-to-End Deployment auf einer einzelnen Ubuntu-VPS via Docker Compose + Caddy (Auto-HTTPS).

## Architektur

```
Internet
  ↓ :80 / :443
[Caddy]  ← Auto-HTTPS, Reverse Proxy
  ├─ dev.akkubooster.de        →  storefront:8001  (Next.js)
  └─ admin.dev.akkubooster.de  →  backend:9000     (Medusa)

Internes Docker-Netz:
  backend ↔ postgres:5432, redis:6379
  storefront ↔ backend:9000
```

**Sanity Studio** wird separat auf `*.sanity.studio` gehostet (siehe Schritt 7).

---

## 1️⃣  Droplet vorbereiten

### Empfehlung
- **Ubuntu 24.04 LTS**, **4 GB RAM** (Basic Premium AMD), Region **FRA1**
- Ein bestehendes 1-GB-Droplet **resizen** (Power off → Resize → CPU and RAM only).

### SSH einrichten
```bash
ssh root@<DROPLET-IP>

# Sicherheits-Basics
adduser akku
usermod -aG sudo akku
mkdir -p /home/akku/.ssh && cp ~/.ssh/authorized_keys /home/akku/.ssh/
chown -R akku:akku /home/akku/.ssh
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
```

### Docker installieren
```bash
ssh akku@<DROPLET-IP>
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# einmal aus- und wieder einloggen, damit die Gruppe greift
exit && ssh akku@<DROPLET-IP>
docker --version && docker compose version
```

---

## 2️⃣  DNS-Records setzen

In deinem DNS-Provider zwei A-Records auf die **Droplet-IP** zeigen lassen:

| Type | Name                 | Value           | TTL  |
|------|----------------------|-----------------|------|
| A    | `dev`                | `<DROPLET-IP>`  | 300  |
| A    | `admin.dev`          | `<DROPLET-IP>`  | 300  |

(Optional fuer `www.dev.akkubooster.de` einen weiteren A-Record.)

DNS-Propagation pruefen: `dig dev.akkubooster.de +short` → muss die Droplet-IP zurueckgeben, bevor Caddy ein TLS-Cert ziehen kann.

---

## 3️⃣  Repo klonen

```bash
ssh akku@<DROPLET-IP>
git clone https://github.com/ozturkyaser/akkubooster2.git
cd akkubooster2
```

> Falls Privat-Repo: SSH-Deploy-Key auf dem Droplet erzeugen
> (`ssh-keygen -t ed25519 -C "deploy@akkubooster"`) und in
> GitHub → Repo → Settings → Deploy keys hinzufuegen.

---

## 4️⃣  ENV-Datei anlegen

```bash
cp .env.production.example .env.production
nano .env.production
```

Mindestens diese Werte setzen:

| Variable                              | Wert                                                                  |
|---------------------------------------|-----------------------------------------------------------------------|
| `POSTGRES_PASSWORD`                   | `openssl rand -base64 32`                                             |
| `JWT_SECRET`                          | `openssl rand -base64 64`                                             |
| `COOKIE_SECRET`                       | `openssl rand -base64 64`                                             |
| `REVALIDATE_SECRET`                   | `openssl rand -hex 32`                                                |
| `SANITY_API_READ_TOKEN`               | aus Sanity Manage → API → Tokens (Read)                              |
| `STRIPE_API_KEY` / `STRIPE_WEBHOOK_…` | aus Stripe Dashboard                                                  |
| `PAYPAL_CLIENT_ID/SECRET`             | aus PayPal Developer Dashboard                                        |
| `ANTHROPIC_API_KEY`                   | aus console.anthropic.com                                            |
| `RESEND_API_KEY`                      | aus resend.com                                                       |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`  | **erst nach 1. Backend-Start** generieren — siehe Schritt 6           |

---

## 5️⃣  Erst-Deploy

```bash
./deploy.sh
```

Erwartete Dauer:
- Erster Build: **5–10 Minuten** (Node-Module + Next-Build)
- Folge-Deploys (Cache): **1–2 Minuten**

Caddy zieht beim ersten Request automatisch ein Let's Encrypt Zertifikat — kann 30–60 s dauern.

Pruefen:
```bash
docker compose ps                 # alle services up
docker compose logs -f backend    # Migrations + Server-Start
docker compose logs -f caddy      # TLS-Cert-Issuance
curl -I https://admin.dev.akkubooster.de/health
curl -I https://dev.akkubooster.de
```

---

## 6️⃣  Admin-User + Publishable Key anlegen

```bash
# Im Backend-Container:
docker compose exec backend npx medusa user -e admin@akkubooster.de -p "DEIN_STARKES_PASSWORT"
```

Dann auf `https://admin.dev.akkubooster.de/app` einloggen und unter
**Settings → Publishable API Keys** einen neuen Key erstellen.

Diesen Key in `.env.production` als `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` eintragen.

**Storefront neu bauen** (Key wird build-time eingebacken):
```bash
docker compose --env-file .env.production build storefront
docker compose --env-file .env.production up -d storefront
```

---

## 7️⃣  Sanity Studio deployen (separat, kostenlos)

Lokal (nicht auf dem Server):
```bash
cd studio
pnpm install
npx sanity login
npx sanity deploy
# Hostname waehlen, z.B.: akkubooster
```

Studio ist dann erreichbar unter `https://akkubooster.sanity.studio`.

---

## 8️⃣  Sanity Webhook fuer Live-Revalidate (optional)

Sanity Manage → Project → API → Webhooks → Create webhook:

- **URL**: `https://dev.akkubooster.de/api/revalidate?secret=<REVALIDATE_SECRET>`
- **Trigger**: Create / Update / Delete
- **Filter**: `_type in ["brandContent", "productContent", "homePage", "repairSettings", ...]`

So werden Storefront-Seiten sofort neu gerendert wenn du im Studio etwas aenderst.

---

## 🔁 Updates ausrollen

Nach jedem `git push` auf `main` einfach auf dem Server:
```bash
ssh akku@<DROPLET-IP>
cd akkubooster2
./deploy.sh
```

Optional: **Auto-Deploy via GitHub Actions + SSH** — sag Bescheid, dann baue ich das Workflow-File.

---

## 🧰 Troubleshooting

| Problem                               | Loesung                                                           |
|---------------------------------------|------------------------------------------------------------------|
| `caddy` faengt kein TLS-Cert ein      | DNS pruefen (`dig`), Port 80 in UFW offen, Caddy-Logs lesen     |
| `backend` startet nicht               | `docker compose logs backend` — meist DB nicht erreichbar oder Migrations fehlgeschlagen |
| Storefront zeigt alte Sanity-Daten    | Cache: `docker compose restart storefront` oder Webhook nutzen   |
| OOM (out of memory) waehrend Build    | Droplet auf 4 GB RAM upsizen oder Swap aktivieren               |
| `Publishable API Key` fehlt           | Schritt 6 ausfuehren                                              |

### Swap aktivieren (falls < 4 GB RAM)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🔐 Backup-Empfehlung

Postgres-Volume taeglich sichern:
```bash
docker compose exec -T postgres pg_dump -U postgres akkubooster | gzip > /home/akku/backups/db-$(date +%F).sql.gz
```

Cron-Eintrag (`crontab -e`):
```
0 3 * * * cd /home/akku/akkubooster2 && docker compose exec -T postgres pg_dump -U postgres akkubooster | gzip > /home/akku/backups/db-$(date +\%F).sql.gz && find /home/akku/backups -mtime +14 -delete
```

---

## 🌐 Spaeter auf Produktion umschalten

Wenn `dev.akkubooster.de` ablaeuft:

1. DNS: A-Record `akkubooster.de` und `admin.akkubooster.de` auf dieselbe IP.
2. `Caddyfile` editieren — Hosts hinzufuegen / umbenennen.
3. `.env.production` → `PUBLIC_*_URL`, `STORE_CORS`, `ADMIN_CORS` aktualisieren.
4. `./deploy.sh` ausfuehren.
