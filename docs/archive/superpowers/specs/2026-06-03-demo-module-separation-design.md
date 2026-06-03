# 데모 모듈 물리적 분리 설계 문서

> `src/modules/` 내 데모/Product 모듈 혼재 문제 해결 및 `scc-develop-guide` 스킬 신설
> 
> 본 문서는 기존 `2026-05-24-demo-reorg-design.md`의 미실행 계획을 대체한다.
> 해당 문서의 3-뷰 분할(`demo-ui`, `demo-logic`, `api-reference`) 대신 단일 `demo` 뷰로 통합한다.

**작성일**: 2026-06-03
**상태**: 설계 승인 대기

---

## 1. 배경

### 1.1 문제

`src/modules/` 하위에 데모 모듈(14개, in-memory mock)과 Product 모듈(8개, Prisma + PostgreSQL)이 평면적으로 혼재한다. 현재는 규칙(convention)에만 의존해 데모 코드의 Product import를 막고 있어, 물리적 격리가 없다. 데모 모듈이 Product 모듈과 동일한 경로 깊이(`@/modules/<name>`)에 있어 실수로 import가 발생할 수 있다.

### 1.2 결정

- **데모는 영원히 데모** — Product로 전환할 때는 복제 후 Prisma/API route 등 운영 수준으로 품질을 올려 별도 모듈로 만든다
- **물리적 디렉토리 분리** — `src/modules/demo/` 하위로 데모 모듈 그룹화
- **Product 모듈은 그대로** — `src/modules/ipam/`, `src/modules/devices/` 등 평면 유지

### 1.3 원본 템플릿 분석

`/Users/jerry/dev/next-shadcn-dashboard-starter` (kiranism-shadcn-dashboard) 조사 결과:

- `src/features/` — 11개 기능 디렉토리, 각자 다른 아키텍처 패턴 사용
- `src/constants/mock-api.ts` + `mock-api-users.ts` — faker + match-sorter 기반 공유 가상 DB
- 2개 모듈만 mock-api 패턴 (products, users), 나머지는 Zustand/인라인 데이터/외부 API 등 다양
- **의도된 다양성**: 템플릿은 여러 아키텍처 패턴을 가르치기 위해 일부러 다양한 패턴을 보여줌

---

## 2. 설계

### 2.1 모듈 디렉토리 구조

```
src/modules/
├── demo/                       # 신설: 모든 데모 모듈
│   ├── products/               # ← src/modules/products/ 에서 이동
│   ├── users/                  # ← src/modules/users/ 에서 이동
│   ├── dashboard/              # ← src/modules/dashboard/ 에서 이동
│   ├── billing/                # ← src/modules/billing/ 에서 이동
│   ├── chat/                   # ← src/modules/chat/ 에서 이동
│   ├── kanban/                 # ← src/modules/kanban/ 에서 이동
│   ├── notifications/          # ← src/modules/notifications/ 에서 이동
│   ├── forms/                  # ← src/modules/forms/ 에서 이동
│   ├── elements/               # ← src/modules/elements/ 에서 이동
│   ├── exclusive/              # ← src/modules/exclusive/ 에서 이동
│   ├── workspaces/             # ← src/modules/workspaces/ 에서 이동
│   ├── react-query-demo/       # ← src/modules/react-query-demo/ 에서 이동
│   └── profile/                # ← src/modules/profile/ 에서 이동
├── ipam/                       # Product (변경 없음)
├── devices/
├── cables/
├── sites/
├── switch-mapping/
├── interfaces/
├── view-settings/
└── auth/                       # Phase 2 (변경 없음)
```

**제외된 모듈:**
- `overview` — 삭제. 코드베이스 어디에서도 import 되지 않는 orphaned 모듈.

