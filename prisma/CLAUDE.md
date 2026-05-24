# DB 스키마 변경 워크플로

@docs/rules/prisma.md
@docs/core/conventions.md

Prisma 마이그레이션 네이밍 및 전체 워크플로는 [`docs/core/conventions.md` 규칙 #16](../docs/core/conventions.md)을 엄격히 준수합니다.
마이그레이션 생성/적용/검증 절차는 [`docs/rules/prisma.md`](../docs/rules/prisma.md)를 참조하세요.

## 🚨 `prisma db push` 절대 금지

**`prisma db push`는 사용하지 마십시오.** 이유:

1. **데이터 초기화**: `--accept-data-loss`가 필요할 때마다 기존 테이블이 재생성되고 모든 데이터가 소멸됨
2. **migrate 이력 불일치**: `db push`는 migration history를 기록하지 않아 추후 `migrate deploy` 실패 원인
3. **운영 환경 위험**: staging/production에서 절대 사용 불가한 도구를 개발 환경에서도 사용하면 안 됨

**올바른 워크플로:**
```
1. prisma/schema.prisma 수정
2. npx prisma migrate dev --name YYMMDD_설명     → migration 생성 + DB 반영
3. npx prisma generate                              → Prisma Client 갱신
4. npm run build                                    → migration 검증 통과 확인
```

**DB 이관/재구성 시:**
```
npx prisma migrate deploy   → 새 DB에 모든 migration 순차 적용 (데이터 보존)
```

## 스키마 파일 위치

| 경로 | 설명 |
|------|------|
| `prisma/schema.prisma` | DB 스키마 정의 (datasource, generator, model) |
| `prisma/migrations/` | 마이그레이션 SQL 파일 (YYYYMMDD_설명/migration.sql) |
| `prisma/seed.ts` | 데모 데이터 시드 스크립트 |
