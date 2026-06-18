# Prisma 스키마 아키텍처 재설계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 단일 `schema.prisma` + 단일 init 마이그레이션으로 구성된 `prisma/` 디렉터리를 multi-file schema, 도메인별 디렉터리, 검증 스크립트, 운영 정책을 갖춘 베스트 프랙티스 기반 아키텍처로 재설계한다.

**Architecture:**
- `prisma/schema.prisma` (root) = generator + datasource + model import 디렉티브
- `prisma/models/<domain>/<model>.prisma` = 1 모델 = 1 파일 (모델 + 전용 enum)
- `prisma/config/prisma.config.ts` = seed 등록 (schema 경로는 default)
- `prisma/scripts/check-prisma.sh` = 네이밍/길이/예약어 + Squawk 통합
- `prisma/scripts/squash-migrations.sh` = custom SQL 자동 감지 + dry-run
- 문서: prisma/CLAUDE.md 진입점 + docs/common/{development,decisions,operations,reference} 4개 + 1-hop cross-link

**Tech Stack:** Prisma 6.19.3, PostgreSQL, Squawk (PostgreSQL migration linter), Bash, Bun

---

## File Structure

**Create:**
- `prisma/config/prisma.config.ts` — Prisma config (seed)
- `prisma/models/core/view-setting.prisma` — ViewSetting 모델
- `prisma/models/cache/netbox-cache.prisma` — NetBoxCache 모델
- `prisma/scripts/check-prisma.sh` — 네이밍/길이/예약어 + Squawk 통합
- `prisma/scripts/squash-migrations.sh` — squash 자동화
- `prisma/seeds/index.ts` — seed 진입점 (placeholder)
- `docs/common/decisions/adr-002-prisma-schema-architecture.md` — 통합 ADR
- `docs/common/operations/db-rollback-runbook.md` — P0 runbook
- `docs/common/reference/data-models/index.md` — 도메인 트리

**Modify:**
- `prisma/schema.prisma` — generator + datasource + import 디렉티브
- `prisma/CLAUDE.md` — AI 진입점, cross-link hub
- `prisma/index.md` — 사람용 구조 문서
- `docs/common/development/prisma.md` — 정책/규칙 전면 갱신
- `docs/common/foundation/project.md` — 트리 갱신
- `package.json` — prisma to dependencies, db:seed scripts
- `.env.example` — DIRECT_URL 추가 (있다면)
- `.env.local` (gitignored) — DIRECT_URL 추가 (있다면)

**Regenerate:**
- `prisma/migrations/*` — prisma migrate reset 후 재생성

---

## Phase 1: 골격 + 도구

### Task 1: 디렉터리 골격 생성

**Files:**
- Create: `prisma/config/`
- Create: `prisma/models/`
- Create: `prisma/enums/`
- Create: `prisma/seeds/`
- Create: `prisma/scripts/`

- [ ] **Step 1: 디렉터리 생성**

```bash
mkdir -p prisma/config prisma/models prisma/enums prisma/seeds prisma/scripts
```

- [ ] **Step 2: 디렉터리 확인**

```bash
ls -la prisma/
```

Expected: 5개 새 디렉터리 (`config`, `models`, `enums`, `seeds`, `scripts`)가 보임. `migrations/`, `schema.prisma`, `CLAUDE.md`, `index.md`는 그대로.

- [ ] **Step 3: Commit**

```bash
git add prisma/config prisma/models prisma/enums prisma/seeds prisma/scripts
git commit -m "chore(prisma): create multi-file directory structure

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: schema.prisma 업데이트 (generator + datasource)

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: schema.prisma 백업**

```bash
cp prisma/schema.prisma prisma/schema.prisma.bak
```

- [ ] **Step 2: schema.prisma 재작성**

`prisma/schema.prisma` 전체를 다음으로 교체:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  directUrl         = env("DIRECT_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

// Models (multi-file)
import "./models/core/view-setting.prisma"
import "./models/cache/netbox-cache.prisma"
```

- [ ] **Step 3: 백업 제거**

```bash
rm prisma/schema.prisma.bak
```

- [ ] **Step 4: prisma validate (실패 예상 — model 파일 없음)**

```bash
bunx prisma validate
```

Expected: ERROR — `models/core/view-setting.prisma` 파일 없음. 이건 정상 (다음 task에서 생성).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "chore(prisma): rewrite schema.prisma with driver adapters and direct URL

