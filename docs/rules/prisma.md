# Prisma 규칙

## 🚨 `prisma db push` 절대 금지

- `prisma db push` 사용 시 모든 데이터 삭제 + migration history 불일치 발생
- `--accept-data-loss` 옵션은 말 그대로 데이터 손실을 의미
- 개발/스테이징/프로덕션 어디서도 사용 금지
- 대신 항상 `prisma migrate dev` 또는 `prisma migrate deploy` 사용

## 허용된 명령어

| 명령어                                  | 용도                                   |
| --------------------------------------- | -------------------------------------- |
| `prisma migrate dev --name YYMMDD_설명` | 스키마 변경 시 migration 생성 + 적용   |
| `prisma migrate deploy`                 | 새 환경/DB 이관 시 모든 migration 적용 |
| `prisma generate`                       | Prisma Client 재생성                   |
| `prisma migrate status`                 | migration 적용 상태 확인               |
| `prisma migrate diff`                   | 스키마 ↔ migration 간 drift 검출       |

## 마이그레이션 네이밍

- 형식: `YYMMDD_무엇을-했는지-설명`
- 예: `270524_add_batch_move_api`, `270523_add_folder_and_remove_tags`

> 실무 워크플로와 Shadow DB 설정은 [`prisma/CLAUDE.md`](/prisma/CLAUDE.md) 참조.
