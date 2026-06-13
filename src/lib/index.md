# lib/ — 유틸리티 함수 구조와 파일 목록

## 디렉터리 용도

애플리케이션 전반에서 사용되는 순수 유틸리티 함수 모음. 모든 함수는 부수 효과 없이 동작하며 `@/lib/*` 경로로 임포트한다.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `utils.ts` | clsx + tailwind-merge 클래스 병합 (`cn()`), `formatBytes()` | cn, class-merge, format |
| `api-client.ts` | 제네릭 fetch 래퍼, `Content-Type: application/json` 기본 | fetch, api, client |
| `api-response.ts` | Route Handler 표준 응답 (`success()`, `failure()`) | api, response, format |
| `query-client.ts` | SSR/클라이언트 자동 감지 QueryClient 싱글톤, `staleTime: 60s` | react-query, ssr |
| `searchparams.ts` | nuqs 서버/클라이언트 검색 파라미터 캐시 | url, search-params |
| `parsers.ts` | TanStack Table 정렬 상태 URL 직렬화 | table, sort, parser |
| `prisma.ts` | Prisma 클라이언트 싱글톤 | database, orm |
| `format.ts` | 날짜 포매팅 | date, format, display |
| `data-table.ts` | TanStack Table 헬퍼 (pinning, filters) | table, datagrid |
| `compose-refs.ts` | 다중 ref 합성 (Radix UI 통합) | ref, radix |
| `netbox/` | NetBox API 클라이언트 유틸 (auto-paginate, cache, retry 등) | netbox, integration |

## 포함 금지 항목

- 도메인 로직·데이터 접근 → `src/modules/<name>/api/`에 배치
- React 컴포넌트 → `src/components/` 또는 `src/modules/<name>/components/`에 배치
- React 훅 → `src/hooks/` 또는 `src/modules/<name>/hooks/`에 배치
- 부수 효과가 있는 함수 — `lib/`는 순수 함수만 허용
