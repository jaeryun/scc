#!/bin/bash
# check-conventions.sh — 컨벤션 위반 자동 검출
# oxlint로 검출 불가능한 규칙을 grep 기반으로 확인

set -euo pipefail

errors=0
warnings=0

# 컬러 설정
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== 컨벤션 검사 시작 ==="

# 1. 정적 Tailwind 색상 사용 검사
echo ""
echo "--- 정적 Tailwind 색상 ---"
STATIC_COLORS=$(grep -rn --include='*.tsx' --include='*.ts' \
  -E '(text|bg|border|ring|outline)-(red|blue|green|amber|yellow|gray|slate|zinc|neutral|stone|orange|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-[0-9]' \
  src/ \
  --exclude-dir='.next' --exclude-dir='node_modules' 2>/dev/null | \
  grep -v 'data-theme' | grep -v 'globals.css' | grep -v -- '\.css:' || true)

if [ -n "$STATIC_COLORS" ]; then
  echo -e "${RED}[오류] 정적 Tailwind 색상 발견. CSS 변수 토큰(--chart-*, --primary 등)으로 교체하세요.${NC}"
  echo "$STATIC_COLORS"
  ((errors++))
else
  echo "통과: 정적 색상 없음"
fi

# 2. Metadata export 누락 검사
echo ""
echo "--- Metadata 누락 ---"
MISSING_METADATA=""
for f in $(find src/app -name 'page.tsx'); do
  if ! grep -q 'export const metadata\|generateMetadata' "$f"; then
    MISSING_METADATA="${MISSING_METADATA}${f}\n"
  fi
done

if [ -n "$MISSING_METADATA" ]; then
  echo -e "${RED}[오류] Metadata 누락된 page.tsx:${NC}"
  echo -e "$MISSING_METADATA"
  ((errors++))
else
  echo "통과: 모든 page.tsx에 Metadata 있음"
fi

# 3. className 템플릿 리터럴 사용 검사 (경고)
echo ""
echo "--- className 템플릿 리터럴 ---"
TEMPLATE_CLASSNAMES=$(grep -rn --include='*.tsx' \
  -E 'className=\{[^}]*`[^`]*\$\{[^}]*\}[^`]*`' \
  src/ \
  --exclude-dir='.next' --exclude-dir='node_modules' 2>/dev/null || true)

if [ -n "$TEMPLATE_CLASSNAMES" ]; then
  echo -e "${YELLOW}[경고] className 템플릿 리터럴 발견. cn() 사용을 권장합니다.${NC}"
  echo "$TEMPLATE_CLASSNAMES"
  ((warnings++))
else
  echo "통과: className 템플릿 리터럴 없음"
fi

# 결과 요약
echo ""
echo "=== 검사 완료: 오류 ${errors}건, 경고 ${warnings}건 ==="

if [ "$errors" -gt 0 ]; then
  exit 1
fi
