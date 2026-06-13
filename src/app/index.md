# app/ — App Router 구조와 파일 목록

## 디렉터리 용도

Next.js App Router 진입점. 뷰별 라우트 그룹, API 라우트 핸들러, 루트 레이아웃 및 에러 처리를 포함한다.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `(main)/` | 뷰별 라우트 그룹 (dcim, demo, home, settings) | route-group, views |
| `api/` | Production API 라우트 핸들러 (dcim, ipam, view-settings) | api, route-handlers |
| `api-reference/` | Scalar 기반 API 레퍼런스 뷰어 | api-docs, scalar |
| `metrics/` | Prometheus 메트릭 엔드포인트 | metrics, monitoring |
| `layout.tsx` | 루트 레이아웃 | root-layout |
| `page.tsx` | 루트 페이지 (홈 리다이렉트) | redirect |
| `global-error.tsx` | 전역 에러 바운더리 (`<html>`/`<body>` 포함) | error-boundary |
| `not-found.tsx` | 404 페이지 | 404 |
| `favicon.ico` | 파비콘 | favicon |

## Next.js 파일 컨벤션

| 파일 | 역할 |
|------|------|
| `layout.tsx` | 공유 레이아웃 (중첩 가능) |
| `page.tsx` | 라우트의 실제 페이지 |
| `loading.tsx` | Suspense fallback (page 로딩 중) |
| `error.tsx` | 에러 바운더리 (`'use client'` 필수) |
| `not-found.tsx` | 404 페이지 |
| `global-error.tsx` | 루트 에러 바운더리 (`<html>`, `<body>` 포함 필수) |
| `route.ts` | API 라우트 핸들러 |

## 포함 금지 항목

- `pages/` 디렉토리 (Pages Router — App Router만 사용)
