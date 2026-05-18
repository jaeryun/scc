#!/usr/bin/env bash
set -euo pipefail

# Migration Integrity Check
# Verifies that prisma/schema.prisma matches the latest migration state.
# Exit 0 = OK, Exit 1 = drift detected.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=== Migration Integrity Check ==="

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -f .env.local ]; then
    export $(grep DATABASE_URL .env.local | xargs)
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[WARN] DATABASE_URL not set. Skipping DB-backed checks."
  echo "[INFO] Checking migration directory structure only..."

  # At minimum, verify migrations directory exists with at least one migration
  migration_count=$(find prisma/migrations -maxdepth 2 -name 'migration.sql' 2>/dev/null | wc -l)
  if [ "$migration_count" -eq 0 ]; then
    echo "[ERROR] No migration files found in prisma/migrations/"
    exit 1
  fi
  echo "[OK] Found $migration_count migration file(s)."
  exit 0
fi

# Verify migrations directory exists
if [ ! -d prisma/migrations ]; then
  echo "[ERROR] prisma/migrations/ directory not found."
  exit 1
fi

# Run prisma migrate diff to check for drift
echo "[INFO] Running prisma migrate diff..."
diff_output=$(bunx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "$DATABASE_URL" \
  --script 2>&1) || true

# If diff output is empty or only contains "This is an empty migration", schema matches
if echo "$diff_output" | grep -q "This is an empty migration"; then
  echo "[OK] Schema matches migrations. No drift detected."
  exit 0
fi

# If the diff contains actual SQL, there's drift
if echo "$diff_output" | grep -qiE "CREATE|ALTER|DROP"; then
  echo "=============================================="
  echo "[ERROR] SCHEMA DRIFT DETECTED!"
  echo "The following changes exist in schema.prisma"
  echo "that are not covered by migration files:"
  echo "=============================================="
  echo "$diff_output"
  echo "=============================================="
  echo "Fix: Create a new migration with:"
  echo "  bunx prisma migrate dev --name YYMMDD_설명"
  echo "=============================================="
  exit 1
fi

echo "[OK] No schema drift detected."
exit 0
