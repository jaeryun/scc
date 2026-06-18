#!/usr/bin/env bash
set -euo pipefail

# Squash migrations with custom SQL safety check
# Usage: ./squash-migrations.sh [--dry-run] [--apply]

DRY_RUN=true
APPLY=false
for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --apply) DRY_RUN=false; APPLY=true ;;
    *) echo "Unknown arg: $arg"; exit 1 ;;
  esac
done

MIGRATIONS_DIR="prisma/migrations"
CUSTOM_SQL_PATTERN='CREATE OR REPLACE FUNCTION|TRIGGER|POLICY|VIEW|CREATE INDEX CONCURRENTLY'

echo "→ Scanning migrations for custom SQL..."
CUSTOM_SQL_FOUND=$(grep -rE "$CUSTOM_SQL_PATTERN" "$MIGRATIONS_DIR"/*/migration.sql 2>/dev/null || true)

if [ -n "$CUSTOM_SQL_FOUND" ]; then
  echo "❌ Custom SQL found in migrations:"
  echo "$CUSTOM_SQL_FOUND"
  echo ""
  echo "Squash would lose this. Please:"
  echo "  1. Move custom SQL to a new migration AFTER squash"
  echo "  2. Document in docs/common/decisions/adr-002-prisma-schema-architecture.md"
  echo "  3. Re-run this script"
  exit 1
fi

if [ "$DRY_RUN" = true ]; then
  echo "✅ Dry-run: no custom SQL found. Safe to squash."
  echo "Run with --apply to actually squash."
  exit 0
fi

if [ "$APPLY" = true ]; then
  echo "⚠️  This will DELETE all migrations and create a single squashed one."
  echo "Have you backed up production DB? (yes/no)"
  read -r response
  if [ "$response" != "yes" ]; then
    echo "Aborted."
    exit 1
  fi

  SQUASHED_DIR="$MIGRATIONS_DIR/00000000000000_squashed_migrations"
  mkdir -p "$SQUASHED_DIR"

  bunx prisma migrate diff \
    --from-empty \
    --to-schema ./prisma/schema.prisma \
    --script > "$SQUASHED_DIR/migration.sql"

  find "$MIGRATIONS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name "00000000000000_squashed_migrations" -exec rm -rf {} +

  bunx prisma migrate resolve --applied 00000000000000_squashed_migrations

  echo "✅ Squash complete. Verify with: bunx prisma migrate status"
fi