- Add previewFeatures = [\"driverAdapters\"]
- Add directUrl for connection pooler
- Convert to multi-file with import directives

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: ViewSetting 모델을 multi-file로 이동

**Files:**
- Create: `prisma/models/core/view-setting.prisma`

- [ ] **Step 1: ViewSetting 모델 파일 작성**

`prisma/models/core/view-setting.prisma` 생성:

```prisma
model ViewSetting {
  id        String   @id @default(cuid())
  viewId    String   @unique
  icon      String   @default("dashboard")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 2: prisma validate**

```bash
bunx prisma validate
```

Expected: 여전히 ERROR (NetBoxCache 파일 없음). ViewSetting import는 성공해야 함.

- [ ] **Step 3: Commit**

```bash
git add prisma/models/core/view-setting.prisma
git commit -m "refactor(prisma): move ViewSetting to multi-file (models/core)

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: NetBoxCache 모델을 multi-file로 이동

**Files:**
- Create: `prisma/models/cache/netbox-cache.prisma`

- [ ] **Step 1: NetBoxCache 모델 파일 작성**

`prisma/models/cache/netbox-cache.prisma` 생성:

```prisma
model NetBoxCache {
  url        String   @id
  data       Json
  expiresAt  DateTime
  staleUntil DateTime
  hitCount   Int      @default(0)

  @@index([expiresAt])
}
```

- [ ] **Step 2: prisma validate (성공해야 함)**

```bash
bunx prisma validate
```

Expected: `The schema at prisma/schema.prisma is valid`. 두 모델 모두 import 성공.

- [ ] **Step 3: prisma generate (Prisma Client 생성 확인)**

```bash
bunx prisma generate
```

Expected: `Generated Prisma Client (v6.x.x) to ./node_modules/@prisma/client`. 에러 없이 완료.

- [ ] **Step 4: 기존 클라이언트와 동일한지 확인 (sanity check)**

```bash
grep -r "ViewSetting" node_modules/.prisma/client/index.d.ts | head -3
grep -r "NetBoxCache" node_modules/.prisma/client/index.d.ts | head -3
```

Expected: 두 모델 타입이 모두 생성됨.

- [ ] **Step 5: Commit**

```bash
git add prisma/models/cache/netbox-cache.prisma
git commit -m "refactor(prisma): move NetBoxCache to multi-file (models/cache)

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: prisma.config.ts 작성

**Files:**
- Create: `prisma/config/prisma.config.ts`

- [ ] **Step 1: prisma.config.ts 작성**

`prisma/config/prisma.config.ts` 생성:

```typescript
import { defineConfig } from "prisma/config";
import path from "node:path";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "bun prisma/seeds/index.ts",
  },
});
```

- [ ] **Step 2: prisma validate (config 인식 확인)**

```bash
bunx prisma validate
```

Expected: 여전히 `The schema at prisma/schema.prisma is valid`. config 파일이 정상 인식됨.

- [ ] **Step 3: Commit**

```bash
git add prisma/config/prisma.config.ts
git commit -m "chore(prisma): add prisma.config.ts with seed registration

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: package.json 업데이트

**Files:**
- Modify: `package.json`

- [ ] **Step 1: prisma를 dependencies로 이동 확인**

```bash
grep -A 1 '"prisma"' package.json
```

만약 `devDependencies`에 있으면 `dependencies`로 이동. 현재 위치 확인 후 적절히 수정.

- [ ] **Step 2: db:seed 스크립트 추가**

`package.json`의 `"scripts"` 섹션에 다음 추가:

```json
"db:seed": "bun prisma/seeds/index.ts",
"db:seed:dev": "SEED_ENV=dev bun prisma/seeds/index.ts",
"db:seed:staging": "SEED_ENV=staging bun prisma/seeds/index.ts"
```

그리고 `"prisma"` 키 추가 (없다면):

```json
"prisma": {
  "seed": "bun prisma/seeds/index.ts"
}
```

- [ ] **Step 3: prisma install (devDeps에서 deps로 이동했으면)**

```bash
bun install
```

Expected: `prisma`가 dependencies로 이동됨. lock 파일 갱신.

- [ ] **Step 4: 스크립트 작동 확인 (placeholder seed 파일 만들기 전에 dry-run)**

```bash
cat prisma/seeds/index.ts 2>/dev/null || echo "NOT YET — will be created in Task 11"
```

Expected: "NOT YET" 출력. 다음 task에서 작성 예정.

- [ ] **Step 5: Commit**

```bash
git add package.json bun.lock
git commit -m "chore(package): add prisma seed scripts, move prisma to dependencies

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: check-prisma.sh 작성 (네이밍/길이/예약어 + Squawk)

**Files:**
- Create: `prisma/scripts/check-prisma.sh`

- [ ] **Step 1: check-prisma.sh 작성**

`prisma/scripts/check-prisma.sh` 생성:

```bash
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
```

- [ ] **Step 2: 실행 권한 부여**

```bash
chmod +x prisma/scripts/check-prisma.sh
```

- [ ] **Step 3: 스크립트 실행 (현재 상태로 통과해야 함)**

```bash
./prisma/scripts/check-prisma.sh
```

Expected: `✅ All checks passed` (현재 init 마이그레이션은 규칙 충족).

- [ ] **Step 4: 스크립트 검증 — 잘못된 폴더명으로 테스트**

```bash
mkdir -p prisma/migrations/20260527000000_invalid-name
touch prisma/migrations/20260527000000_invalid-name/migration.sql
./prisma/scripts/check-prisma.sh || true
rm -rf prisma/migrations/20260527000000_invalid-name
```

Expected: `❌ Invalid migration folder name: 20260527000000_invalid-name` 출력. 그 후 정리.

- [ ] **Step 5: Commit**

```bash
git add prisma/scripts/check-prisma.sh
git commit -m "chore(prisma): add check-prisma.sh with naming, reserved words, and Squawk

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: squash-migrations.sh 작성 (custom SQL 자동 감지)

**Files:**
- Create: `prisma/scripts/squash-migrations.sh`

- [ ] **Step 1: squash-migrations.sh 작성**

`prisma/scripts/squash-migrations.sh` 생성:

```bash
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
```

- [ ] **Step 2: 실행 권한**

```bash
chmod +x prisma/scripts/squash-migrations.sh
```

- [ ] **Step 3: dry-run 테스트 (현재 상태 — 통과해야 함)**

```bash
./prisma/scripts/squash-migrations.sh --dry-run
```

Expected: `✅ Dry-run: no custom SQL found. Safe to squash.`

- [ ] **Step 4: custom SQL 감지 테스트**

```bash
mkdir -p prisma/migrations/20260527000000_test_custom_sql
cat > prisma/migrations/20260527000000_test_custom_sql/migration.sql <<'EOF'
CREATE OR REPLACE FUNCTION test_fn() RETURNS void AS $$
BEGIN
  RAISE NOTICE 'test';
END;
$$ LANGUAGE plpgsql;
EOF

./prisma/scripts/squash-migrations.sh --dry-run || true
rm -rf prisma/migrations/20260527000000_test_custom_sql
```

