# Prisma 스키마 아키텍처 재설계

- **날짜**: 2026-06-17
- **상태**: Draft (검토 대기)
- **대상**: `prisma/` 디렉터리 및 관련 문서
- **리뷰**: Database Optimizer agent 24 finding 반영 후 lean 적용

## 배경 및 동기

현재 `prisma/`는 단일 `schema.prisma` (2 모델) + 단일 init 마이그레이션 + 가이드 문서. 향후 수백 모델 + 다수 마이그레이션까지 성장을 고려해 베스트 프랙티스 기반으로 처음부터 설계한다. 자사 only (DCIM 내부 도구)로 멀티테넌트는 범위 밖.

## 목표

1. 확장 가능한 스키마 조직화 (수백 모델 대비)
2. 명명/구조 규칙 CI 강제
3. 마이그레이션 안전성 (Squawk + custom SQL 보존)
4. 운영 자동화 (CI/CD)
5. 시드/테스트 체계 (co-located, idempotent)

## 비목표

- 멀티테넌트 (SaaS화) — 자사 only
- PostgreSQL multi-schema
- 별도 운영 거버넌스 (4-eyes review with dedicated DB person, P0 runbook) — 팀 규모에 비현실적

## `prisma db push` 정책 (재검토)

기존 `docs/common/development/prisma.md`의 "절대 금지" 규칙은 너무 빡빡함. 환경별 정책으로 변경:

| 환경 | `prisma db push` | 비고 |
|------|-----------------|------|
| 로컬 dev (DB 비어있거나 무손실) | ✅ 허용 | 빠른 스키마 반복. `bunx prisma db push` |
| CI test DB (매번 fresh) | ✅ 허용 | 데이터 없음. `prisma db push --accept-data-loss` OK |
| Staging (시드 데이터) | ❌ 금지 | `prisma migrate deploy`만 |
| Production | ❌ 금지 | `prisma migrate deploy`만 |

**근거**:
- `db push`의 위험은 **데이터 손실**이지 스키마 변경 자체가 아님
- 데이터가 없는 환경에선 `db push`가 정당한 도구 (Prisma 공식 "prototyping" 권장)
- `prisma db push --accept-data-loss`는 데이터 손실이 예상될 때 명시적 승인 플래그 (CI test에서 의도적 사용 OK)

**워크플로 가이드**:
- 새 모델 추가/제거: `prisma migrate dev --name <purpose>` (마이그레이션 히스토리 유지)
- 로컬에서 빠른 반복 (DB 비어있음): `prisma db push`
- Production: 절대 `db push` 금지. `migrate deploy`만

기존 `docs/common/development/prisma.md`의 prisma.md 규칙은 본 spec과 함께 추후 갱신.

## 디렉터리 구조

```
prisma/
├── schema.prisma                          # generator + datasource
├── config/
│   └── prisma.config.ts                   # schema 경로 명시
├── models/                                # 도메인별 multi-file (multi-depth)
│   ├── core/                              # 설정/사이트
│   │   ├── site.prisma
│   │   └── view-setting.prisma
│   ├── audit/                             # 감사 로그
│   │   └── audit-log.prisma
│   ├── ipam/                              # IP 관리
│   │   ├── subnet.prisma
│   │   ├── ip-address.prisma
│   │   └── vlan.prisma
│   ├── dcim/                              # DCIM (디바이스/랙/케이블/인터페이스/스위치)
│   │   ├── device.prisma
│   │   ├── rack.prisma
│   │   ├── cable.prisma
│   │   ├── interface.prisma
│   │   └── switch-port.prisma
│   └── cache/                             # 캐시/외부 동기화
│       └── netbox-cache.prisma
├── enums/
│   └── common.prisma                      # 전사 공통 enum만 (도메인 enum은 모델 파일과 공존)
├── migrations/                            # Prisma 마이그레이션 (기계 생성)
│   ├── migration_lock.toml
│   └── YYYYMMDDHHMMSS_<purpose>/
│       └── migration.sql
├── seeds/
│   └── index.ts                           # 도메인별 시드 (idempotent, 필요 시 분리)
├── scripts/
│   ├── check-prisma.sh                    # 네이밍/길이/예약어 + Squawk 통합
│   └── squash-migrations.sh               # custom SQL 자동 감지 + dry-run
├── CLAUDE.md
└── index.md
```

> **1차 메커니즘**: `prisma.config.ts`의 `schema: "prisma/models"` 경로. 명시적 import 디렉티브는 사용하지 않음.

## 스키마 조직 규칙

- **모델 + 그 모델 전용 enum**을 한 파일에 공존 (Prisma 권장)
- **1차 메커니즘** = `prisma.config.ts`의 schema 경로 (import 디렉티브 X)
- 도메인 디렉터리: `models/<domain>/<model>.prisma`. 도메인 추가 시 새 디렉터리

