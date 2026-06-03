# Prisma 규칙

## `prisma db push` 절대 금지

- `prisma db push`는 기존 데이터를 전량 삭제하고 마이그레이션 이력을 파괴함
- `--accept-data-loss` 플래그는 데이터 손실을 의미 -- 어디서도 사용 금지 (개발/스테이징/프로덕션)
- 항상 `prisma migrate dev` 또는 `prisma migrate deploy` 사용

## 허용된 명령어

| 명령어 | 용도 |
| ------- | ------- |
| `prisma migrate dev --name YYMMDD_description` | 스키마 변경 시 마이그레이션 생성 및 적용 |
| `prisma migrate deploy` | 대기 중인 모든 마이그레이션 적용 (새 환경/DB 이관) |
| `prisma generate` | Prisma Client 재생성 |
| `prisma migrate status` | 마이그레이션 적용 상태 확인 |
| `prisma migrate diff` | 스키마와 마이그레이션 간 차이 감지 |

## 마이그레이션 네이밍

- 형식: `YYMMDD_작업-내용`
- 예시: `270524_add_batch_move_api`, `270523_add_folder_and_remove_tags`

> 실무 워크플로우 및 Shadow DB 설정은 `prisma/CLAUDE.md` 참조.
