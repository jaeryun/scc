# DB 스키마 변경 워크플로

@docs/rules/prisma.md
@docs/core/conventions.md

Prisma 마이그레이션 네이밍 및 전체 워크플로는 [`docs/core/conventions.md` 규칙 #16](../docs/core/conventions.md)을 엄격히 준수합니다.
마이그레이션 생성/적용/검증 절차는 [`docs/rules/prisma.md`](../docs/rules/prisma.md)를 참조하세요.

## 스키마 파일 위치

| 경로 | 설명 |
|------|------|
| `prisma/schema.prisma` | DB 스키마 정의 (datasource, generator, model) |
| `prisma/migrations/` | 마이그레이션 SQL 파일 (YYYYMMDD_설명/migration.sql) |
| `prisma/seed.ts` | 데모 데이터 시드 스크립트 |
