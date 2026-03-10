#!/bin/bash
# =============================================================
# migrate-local.sh - Migrate langsung ke PostgreSQL Lokal
# Tidak butuh Docker - jalankan ini jika PostgreSQL sudah install di Mac
# =============================================================
# Cara penggunaan:
#   ./migrate-local.sh
#
# Atau dengan credentials custom:
#   DB_USER=myuser DB_PASS=mypass DB_NAME=mydb ./migrate-local.sh
# =============================================================

DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-root210605}"
DB_NAME="${DB_NAME:-klinikos}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "🔧 Klinikos DB Migration"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   User: $DB_USER"
echo "   DB  : $DB_NAME"
echo ""

# Cek psql tersedia
if ! command -v psql &>/dev/null; then
  echo "❌ psql tidak ditemukan."
  echo "   Install PostgreSQL client:"
  echo "   brew install postgresql"
  exit 1
fi

# Buat database jika belum ada
echo "📦 Memastikan database '$DB_NAME' ada..."
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" postgres 2>/dev/null || echo "   (database sudah ada, lanjut...)"

# Jalankan schema
echo "📋 Menjalankan schema.sql..."
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f ./schema.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migrasi berhasil!"
  echo ""
  echo "🔐 Akun login:"
  echo "   admin / root210605       -> role: admin"
  echo "   dokter / root210605      -> role: dokter"
  echo "   apoteker / root210605    -> role: apoteker"
  echo "   kasir / root210605       -> role: kasir"
  echo "   resepsionis / root210605 -> role: resepsionis"
  echo ""
  echo "🚀 Jalankan backend:"
  echo "   cd backend && go run ./cmd/main.go"
else
  echo "❌ Migrasi gagal. Cek konfigurasi PostgreSQL kamu."
fi