Expected: `❌ Custom SQL found in migrations:` 출력 + `CREATE OR REPLACE FUNCTION` 매치.

- [ ] **Step 5: Commit**

```bash
git add prisma/scripts/squash-migrations.sh
git commit -m "chore(prisma): add squash-migrations.sh with custom SQL detection

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: 마이그레이션 재생성 (reset + init)

**Files:**
- Regenerate: `prisma/migrations/*`
- Create: `prisma/seeds/index.ts` (placeholder for reset)

- [ ] **Step 1: 기존 마이그레이션 백업**

```bash
mv prisma/migrations prisma/migrations.bak.$(date +%Y%m%d)
ls prisma/migrations.bak.*/
```

Expected: `migration_lock.toml`과 기존 `20260526165634_270527_init/` 보존.

- [ ] **Step 2: 새 migrations 디렉터리 생성**

```bash
mkdir prisma/migrations
cp prisma/migrations.bak.*/migration_lock.toml prisma/migrations/
```

- [ ] **Step 3: seed 파일 placeholder (reset 통과용)**

`prisma/seeds/index.ts` 생성 (나중에 갱신):

```typescript
// Placeholder seed — will be expanded in Task 11
async function main() {
  console.log("Seed: no-op (placeholder)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

- [ ] **Step 4: 마이그레이션 재생성 (dev 환경에서만 실행)**

```bash
bunx prisma migrate dev --name init
```

Expected: `Your database is now in sync with your schema.` 새 `YYYYMMDDHHMMSS_init/` 디렉터리 생성됨.

- [ ] **Step 5: 마이그레이션 상태 확인**

```bash
bunx prisma migrate status
```

Expected: `Database schema is up to date`.

- [ ] **Step 6: 백업 제거 (확인 후)**

```bash
ls prisma/migrations.bak.*/
# 확인 후:
rm -rf prisma/migrations.bak.*
```

- [ ] **Step 7: 새 init 마이그레이션 내용 확인**

```bash
ls prisma/migrations/
cat prisma/migrations/*/migration.sql
```

Expected: 2개 테이블 (`ViewSetting`, `NetBoxCache`) CREATE TABLE.

- [ ] **Step 8: Commit**

```bash
git add prisma/migrations prisma/seeds/index.ts
git commit -m "chore(prisma): regenerate init migration with multi-file schema

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: 모든 검증 통과 확인

**Files:** 없음 (검증만)

- [ ] **Step 1: prisma validate**

```bash
bunx prisma validate
```

Expected: `The schema at prisma/schema.prisma is valid`.

- [ ] **Step 2: prisma format (의도적 변경 없을 것)**

```bash
bunx prisma format
git diff prisma/
```

Expected: diff 없음 (이미 잘 포맷됨).

- [ ] **Step 3: format --check**

```bash
bunx prisma format --check
```

Expected: `All files are formatted correctly`.

- [ ] **Step 4: check-prisma.sh 실행**

```bash
./prisma/scripts/check-prisma.sh
```

Expected: `✅ All checks passed`.

- [ ] **Step 5: TypeScript 빌드 확인**

```bash
bun run build 2>&1 | tail -20
```

Expected: 빌드 성공. Prisma Client 타입이 정상 인식됨.

- [ ] **Step 6: 문제 있으면 수정, 없으면 no-op commit**

문제가 있었다면:
```bash
git add -A
git commit -m "fix(prisma): resolve validation issues after multi-file refactor

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

문제 없었으면 skip.

---

## Phase 2: 문서

### Task 11: prisma/CLAUDE.md 갱신 (AI 진입점)

**Files:**
- Modify: `prisma/CLAUDE.md`

- [ ] **Step 1: 기존 CLAUDE.md 백업**

```bash
cp prisma/CLAUDE.md prisma/CLAUDE.md.bak
```

- [ ] **Step 2: prisma/CLAUDE.md 전면 재작성**

`prisma/CLAUDE.md` 전체를 다음으로 교체:

```markdown
# prisma/ — AI 에이전트 가이드

> **AI 진입점**: Prisma 작업 시 가장 먼저 읽을 문서. 다른 Prisma 관련 문서로의 cross-link 허브.

## 빠른 링크

| 문서 | 용도 |
|------|------|
| [docs/common/development/prisma.md](../docs/common/development/prisma.md) | 규칙/네이밍/CI 정책 |
| [docs/common/decisions/adr-002-prisma-schema-architecture.md](../docs/common/decisions/adr-002-prisma-schema-architecture.md) | multi-file + 명명 + CI 결정 |
| [docs/common/reference/data-models/index.md](../docs/common/reference/data-models/index.md) | 도메인별 데이터 모델 |
| [docs/common/operations/db-rollback-runbook.md](../docs/common/operations/db-rollback-runbook.md) | P0 마이그레이션 롤백 |
| [prisma/index.md](./index.md) | 디렉터리 구조 + 도메인 트리 (사람용) |

## 디렉터리 구조

```
prisma/
├── schema.prisma              # generator + datasource + import
├── config/                    # Prisma 설정
├── models/<domain>/           # 1 모델 = 1 파일
├── enums/common.prisma        # 전사 공통 enum
├── migrations/                # Prisma 마이그레이션 (기계 생성)
├── seeds/                     # 시드 데이터
├── scripts/                   # 검증/운영 스크립트
├── CLAUDE.md                  # 이 파일 (AI 진입점)
└── index.md                   # 사람용 구조
```

## 새 모델 추가 절차

1. `prisma/models/<domain>/<model>.prisma` 생성 (kebab-case)
2. `prisma/schema.prisma`에 `import` 디렉티브 추가
3. `bunx prisma migrate dev --name YYMMDD_<purpose>`
4. `bunx prisma validate` + `./prisma/scripts/check-prisma.sh`

## 새 enum 추가

- 모델 전용 enum: 해당 모델 파일 안에 정의
- 전사 공통 enum: `prisma/enums/common.prisma`에 추가

## 마이그레이션 작업

- 네이밍: `YYMMDD_<purpose>` 또는 `YYMMDD_<ticket>_<purpose>`
- 커밋 전 `./prisma/scripts/check-prisma.sh` 실행
- 운영 배포: `docs/common/operations/db-rollback-runbook.md` 참조

## 긴급 상황

- DB 롤백: `docs/common/operations/db-rollback-runbook.md`
- 마이그레이션 squash: `./prisma/scripts/squash-migrations.sh --dry-run` (custom SQL 사전 감지)
```

- [ ] **Step 3: 백업 제거**

```bash
rm prisma/CLAUDE.md.bak
```

- [ ] **Step 4: 링크 검증 (5개 링크 모두 살아있는지)**

```bash
for link in \
  "../docs/common/development/prisma.md" \
  "../docs/common/decisions/adr-002-prisma-schema-architecture.md" \
  "../docs/common/reference/data-models/index.md" \
  "../docs/common/operations/db-rollback-runbook.md" \
  "./index.md"; do
  target="prisma/$link"
  if [ ! -e "$target" ]; then
    echo "❌ Broken link: $target (파일이 아직 없음 — Task 13-17에서 생성)"
  fi
done
```

Expected: 일부 링크는 "파일이 아직 없음" 출력. 다음 task들에서 생성됨.

- [ ] **Step 5: Commit**

```bash
git add prisma/CLAUDE.md
git commit -m "docs(prisma): rewrite CLAUDE.md as AI entry point with cross-links

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: prisma/index.md 갱신 (사람용 구조)

**Files:**
- Modify: `prisma/index.md`

- [ ] **Step 1: prisma/index.md 재작성**

`prisma/index.md` 전체를 다음으로 교체:

```markdown
# prisma/ — 구조와 파일 목록

## 디렉터리 용도

Prisma 스키마 정의, 마이그레이션 관리, 시드, 검증 스크립트. Multi-file schema로 도메인별 분리.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `schema.prisma` | generator + datasource + model import | prisma, schema, generator, datasource |
| `config/` | prisma.config.ts (seed 등록) | prisma-config, seed |
| `models/<domain>/` | 1 모델 = 1 파일 (kebab-case) | 도메인별, multi-file |
| `enums/common.prisma` | 전사 공통 enum | enum, 공통 |
| `migrations/` | Prisma 마이그레이션 (`YYYYMMDDHHMMSS_<purpose>/`) | migration, SQL |
| `seeds/` | 시드 데이터 (idempotent) | seed |
| `scripts/` | 검증/운영 스크립트 (check-prisma, squash) | lint, 운영 |
| `CLAUDE.md` | AI 진입점 (cross-link hub) | AI, 진입점 |
| `index.md` | 이 파일 | 인덱스 |

## 도메인 트리

```
models/
├── core/         # 설정/사이트 (ViewSetting, Site)
├── audit/        # 감사 로그 (AuditLog)
├── ipam/         # IP 관리 (Subnet, IpAddress, Vlan)
├── dcim/         # DCIM (Device, Rack, Cable, Interface, SwitchPort)
└── cache/        # 캐시 (NetBoxCache)
```

## 새 도메인/모델 추가

1. `prisma/models/<new-domain>/` 디렉터리 생성
2. `prisma/models/<new-domain>/<model>.prisma` 작성
3. `prisma/schema.prisma`에 import 추가
4. `bunx prisma migrate dev --name YYMMDD_<purpose>`

## 포함 금지 항목

- 일반 문서 (이 프로젝트의 모든 문서는 `docs/`에 위치, prisma 진입점 문서만 예외)
- `.env` 파일 (`.env.local`에 DATABASE_URL/DIRECT_URL 설정)
- `migrations.bak.*` (재생성 후 삭제)

## 관련 문서

- [prisma/CLAUDE.md](./CLAUDE.md) — AI 진입점
- [docs/common/development/prisma.md](../docs/common/development/prisma.md) — 규칙
- [docs/common/decisions/adr-002-prisma-schema-architecture.md](../docs/common/decisions/adr-002-prisma-schema-architecture.md) — 결정
- [docs/common/reference/data-models/index.md](../docs/common/reference/data-models/index.md) — 데이터 모델
- [docs/common/operations/db-rollback-runbook.md](../docs/common/operations/db-rollback-runbook.md) — 운영
```

- [ ] **Step 2: Commit**

```bash
git add prisma/index.md
git commit -m "docs(prisma): rewrite index.md with multi-file structure and domain tree

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: docs/common/development/prisma.md 전면 갱신

**Files:**
- Modify: `docs/common/development/prisma.md`

- [ ] **Step 1: 기존 파일 백업**

```bash
cp docs/common/development/prisma.md docs/common/development/prisma.md.bak
```

- [ ] **Step 2: docs/common/development/prisma.md 재작성**

`docs/common/development/prisma.md` 전체를 다음으로 교체:

```markdown
# Prisma 규칙

## 스키마 구조 (Multi-file)

- **1 모델 = 1 파일** — `prisma/models/<domain>/<model>.prisma`
- **모델 + 전용 enum** 함께 두기
- **도메인 디렉터리** — `models/<domain>/`. 신규 도메인은 새 디렉터리
- **진입점** — `prisma/schema.prisma` (root): generator + datasource + import 디렉티브
- **상세 위치**: [prisma/CLAUDE.md](../../../prisma/CLAUDE.md), [prisma/index.md](../../../prisma/index.md)

## `prisma db push` 정책

| 환경 | `db push` | 비고 |
|------|-----------|------|
| 로컬 dev (DB 비어있음) | ✅ 허용 | 빠른 스키마 반복 |
| CI test DB (fresh) | ✅ 허용 | `--accept-data-loss` OK |
| Staging (시드 데이터) | ❌ 금지 | `migrate deploy`만 |
| Production | ❌ 금지 | `migrate deploy`만 |

**근거**: 위험은 "스키마 변경"이 아니라 "데이터 손실". 데이터 없는 환경은 안전. Prisma 공식 "prototyping" 권장.

## 마이그레이션

### 허용된 명령어

| 명령어 | 용도 |
|--------|------|
| `prisma migrate dev --name YYMMDD_<purpose>` | 스키마 변경 시 마이그레이션 생성/적용 |
| `prisma migrate deploy` | 대기 마이그레이션 적용 (운영) |
| `prisma migrate status` | 적용 상태 확인 |
| `prisma migrate diff` | 스키마/migration 간 diff |
| `prisma generate` | Prisma Client 재생성 |

### 네이밍

- 형식: `YYMMDD_<purpose>` 또는 `YYMMDD_<ticket>_<purpose>`
- 예시: `270620_add_vlan_model`, `270625_iss-142-permission-cache`
- 금지: `update`, `fix`, `changes` 같은 무의미한 이름

### Squash 정책

- **임계값 75개 초과 시** 1회 squash
- **절차**:
  1. `./prisma/scripts/squash-migrations.sh --dry-run` (custom SQL 사전 감지)
  2. prod DB 백업
  3. `./prisma/scripts/squash-migrations.sh --apply`
  4. `prisma migrate status` 검증
- **상세**: [ADR-002](../../decisions/adr-002-prisma-schema-architecture.md)

### Rollback

- Prisma는 down 마이그레이션 자동 생성 안 함. `migrate diff`로 수동 생성
- **PR 단계**: `prisma migrate dev --create-only`로 SQL 검토
- **운영**: [db-rollback-runbook.md](../../operations/db-rollback-runbook.md) 참조

## 명명 규칙

### 모델

- **PascalCase 단수형** — `Subnet`, `IpAddress`
- **도메인 접두사 회피** — `IpamSubnet` ❌, `Subnet` ✅
- **예약어 차단** — `User`/`Comment`/`Order` ❌ (PostgreSQL 예약어)
- **파일명** — kebab-case (`ip-address.prisma`)

### 필드

- **camelCase** — `networkCidr`, `createdAt`
- **타임스탬프** — `createdAt`, `updatedAt`, `deletedAt`
- **FK** — `{modelName}Id` (예: `siteId`)

### 인덱스/제약

- **단일** — `${Model}_${field}_idx`
- **유니크** — `${Model}_${field}_key`
- **복합** — `@@unique([siteId, networkCidr])`
- **길이 한도** — PostgreSQL 식별자 **63바이트**. `check-prisma.sh`에서 50자 마진 검증
- **Partial** — `@@index([field]) WHERE deletedAt IS NULL` (soft delete 모델)

### Enum

- **위치** — 모델 파일 내부 (전사 공통만 `enums/common.prisma`)
- **변경 정책** — **값 추가만 허용**. 제거/이름변경/순서변경은 새 enum + column migration

### Relation

- `onDelete`/`onUpdate` **명시 필수** (기본값 의존 금지)
- **Cascade** — 부모 삭제 시 자식 (예: 사이트 → 서브넷)
- **Restrict** — 참조 중이면 거부
- **SetNull** — 참조만 끊기

## 스키마 네이밍 (필수)

- Model: `PascalCase`, 단수형
- Field: `camelCase`
- Relation: 명시적 이름 (`author User @relation(...)`)
- Index/Unique: `${Model}_${field}_idx` / `_key`
- Enum: `PascalCase` 멤버, `SCREAMING_SNAKE_CASE` 값

## 인덱스/제약조건 (필수)

- 단일 필드 인덱스: `@@index` 명시
- 복합 인덱스: 자주 함께 조회되는 필드
- Unique: 비즈니스 유니크 키
- 복합 유니크: `@@unique([siteId, networkCidr])` (사이트 스코프)

## Relation 규칙 (필수)

- `onDelete`/`onUpdate` **반드시 명시**
- Cascade/Restrict/SetNull 정책 결정 후 적용

## Connection Pooling

- `directUrl` + `driverAdapters` (Prisma 6 GA) 사용
- Vercel/Neon/Supabase: pooler URL → `url`, migrations/RLS bypass → `directUrl`

## Soft Delete (가이드)

- `deletedAt DateTime?` 필드 + application layer `where: { deletedAt: null }`
- Partial index `@@index([field]) WHERE deletedAt IS NULL` 사용
- **필요한 모델에 적용** (강제 X)

## CI/CD

### 검증 (3단계)

```bash
bunx prisma validate                                    # 스키마 문법/관계
./prisma/scripts/check-prisma.sh                        # 네이밍/길이/예약어 + Squawk
bunx prisma format --check                              # 의도치 않은 reformat 감지
```

### 배포

- `bunx prisma migrate deploy` (main 머지 시)
- `prisma`는 `dependencies`에 위치 (Vercel devDeps prune 대비)

## Shadow DB (개발)

- `prisma migrate dev`는 shadow DB로 변경 검증
- Docker compose의 postgres 사용 권장 (`.env.local`의 `SHADOW_DATABASE_URL`)
- shadow DB는 `prisma migrate reset`으로 정리

## 금지 패턴

- ❌ `db push` in staging/production
- ❌ 마이그레이션 파일 직접 수정 (재실행 시 충돌)
- ❌ `prisma db push --accept-data-loss` in production
- ❌ 모델 간 cross-module query (모듈 경계 무시)
- ❌ `prisma db push`로 데이터 있는 환경 작업

## 변경 이력

- 2026-06-17: Multi-file schema, Squawk, soft delete, enum 정책, AI 네비게이션 추가 (ADR-002)
```

- [ ] **Step 3: 백업 제거**

```bash
rm docs/common/development/prisma.md.bak
```

- [ ] **Step 4: Commit**

```bash
git add docs/common/development/prisma.md
git commit -m "docs(prisma): comprehensive prisma rules update with multi-file, db push policy, and CI

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: ADR 작성 (multi-file + 명명 + CI 통합)

**Files:**
- Create: `docs/common/decisions/adr-002-prisma-schema-architecture.md`

- [ ] **Step 1: ADR 작성**

`docs/common/decisions/adr-002-prisma-schema-architecture.md` 생성:

```markdown
# ADR-002: Prisma 스키마 아키텍처

- **날짜**: 2026-06-17
- **상태**: 승인
- **맥락**: 단일 `schema.prisma` (2 모델) + 단일 init 마이그레이션 → 베스트 프랙티스 기반 재설계

## 결정

Prisma 디렉터리를 다음 원칙으로 재설계한다:

1. **Multi-file schema** — 1 모델 = 1 파일, 도메인별 디렉터리
2. **명명 규칙** — PascalCase 모델, kebab-case 파일, 인덱스 길이 63B 한도, 예약어 차단
3. **CI/CD 자동화** — Squawk (마이그레이션 SQL lint) + 자체 검증 스크립트

---

## 1. Multi-file schema

### 결정

- `prisma/schema.prisma` (root) = generator + datasource + model import
- `prisma/models/<domain>/<model>.prisma` = 1 모델 = 1 파일
- 모델 + 그 모델 전용 enum을 같은 파일에 공존
- 전사 공통 enum만 `prisma/enums/common.prisma`에 분리

### 근거

- 모델 100개+ 시 단일 파일은 유지보수 불가
- Prisma 6.7+ 정식 multi-file 지원
- 도메인별 디렉터리는 bounded context (DCIM, IPAM 등)와 일치

### 검토한 대안

- **단일 파일 유지** — 모델 수 증가 시 파일 크기 폭증. 거부
- **Aggregate root별 분리** (`dcim/inventory/`, `dcim/connection/`) — 디렉터리 깊이 증가, import 빈번. foundation phase에선 과한 추상화. 거부
- **현재 결정** — 도메인 일관성 우선, aggregate는 코드 레벨에서 처리

### Prisma 6 → 7 마이그레이션 노트

- v7의 `prisma-client` generator (output 분리)는 모델 50+ 도달 시 검토
- 현재 v6.19.3에서 v7로 갈 때 generator 옵션 변경 필요

---

## 2. 명명 규칙

### 결정

- **모델** — PascalCase 단수형, 도메인 접두사 회피, 예약어 차단
- **필드** — camelCase, FK는 `{modelName}Id`
- **인덱스** — `${Model}_${field}_idx` (50자 마진, 63B 한도)
- **Enum** — 모델 파일 내부, **값 추가만 허용**

### 근거

- PostgreSQL 식별자 63바이트 한도 ([PostgreSQL docs](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS))
- 예약어 (`User`, `Comment`, `Order`)는 quoted identifier 없이 사용 시 syntax error
- PostgreSQL enum은 `ALTER TYPE ... ADD VALUE`만 가능. 제거/이름변경은 새 enum + column migration

### 검토한 대안

- **snake_case 모델** — Prisma/PascalCase 컨벤션 위배. 거부
- **Prefix 도메인** (`IpamSubnet`) — 디렉터리로 이미 분리되므로 중복. 거부

---

## 3. CI/CD 자동화

### 결정

- `prisma/scripts/check-prisma.sh` — 네이밍/길이/예약어 + Squawk 통합
- `prisma/scripts/squash-migrations.sh` — custom SQL 자동 감지 + dry-run
- CI 3단계: `prisma validate` + `check-prisma.sh` + `prisma format --check`

### Squawk 선택 근거

- PostgreSQL 마이그레이션 SQL lint의 사실상 표준
- 30+ 규칙 (prefer-identity, adding-required-field, ban-drop-table 등)
- SQL 파일 직접 lint: `npx squawk migration.sql`
- GitHub App, VSCode extension 지원

### 검토한 대안

- **pgfence** — 검토 시점에 실존 도구 아님 확인. 거부
- **수동 검증만** — human error 가능. CI 강제 필요. 거부
- **Squawk** — 위 근거로 채택

### 마이그레이션 락 경합

- `CREATE INDEX CONCURRENTLY`, `ALTER TABLE ... ADD CONSTRAINT`는 트래픽 低谷 시간 또는 read-only 모드
- 운영 마이그레이션은 PR 리뷰 + `migrate dev --create-only`로 SQL 검토
- 긴급 롤백은 [db-rollback-runbook.md](../../operations/db-rollback-runbook.md) 참조

---

## 결과

- 2026-06-17 적용. Phase 1 (골격+도구) + Phase 2 (문서) 완료
- 모든 Prisma 관련 문서가 1-hop 내 도달 가능 (AI 네비게이션 보장)
- 운영 거버넌스는 팀 규모에 맞게 lean (전담 DB 담당자 없음)
```

- [ ] **Step 2: Commit**

```bash
git add docs/common/decisions/adr-002-prisma-schema-architecture.md
git commit -m "docs(decisions): add ADR-002 prisma schema architecture (multi-file + naming + CI)

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 15: DB rollback runbook 작성

**Files:**
- Create: `docs/common/operations/db-rollback-runbook.md`

- [ ] **Step 1: runbook 작성**

`docs/common/operations/db-rollback-runbook.md` 생성:

```markdown
# DB 롤백 Runbook (P0)

> **긴급 상황**: 운영 DB 마이그레이션이 실패했거나 데이터 손실이 발생했을 때.

## 일반 원칙

- Prisma는 down 마이그레이션을 자동 생성하지 않음
- 모든 롤백은 PR 리뷰 + `migrate dev --create-only`로 미리 검토
- 운영 마이그레이션은 트래픽 低谷 시간 또는 read-only 모드

## 롤백 절차

### 1. 상황 판단

- [ ] 영향 범위 파악 (몇 개 테이블, 몇 개 row)
- [ ] 사용자에게 공지 (필요 시)

### 2. 즉시 조치 (Down SQL 생성)

```bash
# 현재 스키마와 적용된 마지막 마이그레이션의 차이로 down SQL 생성
bunx prisma migrate diff \
  --from-schema-datamodel ./prisma/schema.prisma \
  --to-migrations ./prisma/migrations \
  --script
```

생성된 SQL을 검토 후 적용. 예시:

```sql
-- DropTable
DROP TABLE IF EXISTS "NewTable";

-- AlterTable
ALTER TABLE "OldTable" DROP COLUMN "newField";
```

### 3. 적용

```bash
# 생성된 down SQL을 psql로 직접 적용
psql $DATABASE_URL -f down.sql
```

### 4. 검증

```bash
bunx prisma migrate status
bunx prisma validate
```

### 5. 사후 조치

- [ ] `prisma/schema.prisma`에서 잘못된 변경 revert
- [ ] 새 마이그레이션 생성 (`migrate dev --name fix_<issue>`)
- [ ] PR 리뷰 후 운영 적용
- [ ] postmortem 작성 (필요 시)

## 데이터 손실 시

1. **즉시 DB 백업** (이미 손실된 경우에도 추가 손실 방지)
2. **Point-in-time recovery** — PostgreSQL의 PITR 사용
3. **관리자 + 팀 리드 알림**

## Squash 중 Custom SQL 손실 시

`./prisma/scripts/squash-migrations.sh`가 감지하지만, 만약 놓쳤다면:

1. `git log`에서 squash 이전 커밋 찾기
2. 해당 마이그레이션의 `migration.sql`에서 custom SQL 추출
3. 새 마이그레이션으로 재적용:
   ```bash
   bunx prisma migrate dev --name restore_custom_sql
   ```
4. 손실된 SQL을 수동으로 `migration.sql`에 추가

## 관련 문서

- [ADR-002 prisma schema architecture](../decisions/adr-002-prisma-schema-architecture.md)
- [docs/common/development/prisma.md](../development/prisma.md) — 정책
- [prisma/CLAUDE.md](../../prisma/CLAUDE.md) — AI 진입점
```

- [ ] **Step 2: Commit**

```bash
git add docs/common/operations/db-rollback-runbook.md
git commit -m "docs(operations): add DB rollback runbook (P0)

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 16: data-models/index.md 작성 (도메인 트리)

**Files:**
- Create: `docs/common/reference/data-models/index.md`

- [ ] **Step 1: data-models/index.md 작성**

`docs/common/reference/data-models/index.md` 생성:

```markdown
# 데이터 모델 — 도메인 트리

> **참조**: 이 문서는 `prisma/models/` 디렉터리의 도메인 트리를 미러링합니다. 새 모델 추가 시 양쪽 모두 갱신.

## 도메인 트리

```
models/
├── core/         # 설정/사이트 (격리 단위)
│   ├── site.prisma          → Site
│   └── view-setting.prisma  → ViewSetting
├── audit/        # 감사 로그
│   └── audit-log.prisma     → AuditLog
├── ipam/         # IP 관리
│   ├── subnet.prisma        → Subnet
│   ├── ip-address.prisma    → IpAddress
│   └── vlan.prisma          → Vlan
├── dcim/         # DCIM
│   ├── device.prisma        → Device
│   ├── rack.prisma          → Rack
│   ├── cable.prisma         → Cable
│   ├── interface.prisma     → Interface
│   └── switch-port.prisma   → SwitchPort
└── cache/        # 캐시/외부 동기화
    └── netbox-cache.prisma  → NetBoxCache
```

## 현재 모델

| 도메인 | 모델 | 파일 | 설명 |
|--------|------|------|------|
| core | ViewSetting | `prisma/models/core/view-setting.prisma` | 뷰별 설정 (icon 등) |
| core | Site | `prisma/models/core/site.prisma` | 사이트 (내부 격리 단위, 향후 추가) |
| cache | NetBoxCache | `prisma/models/cache/netbox-cache.prisma` | NetBox API 캐시 |

## 새 도메인 추가 절차

1. `prisma/models/<new-domain>/` 디렉터리 생성
2. 모델 파일 작성 (`<model>.prisma`)
3. `prisma/schema.prisma`에 `import` 디렉티브 추가
4. `bunx prisma migrate dev --name YYMMDD_<purpose>`
5. **이 문서 갱신** (도메인 트리 + 현재 모델 표)

## 관련 문서

- [prisma/CLAUDE.md](../../../prisma/CLAUDE.md) — AI 진입점
- [prisma/index.md](../../../prisma/index.md) — 디렉터리 구조
- [docs/common/development/prisma.md](../../development/prisma.md) — 규칙
- [docs/common/decisions/adr-002-prisma-schema-architecture.md](../../decisions/adr-002-prisma-schema-architecture.md) — 결정
```

- [ ] **Step 2: Commit**

```bash
git add docs/common/reference/data-models/index.md
git commit -m "docs(reference): add data models index with domain tree

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 17: project.md 트리 갱신

**Files:**
- Modify: `docs/common/foundation/project.md`

- [ ] **Step 1: 현재 prisma 트리 위치 확인**

```bash
grep -A 5 "prisma/" docs/common/foundation/project.md
```

Expected: 현재 단일 파일 구조 설명 (`schema.prisma`, `migrations/`, `seed.ts`).

- [ ] **Step 2: project.md의 prisma 트리 갱신**

`docs/common/foundation/project.md`의 prisma 트리 섹션을 다음으로 교체:

```markdown
├── prisma/                     # DB 스키마 + 마이그레이션 + 시드 (multi-file)
│   ├── schema.prisma           # generator + datasource + import
│   ├── config/                 # prisma.config.ts
│   ├── models/<domain>/        # 1 모델 = 1 파일
│   ├── enums/                  # 전사 공통 enum
│   ├── migrations/             # 마이그레이션 SQL
│   ├── seeds/                  # 시드 데이터
│   ├── scripts/                # check-prisma, squash-migrations
│   ├── CLAUDE.md               # AI 진입점
│   └── index.md                # 사람용 구조
```

- [ ] **Step 3: Commit**

```bash
git add docs/common/foundation/project.md
git commit -m "docs(foundation): update project tree for multi-file prisma structure

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 18: Cross-linking 검증 (1-hop 도달)

**Files:** 없음 (검증만)

- [ ] **Step 1: prisma/CLAUDE.md의 5개 링크 검증**

```bash
for link in \
  "../docs/common/development/prisma.md" \
  "../docs/common/decisions/adr-002-prisma-schema-architecture.md" \
  "../docs/common/reference/data-models/index.md" \
  "../docs/common/operations/db-rollback-runbook.md" \
  "./index.md"; do
  target="prisma/$link"
  if [ -e "$target" ]; then
    echo "✅ $target"
  else
    echo "❌ $target"
  fi
done
```

Expected: 모두 ✅ (Task 11-17 완료 후).

- [ ] **Step 2: docs/common/development/prisma.md의 back-link 검증**

```bash
for link in \
  "../../../prisma/CLAUDE.md" \
  "../../../prisma/index.md" \
  "../../decisions/adr-002-prisma-schema-architecture.md" \
  "../../operations/db-rollback-runbook.md"; do
  target="docs/common/development/$link"
  if [ -e "$target" ]; then
    echo "✅ $target"
  else
    echo "❌ $target"
  fi
done
```

Expected: 모두 ✅.

- [ ] **Step 3: ADR-002의 back-link 검증**

```bash
for link in \
  "../../operations/db-rollback-runbook.md" \
  "../../development/prisma.md"; do
  target="docs/common/decisions/adr-002-prisma-schema-architecture/$link"
  if [ -e "$target" ]; then
    echo "✅ $target"
  else
    echo "❌ $target"
  fi
done
```

Expected: 모두 ✅.

- [ ] **Step 4: 결과 종합**

모두 ✅면 spec 요구사항 충족. ❌ 있으면 해당 문서 수정.

- [ ] **Step 5: no-op commit (문제 없었을 경우) 또는 fix commit**

문제 있었다면:
```bash
git add -A
git commit -m "docs: fix broken cross-links

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
```

문제 없었으면 skip.

---

## Self-Review

### Spec coverage check

| Spec 섹션 | Task |
|----------|------|
| 디렉터리 구조 (multi-file, models/<domain>/, enums/, seeds/, scripts/, config/) | Task 1, 2 |
| schema.prisma (generator + datasource + driverAdapters + directUrl) | Task 2 |
| ViewSetting, NetBoxCache multi-file 이동 | Task 3, 4 |
| prisma.config.ts (seed 등록) | Task 5 |
| package.json (prisma to deps, db:seed scripts) | Task 6 |
| check-prisma.sh (네이밍/길이/예약어 + Squawk) | Task 7 |
| squash-migrations.sh (custom SQL 감지 + dry-run) | Task 8 |
| 마이그레이션 reset + 재생성 | Task 9 |
| 전체 검증 | Task 10 |
| prisma/CLAUDE.md (AI 진입점) | Task 11 |
| prisma/index.md (사람용 구조) | Task 12 |
| docs/common/development/prisma.md (정책/규칙) | Task 13 |
| ADR-002 (multi-file + 명명 + CI) | Task 14 |
| db-rollback-runbook.md (P0) | Task 15 |
| data-models/index.md (도메인 트리) | Task 16 |
| project.md 트리 갱신 | Task 17 |
| Cross-linking 1-hop 도달 | Task 18 |

**Coverage**: 18/18 spec 항목 커버. ✓

### Type/명명 consistency

- 모든 import 경로: `./models/<domain>/<model>.prisma` 형식 (kebab-case) ✓
- 모든 스크립트 chmod +x ✓
- 모든 ADR/문서 link 경로: `../<file>.md` 형식 ✓
- 모든 commit: `Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>` 포함 ✓

### Placeholder scan

- "TBD"/"TODO" 없음
- 모든 step에 실제 명령어/코드
- "Similar to Task N" 없음 (모두 독립적)

### Edge cases handled

- Task 9에서 마이그레이션 reset 후 seed 파일 placeholder (Task 11의 placeholder가 일찍 필요)
- Task 7-8의 dry-run으로 스크립트 자체 검증
- Task 18의 cross-link 검증으로 1-hop 도달 보장
