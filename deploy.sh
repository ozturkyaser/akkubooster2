#!/usr/bin/env bash
# ============================================
# AkkuBooster — Production Deploy Script
# Wird auf dem VPS ausgefuehrt (nicht lokal!)
# ============================================
set -euo pipefail

cd "$(dirname "$0")"

echo "▶ 1/5  Pulling latest code …"
git fetch --all
git reset --hard origin/main

if [ ! -f .env.production ]; then
  echo "❌ .env.production fehlt — bitte erstellen (siehe .env.production.example)"
  exit 1
fi

echo "▶ 2/5  Building Docker images (cached, kann beim ersten Mal 5–10 min dauern) …"
docker compose --env-file .env.production build

echo "▶ 3/5  Starting/Updating containers …"
docker compose --env-file .env.production up -d --remove-orphans

echo "▶ 4/5  Pruning old images …"
docker image prune -f >/dev/null

echo "▶ 5/5  Status:"
docker compose ps

echo ""
echo "✅ Deploy fertig."
echo "   Logs:    docker compose logs -f"
echo "   Restart: docker compose restart <service>"
echo "   Shell:   docker compose exec backend sh"
