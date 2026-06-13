# users/ — Demo 사용자 모듈

## 디렉터리 용도

사용자(User) 데모 모듈. mock-api 기반 인메모리 데이터로 사용자 CRUD와 필터링을 시연한다.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `api/` | 데이터 접근 계층 (types, service, queries, mutations, mock-store) | API, data layer |
| `components/` | 사용자 UI 컴포넌트 | user table, form |
| `hooks/` | 데이터 페칭 훅 | hooks, useQuery |
| `schemas/` | Zod 유효성 검사 스키마 | validation, schema |
| `info-content.ts` | 사용자 상세 정보 콘텐츠 | info, detail |

## 포함 금지 항목

- 제품(production) 코드 — demo/는 인메모리 mock 데이터만 사용, Prisma·apiClient 사용 금지
- 다른 모듈 코드 — 모듈 간 의존 금지, shared mock-data는 `src/constants/`에 배치
