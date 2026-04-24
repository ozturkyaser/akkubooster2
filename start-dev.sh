#!/bin/bash
# AkkuBooster Dev-Umgebung starten
# Usage: ./start-dev.sh

set -e

echo "🔋 AkkuBooster Dev-Umgebung wird gestartet..."

# 1. Docker prüfen
echo "🐳 Prüfe Docker..."
if ! docker ps > /dev/null 2>&1; then
  echo "⚠️  Docker läuft nicht. Starte Docker Desktop..."
  open -a "Docker Desktop"
  echo "   Warte auf Docker..."
  for i in $(seq 1 60); do
    if docker ps > /dev/null 2>&1; then
      echo "   ✅ Docker bereit!"
      break
    fi
    sleep 2
  done
  if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker konnte nicht gestartet werden. Bitte manuell starten."
    exit 1
  fi
fi

# 2. PostgreSQL Container starten
echo "🐘 Starte PostgreSQL..."
if ! docker ps | grep -q akkubooster-postgres; then
  docker run -d \
    --name akkubooster-postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=akkubooster \
    -e POSTGRES_DB=akkubooster \
    -p 5433:5432 \
    --restart unless-stopped \
    postgres:16-alpine 2>/dev/null || docker start akkubooster-postgres 2>/dev/null
  echo "   Warte auf PostgreSQL..."
  sleep 3
fi
echo "   ✅ PostgreSQL auf Port 5433"

# 3. Backend starten
echo "🖥️  Starte Medusa Backend..."
cd "$(dirname "$0")/backend"
npm run dev > /tmp/akkubooster-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# 4. Storefront starten
echo "🌐 Starte Next.js Storefront..."
cd "$(dirname "$0")/storefront"
npm run dev > /tmp/akkubooster-storefront.log 2>&1 &
STOREFRONT_PID=$!
echo "   Storefront PID: $STOREFRONT_PID"

# 5. Studio starten
echo "🎨 Starte Sanity Studio..."
cd "$(dirname "$0")/studio"
npm run dev > /tmp/akkubooster-studio.log 2>&1 &
STUDIO_PID=$!
echo "   Studio PID: $STUDIO_PID"

# Warte auf Backend
echo ""
echo "⏳ Warte auf Backend..."
for i in $(seq 1 30); do
  if curl -s http://localhost:9002/store/regions 2>/dev/null | grep -q "regions"; then
    echo "   ✅ Backend bereit!"
    break
  fi
  sleep 2
done

echo ""
echo "============================================"
echo "🔋 AkkuBooster läuft!"
echo "============================================"
echo "  Backend:    http://localhost:9002"
echo "  Storefront: http://localhost:8001"
echo "  Studio:     http://localhost:3333"
echo "  Admin:      http://localhost:9002/app"
echo "============================================"
echo ""
echo "Logs: tail -f /tmp/akkubooster-backend.log"
echo "Stop: kill $BACKEND_PID $STOREFRONT_PID $STUDIO_PID"
