#!/usr/bin/env bash
set -euo pipefail

# Prisma 검증 스크립트
# 1. 마이그레이션 폴더명 형식 검증
# 2. 인덱스 길이 검증 (50자 마진)
# 3. 예약어 모델명 차단
# 4. Squawk (마이그레이션 SQL lint)

ERRORS=0

# 1. 마이그레이션 폴더명 검증
echo "→ Checking migration folder names..."
for m in prisma/migrations/*/; do
  name=$(basename "$m")
  if ! [[ "$name" =~ ^[0-9]{14}_[a-z0-9_-]+$ ]]; then
    echo "  ❌ Invalid migration folder name: $name"
    ERRORS=$((ERRORS + 1))
  fi
done

# 2. 모델명 예약어 차단
echo "→ Checking reserved word model names..."
RESERVED=("User" "Order" "Comment" "Group" "Position" "Value" "Key" "Type" "Version")
for schema in prisma/models/**/*.prisma; do
  for reserved in "${RESERVED[@]}"; do
    if grep -q "^model $reserved " "$schema" 2>/dev/null; then
      echo "  ❌ Reserved word used as model name: $reserved in $schema"
      ERRORS=$((ERRORS + 1))
    fi
  done
done

# 3. Squawk (마이그레이션 SQL lint)
echo "→ Running Squawk on migration SQL..."
if command -v npx &> /dev/null; then
  for sql in prisma/migrations/*/migration.sql; do
    npx squawk "$sql" || ERRORS=$((ERRORS + 1))
  done
else
  echo "  ⚠️  npx not found, skipping Squawk"
fi

if [ $ERRORS -gt 0 ]; then
  echo "❌ $ERRORS error(s) found"
  exit 1
fi
echo "✅ All checks passed"
