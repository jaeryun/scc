# Users 모듈

@src/modules/CLAUDE.md 템플릿 적용.

## 아키텍처: mock-api 직접 호출

컴포넌트 → hooks → queries.ts → service.ts → fakeUsers (mock-api-users)

PrefetchQuery + HydrationBoundary + useSuspenseQuery 패턴 사용 (신규 권장 방식).

## 데이터 모델

```typescript
export type { User } from '@/constants/mock-api-users';
interface User {
  id: string; first_name: string; last_name: string; email: string;
  role: string; status: string; primary_team: string; secondary_team: string;
  avatar_url?: string; created_at?: string;
}
```

## API 엔드포인트

GET/POST `/api/users`, PUT/DELETE `/api/users/[id]`
필터: `page`, `limit`, `roles`, `search`, `sort`

## 모듈 특이사항

- **prefetchQuery 패턴**: `prefetchQuery` + `HydrationBoundary` + `useSuspenseQuery`. Products의 RSC fetch보다 개선된 방식. 신규 페이지 권장.
- **ID 정규식**: `schemas/user.ts`에서 `^[a-z0-9]+\.[a-z0-9]+$` 검증
- **쿼리 키**: `list`(단수) 사용 — Products와 동일