### `schema.prisma` 예시

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")        // pooler
  directUrl         = env("DIRECT_URL")          // migrations + RLS bypass
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

> `directUrl`: connection pooler 사용 시 마이그레이션/RLS 우회. `driverAdapters`: Prisma 6 GA.

## 명명 규칙

### 모델

- **PascalCase 단수형** — `Subnet`, `IpAddress`
- **도메인 접두사 회피** — `IpamSubnet` ❌, `Subnet` ✅
- **예약어 차단** — `User`/`Comment`/`Order` ❌ (PostgreSQL 예약어)

### 필드

- **camelCase** — `networkCidr`, `createdAt`, `deletedAt`
- **FK** — `{modelName}Id` (예: `siteId`)

### 인덱스/제약

- **단일** — `${Model}_${field}_idx`
- **유니크** — `${Model}_${field}_key`
- **복합 유니크** — `@@unique([siteId, networkCidr])`
- **길이 한도** — PostgreSQL 식별자 **63바이트**. `check-prisma.sh`에 50자 마진 검증
- **Partial index** — `@@index([field]) WHERE deletedAt IS NULL` (soft delete 모델)
- **GIN/INCLUDE** — 필요 시 ADR에 명시

### Enum

- **위치** — 모델 파일 내부 (전사 공통만 `enums/common.prisma`)
- **변경 정책** — **값 추가만 허용** (`ALTER TYPE ... ADD VALUE`). 제거/이름변경/순서변경은 새 enum + column migration 패턴. ADR에 기록

### Relation

- `onDelete`/`onUpdate` **명시 필수**
- **Cascade** — 부모 삭제 시 자식도 (예: 사이트 → 서브넷)
- **Restrict** — 참조 중이면 거부 (예: 디바이스가 참조 중인 사이트)
- **SetNull** — 참조만 끊기 (예: 디바이스 owner)

## 마이그레이션 정책

### 명명

- Prisma 자동 prefix `YYYYMMDDHHMMSS_` (변경 불가)
- 수동 형식: `YYMMDD_<purpose>` 또는 `YYMMDD_<ticket>_<purpose>`
- **금지**: `update`, `fix`, `changes` 같은 무의미한 이름

### 커밋 규칙

- **스키마와 마이그레이션은 항상 함께 커밋** — `schema.prisma` + `migrations/`
- `migration_lock.toml` 형상관리 포함

### Squash 정책

- **임계값 75개 초과 시** 1회 squash
- 워크플로:
  1. `scripts/squash-migrations.sh --dry-run` (custom SQL 감지)
  2. prod DB 백업
  3. `prisma/migrations/` 삭제
  4. `00000000000000_squashed_migrations/migration.sql` 생성
  5. `prisma migrate diff --from-empty --to-schema ./prisma/schema.prisma --script > migration.sql`
  6. `prisma migrate resolve --applied 00000000000000_squashed_migrations`
  7. `prisma migrate diff --from-migrations ... --to-schema-datamodel ... --shadow-database-url $SHADOW_DATABASE_URL` 검증
- **Custom SQL 보존** — `squash-migrations.sh`가 `CREATE OR REPLACE FUNCTION | TRIGGER | POLICY | VIEW | CREATE INDEX CONCURRENTLY` 자동 감지 → squash 중단 + 사람 확인

### Rollback

- Prisma는 down 마이그레이션 자동 생성 안 함. `migrate diff`로 수동 생성
- **`migrate dev --create-only`**로 SQL PR 단계에서 검토
- **PR 리뷰**로 운영 마이그레이션 검증 (전용 DB 담당자 없이 표준 리뷰)
- 운영 DB 마이그레이션은 트래픽 低谷 시간 또는 read-only 모드

## Soft Delete / Connection Pooling / Seed

### Soft delete (가이드)

- `deletedAt DateTime?` 필드 + application layer `where: { deletedAt: null }` 일관 적용
- Partial index `@@index([field]) WHERE deletedAt IS NULL` 사용 권장
- **필요한 모델에 적용** (강제 X)

### Connection pooling

- `directUrl` + `driverAdapters` (위 schema.prisma 예시)
- Vercel/Neon/Supabase 환경에서 pooler URL 사용, 마이그레이션은 `directUrl`로

### Seed

- `prisma/seeds/index.ts` 진입점, 환경별 분기 (`SEED_ENV`)
- **Idempotent** — `upsert` (PK 기준) 또는 cache 모델은 `deleteMany` + `createMany`
- **명시적 환경 가드** — `if (env === 'prod') return` (조건 누락 방지)
- **통계 로그** — `{ inserted: N, skipped: M, updated: K }`
- 도메인별 seed 파일은 **필요 시** 분리 (지금은 단일 진입점으로 시작)

