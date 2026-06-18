# DB 롤백 Runbook (P0)

> **긴급 상황**: 운영 DB 마이그레이션이 실패했거나 데이터 손실이 발생했을 때.

## 일반 원칙

- Prisma는 down 마이그레이션을 자동 생성하지 않음
- 모든 롤백은 PR 리뷰 + `prisma migrate dev --create-only`로 미리 검토
- 운영 마이그레이션은 트래픽 低谷 시간 또는 read-only 모드
- 모든 prisma CLI 명령은 `--config prisma/config/prisma.config.ts` 사용

## 롤백 절차

### 1. 상황 판단

- [ ] 영향 범위 파악 (몇 개 테이블, 몇 개 row)
- [ ] 사용자에게 공지 (필요 시)

### 2. 즉시 조치 (Down SQL 생성)

```bash
# 현재 스키마와 적용된 마지막 마이그레이션의 차이로 down SQL 생성
bunx prisma migrate diff \
  --from-schema-datamodel ./prisma/models/schema.prisma \
  --to-migrations ./prisma/migrations \
  --script --config prisma/config/prisma.config.ts
```

생성된 SQL을 검토 후 적용. 예시:

```sql
-- DropTable
DROP TABLE IF EXISTS "NewTable";

-- AlterTable
ALTER TABLE "OldTable" DROP COLUMN "newField";
```

### 3. 적용

```bash
# 생성된 down SQL을 psql로 직접 적용
psql $DATABASE_URL -f down.sql
```

### 4. 검증

```bash
bunx prisma migrate status --config prisma/config/prisma.config.ts
bunx prisma validate --config prisma/config/prisma.config.ts
```

### 5. 사후 조치

- [ ] `prisma/models/schema.prisma` 또는 모델 파일에서 잘못된 변경 revert
- [ ] 새 마이그레이션 생성 (`migrate dev --name fix_<issue>`)
- [ ] PR 리뷰 후 운영 적용
- [ ] postmortem 작성 (필요 시)

## 데이터 손실 시

1. **즉시 DB 백업** (이미 손실된 경우에도 추가 손실 방지)
2. **Point-in-time recovery** — PostgreSQL의 PITR 사용
3. **관리자 + 팀 리드 알림**

## Squash 중 Custom SQL 손실 시

`./prisma/scripts/squash-migrations.sh`가 감지하지만, 만약 놓쳤다면:

1. `git log`에서 squash 이전 커밋 찾기
2. 해당 마이그레이션의 `migration.sql`에서 custom SQL 추출
3. 새 마이그레이션으로 재적용:
   ```bash
   bunx prisma migrate dev --name restore_custom_sql --config prisma/config/prisma.config.ts
   ```
4. 손실된 SQL을 수동으로 `migration.sql`에 추가

## Driver Adapter 관련 이슈

- `PrismaClient` 생성 시 "needs to be constructed with a non-empty, valid `PrismaClientOptions`" 에러 → adapter 누락
- 해결: `src/lib/prisma.ts` 확인 — `new PrismaClient({ adapter })` 패턴 사용 확인
- Connection timeout → adapter pool 설정 조정

## Prisma 7 주요 명령어

```bash
# 마이그레이션 상태
bunx prisma migrate status --config prisma/config/prisma.config.ts

# SQL 검증 (Squawk)
./prisma/scripts/check-prisma.sh

# 클라이언트 재생성
bunx prisma generate --config prisma/config/prisma.config.ts

# 마이그레이션 적용 (운영)
bunx prisma migrate deploy --config prisma/config/prisma.config.ts
```

## 관련 문서

- [ADR-002 prisma schema architecture](../decisions/adr-002-prisma-schema-architecture.md)
- [docs/common/development/prisma.md](../development/prisma.md) — 정책
- [prisma/CLAUDE.md](../../../prisma/CLAUDE.md) — AI 진입점
- [prisma/index.md](../../../prisma/index.md) — 사람용 디렉터리 구조
- [docs/common/reference/data-models/index.md](../reference/data-models/index.md) — 데이터 모델 도메인 트리
