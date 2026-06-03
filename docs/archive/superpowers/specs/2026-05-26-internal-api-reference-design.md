# 내부 API Reference 뷰 설계

**날짜**: 2026-05-26
**상태**: Approved

## 목적

`src/app/api/` 의 production API(dcim, ipam, view-settings)를 빌드타임 자동 스캔하여 통합 OpenAPI 스펙을 생성하고, SCC 대시보드 크롬 없이 풀사이즈 Scalar 뷰어로 제공.

## 배경

기존 `/library/api-reference` 는 외부 시스템(SemaphoreUI)의 OpenAPI 스펙을 Scalar로 임베딩해 보여주는 용도였다. 이번 작업으로 해당 페이지는 전면 삭제하고, SCC 자체 production API를 위한 전용 뷰로 교체한다.

## 아키텍처

```
[빌드타임]   src/app/api/**/route.ts 스캔 (glob)
                  ↓
           통합 OpenAPI 3.1 JSON 생성
                  ↓
        public/api-specs/internal/latest.json
                  ↓
[런타임]    /api-reference 페이지
                  ↓
        DynamicScalarViewer (풀사이즈, SCC 크롬 없음)
```

## 삭제 대상

| 경로 | 설명 |
|---|---|
| `src/modules/api-reference/` | api-reference 모듈 전체 |
| `src/app/(main)/library/api-reference/` | 라이브러리 내 API Reference 페이지들 |
| `src/styles/scalar-overrides.css` | Scalar CSS 오버라이드 (새 위치로 이동) |
| `src/config/views.ts` | library 뷰의 API Reference navItems |
| `src/config/nav-config.ts` | library 내비게이션의 API Reference 항목 |

## 신규 생성

### 라우트

```
src/app/api-reference/
├── layout.tsx    # scalar CSS import + "← 대시보드로" 링크
└── page.tsx      # DynamicScalarViewer, RSC + CSR 하이브리드
```

- `(main)` 라우트 그룹 밖에 배치 → `AppSidebar`, `Header`, `KBar` 미적용
- 루트 레이아웃(테마, 폰트, Providers)만 적용되어 Scalar에 필요한 최소 환경만 제공

### OpenAPI 스펙 생성 스크립트

`scripts/generate-api-spec.ts` (Bun 스크립트)

- `src/app/api/**/route.ts` glob 스캔
- `export async function GET/POST/PUT/PATCH/DELETE` 추출
- 디렉토리 구조 → API 경로 추론: `dcim/devices` → `/api/dcim/devices`
- `[id]` 폴더 → `/{id}` path parameter
- `CLAUDE.md` 문맥에서 설명 추출 (선택적)
- 출력: `public/api-specs/internal/latest.json` (OpenAPI 3.1)

### 사이드바 등록

- `src/config/views.ts`: library 뷰 navItems에서 API Reference 항목을 `/api-reference` 링크로 재구성
- `src/config/nav-config.ts`: 동일하게 업데이트

### Scalar 설정

- `hideDarkModeToggle: true` (앱 테마 시스템 사용)
- `hideSearch: false` (검색 유지)
- `spec: { url: '/api-specs/internal/latest.json' }`
- CSS 오버라이드: `src/styles/scalar-overrides.css` 의 기존 파일 재사용

## 데이터 흐름

1. `bun run scripts/generate-api-spec.ts` → `public/api-specs/internal/latest.json`
2. Next.js 빌드: `latest.json` 은 `/public` 정적 에셋으로 배포
3. `/api-reference` 페이지에서 브라우저가 `/api-specs/internal/latest.json` fetch
4. `@scalar/api-reference-react` 가 클라이언트에서 렌더링

## 빌드 통합

`package.json` scripts:

```json
{
  "prebuild": "bash scripts/check-migrations.sh && bun run generate-api-spec",
  "generate-api-spec": "bun scripts/generate-api-spec.ts"
}
```

## 보안

- 생성된 OpenAPI spec에 내부 IP, 토큰 포함 여부 검증
- Scalar 프록시 비활성화 (Phase 1)
- "Try it" 비활성화 (추후 Phase 2 에서 프록시 도입 시 활성화)
