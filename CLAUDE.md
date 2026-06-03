# CLAUDE.md

SE Command Center — Next.js 16 + shadcn/ui 사내 인프라팀 관리 대시보드
`kiranism/next-shadcn-dashboard-starter` 템플릿 기반

## 주요 참조

- [docs/core/loading-policy.md](./docs/core/loading-policy.md) — CLAUDE.md 로딩 정책
- [docs/forms/guide.md](./docs/forms/guide.md) — 폼 시스템: TanStack Form + Zod
- [docs/themes/guide.md](./docs/themes/guide.md) — 테마 시스템: OKLCH 색상, 폰트
- [docs/data/cheat-sheet.md](./docs/data/cheat-sheet.md) — 데이터 패턴 빠른 참조
- [docs/architecture/build-deploy.md](./docs/architecture/build-deploy.md) — 빌드 & 배포
- [docs/onboarding/quickstart.md](./docs/onboarding/quickstart.md) — 5분 개발 서버
- [docs/onboarding/first-feature.md](./docs/onboarding/first-feature.md) — IPAM 따라하기

## 코딩 컨벤션

→ 모든 코딩 규칙은 [conventions.md](./docs/core/conventions.md) 참조

## 신규 기능 추가 워크플로

1. `src/modules/<name>/api/` — `types.ts` → `service.ts` → `queries.ts`
2. `src/modules/<name>/hooks/` — `use-<name>s.ts` (조회 훅만, mutation은 hooks 불필요)
3. `src/modules/<name>/components/` — UI 컴포넌트
4. `src/app/(views)/<view>/` 또는 `src/app/dashboard/<name>/page.tsx`
5. `src/config/views.ts` 또는 `src/config/nav-config.ts` 네비게이션 아이템 등록
6. (선택) `src/app/api/<name>/route.ts` — API 라우트
7. (선택) `src/components/icons.tsx` — 새 아이콘 등록

## 작업 완료 전 필수 검증 체크리스트

모든 page.tsx / 기능 추가 시 반드시 아래 항목을 확인한다:

- [ ] `page.tsx`에 `export const metadata: Metadata` 존재 (타입 import 포함)
- [ ] `cn()`으로 className 병합, 템플릿 리터럴/문자열 연결 금지
- [ ] Tailwind 정적 색상(`text-red-500`, `bg-blue-500` 등) 대신 CSS 변수 토큰(`text-primary`, `bg-muted/50`) 사용
- [ ] `any` 타입 사용 금지 (`// @reason` 주석 필수)
- [ ] 데이터 계층: `api/types.ts` → `api/service.ts` → `api/queries.ts` 완전 분리
- [ ] `hooks/` 계층 존재: 컴포넌트는 hook을 통해서만 데이터 접근 (직접 `api/service.ts` import 금지)
- [ ] `useMutation({mutationFn: ...})` 인라인 금지 → `api/mutations.ts`에 `mutationOptions`로 정의 후 컴포넌트에서 spread 조합
- [ ] Query Key Factory(`entityKeys.all/list/detail`) 사용, 문자열 하드코딩 금지
- [ ] API route: Zod 스키마 `.parse()` 검증 사용, 수동 타입 체크 금지
- [ ] `bun tsc --noEmit` 통과
- [ ] `bun run build` 성공

📚 [전체 문서 맵](./docs/README.md)
@docs/core/project.md
@docs/core/behavior.md
@docs/core/conventions.md
