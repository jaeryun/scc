# src/ — 소스코드 구조와 파일 목록

## 디렉터리 용도

Next.js 16 App Router 기반의 애플리케이션 소스 코드 루트. 라우트, 컴포넌트, 모듈, 유틸리티, 스타일 등 모든 소스가 이 디렉터리 아래에 위치한다.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `app/` | Next.js App Router (라우트, API, 레이아웃) | routing, pages, api |
| `components/` | 공통 UI 컴포넌트 (shadcn/ui, 레이아웃, 폼, 테마, 아이콘) | ui, layout, forms, themes |
| `config/` | 뷰 정의, 내비게이션, 데이터 테이블 설정 | views, navigation, rbac |
| `constants/` | 모의 API 상수 및 사용자 정의 | mock, fixtures |
| `hooks/` | 커스텀 React 훅 (useDebounce, useNav, useCurrentView 등) | hooks, state, navigation |
| `lib/` | 순수 유틸리티 함수 (cn, apiClient, prisma, format 등) | utilities, helpers |
| `modules/` | 도메인 기능 모듈 (ipam, devices, cables, demo 등) | domain, features |
| `styles/` | 전역 CSS, 테마 스타일시트 | css, themes, globals |
| `types/` | 공통 TypeScript 타입 정의 | types, interfaces |

## 포함 금지 항목

- 문서 파일 → `docs/`에 배치
- 설정 파일(next.config, package.json 등) → 프로젝트 루트에 배치
- 데이터베이스 마이그레이션·시드 → `prisma/`에 배치
- 정적 파일(이미지, 폰트) → `public/`에 배치
