# DB 스키마 변경 워크플로

## 마이그레이션 네이밍 컨벤션

형식: `YYMMDD_무엇을-했는지-설명`
- `_`: 날짜/설명 구분자
- `-`: 설명 내 단어 구분

| 접두어 | 용도 | 예시 |
|--------|------|------|
| `init` | 초기 스키마 생성 | `260514_init-core-schema` |
| `add` | 컬럼/테이블/인덱스 추가 | `260518_add-purpose-centers-to-subnet` |
| `alter` | 컬럼 타입/제약조건 변경 | `260520_alter-status-add-archived` |
| `remove` | 컬럼/테이블 제거 | `260522_remove-vlan-from-subnet` |
| `rename` | 컬럼명/테이블명 변경 | `260525_rename-ipaddress-to-ip` |
| `replace` | 복합 변경 (제거 + 추가) | `260601_replace-vlan-with-gateway` |

애매한 복합 변경은 `replace` 접두어를 사용하거나, 변경의 주된 성격에 맞는 접두어를 선택한다.

## 스키마 변경 워크플로 (필수)

1. `prisma/schema.prisma` 수정
2. 마이그레이션 생성:
   ```bash
   # CI/서버 환경 (권장)
   bunx prisma migrate diff \
     --from-schema-datasource prisma/schema.prisma \
     --to-schema-datamodel prisma/schema.prisma \
     --script > prisma/migrations/YYMMDD_설명/migration.sql

   # 로컬 개발 환경
   bunx prisma migrate dev --name YYMMDD_설명
   ```
   - `migrate diff`: `--from-schema-datasource`는 DB 현재 상태에서 읽고, `--from-migrations`는 마이그레이션 히스토리에서 읽음
   - `--from-schema-datasource` 사용 시 Shadow DB가 필요하므로 `--shadow-database-url` 필수 지정
   - `migrate dev`는 자동으로 diff를 계산하고 마이그레이션 파일을 생성 (로컬에서만 사용)
3. 생성된 SQL 확인: `prisma/migrations/YYMMDD_설명/migration.sql`
   - 의도하지 않은 DROP, ALTER가 포함되지 않았는지 반드시 검토
4. (migrate diff 경로만) 마이그레이션 적용 등록:
   ```bash
   bunx prisma migrate resolve --applied YYMMDD_설명
   ```
   - `migrate diff`로 생성한 수동 마이그레이션은 `migrate resolve`로 적용 완료 처리
   - `migrate dev` 경로는 자동으로 적용 처리되므로 이 단계 불필요
5. Prisma 클라이언트 재생성:
   ```bash
   bunx prisma generate
   ```
6. 빌드 검증:
   ```bash
   bun run build
   ```

## 금지사항

- **`prisma db push` 단독 사용 절대 금지** — 마이그레이션 파일이 생성되지 않아 신규 환경에서 스키마 불일치 발생

> ⚠️ 프로토타이핑 등 임시 용도로 `db push`를 사용한 경우, 반드시 이후 `migrate dev` 또는 `migrate diff`로 정식 마이그레이션을 생성하고 마이그레이션 히스토리를 정리하십시오.

## 무결성 검사

- 빌드 전 `scripts/check-migrations.sh` 자동 실행 → `schema.prisma`와 마이그레이션 파일 일치 검증
- 수동 실행:
  ```bash
  bash scripts/check-migrations.sh
  ```
- 검사 실패 시 빌드가 중단되므로, 마이그레이션 파일과 스키마가 완전히 동기화된 상태에서만 빌드 가능

## 스키마 파일 위치

| 경로 | 설명 |
|------|------|
| `prisma/schema.prisma` | DB 스키마 정의 (datasource, generator, model) |
| `prisma/migrations/` | 마이그레이션 SQL 파일 (YYYYMMDD_설명/migration.sql) |
| `prisma/seed.ts` | 데모 데이터 시드 스크립트 |
