# 데이터 모델 — 도메인 트리

> **참조**: 이 문서는 `prisma/models/` 디렉터리의 도메인 트리를 미러링합니다. 새 모델 추가 시 양쪽 모두 갱신.

## 도메인 트리

```
models/
├── core/         # 설정/사이트
│   └── view-setting.prisma
├── cache/        # 캐시/외부 동기화
│   └── netbox-cache.prisma
└── (향후: audit/, ipam/, dcim/ 등)
```

## 현재 모델

| 도메인 | 모델 | 파일 | 설명 |
|--------|------|------|------|
| core | ViewSetting | `prisma/models/core/view-setting.prisma` | 뷰별 설정 (icon 등) |
| cache | NetBoxCache | `prisma/models/cache/netbox-cache.prisma` | NetBox API 캐시 |

## 새 도메인 추가 절차

1. `prisma/models/<new-domain>/` 디렉터리 생성
2. 모델 파일 작성 (`<model>.prisma`)
3. `bunx prisma generate --config prisma/config/prisma.config.ts`
4. `bunx prisma migrate dev --name YYMMDD_<purpose> --config prisma/config/prisma.config.ts`
5. **이 문서 갱신** (도메인 트리 + 현재 모델 표)

## 관련 문서

- [prisma/CLAUDE.md](../../../../prisma/CLAUDE.md) — AI 진입점
- [prisma/index.md](../../../../prisma/index.md) — 디렉터리 구조
- [docs/common/development/prisma.md](../../development/prisma.md) — 규칙
- [docs/common/decisions/adr-002-prisma-schema-architecture.md](../../decisions/adr-002-prisma-schema-architecture.md) — 결정
