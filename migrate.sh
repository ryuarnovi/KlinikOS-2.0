#!/bin/bash
# =============================================================
# migrate.sh - Klinikos Database Migration & Seed Script
# =============================================================
# Usage:
#   ./migrate.sh             -> migrate ke PostgreSQL Docker container
#   ./migrate.sh local       -> migrate ke PostgreSQL lokal (port 5432)
#   ./migrate.sh clean       -> drop & recreate database, lalu migrate
# =============================================================

set -e

DB_USER="postgres"
DB_PASS="root210605"
DB_NAME="klinikos"
DB_PORT="5432"
SCHEMA_FILE="./schema.sql"

# Cek apakah schema.sql ada
if [ ! -f "$SCHEMA_FILE" ]; then
  echo "❌ File $SCHEMA_FILE tidak ditemukan! Pastikan kamu jalankan script ini dari root folder Klinikos."
  exit 1
fi

MODE="${1:-docker}"

run_psql() {
  local HOST=$1
  PGPASSWORD="$DB_PASS" psql \
    -h "$HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -f "$SCHEMA_FILE"
}

run_psql_cmd() {
  local HOST=$1
  local CMD=$2
  PGPASSWORD="$DB_PASS" psql \
    -h "$HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -c "$CMD"
}

case "$MODE" in
  docker)
    echo "🐳 Menjalankan migrasi ke database Docker container..."
    echo "   Container: klinikos_db"

    # Cek container berjalan
    if ! docker ps --format '{{.Names}}' | grep -q "klinikos_db"; then
      echo "🚨 Container klinikos_db tidak ditemukan atau tidak berjalan."
      echo "   Jalankan dulu: docker compose up -d db"
      echo ""
      echo "   Atau untuk jalankan semua: docker compose up -d"
      exit 1
    fi

    echo "📋 Menjalankan schema.sql via docker exec..."
    docker exec -i klinikos_db psql -U "$DB_USER" -d "$DB_NAME" < "$SCHEMA_FILE"
    echo ""
    echo "✅ Migrasi selesai!"
    echo ""
    echo "🔐 Akun Seed yang tersedia:"
    echo "   username: admin        | password: root210605 | role: admin"
    echo "   username: dokter       | password: root210605 | role: dokter"
    echo "   username: apoteker    | password: root210605 | role: apoteker"
    echo "   username: kasir        | password: root210605 | role: kasir"
    echo "   username: resepsionis  | password: root210605 | role: resepsionis"
    ;;

  local)
    echo "🖥️  Menjalankan migrasi ke PostgreSQL lokal (localhost:5432)..."
    run_psql "localhost"
    echo ""
    echo "✅ Migrasi lokal selesai!"
    ;;

  clean)
    echo "⚠️  Mode CLEAN: Database '$DB_NAME' akan di-drop dan dibuat ulang..."
    read -p "   Yakin? (y/N) " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
      echo "❌ Dibatalkan."
      exit 0
    fi

    echo "🗑️  Drop database..."
    docker exec -i klinikos_db psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;" postgres || true
    echo "🆕 Create database..."
    docker exec -i klinikos_db psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" postgres
    echo "📋 Menjalankan schema.sql..."
    docker exec -i klinikos_db psql -U "$DB_USER" -d "$DB_NAME" < "$SCHEMA_FILE"
    echo ""
    echo "✅ Clean migrate selesai!"
    ;;

  *)
    echo "❌ Mode tidak dikenal: $MODE"
    echo "   Gunakan: ./migrate.sh [docker|local|clean]"
    exit 1
    ;;
esac
