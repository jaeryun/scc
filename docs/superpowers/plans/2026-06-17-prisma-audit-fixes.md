# Prisma Audit 수정 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** Technical writer 감사로 발견된 12개 finding (Critical 4 + Important 5 + Minor 3) 모두 해결. 빌드 파이프라인, 문서 cross-link, quickstart, troubleshooting 모두 정비.

**Architecture:**
- Critical 4개: 빌드 파이프라인 + README + build-deploy
- Important 5개: cross-link 완성 + quickstart + package.json 정리
- Minor 3개: generated/ lifecycle + troubleshooting + .env 일관성

**Tech Stack:** Prisma 7.8.0, Next.js 16, Bash, Bun

---

## File Structure

**Modify:**
- `scripts/check-migrations.sh` — 옛 Prisma 6 single-file → Prisma 7 folder-based 갱신
- `package.json` — prebuild 명령 갱신, deprecated `prisma.seed` 제거
- `README.md` — Prisma CLI 명령어에 `--config` 추가
- `docs/common/operations/build-deploy.md` — Prisma CLI 명령어에 `--config` 추가, env vars에 SHADOW_DATABASE_URL 추가
- `docs/common/foundation/project.md` — env vars 표에 SHADOW_DATABASE_URL 추가
- `prisma/CLAUDE.md` — quickstart 섹션 추가, troubleshooting 섹션 추가, generated/ lifecycle 설명
- `docs/common/development/prisma.md` — data-models 링크 추가, troubleshooting 섹션 추가
- `docs/common/decisions/adr-002-prisma-schema-architecture.md` — cross-link 완성 (prisma/index.md, data-models)
- `docs/common/operations/db-rollback-runbook.md` — cross-link 완성 (prisma/index.md, data-models)
- `docs/common/reference/data-models/index.md` — cross-link 완성 (runbook)

**Update references to old `scripts/check-migrations.sh`**:
- `package.json` prebuild
- `docs/common/foundation/project.md` (line 81)
- `docs/common/operations/build-deploy.md` (line 70)
- `scripts/index.md`

---

## Tasks

### Task A1: scripts/check-migrations.sh Prisma 7 패턴으로 갱신 [CRITICAL]

**Files:**
- Modify: `scripts/check-migrations.sh`

`scripts/check-migrations.sh`는 옛 Prisma 6 단일 파일을 가정. 현재 `prisma/schema.prisma`는 삭제됐고 schema는 `prisma/models/` 폴더. 다음 변경:

1. 모든 `bunx prisma migrate diff` 호출에 `--config prisma/config/prisma.config.ts` 추가
2. 옛 schema 경로 참조 (`prisma/schema.prisma`) 제거
3. Env loading을 `.env.local` → `.env`로 (Prisma 7 prisma.config.ts가 `.env` 사용)
4. Prisma 7 patterns 적용 (datasource URL은 config에서, schema는 폴더)

**검증**: `bash scripts/check-migrations.sh` 실행 시 성공 (또는 no-op)해야 함.

- [ ] **Step 1**: 기존 스크립트 백업
- [ ] **Step 2**: 스크립트 갱신 (Prisma 7 patterns)
- [ ] **Step 3**: 실행 검증
- [ ] **Step 4**: Commit

---

### Task A2: package.json 정리 (prebuild, deprecated prisma.seed) [CRITICAL + Important #5]

**Files:**
- Modify: `package.json`

1. `prebuild` 스크립트가 `scripts/check-migrations.sh` 호출. Task A1 완료 후 동작. 또는 Prisma 7의 새 패턴 사용:
   - `bunx prisma validate --config prisma/config/prisma.config.ts && bun run generate-api-spec`
2. `prisma.seed` 제거 (Prisma 7에서 deprecated; prisma.config.ts에 이미 있음)
3. SHADOW_DATABASE_URL이 `.env`에 명시되어 있는지 확인 (없으면 추가)

- [ ] **Step 1**: package.json 확인
- [ ] **Step 2**: `prisma.seed` 제거
- [ ] **Step 3**: prebuild 갱신 (check-migrations.sh 의존 제거 또는 갱신된 스크립트 사용)
- [ ] **Step 4**: Commit

---

### Task A3: README.md Prisma CLI 명령어에 --config 추가 [CRITICAL]

**Files:**
- Modify: `README.md` (lines 104-105, 143-145)

모든 `bunx prisma` 명령어에 `--config prisma/config/prisma.config.ts` 추가 (6개 명령어).

- [ ] **Step 1**: README.md에서 prisma 명령어 위치 확인
- [ ] **Step 2**: 모든 prisma 명령어에 `--config` 추가
- [ ] **Step 3**: Commit

---

### Task A4: build-deploy.md Prisma CLI 명령어에 --config 추가 + env vars 갱신 [CRITICAL + Important #12]

**Files:**
- Modify: `docs/common/operations/build-deploy.md`

1. Prisma CLI 명령어에 `--config prisma/config/prisma.config.ts` 추가
2. env vars 표에 `SHADOW_DATABASE_URL` 추가
3. 옛 `scripts/check-migrations.sh` 참조 갱신 (Task A1과 연동)

- [ ] **Step 1**: build-deploy.md 확인
- [ ] **Step 2**: Prisma CLI 명령어 갱신
- [ ] **Step 3**: env vars 표 갱신
- [ ] **Step 4**: Commit

---

### Task A5: Cross-link 완성 (ADR, runbook, data-models) [Important #6, #7]

