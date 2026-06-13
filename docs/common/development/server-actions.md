# Server Actions 규칙

<!-- 관련 Skills: vercel-react-best-practices/rules/server-auth-actions.md (CRITICAL),
                  next-best-practices/data-patterns.md (RSC 패턴)
     이 문서는 프로젝트 계층 구조 내 Server Actions 규칙만 기술합니다.
     일반 Server Actions 패턴은 Skills 참조. -->

> Server Actions의 일반 사용법(정의, useActionState, useFormStatus, useOptimistic)은
> Skills에 위임한다. 이 문서는 **우리 코드베이스에서** Server Actions을 어디에
> 두고 어떻게 호출하는지만 다룬다.

## 정의 위치 (필수)

Server Actions은 두 가지 위치에 둘 수 있다:

| 위치 | 사용 시점 |
|------|---------|
| `service.ts`에 동거 | 기존 service 함수와 1:1 매핑되는 mutation |
| `api/actions.ts` 별도 파일 | 여러 service 함수를 묶는 복합 mutation |

**금지:**
- 컴포넌트 파일(`page.tsx`, `*-dialog.tsx` 등)에 인라인 Server Action 정의 금지
- `app/api/*/route.ts`에서 mutation 처리 시 Server Action과 중복 정의 금지 (한 곳에 모음)

## 호출 패턴 (필수)

### Server Component

```typescript
// app/(main)/subnets/page.tsx
import { createSubnet } from '@/modules/ipam/service';

export default async function Page() {
  // Server Component는 직접 await 호출
  const result = await createSubnet(formData);
  // ...
}
```

### Client Component

```typescript
// components/create-subnet-dialog.tsx
'use client';
import { useActionState } from 'react';
import { createSubnetAction } from '@/modules/ipam/api/actions';

const [state, formAction, isPending] = useActionState(
  createSubnetAction,
  initialState
);
```

또는 mutation 경유:

```typescript
// api/mutations.ts
export const createSubnetMutation = mutationOptions({
  mutationFn: (data) => createSubnet(data),
  // ...
});
```

## 유효성 검사 (필수)

- Server Action **내부**에서 Zod 스키마로 `parse()`
- `parse()` 실패 시 표준 에러 객체로 변환하여 throw
- 클라이언트 폼 레벨 검증(Zod 스키마 재사용)과 독립적 — 두 번 검증

```typescript
'use server';
import { z } from 'zod';

const schema = z.object({ name: z.string().min(1) });

export async function createSubnet(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new ActionError('VALIDATION', parsed.error.flatten());
  }
  return db.subnet.create({ data: parsed.data });
}
```

## 재검증 (필수)

mutation 성공 후 데이터 갱신이 필요한 경우:

| 전략 | 사용 시점 |
|------|---------|
| `revalidatePath('/path')` | 특정 라우트의 데이터 갱신 |
| `revalidateTag('subnets')` | 태그 기반 캐시 무효화 (queries.ts의 queryKey와 일치) |

- `revalidatePath`/`revalidateTag`는 Server Action 내부에서 호출
- 클라이언트 mutationOptions의 `onSuccess`에서는 `invalidateQueries`만 사용 (TanStack Query 캐시)

## 에러 처리 (필수)

표준 에러 객체:

```typescript
// lib/errors.ts
export class ActionError extends Error {
  constructor(public code: string, public details?: unknown) {
    super(code);
  }
}
```

- Server Action은 `ActionError`를 throw
- 클라이언트에서 catch하여 토스트/UI 피드백 표시

## 보안 (CRITICAL)

Skills `vercel-react-best-practices/rules/server-auth-actions.md` (CRITICAL) 참조:

- **모든 Server Action은 내부에서 인증/인가 검증** (middleware, layout 가드만 의존 금지)
- 세션 확인 → 권한 확인 → 입력 검증 → 실행 순서
- IDOR(타인 리소스 접근) 방지: 모든 mutation은 소유권/권한 재확인

## 금지 패턴

- ❌ Server Action에서 `redirect()` 호출 후 mutation 실패 시 silent failure
- ❌ 컴포넌트에서 fetch로 Server Action 우회 호출
- ❌ Server Action 내부에서 클라이언트 전용 API(localStorage 등) 접근
