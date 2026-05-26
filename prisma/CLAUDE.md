# Prisma 실무 가이드

@docs/rules/prisma.md
@docs/core/conventions.md

규칙 및 네이밍 컨벤션은 [`docs/rules/prisma.md`](../docs/rules/prisma.md)를, 전체 코딩 규칙은 [`docs/core/conventions.md`](../docs/core/conventions.md)를 따릅니다.

## Shadow Database

`prisma migrate dev`는 새 마이그레이션 생성 시 shadow database가 반드시 필요합니다. 내부적으로 shadow DB에 기존 마이그레이션을 모두 적용한 뒤, schema.prisma와 비교해 diff를 추출합니다.

- **전용 DB 사용**: 기존 DB를 shadow 용도로 재사용하면 테이블 충돌이 발생합니다. `prisma_shadow` 같은 전용 빈 DB를 postgres 슈퍼유저 계정으로 생성하세요.
- **환경 변수**: `.env`와 `.env.local`에 `SHADOW_DATABASE_URL`을 설정합니다.

```
SHADOW_DATABASE_URL="postgresql://postgres:POSTGRES@localhost:5432/prisma_shadow"
```

## 일상 워크플로

```
1. prisma/schema.prisma 수정
2. npx prisma migrate dev --name YYMMDD_설명     → migration 생성 + DB 반영 + generate 자동 실행
3. npm run build                                    → check-migrations.sh 통과 확인
```

## DB 이관 / 재구성

이미 확정된 마이그레이션을 새로운 DB에 순차 적용할 때:

```
npx prisma migrate deploy
```

## DB 완전 초기화

개발 중 스키마가 꼬였을 때 처음부터 다시 시작:

```bash
# 1. DB + shadow DB 모두 드랍 후 재생성
psql -U postgres -c "DROP DATABASE IF EXISTS coredb;"
psql -U postgres -c "DROP DATABASE IF EXISTS prisma_shadow;"
psql -U postgres -c "CREATE DATABASE coredb OWNER app;"
psql -U postgres -c "CREATE DATABASE prisma_shadow OWNER postgres;"

# 2. 모든 migration 디렉토리 삭제 후 재생성
rm -rf prisma/migrations/2*
npx prisma migrate dev --name YYMMDD_init
```

## 파일 위치

| 경로                   | 설명                                                 |
| ---------------------- | ---------------------------------------------------- |
| `prisma/schema.prisma` | DB 스키마 정의 (datasource, generator, model)        |
| `prisma/migrations/`   | 마이그레이션 SQL 파일 (YYYYMMDD\_설명/migration.sql) |
| `.env` / `.env.local`  | DATABASE_URL, SHADOW_DATABASE_URL                    |
