# prisma/ — 구조와 파일 목록

## 디렉터리 용도

Prisma 7 기반 multi-file schema, 마이그레이션, 시드, 검증 스크립트. 도메인별 디렉터리로 모델 분리.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `models/` | multi-file schema (generator + 모델 파일들) | multi-file, folder-based |
| `models/schema.prisma` | generator + datasource (모델 없음) | generator, prisma-client, output |
| `models/<domain>/` | 1 도메인 = 1 디렉터리 | 도메인별, 도메인 |
| `models/<domain>/<model>.prisma` | 1 모델 = 1 파일 (kebab-case) | model, multi-file |
| `config/prisma.config.ts` | Prisma 7 공식 config (schema 경로, datasource, migrations) | prisma-config |
| `generated/` | Prisma 7 client 출력 (gitignore됨) | generated-client |
| `migrations/` | Prisma 마이그레이션 (기계 생성, `YYYYMMDDHHMMSS_<purpose>/`) | migration, SQL |
| `seeds/` | 시드 데이터 (idempotent) | seed |
| `scripts/check-prisma.sh` | 네이밍/길이/예약어 + Squawk lint | lint, ci |
| `scripts/squash-migrations.sh` | custom SQL 감지 + dry-run | 운영, ci |
| `CLAUDE.md` | AI 진입점 (cross-link hub) | AI, 진입점 |
| `index.md` | 이 파일 (사람용) | 인덱스 |

## 도메인 트리

```
models/
├── core/         # 설정/사이트
│   └── view-setting.prisma
├── cache/        # 캐시/외부 동기화
│   └── netbox-cache.prisma
└── (향후: audit/, ipam/, dcim/ 등)
```

## Prisma 7 핵심

- **Generator**: `prisma-client` + 명시적 `output` 경로
- **Multi-file**: `prisma.config.ts`의 `schema`를 폴더 경로로 지정
- **Driver adapter**: `@prisma/adapter-pg` + `pg` 필수 (SQL providers)
- **Datasource URL**: `prisma.config.ts`의 `datasource` 블록

## 새 도메인/모델 추가

1. `prisma/models/<new-domain>/` 디렉터리 생성
2. `prisma/models/<new-domain>/<model>.prisma` 작성
3. `bunx prisma generate --config prisma/config/prisma.config.ts`
4. `bunx prisma migrate dev --name YYMMDD_<purpose> --config prisma/config/prisma.config.ts`
5. `./prisma/scripts/check-prisma.sh`
6. **이 문서 갱신** (도메인 트리)

## 포함 금지 항목

- 일반 문서 (이 프로젝트의 모든 문서는 `docs/`에 위치, prisma 진입점 문서만 예외)
- `.env` 파일 (`.env.local`에 DATABASE_URL/SHADOW_DATABASE_URL 설정)
- `migrations.bak.*` (재생성 후 삭제)
- `generated/` (Prisma가 자동 생성, gitignore)

## 관련 문서

- [prisma/CLAUDE.md](./CLAUDE.md) — AI 진입점
- [docs/common/development/prisma.md](../docs/common/development/prisma.md) — 규칙
- [docs/common/decisions/adr-002-prisma-schema-architecture.md](../docs/common/decisions/adr-002-prisma-schema-architecture.md) — 결정
- [docs/common/reference/data-models/index.md](../docs/common/reference/data-models/index.md) — 데이터 모델
- [docs/common/operations/db-rollback-runbook.md](../docs/common/operations/db-rollback-runbook.md) — 운영