**NotificationCenter 특별 처리:**
`NotificationCenter`는 `src/modules/notifications/components/notification-center.tsx`에 있지만 `src/app/(main)/layout.tsx`(전역 레이아웃)에서 import되어 모든 뷰(dcim, settings, demo, home)에서 사용된다. 따라서 이 컴포넌트는 `src/components/layout/notification-center.tsx`로 추출하여 공통 컴포넌트로 승격시킨다. 나머지 notifications 모듈(페이지, zustand store)은 demo로 이동한다.

### 2.2 뷰 변경

| 항목 | 현재 | 변경 후 |
|------|------|---------|
| 뷰 ID | `library` | `demo` |
| 뷰 레이블 | `라이브러리` | `데모` |
| URL prefix | `/library/*` | `/demo/*` |
| 라우트 그룹 | `(main)/library/` | `(main)/demo/` |

**내부 라우트 구조** — 기존 구조를 유지한다:

```
(app)/(main)/demo/
├── layout.tsx                  # 기존 library/layout.tsx
├── page.tsx                    # 기존 library/page.tsx (데모 소개)
├── error.tsx                   # 신규 생성 (컨벤션 요구)
├── loading.tsx                 # 신규 생성
├── components/
│   ├── layout.tsx
│   ├── page.tsx                # 컴포넌트 소개
│   ├── chart/page.tsx          # 모듈 없는 순수 페이지 컴포넌트
│   ├── code-block/page.tsx
│   ├── command/page.tsx
│   ├── dialog/page.tsx
│   ├── dropdown/page.tsx
│   ├── progress/page.tsx
│   ├── static-pages/page.tsx
│   ├── table/page.tsx
│   ├── tabs-accordion/page.tsx
│   ├── tooltip/page.tsx
│   ├── ... (기존 16개 페이지 그대로)
│   └── forms/                  # forms 모듈과 연결된 페이지
│       └── basic/page.tsx
│       └── ...
├── modules/                    # 데모 모듈 페이지
│   ├── layout.tsx
│   ├── page.tsx                # 모듈 소개
│   ├── dashboard/page.tsx      # ← @/modules/demo/dashboard/
│   ├── products/page.tsx       # ← @/modules/demo/products/
│   ├── users/page.tsx          # ← @/modules/demo/users/
│   ├── billing/page.tsx
│   ├── exclusive/page.tsx
│   ├── react-query/page.tsx
│   └── workspaces/page.tsx
```

**모듈 없는 페이지들**(chart, code-block, command, dialog, dropdown, progress, static-pages, table, tabs-accordion, tooltip)은 기존대로 `demo/components/` 하위에 유지된다. 이들은 `src/modules/`에 대응 모듈이 없는 순수 UI 쇼케이스 페이지다.

**URL 리다이렉트** — `next.config.ts`에 추가:
```typescript
async redirects() {
  return [
    { source: '/library', destination: '/demo', permanent: true },
    { source: '/library/:path*', destination: '/demo/:path*', permanent: true },
  ];
}
```

### 2.3 변하지 않는 것

- `src/constants/mock-api.ts`, `mock-api-users.ts` — 템플릿 원본 위치 그대로 유지
- `src/components/` — 공통 UI (shadcn, layout, forms, themes)
- `src/hooks/` — 공통 훅
- `src/lib/` — 유틸리티
- `src/config/` — views.ts, nav-config.ts
- 각 데모/Product 모듈 내부 구조 (`api/`, `hooks/`, `components/`)

### 2.4 데모 모듈 아키텍처 유형

원본 템플릿의 의도를 존중하여, 유형별로 다른 패턴을 허용한다:

| 유형 | 패턴 | 해당 모듈 |
|------|------|-----------|
| **CRUD 데이터** | `@/constants/mock-api-<name>.ts` + `api/{types,service,queries,mutations}.ts` + `hooks/` | products, users, dashboard, billing, exclusive, workspaces |
| **클라이언트 상태** | Zustand store (`utils/store.ts`) + 컴포넌트 | chat, kanban, notifications |
| **순수 UI** | 데이터 레이어 없이 컴포넌트만 | forms, elements, profile |
| **외부 API** | 실제 fetch + React Query 패턴 쇼케이스 | react-query-demo |

