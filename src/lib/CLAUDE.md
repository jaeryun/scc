# 유틸리티 컨벤션

## 원칙

- 유틸 함수는 순수 함수 유지, 부수 효과 금지
- 모든 유틸은 `@/lib/*` 경로로 임포트

## 유틸리티 파일 목록

### `utils.ts` — `cn()` 클래스 병합

`clsx` + `tailwind-merge` 조합으로 조건부 클래스를 안전하게 병합합니다. Tailwind 클래스 충돌 시 마지막 클래스가 우선됩니다.

```typescript
import { cn } from "@/lib/utils";

// 기본 사용: 조건부 클래스
<button className={cn("btn", isActive && "btn-active", className)} />

// Tailwind 충돌 해결: p-4 무시되고 p-6 적용됨
<div className={cn("p-4 bg-red-500", "p-6")} />

// falsy 값은 자동 제외
<div className={cn("base", false && "hidden", undefined, null)} />
// 결과: "base"
```

추가 유틸: `formatBytes(bytes, { decimals?, sizeType? })` — 바이트 단위를 사람이 읽기 쉬운 형식으로 변환.

### `api-client.ts` — 타입 fetch 래퍼

표준 API 호출을 위한 제네릭 fetch 래퍼. `success` 필드가 있는 표준 응답을 기대합니다.

```typescript
import { apiClient } from "@/lib/api-client";

// GET
const data = await apiClient<SubnetListResponse>("/api/ipam/subnets");

// POST
const created = await apiClient<SubnetDetailResponse>("/api/ipam/subnets", {
  method: "POST",
  body: JSON.stringify(payload),
});
```

**내부 동작:**
1. `fetch(url, { headers: { "Content-Type": "application/json" }, ...options })` 호출
2. `res.ok` 확인 → 실패 시 `HTTP {status}: {text}` 에러 throw
3. JSON 파싱 후 `json.success` 확인 → 실패 시 `json.error` 메시지로 에러 throw
4. 성공 시 `json.data` 반환

**⚠️ headers override 위험:**
`options`의 스프레드 순서로 인해 `options.headers`를 전달하면 기본 `Content-Type: application/json`이 **덮어쓰기**됩니다. 파일 업로드 등 `Content-Type` 변경이 필요한 경우에만 `options.headers`를 전달하고, 그 외에는 절대 `headers`를 포함하지 마십시오.

```typescript
// ❌ 위험: Content-Type이 덮어쓰기됨
apiClient('/api/upload', { headers: { 'X-Custom': 'value' } });
// 실제 전송 헤더: { 'X-Custom': 'value' } — Content-Type 누락

// ✅ 안전: 일반 요청은 headers 전달 금지
apiClient('/api/subnets', { method: 'POST', body: JSON.stringify(data) });
// 실제 전송 헤더: { 'Content-Type': 'application/json' } + body

// ✅ 허용: 파일 업로드 등 Content-Type 변경이 필요한 경우만 headers 직접 설정
apiClient('/api/upload', { method: 'POST', body: formData, headers: {} });
```

**에러 처리:**
```typescript
try {
  const data = await apiClient<T>(url);
} catch (error) {
  // error.message:
  // - "HTTP 400: Bad Request" — ZodError 등 클라이언트 에러
  // - "HTTP 500: Internal Server Error" — 서버 에러
  // - "유효성 검사 실패" 등 — api-response failure()의 에러 메시지
}
```

### `api-response.ts` — 표준 API 응답 래퍼

Route handler에서 일관된 응답 형식을 생성합니다.

```typescript
import { success, failure, type ApiResponse } from "@/lib/api-response";

// 성공 응답
return NextResponse.json(success(subnet));

// 실패 응답 (ZodError → 400, 기타 → 500)
return NextResponse.json(failure("유효성 검사 실패"), { status: 400 });
return NextResponse.json(failure("서브넷을 찾을 수 없습니다"), { status: 404 });
```

**응답 인터페이스:**
```typescript
interface ApiResponse<T> {
  success: boolean;  // true = 성공, false = 실패
  data: T | null;    // 성공 시 데이터, 실패 시 null
  error: string | null; // 실패 시 에러 메시지, 성공 시 null
}
```

### `query-client.ts` — QueryClient 싱글톤

서버/브라우저 환경을 자동 감지하여 적절한 QueryClient를 반환합니다.

```typescript
import { getQueryClient } from "@/lib/query-client";

// 서버 컴포넌트: prefetch에 사용
const queryClient = getQueryClient();
void queryClient.prefetchQuery(subnetsQueryOptions());

// 브라우저 (hooks, mutations): 캐시 무효화에 사용
import { getQueryClient } from "@/lib/query-client";
getQueryClient().invalidateQueries({ queryKey: subnetKeys.all });
```

**설정:**
- `staleTime: 60 * 1000` (60초) — 60초 내 동일 쿼리는 재요청하지 않음
- `shouldDehydrateQuery`: pending 상태 쿼리도 dehydrate하여 클라이언트에서 이어받음

**내부 구조:**
```typescript
function getQueryClient() {
  if (isServer) {
    return makeQueryClient(); // 요청마다 새 인스턴스 (cross-request 오염 방지)
  }
  // 브라우저: 싱글톤 유지
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
```

### `searchparams.ts` — 검색 파라미터 유틸리티

nuqs 기반의 서버/클라이언트 공통 검색 파라미터 관리.

```typescript
// lib/searchparams.ts
import { createSearchParamsCache, parseAsInteger, parseAsString } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString,
  role: parseAsString,
  sort: parseAsString,
});

// 서버 컴포넌트에서 사용
import { searchParamsCache } from "@/lib/searchparams";
const { page, name } = searchParamsCache.parse(searchParams);
```

새로운 검색 파라미터가 필요하면 이 파일에 추가합니다. `parseAsInteger`, `parseAsString`, `parseAsBoolean` 등 nuqs 파서를 사용합니다.

### `parsers.ts` — nuqs 커스텀 파서

```typescript
// TanStack Table 정렬 상태를 URL 파라미터로 직렬화/역직렬화
import { getSortingStateParser } from "@/lib/parsers";

const sortingParser = getSortingStateParser(["name", "createdAt"]);
```

### `prisma.ts` — Prisma 클라이언트 싱글톤

개발 환경에서 hot reload로 인한 중복 인스턴스 생성을 방지합니다.

```typescript
import { prisma } from "@/lib/prisma";

const subnets = await prisma.subnet.findMany();
```

**주의:** 컴포넌트에서 직접 호출 금지 — 반드시 route handler 또는 Server Action 내에서만 사용.

### `format.ts` — 날짜 포매팅

```typescript
import { formatDate } from "@/lib/format";

formatDate(createdAt);                          // "May 19, 2026"
formatDate(createdAt, { month: "short" });      // "May 19, 2026"
formatDate(createdAt, { year: undefined });     // "May 19"
```

### `data-table.ts` — TanStack Table 헬퍼

```typescript
import { getCommonPinningStyles, getValidFilters } from "@/lib/data-table";

// 컬럼 고정 스타일
const style = getCommonPinningStyles({ column });

// 빈 값/무효 필터 제거
const validFilters = getValidFilters(filters);
```

### `compose-refs.ts` — Ref 합성

여러 개의 ref를 하나로 합성해야 할 때 사용 (Radix UI 등과 통합 시).

```typescript
import { useComposedRefs } from "@/lib/compose-refs";

const composedRef = useComposedRefs(internalRef, forwardedRef);
```