## 테스트 전략

- **Co-located** — `src/modules/<name>/api/service.test.ts`
- Factory: `src/modules/<name>/__tests__/factories/<model>.factory.ts` (수동, `@faker-js/faker` 활용)
- 통합 테스트: `*.integration.test.ts` glob (기존 `bun test:integration` 활용)
- `TEST_DATABASE_URL` 별도 env, 트랜잭션 롤백으로 격리

## CI/CD

### 검증 (PR 단계, 3단계)

```bash
bunx prisma validate                                    # 스키마 문법/관계
./prisma/scripts/check-prisma.sh                        # 네이밍/길이/예약어 + Squawk
bunx prisma format --check                              # 의도치 않은 reformat 감지
```

`check-prisma.sh` 통합 스크립트:
```bash
#!/usr/bin/env bash
set -euo pipefail
# 1. 마이그레이션 폴더명 검증
for m in prisma/migrations/*/; do
  name=$(basename "$m")
  [[ "$name" =~ ^[0-9]{14}_[a-z0-9_-]+$ ]] || { echo "❌ $name"; exit 1; }
done
# 2. 인덱스 길이 검증 (50자 마진)
# 3. 예약어 모델명 차단
# 4. Squawk (마이그레이션 SQL lint)
npx squawk prisma/migrations/*/migration.sql
```

### 배포 (main 머지)

- `bunx prisma migrate deploy` — CI/CD 자동 실행
- `prisma`는 `dependencies`에 위치 (Vercel 등 devDeps prune 대비)
- `DATABASE_URL`, `DIRECT_URL` CI secret에서 주입

## 재구성 단계 (2 Phases)

### Phase 1: 골격 + 도구 (즉시)

1. `prisma/config/`, `prisma/models/`, `prisma/enums/`, `prisma/seeds/`, `prisma/scripts/` 디렉터리 생성
2. 기존 `schema.prisma` 재작성 (generator + `previewFeatures`, datasource + `directUrl`)
3. 도메인별 디렉터리 + 기존 모델 분리:
   - `ViewSetting` → `prisma/models/core/view-setting.prisma`
   - `NetBoxCache` → `prisma/models/cache/netbox-cache.prisma`
4. `prisma/config/prisma.config.ts` 작성 (`schema: "prisma/models"`)
5. `prisma/scripts/check-prisma.sh` 작성 (네이밍/길이/예약어 + Squawk)
6. `prisma/scripts/squash-migrations.sh` 작성 (custom SQL 감지 + dry-run)
7. `package.json`의 `prisma.seed` 등록, `prisma`를 `dependencies`로 이동
8. `prisma migrate reset` → 새 init 마이그레이션 생성
9. `prisma migrate dev` 검증

### Phase 2: 문서 (즉시)

#### 2.1 Prisma 디렉터리 진입점

10. `prisma/CLAUDE.md` 전면 개정 — **AI 진입점**. 아래 문서들로의 cross-link 명시:
    - `docs/common/development/prisma.md` (규칙)
    - `docs/common/decisions/adr-002-prisma-schema-architecture.md` (결정)
    - `docs/common/reference/data-models/` (데이터 모델)
    - `docs/common/operations/db-rollback-runbook.md` (운영)
    - `prisma/index.md` (사람용 구조)
11. `prisma/index.md` 전면 개정 (구조 + 도메인 트리, 사람용)

#### 2.2 정책/규칙 문서

12. `docs/common/development/prisma.md` 전면 갱신:
    - `db push` 환경별 정책 (로컬/CI ✅, staging/prod ❌)
    - squash 정책 (임계값 75, custom SQL 자동 감지)
    - 명명 규칙 (PascalCase, kebab-case 파일, 인덱스 길이 63B, 예약어 차단)
    - enum 정책 (추가만 허용)
    - CI/CD 3단계 (validate + check-prisma + format --check)
    - soft delete 가이드
    - connection pooling (`directUrl` + `driverAdapters`)

#### 2.3 결정/구조 문서

13. `docs/common/foundation/project.md` 트리 갱신
14. `docs/common/decisions/adr-002-prisma-schema-architecture.md` ADR 작성 (multi-file + 명명 + CI 통합, 3 섹션)
15. `docs/common/operations/db-rollback-runbook.md` 신규 작성 (P0 runbook)

#### 2.4 AI 네비게이션 보장

16. `prisma/CLAUDE.md`에서 모든 Prisma 관련 문서로의 링크 검증 (4개 이상)
17. 각 문서(`prisma.md`, ADR, runbook)에도 상호 link 추가
18. `docs/common/reference/data-models/index.md` 신규 작성 (도메인 트리 + prisma/models/ 미러)

