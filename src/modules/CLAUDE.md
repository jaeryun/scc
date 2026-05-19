# 기능 모듈 컨벤션

데이터 계층, 쿼리 키, 페칭 패턴, 금지사항 → [@docs/data/cheat-sheet.md](../../docs/data/cheat-sheet.md) 참조.
폼 시스템 → [@docs/forms/cheat-sheet.md](../../docs/forms/cheat-sheet.md) 참조.

## 기능 추가 워크플로
1. `src/modules/<name>/api/` — `types.ts` → `service.ts` → `queries.ts`
2. `src/modules/<name>/hooks/` — `use-<name>s.ts`, `use-<name>-mutations.ts`
3. `src/modules/<name>/components/` — UI 컴포넌트
4. `src/app/(views)/<view>/` 또는 `src/app/dashboard/<name>/page.tsx`
5. `src/config/views.ts` 또는 `src/config/nav-config.ts` 네비게이션 아이템 등록
6. (선택) `src/app/api/<name>/route.ts` — API 라우트
7. (선택) `src/components/icons.tsx` — 새 아이콘 등록

## 정규 참조 구현
- `src/modules/ipam/` — TanStack Query + Zod + Prisma 전체 패턴
- `src/app/api/ipam/` — Route Handler + Zod 검증 + 계층 분리

## 컴포넌트 배치
→ @docs/architecture/component-guide.md 참조