> CRUD 모듈 6개 중 products, users만 mock-api 표준을 준수하고, dashboard/billing/exclusive/workspaces는 service.ts 내 인라인 mock 배열을 사용 중이다. 표준화는 별도 이슈로 추적.
>
> overview 모듈은 어디서도 import되지 않아 삭제 대상이다. overview 차트 패턴은 `demo/components/chart/` 페이지에서 별도 제공된다.

### 2.5 Import 경계

- Product 코드(`dcim`, `settings`, `home` 뷰의 page.tsx 및 모듈)는 `@/modules/demo/*` import 금지
- 데모 내에서는 `@/constants/mock-api*`, `@/modules/demo/*` 자유롭게 import
- `scripts/check-demo-imports.sh`:
  ```bash
  #!/usr/bin/env bash
  # Product → demo import 검사
  if grep -rn "from ['\"]@/modules/demo/" src/modules/ \
     --include='*.ts' --include='*.tsx' \
     | grep -v "src/modules/demo/" ; then
    echo "ERROR: Product code imports from demo modules."
    exit 1
  fi
  # Product → mock-api 직접 import 검사
  if grep -rn "from ['\"]@/constants/mock-api" src/modules/ \
     --include='*.ts' --include='*.tsx' \
     | grep -v "src/modules/demo/" ; then
    echo "ERROR: Product code imports mock-api directly."
    exit 1
  fi
  ```

### 2.6 `scc-develop-guide` 스킬

`.claude/skills/scc-develop-guide/` — kiranism 기반으로 현행화한 SCC 개발 가이드.

참조를 5개로 축소하고 kiranism 중복은 기존 `docs/`로 연결한다:

| 파일 | 내용 |
|------|------|
| `SKILL.md` | 메인 가이드: 기술 스택, 뷰 시스템, 모듈 패턴, 네비게이션, 코드 컨벤션, Demo/Product 경계 |
| `references/crud-module-guide.md` | CRUD 데모 모듈 전체 아키텍처 (신규) |
| `references/zustand-module-guide.md` | Zustand store 패턴 (신규) |
| `references/view-system-guide.md` | 뷰 시스템: views.ts, route group, PageContainer (신규) |
| `references/demo-product-boundary.md` | Demo/Product 경계 규칙 + CI 검사 (신규) |

SKILL.md에서 기존 `docs/` 파일들로 연결:
- mock-api 패턴 → `docs/data/cheat-sheet.md`
- query/mutation 패턴 → `docs/data/cheat-sheet.md`
- 폼 시스템 → `docs/forms/guide.md`
- 테마 시스템 → `docs/themes/guide.md`
- 코딩 컨벤션 → `docs/core/conventions.md`

기존 `.claude/skills/kiranism-shadcn-dashboard/`는 `scc-develop-guide`와 동일 PR에서 삭제한다.

---

## 3. 구현 계획

### Phase A — 사전 작업 (모듈 이동 없음)

1. `NotificationCenter`를 `src/components/layout/notification-center.tsx`로 추출
2. `(main)/layout.tsx` import 경로 수정
3. `notifications/` 모듈 내 `notification-center.tsx`는 `src/components/layout/`으로 re-export 경로만 남기고 제거
4. orphaned `overview` 모듈 삭제
5. 검증: `bun tsc --noEmit`, `bun run build`

### Phase B — 모듈 디렉토리 이동 (URL 변경 없음)

1. `src/modules/demo/` 디렉토리 생성
2. 13개 데모 모듈을 `git mv`로 `src/modules/demo/` 하위로 이동
3. 모든 `@/modules/<demo-name>/` import를 `@/modules/demo/<demo-name>/`로 일괄 변경
4. 검증: `bun tsc --noEmit`, `bun run build`

### Phase C — 라우트 변경

