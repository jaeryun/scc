# Prisma 규칙

> **상세 위치**: [prisma/CLAUDE.md](../../../prisma/CLAUDE.md) (AI 진입점), [prisma/index.md](../../../prisma/index.md) (디렉터리 구조), [ADR-002](../../decisions/adr-002-prisma-schema-architecture.md) (결정)

## 스키마 구조 (Multi-file, Prisma 7)

- **도메인 디렉터리** — `prisma/models/<domain>/<model>.prisma`
- **1 모델 = 1 파일** + 전용 enum 같은 파일
- **Generator/Datasource** — `prisma/models/schema.prisma` (root, 모델 없음)
- **Multi-file 메커니즘** — `prisma.config.ts`의 `schema`를 폴더 경로로 지정 (folder-based auto-discovery)
- **import 디렉티브 사용 안 함** (Prisma 7은 subdirectory import 미지원)

## Prisma 7 핵심 변경사항

- **Generator**: `prisma-client` (output 경로 명시 필수)
- **Driver adapter 필수**: SQL providers는 `@prisma/adapter-pg` + `pg` 필요
- **Datasource URL**: `prisma.config.ts`의 `datasource` 블록 (schema.prisma에 없음)
- **Env loading**: `dotenv.config({ path: '.env' })` 명시 (Prisma 7은 auto-load 안 함)
- **Migrations path**: `prisma.config.ts`의 `migrations.path`로 명시

## 허용된 명령어

| 명령어 | 용도 |
|--------|------|
| `prisma migrate dev --name YYMMDD_<purpose>` | 스키마 변경 시 마이그레이션 생성/적용 |
| `prisma migrate deploy` | 대기 마이그레이션 적용 (운영) |
| `prisma generate` | Prisma 7 client 재생성 (output 경로로) |
| `prisma migrate status` | 적용 상태 확인 |
| `prisma migrate diff` | 스키마/migration 간 diff |
| `prisma validate` | 스키마 문법 검증 |
| `prisma format` / `prisma format --check` | 포맷팅 / 검증 |

> **Note**: 모든 prisma CLI 명령에 `--config prisma/config/prisma.config.ts` 필요 (config가 서브디렉터리에 있어 자동 탐색 안 됨)

## `prisma db push` 정책

| 환경 | `db push` | 비고 |
|------|-----------|------|
| 로컬 dev (DB 비어있음) | ✅ 허용 | 빠른 스키마 반복 |
| CI test DB (fresh) | ✅ 허용 | `--accept-data-loss` OK |
| Staging (시드 데이터) | ❌ 금지 | `migrate deploy`만 |
| Production | ❌ 금지 | `migrate deploy`만 |

**근거**: 위험은 "스키마 변경"이 아니라 "데이터 손실". 데이터 없는 환경은 안전. Prisma 공식 "prototyping" 권장.

## 마이그레이션

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

## Driver Adapter (필수)

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });
```

**왜 필요한가**:
- Prisma 7은 SQL providers에 driver adapter 필수
- 기존 `new PrismaClient()`는 더 이상 작동 안 함
- `@prisma/adapter-pg` + `pg` 설치 필요

## CI/CD

### 검증 (3단계)

```bash
bunx prisma validate --config prisma/config/prisma.config.ts
./prisma/scripts/check-prisma.sh
bunx prisma format --check --config prisma/config/prisma.config.ts
```

### 배포

- `bunx prisma migrate deploy --config prisma/config/prisma.config.ts` (main 머지 시)
- `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`는 `dependencies`에 위치 (Vercel devDeps prune 대비)

## Soft Delete (가이드)

- `deletedAt DateTime?` 필드 + application layer `where: { deletedAt: null }`
- Partial index `@@index([field]) WHERE deletedAt IS NULL` 사용
- **필요한 모델에 적용** (강제 X)

## Shadow DB (개발)

- `prisma migrate dev`는 shadow DB로 변경 검증
- `SHADOW_DATABASE_URL` 별도 DB, `prisma.config.ts`의 `datasource.shadowDatabaseUrl`에 설정
- shadow DB는 `prisma migrate reset`으로 정리

## 금지 패턴

- ❌ `db push` in staging/production
- ❌ 마이그레이션 파일 직접 수정 (재실행 시 충돌)
- ❌ `prisma db push --accept-data-loss` in production
- ❌ 모델 간 cross-module query (모듈 경계 무시)
- ❌ `new PrismaClient()` (adapter 없이, Prisma 7에서 미작동)

## 변경 이력

- 2026-06-17: Prisma 7 마이그레이션, multi-file folder-based, driver adapter, db push 정책, AI 네비게이션 추가 (ADR-002)