**Files:**
- Modify: `docs/common/decisions/adr-002-prisma-schema-architecture.md`
- Modify: `docs/common/operations/db-rollback-runbook.md`
- Modify: `docs/common/reference/data-models/index.md`
- Modify: `docs/common/development/prisma.md`

각 문서가 다른 4개 Prisma 관련 문서로의 1-hop cross-link를 갖도록 보장. 현재:
- `prisma/CLAUDE.md` ↔ `prisma/index.md` ✅
- `prisma/CLAUDE.md` → `prisma.md`, `ADR`, `data-models`, `runbook` ✅
- `prisma/index.md` → `prisma/CLAUDE.md`, `prisma.md`, `ADR`, `data-models`, `runbook` ✅
- `prisma.md` → `prisma/CLAUDE.md`, `prisma/index.md`, `ADR`, `runbook` ❌ data-models 누락
- `ADR` → `prisma.md`, `runbook`, `prisma/CLAUDE.md` ❌ prisma/index.md, data-models 누락
- `runbook` → `prisma.md`, `ADR`, `prisma/CLAUDE.md` ❌ prisma/index.md, data-models 누락
- `data-models` → `prisma/CLAUDE.md`, `prisma/index.md`, `prisma.md`, `ADR` ❌ runbook 누락

**수정**: 각 문서에 누락된 링크 추가.

- [ ] **Step 1**: prisma.md에 data-models 링크 추가
- [ ] **Step 2**: ADR에 prisma/index.md, data-models 링크 추가
- [ ] **Step 3**: runbook에 prisma/index.md, data-models 링크 추가
- [ ] **Step 4**: data-models에 runbook 링크 추가
- [ ] **Step 5**: 1-hop 검증
- [ ] **Step 6**: Commit (4개 파일 합쳐서)

---

### Task A6: Quickstart 섹션 추가 [Important #8]

**Files:**
- Modify: `prisma/CLAUDE.md` (또는 README.md)

신규 개발자를 위한 "Prisma 첫 설정" 절차 추가:

```bash
# 1. 의존성 설치
bun install

# 2. .env 설정
cp .env.example .env
# .env에 DATABASE_URL, SHADOW_DATABASE_URL 설정 (Docker compose postgres 기준)

# 3. Prisma client 생성
bunx prisma generate --config prisma/config/prisma.config.ts

# 4. 마이그레이션 적용
bunx prisma migrate dev --name YYMMDD_init --config prisma/config/prisma.config.ts

# 5. 검증
bunx prisma validate --config prisma/config/prisma.config.ts
./prisma/scripts/check-prisma.sh
```

- [ ] **Step 1**: prisma/CLAUDE.md에 Quickstart 섹션 추가
- [ ] **Step 2**: Commit

---

### Task A7: prisma/generated/ lifecycle + troubleshooting 가이드 [Minor #10, #11]

**Files:**
- Modify: `prisma/CLAUDE.md` (generated/ lifecycle + troubleshooting)
- Modify: `docs/common/development/prisma.md` (troubleshooting)

1. `prisma/generated/` 디렉토리 lifecycle 설명:
   - `bunx prisma generate`로 자동 생성
   - gitignore됨 (수동 편집 X)
   - import 경로: `../../prisma/generated/client`

2. Prisma 7 일반 에러 troubleshooting:
   - P1012: schema import 오류 → config 경로 확인
   - "needs to be constructed with a non-empty, valid PrismaClientOptions" → adapter 누락
   - "Schema at ... not found" → `--config` 누락
   - "Cannot find module '../../prisma/generated/client'" → `prisma generate` 미실행

- [ ] **Step 1**: prisma/CLAUDE.md 갱신
- [ ] **Step 2**: prisma.md 갱신
- [ ] **Step 3**: Commit

---

### Task A8: project.md env vars + 옛 스크립트 참조 [Important #9, #12]

**Files:**
- Modify: `docs/common/foundation/project.md`

1. env vars 표에 `SHADOW_DATABASE_URL` 추가
2. 옛 `scripts/check-migrations.sh` 참조 (line 81) → 새 `prisma/scripts/check-prisma.sh` 또는 갱신된 스크립트 반영

- [ ] **Step 1**: project.md 확인
- [ ] **Step 2**: env vars 표 갱신
- [ ] **Step 3**: 옛 스크립트 참조 갱신
- [ ] **Step 4**: Commit

---

### Task A9: scripts/index.md 옛 스크립트 참조 [Important #9]

**Files:**
- Modify: `scripts/index.md`

Task A1과 연동. 옛 `check-migrations.sh` 참조 갱신.

- [ ] **Step 1**: scripts/index.md 확인
- [ ] **Step 2**: 참조 갱신
- [ ] **Step 3**: Commit

---

## Self-Review

### Spec coverage (12 findings):

| Finding | Task |
|---------|------|
| 1. scripts/check-migrations.sh stale | A1 |
| 2. build-deploy.md Prisma commands | A4 |
| 3. README.md Prisma commands | A3 |
| 4. Cross-link broken (committed) | (이미 commit됨, Task 18 fix) |
| 5. package.json#prisma.seed | A2 |
| 6. prisma.md missing data-models | A5 |
| 7. Cross-link incomplete | A5 |
| 8. No quickstart | A6 |
| 9. Old check-migrations.sh references | A1, A8, A9 |
| 10. prisma/generated/ lifecycle | A7 |
| 11. No troubleshooting | A7 |
| 12. project.md env vars | A4, A8 |

**Coverage**: 12/12 finding covered ✓
