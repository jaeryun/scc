# CLAUDE.md

SE Command Center — Next.js 16 + shadcn/ui 사내 인프라팀 관리 대시보드
`kiranism/next-shadcn-dashboard-starter` 템플릿 기반

## 주요 참조
- [docs/core/loading-policy.md](./docs/core/loading-policy.md) — CLAUDE.md 로딩 정책
- [docs/forms/guide.md](./docs/forms/guide.md) — 폼 시스템: TanStack Form + Zod
- [docs/themes/guide.md](./docs/themes/guide.md) — 테마 시스템: OKLCH 색상, 폰트
- [docs/navigation/rbac.md](./docs/navigation/rbac.md) — 내비게이션 RBAC
- [docs/data/cheat-sheet.md](./docs/data/cheat-sheet.md) — 데이터 패턴 빠른 참조
- [docs/architecture/build-deploy.md](./docs/architecture/build-deploy.md) — 빌드 & 배포
- [docs/onboarding/quickstart.md](./docs/onboarding/quickstart.md) — 5분 개발 서버
- [docs/onboarding/first-feature.md](./docs/onboarding/first-feature.md) — IPAM 따라하기

## 코딩 컨벤션
→ 모든 코딩 규칙은 [conventions.md](./docs/core/conventions.md) 참조

## 신규 기능 추가 워크플로
1. `src/modules/<name>/api/` — `types.ts` → `service.ts` → `queries.ts`
2. `src/modules/<name>/hooks/` — `use-<name>s.ts`, `use-<name>-mutations.ts`
3. `src/modules/<name>/components/` — UI 컴포넌트
4. `src/app/(views)/<view>/` 또는 `src/app/dashboard/<name>/page.tsx`
5. `src/config/views.ts` 또는 `src/config/nav-config.ts` 네비게이션 아이템 등록
6. (선택) `src/app/api/<name>/route.ts` — API 라우트
7. (선택) `src/components/icons.tsx` — 새 아이콘 등록

📚 [전체 문서 맵](./docs/README.md)
@docs/core/project.md
@docs/core/behavior.md
@docs/core/conventions.md
