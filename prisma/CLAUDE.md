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
├── models/                  # 1 모델 = 1 파일 (multi-file, Prisma 7 folder-based)
│   ├── schema.prisma        # generator + datasource (Prisma 7은 datasource에 url 미포함)
│   ├── core/                # 설정/사이트
│   │   └── view-setting.prisma
│   ├── cache/               # 캐시/외부 동기화
│   │   └── netbox-cache.prisma
│   └── ...                  # 향후 도메인 확장
├── config/
│   └── prisma.config.ts     # Prisma 7 공식 config (schema 폴더 경로, datasource, migrations)
├── generated/               # Prisma 7 client 출력 (gitignore됨)
├── migrations/              # Prisma 마이그레이션 (기계 생성)
│   └── YYYYMMDDHHMMSS_<purpose>/
│       └── migration.sql
├── seeds/                   # 시드 데이터
│   └── index.ts
├── scripts/                 # 검증/운영 스크립트
│   ├── check-prisma.sh      # 네이밍/길이/예약어 + Squawk
│   └── squash-migrations.sh # custom SQL 감지 + dry-run
├── CLAUDE.md                # 이 파일 (AI 진입점)
└── index.md                 # 사람용 구조
```

## `prisma/generated/` 디렉토리

- **자동 생성**: `bunx prisma generate` 실행 시마다 재생성됨
- **Git ignore**: 커밋 대상 아님. `.gitignore`에 `/prisma/generated/` 명시
- **수동 편집 금지**: 변경 시 다음 generate에서 덮어쓰여짐
- **Import 경로**: `../../prisma/generated/client` (또는 `../node_modules/.prisma/client` — output 경로에 따라 다름)
- **재생성 시점**: 모델/스키마 변경, 의존성 추가/제거, 클론 직후

## 첫 설정 (Quickstart)

신규 개발자가 처음 Prisma 환경을 설정할 때:

```bash
# 1. 의존성 설치
bun install

# 2. .env 설정
cp .env.example .env
# .env에 DATABASE_URL, SHADOW_DATABASE_URL 설정 (Docker compose postgres 기준)
# 예: DATABASE_URL="postgresql://scc:scc@localhost:5432/scc"
#     SHADOW_DATABASE_URL="postgresql://postgres:POSTGRES@localhost:5432/prisma_shadow"

# 3. Prisma client 생성
bunx prisma generate --config prisma/config/prisma.config.ts

# 4. 마이그레이션 적용 (DB가 비어있을 때)
bunx prisma migrate dev --name YYMMDD_init --config prisma/config/prisma.config.ts

# 5. 검증
bunx prisma validate --config prisma/config/prisma.config.ts
./prisma/scripts/check-prisma.sh
```

> **Note**: Docker compose로 postgres 띄우는 경우 `docker compose up -d postgres` 먼저 실행.

## Prisma 7 핵심 변경사항

- **Generator**: `prisma-client` (이전 `prisma-client-js` deprecated)
- **Output 경로**: 명시적 (`output = "../../prisma/generated"`)
- **Datasource URL**: `prisma.config.ts`의 `datasource` 블록에서 관리 (schema.prisma에 없음)
- **Driver adapter 필수**: SQL providers는 `@prisma/adapter-pg` + `pg` 필요
- **Folder-based multi-file**: `prisma.config.ts`의 `schema`를 폴더 경로로 지정 → 해당 디렉터리의 `schema.prisma` + 모든 하위 .prisma 파일 자동 포함

## 새 모델 추가 절차

1. `prisma/models/<domain>/<model>.prisma` 생성 (kebab-case)
2. `bunx prisma generate --config prisma/config/prisma.config.ts`
3. `bunx prisma migrate dev --name YYMMDD_<purpose> --config prisma/config/prisma.config.ts`
4. `./prisma/scripts/check-prisma.sh` (마이그레이션 네이밍/Squawk 검증)

## 새 enum 추가

- 모델 전용 enum: 해당 모델 파일 안에 정의
- 전사 공통 enum: `prisma/models/<domain>/enums.prisma`에 추가

## 마이그레이션 작업

- 네이밍: `YYMMDD_<purpose>` 또는 `YYMMDD_<ticket>_<purpose>`
- 커밋 전 `./prisma/scripts/check-prisma.sh` 실행
- 운영 배포: `docs/common/operations/db-rollback-runbook.md` 참조

## 클라이언트 import

```typescript
// 절대 경로 사용 시
import { PrismaClient } from '../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```

## 긴급 상황

- DB 롤백: `docs/common/operations/db-rollback-runbook.md`
- 마이그레이션 squash: `./prisma/scripts/squash-migrations.sh --dry-run` (custom SQL 사전 감지)

## Troubleshooting (Prisma 7 일반 에러)

### "Error validating: This line is invalid" (P1012)
- **원인**: 옛 Prisma 6 `import` 디렉티브 또는 schema 위치 문제
- **해결**: `prisma.config.ts`의 `schema` 경로가 `prisma/models` (폴더)인지 확인. `import` 디렉티브 사용 안 함

### "needs to be constructed with a non-empty, valid PrismaClientOptions"
- **원인**: Prisma 7에서 `new PrismaClient()` 직접 호출 불가
- **해결**: `new PrismaClient({ adapter: new PrismaPg({...}) })` 패턴 사용

### "Schema at ... not found"
- **원인**: `--config` 플래그 누락 또는 config 파일 경로 오타
- **해결**: 모든 `bunx prisma` 명령에 `--config prisma/config/prisma.config.ts` 추가

### "Cannot find module '../../prisma/generated/client'"
- **원인**: `prisma generate` 미실행 또는 import 경로 오타
- **해결**: `bunx prisma generate --config prisma/config/prisma.config.ts` 실행

### "Environment variable not found: DATABASE_URL"
- **원인**: Prisma 7은 .env를 자동 로드 안 함
- **해결**: `prisma.config.ts`에서 `dotenv.config({ path: '.env' })` 명시