#### AI 네비게이션 맵

Prisma 작업 시 AI가 따라야 할 탐색 경로:

```
prisma/CLAUDE.md (진입점)
├─→ docs/common/development/prisma.md (규칙/네이밍/CI)
├─→ docs/common/decisions/adr-002-prisma-schema-architecture.md (결정)
├─→ docs/common/reference/data-models/ (데이터 모델 상세)
├─→ docs/common/operations/db-rollback-runbook.md (P0 운영)
└─→ prisma/index.md (구조/도메인 트리)
```

각 문서는 다른 4개 문서로의 back-link 포함. AI가 어느 문서에서 시작하든 전체 Prisma 컨텍스트에 도달 가능해야 함.

## 위험 및 완화

| 위험 | 영향 | 완화 |
|------|------|------|
| 마이그레이션 reset 시 데이터 손실 | 높음 (prod) | dev/staging에서만 실행. prod는 `migrate deploy`만 |
| squash 중 커스텀 SQL 손실 | 중간 | `squash-migrations.sh` 자동 감지 + 사람 확인 |
| Multi-file 스키마 학습 곡선 | 낮음 | `prisma/CLAUDE.md`에 예시 + ADR |
| 도메인 경계 모호 | 중간 | 도메인 결정 시 ADR 기록 |
| Seed가 prod에 영향 | 높음 | 명시적 환경 가드 + 통계 로그 |
| Connection limit 소진 (Vercel) | 높음 | `directUrl` + `driverAdapters` |
| 인덱스명 63바이트 초과 | 중간 | `check-prisma.sh` 길이 사전 검증 |
| Enum 변경 시도 | 중간 | ADR에 "추가만 허용" 정책 |
| 운영 마이그레이션 락 경합 | 높음 | Low-traffic 시간대 + PR 리뷰 |
| Prisma client 번들 (50+ 모델) | 낮음 | 50+ 도달 시 v7 generator 검토 (ADR 노트) |

## 결정 기록

- `docs/common/decisions/adr-002-prisma-schema-architecture.md` — multi-file + 명명 + CI 통합 ADR
  - 섹션 1: Multi-file 채택 근거 + `prisma.config.ts` schema 경로
  - 섹션 2: 명명 규칙 (인덱스 길이, 예약어, enum 정책, partial index)
  - 섹션 3: CI/CD (Squawk 선택, 락 경합, Prisma v6→v7 마이그레이션 노트)

## 관련 문서 위치

| 문서 종류 | 위치 | 대상 독자 |
|-----------|------|----------|
| **진입점 (AI)** | `prisma/CLAUDE.md` | AI 에이전트 — 다른 Prisma 문서로의 link hub |
| 진입점 (사람) | `prisma/index.md` | 사람 — 디렉터리 구조 + 도메인 트리 |
| 규칙/네이밍/CI | `docs/common/development/prisma.md` | AI + 사람 — 모든 정책/규칙 |
| 아키텍처 결정 | `docs/common/decisions/adr-002-prisma-schema-architecture.md` | AI + 사람 — multi-file + 명명 + CI 결정 |
| 데이터 모델 | `docs/common/reference/data-models/index.md` | AI + 사람 — 도메인별 모델 상세 |
| 운영 runbook | `docs/common/operations/db-rollback-runbook.md` | AI + 사람 — P0 마이그레이션 롤백 절차 |
| 본 스펙 | `docs/superpowers/specs/2026-06-17-prisma-schema-architecture-design.md` | 사람 — brainstorming 산출물 |

**AI 네비게이션 정책**: 어느 문서에서 시작하든 1-hop 내에 모든 Prisma 관련 문서에 도달 가능해야 함. 각 문서는 진입점 + 인접 4개 문서로의 back-link 필수.

## 출처 (베스트 프랙티스)

- [Prisma multi-file schema](https://www.prisma.io/docs/orm/prisma-schema/overview/location)
- [Prisma squashing migrations](https://www.prisma.io/docs/orm/prisma-migrate/workflows/squashing-migrations)
- [Prisma generating down migrations](https://www.prisma.io/docs/orm/prisma-migrate/workflows/generating-down-migrations)
- [Prisma team development](https://www.prisma.io/docs/orm/prisma-migrate/workflows/team-development)
- [Prisma deploy](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate)
- [Prisma prisma-config reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Prisma prisma-client generator (v7)](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client)
- [Squawk — PostgreSQL migration linter](https://squawkhq.com/)
- [PostgreSQL identifiers (63바이트 한도)](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS)

## 다음 단계

1. 사용자 spec 검토
2. 승인 후 `writing-plans` skill로 implementation plan 작성
3. Phase 1-2 순차 실행
