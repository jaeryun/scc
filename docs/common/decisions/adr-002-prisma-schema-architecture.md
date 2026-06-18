# ADR-002: Prisma 스키마 아키텍처 (Prisma 7 multi-file)

- **날짜**: 2026-06-17
- **상태**: 승인
- **맥락**: 단일 `schema.prisma` (2 모델) + 단일 init 마이그레이션 → Prisma 7 multi-file folder-based architecture

## 결정

Prisma 7 기반 multi-file schema, 도메인별 디렉터리, 검증 스크립트, 운영 정책으로 재설계한다.

---

## 1. Prisma 7 업그레이드

### 결정

- Prisma 6.19.3 → 7.8.0
- Driver adapter (`@prisma/adapter-pg` + `pg`) 사용
- Generator를 `prisma-client`로 변경 (output 경로 명시)
- Datasource URL을 `prisma.config.ts`로 이동
- `src/lib/prisma.ts` + test utilities를 adapter 패턴으로 갱신

### 근거

- Prisma 6.x의 `import` 키워드는 subdirectory 파일 미지원 (P1012)
- Prisma 7도 `import` 미지원 — folder-based auto-discovery가 정답
- Driver adapter는 Prisma 7의 SQL provider 필수 사항
- 새 `prisma-client` generator는 output 분리 + ESM native로 미래 지향적

### 검토한 대안

- **Prisma 6.19.3 유지 + folder-based** — 작동하지만 레거시 generator (`prisma-client-js`) deprecated 경로
- **Prisma 7 + import 디렉티브** — 검증 결과 Prisma 7도 미지원
- **Prisma 7 + folder-based (현재 결정)** — 정석, 확장성 좋음

### Prisma 6 → 7 Breaking Changes

- `new PrismaClient()` → `new PrismaClient({ adapter })` 필수
- `datasource db { url = ... }` (schema.prisma) → `datasource: { url: env(...) }` (prisma.config.ts)
- `prisma-client-js` generator → `prisma-client` (output 명시)
- Env loading auto → manual (`dotenv.config()`)
- Migrations path auto → explicit (`prisma.config.ts`의 `migrations.path`)

---

## 2. Multi-file Schema (Folder-based)

### 결정

- `prisma/models/schema.prisma` = generator + datasource (모델 없음)
- `prisma/models/<domain>/<model>.prisma` = 1 모델 = 1 파일
- `prisma.config.ts`의 `schema` = 폴더 경로 (`prisma/models`)
- `prisma.models/` 트리의 모든 .prisma 파일이 자동 포함

### 근거

- Prisma 6/7 모두 subdirectory `import` 미지원 → folder-based가 유일한 multi-depth 옵션
- 도메인별 디렉터리는 bounded context (DCIM, IPAM 등)와 일치
- 파일 추가 = 디렉터리에 .prisma 파일 생성 (단순함)

### 검토한 대안

- **단일 파일 유지** — 모델 100개+ 시 파일 크기 폭증. 거부
- **`import` 디렉티브 (subdirectory)** — Prisma 6/7 모두 미지원 확인. 거부
- **Aggregate root별 분리** (`dcim/inventory/`, `dcim/connection/`) — foundation phase엔 과한 추상화. 거부
- **현재 결정 (folder-based + 도메인 일관성)** — 단순, 확장 가능

---

## 3. 명명 규칙

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

## 4. CI/CD 자동화

### 결정

- `prisma/scripts/check-prisma.sh` — 네이밍/길이/예약어 + Squawk 통합
- `prisma/scripts/squash-migrations.sh` — custom SQL 자동 감지 + dry-run
- CI 3단계: `prisma validate` + `check-prisma.sh` + `prisma format --check`

### Squawk 선택 근거

- PostgreSQL 마이그레이션 SQL lint의 사실상 표준
- 30+ 규칙 (prefer-identity, adding-required-field, ban-drop-table 등)
- SQL 파일 직접 lint: `npx squawk migration.sql`
- pgfence 검토했으나 실존하지 않는 도구 확인. Squawk가 대안

### 마이그레이션 락 경합

- `CREATE INDEX CONCURRENTLY`, `ALTER TABLE ... ADD CONSTRAINT`는 트래픽 低谷 시간 또는 read-only 모드
- 운영 마이그레이션은 PR 리뷰 + `migrate dev --create-only`로 SQL 검토
- 긴급 롤백은 [db-rollback-runbook.md](../../common/operations/db-rollback-runbook.md) 참조

### 검토한 대안

- **pgfence** — 실존하지 않는 도구. 거부
- **수동 검증만** — human error 가능. CI 강제 필요. 거부
- **Squawk** — 위 근거로 채택

---

## 5. Driver Adapter 패턴

### 결정

- 모든 PrismaClient 인스턴스는 `new PrismaPg({ connectionString: process.env.DATABASE_URL! })` adapter 경유
- `src/lib/prisma.ts` (메인), `src/test-utils/*` (테스트), `scripts/*-seed.ts` (스크립트) 모두 동일 패턴

### 근거

- Prisma 7의 SQL provider 필수
- 향후 connection pooler (PgBouncer transaction mode) 도입 시 adapter 옵션만 변경

### 검토한 대안

- **PgBouncer 직접 연결** — adapter 없이 가능하지만 Prisma 7 정책 위반
- **Accelerate** (Prisma cloud service) — 폐쇄망 환경과 부적합
- **현재 결정 (PrismaPg adapter)** — 폐쇄망에서 호환, 미래 확장 가능

---

## 결과

- 2026-06-17 적용. Tasks 1-13 완료.
- 모든 Prisma 관련 문서가 1-hop 내 도달 가능 (AI 네비게이션 보장)
- 운영 거버넌스는 팀 규모에 맞게 lean (전담 DB 담당자 없음)
- 자사 only 운영이므로 multi-tenant/multi-schema는 비목표

## 관련 문서

- [docs/common/development/prisma.md](../development/prisma.md) — Prisma 규칙
- [prisma/CLAUDE.md](../../../prisma/CLAUDE.md) — AI 진입점