1. `src/config/views.ts`: `library` → `demo`, 모든 href `/library/` → `/demo/`
2. `src/config/nav-config.ts`: 모든 url `/library/` → `/demo/`
3. `(main)/library/` 디렉토리를 `(main)/demo/`로 rename
4. `(main)/demo/`에 `error.tsx` + `loading.tsx` 생성
5. `next.config.ts`에 `/library/*` → `/demo/*` redirect 추가
6. 전체 코드베이스에서 `/library` 문자열 잔존 grep 검사
7. 검증: `bun tsc --noEmit`, `bun run build`, URL 수동 확인

### Phase D — 경계 강제 + 스킬

1. `scripts/check-demo-imports.sh` 생성
2. `.claude/skills/scc-develop-guide/` 스킬 작성
3. `.claude/skills/kiranism-shadcn-dashboard/` 삭제
4. 검증: `bash scripts/check-demo-imports.sh` 통과

### 롤백 전략

각 Phase는 독립적인 커밋으로 분리한다. Phase A/B/C/D 순서로 진행하며, 각 Phase 실패 시 해당 커밋만 revert한다:
- Phase B 실패 → `git reset --hard HEAD~1` (모듈 이동 + import 변경만 되돌림)
- Phase C 실패 → `git revert` (라우트만 되돌림, 모듈 이동은 유지)
- Phase D 실패 → 스크립트/스킬만 revert, 나머지는 유지

---

## 4. 영향 범위

### 4.1 import 경로 변경 (Phase B)

13개 데모 모듈의 내부/외부 import 경로가 변경된다. `sd`(또는 `sed`)로 일괄 치환 후 `bun tsc --noEmit`으로 검증한다. IDE 리팩터링은 문자열 리터럴(href)을 처리하지 못하므로 사용하지 않는다.

### 4.2 변경 파일 요약

| 범주 | 파일 | Phase |
|------|------|-------|
| `src/components/layout/` | `notification-center.tsx` 신규 | A |
| `src/app/(main)/layout.tsx` | NotificationCenter import 변경 | A |
| `src/modules/overview/` | 삭제 | A |
| `src/modules/demo/*` | 13개 모듈 이동 + 내부 import 변경 | B |
| `src/config/views.ts` | `library` → `demo`, ~28개 href 경로 | C |
| `src/config/nav-config.ts` | ~15개 url 경로 | C |
| `src/app/(main)/library/` → `demo/` | 디렉토리 rename | C |
| `src/app/(main)/demo/` | `error.tsx` + `loading.tsx` 신규 | C |
| `next.config.ts` | redirects 추가 | C |
| `scripts/check-demo-imports.sh` | CI 검사 스크립트 신규 | D |
| `.claude/skills/` | kiranism 삭제, scc-develop-guide 신설 | D |

### 4.3 영향 없는 파일

- `src/modules/{ipam,devices,cables,sites,switch-mapping,interfaces,view-settings,auth}/` — 변경 없음
- `src/app/api/` — 변경 없음
- `src/components/` (notification-center.tsx 신설 외) — 변경 없음
- `src/hooks/`, `src/lib/`, `src/types/`, `src/constants/` — 변경 없음
- `package.json`, `prisma/` — 변경 없음

---

## 5. 검증 계획 (Phase C/D 완료 후)

1. `bun tsc --noEmit` — 타입 오류 없음
2. `bun run build` — 빌드 성공
3. `bash scripts/check-demo-imports.sh` — Product → demo import 위반 없음
4. `grep -r "/library" src/ --include='*.ts' --include='*.tsx'` — 잔존 URL 없음 (redirect 제외)
5. 수동: `/demo/*` 경로에서 데모 페이지 정상 렌더링
6. 수동: `/library/*` 경로가 `/demo/*`로 리다이렉트 되는지 확인
7. 수동: `/dcim/*`, `/settings/*`, `/home` 정상 동작 (regression)
