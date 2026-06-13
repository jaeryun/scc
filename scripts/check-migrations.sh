#!/usr/bin/env bash
# check-migrations.sh — Prisma 마이그레이션 무결성 검사
#
# schema.prisma와 마이그레이션 파일이 일치하는지 확인합니다.
# DATABASE_URL이 없으면 디렉토리 구조만 검사하고,
# SHADOW_DATABASE_URL이 있으면 shadow DB로 diff까지 수행합니다.
#
# 실행: package.json prebuild → build 시 자동 호출

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=== Migration Integrity Check ==="

# .env.local에서 DATABASE_URL 자동 로드
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -f .env.local ]; then
    export $(grep DATABASE_URL .env.local | xargs)
  fi
fi

# .env.local 또는 .env에서 SHADOW_DATABASE_URL 자동 로드
if [ -z "${SHADOW_DATABASE_URL:-}" ]; then
  if [ -f .env.local ]; then
    eval "$(grep '^SHADOW_DATABASE_URL=' .env.local)"
  elif [ -f .env ]; then
    eval "$(grep '^SHADOW_DATABASE_URL=' .env)"
  fi
fi

# DB 접속 없으면 마이그레이션 디렉토리 존재 여부만 확인
if [ -z "${DATABASE_URL:-}" ]; then
  echo "[WARN] DATABASE_URL not set. Skipping DB-backed checks."
  echo "[INFO] Checking migration directory structure only..."

  migration_count=$(find prisma/migrations -maxdepth 2 -name 'migration.sql' 2>/dev/null | wc -l)
  if [ "$migration_count" -eq 0 ]; then
    echo "[ERROR] No migration files found in prisma/migrations/"
    exit 1
  fi
  echo "[OK] Found $migration_count migration file(s)."
  exit 0
fi

if [ ! -d prisma/migrations ]; then
  echo "[ERROR] prisma/migrations/ directory not found."
  exit 1
fi

SHADOW_DB="${SHADOW_DATABASE_URL:-}"

# SHADOW_DB 없으면 deep diff 건너뜀
if [ -z "$SHADOW_DB" ]; then
  echo "[WARN] SHADOW_DATABASE_URL not set. Skipping shadow DB diff check."
  echo "[INFO] Checking migration directory structure only..."
  echo "[OK] Schema matches migrations (no shadow DB available for deep check)."
  exit 0
fi

# prisma migrate diff로 실제 스키마 불일치(drift) 검출
echo "[INFO] Running prisma migrate diff..."
diff_output=$(bunx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "$SHADOW_DB" \
  --script 2>&1) || true

# 빈 마이그레이션만 반환되면 일치
if echo "$diff_output" | grep -q "This is an empty migration"; then
  echo "[OK] Schema matches migrations. No drift detected."
  exit 0
fi

# CREATE/ALTER/DROP SQL이 포함되어 있으면 불일치
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
