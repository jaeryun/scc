# prisma/ — 구조와 파일 목록

## 디렉터리 용도

Prisma 스키마 정의, 마이그레이션 관리, 데이터베이스 시드 등 데이터 계층 핵심 파일을 보관합니다.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `schema.prisma` | DB 스키마 정의 (datasource, generator, model) | prisma, schema, model, datasource |
| `migrations/` | 마이그레이션 SQL 파일 (`YYMMDD_설명/migration.sql`) | migration, migrate, SQL |
| `CLAUDE.md` | AI 에이전트 가이드 (실무 워크플로, Shadow DB 설정) | guide, workflow, shadow |

## 포함 금지 항목

- 일반 문서 파일 (문서는 `docs/` 디렉토리에 위치)
- `.env` 파일 (환경변수는 `.env.local`에 설정)
