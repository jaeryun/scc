# CLAUDE.md

SE Command Center — Next.js 16 + shadcn/ui 사내 인프라팀 관리 대시보드
`kiranism/next-shadcn-dashboard-starter` 템플릿 기반

## 주요 참조
- [docs/forms.md](./docs/forms.md) — 폼 시스템: TanStack Form + Zod
- [docs/themes.md](./docs/themes.md) — 테마 시스템: OKLCH 색상, 폰트
- [docs/nav-rbac.md](./docs/nav-rbac.md) — 내비게이션 RBAC

## 코딩 컨벤션
→ 모든 코딩 규칙은 @.claude/rules/conventions.md 참조

## 신규 기능 추가 워크플로
1. `src/features/<name>/api/` — `types.ts` → `service.ts` → `queries.ts`
2. `src/features/<name>/hooks/` — `use-<name>s.ts`, `use-<name>-mutations.ts`
3. `src/features/<name>/components/` — UI 컴포넌트
4. `src/app/(views)/<view>/` 또는 `src/app/dashboard/<name>/page.tsx`
5. `src/config/views.ts` 또는 `src/config/nav-config.ts` 네비게이션 아이템 등록
6. (선택) `src/app/api/<name>/route.ts` — API 라우트
7. (선택) `src/components/icons.tsx` — 새 아이콘 등록

@.claude/rules/project.md
@.claude/rules/behavior.md
@.claude/rules/conventions.md
