# 유틸리티 컨벤션

@docs/core/conventions.md

## 원칙

- 유틸 함수는 순수 함수 유지, 부수 효과 금지
- 모든 유틸은 `@/lib/*` 경로로 임포트
- 에러는 throw, 반환값으로 에러 전달 금지
- 상세 사용법은 각 소스 파일의 JSDoc 참조

## 유틸리티 목록

| 파일 | import | 용도 |
|------|--------|------|
| `utils.ts` | `import { cn } from '@/lib/utils'` | clsx + tailwind-merge 클래스 병합. 추가: `formatBytes()` |
| `api-client.ts` | `import { apiClient } from '@/lib/api-client'` | 제네릭 fetch 래퍼. `Content-Type: application/json` 기본, `headers` 전달 시 덮어쓰기에 주의 |
| `api-response.ts` | `import { success, failure } from '@/lib/api-response'` | Route Handler 표준 응답 (`{ success, data, error }`) |
| `query-client.ts` | `import { getQueryClient } from '@/lib/query-client'` | SSR/클라이언트 자동 감지 QueryClient 싱글톤. `staleTime: 60s` |
| `searchparams.ts` | `import { searchParamsCache } from '@/lib/searchparams'` | nuqs 서버/클라이언트 검색 파라미터 캐시 |
| `parsers.ts` | `import { getSortingStateParser } from '@/lib/parsers'` | TanStack Table 정렬 상태 URL 직렬화 |
| `prisma.ts` | `import { prisma } from '@/lib/prisma'` | Prisma 클라이언트 싱글톤. 컴포넌트 직접 호출 금지 |
| `format.ts` | `import { formatDate } from '@/lib/format'` | 날짜 포매팅 |
| `data-table.ts` | `import { getCommonPinningStyles, getValidFilters } from '@/lib/data-table'` | TanStack Table 헬퍼 |
| `compose-refs.ts` | `import { useComposedRefs } from '@/lib/compose-refs'` | 다중 ref 합성 (Radix UI 통합) |

## 새 유틸 추가 시

1. `src/lib/<name>.ts` 생성 — 순수 함수만 export
2. JSDoc으로 사용법, 파라미터, 반환값 문서화
3. 위 테이블에 한 줄 추가
4. `conventions.md`에 규칙화가 필요한 경우 해당 섹션에 추가
