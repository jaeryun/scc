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
