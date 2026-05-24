# Users 모듈

## 아키텍처: mock-api-users 직접 호출

Users는 `service.ts`에서 `@/constants/mock-api-users`의 `fakeUsers`를 직접 호출합니다.

```
컴포넌트 → hooks → queries.ts → service.ts → fakeUsers (mock-api-users)
```

- Products와 동일한 mock-api 패턴을 사용하지만, 데이터 페칭 패턴이 다릅니다 (아래 참조).

## 데이터 모델 (mock-api-users)

```typescript
// types.ts — User 타입은 mock-api에서 re-export
export type { User } from '@/constants/mock-api-users';

interface User {
  id: string; // e.g. "daniel.yun"
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  primary_team: string;
  secondary_team: string;
  avatar_url?: string;
  created_at?: string;
}
```

## API 엔드포인트 (Route Handler - 프록시)

| 메서드   | 경로                                           | 설명                         |
| -------- | ---------------------------------------------- | ---------------------------- |
| `GET`    | `/api/users?page=&limit=&roles=&search=&sort=` | 사용자 목록 (필터/검색/정렬) |
| `POST`   | `/api/users`                                   | 사용자 생성                  |
| `PUT`    | `/api/users/[id]`                              | 사용자 수정                  |
| `DELETE` | `/api/users/[id]`                              | 사용자 삭제                  |

## 필터/검색/정렬 (`UserFilters`)

```typescript
type UserFilters = {
  page?: number;
  limit?: number;
  roles?: string; // CSV (e.g. "admin,user")
  search?: string; // 이름/이메일 검색
  sort?: string;
};
```

## 쿼리 키

```typescript
export const userKeys = {
  all: ['users'] as const,
  list: (filters: UserFilters) => [...userKeys.all, 'list', filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const
};
```

> `list`(단수) 사용 — Products와 동일 패턴.

## 뮤테이션

```typescript
// updateUserMutation — id와 values를 분리하여 전달
mutationFn: ({ id, values }: { id: string; values: UserMutationPayload }) =>
  updateUser(id, values),
```

## 폼 스키마

- **위치**: `schemas/user.ts` (디렉토리 기반)
- `userSchema`: id(정규식 검증 `^[a-z0-9]+\.[a-z0-9]+$`), primary_team, secondary_team, role, status

## Users vs Products: 데이터 페칭 패턴 차이

두 기능은 다른 데이터 페칭 패턴을 사용합니다 (`info-content.ts`에 상세 설명 포함):

|            | Products                 | Users                                              |
| ---------- | ------------------------ | -------------------------------------------------- |
| 서버 페치  | RSC `fetch` → props 전달 | `prefetchQuery` + `HydrationBoundary`              |
| 클라이언트 | props를 테이블에 전달    | `useSuspenseQuery`로 캐시 조회                     |
| 장점       | 단순함, 직관적           | 백그라운드 refetch, 캐시 공유, optimistic mutation |

Users 패턴이 신규 페이지 권장 방식입니다.
