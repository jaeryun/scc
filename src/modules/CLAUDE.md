# 기능 모듈 컨벤션

@docs/data/cheat-sheet.md
@docs/forms/cheat-sheet.md
@docs/architecture/component-guide.md

## 🚨 핵심 규칙

### 1. `service.ts` 가 유일한 데이터 접근점

**`queries.ts` / `mutations.ts` 는 절대 `apiClient()` 를 직접 호출하지 않는다.** 모든 데이터 접근은 `service.ts` 를 통해야 한다.

```
✅ queries.ts → service.ts → mock-store
✅ queries.ts → service.ts → apiClient → API route → Prisma
❌ queries.ts → apiClient('/api/...')  // 금지
```

### 2. Demo vs Production

| | Demo | Production |
|---|---|---|
| **데이터 소스** | `mock-store.ts` (in-memory) | Prisma (DB) |
| **`src/app/api/<name>/`** | ❌ 없음 | ✅ Route Handler |
| **`service.ts` 역할** | mock-store 직접 호출 | `apiClient()`로 HTTP API 호출 |
| **예시** | dashboard, products, users | ipam, view-settings |

### 3. API 라우트 배치

- **Production 모듈만 `src/app/api/<name>/` 에 Route Handler 생성**
- Demo 모듈은 `src/app/api/` 를 사용하지 않음 (빌드 시 실제 엔드포인트로 노출되기 때문)
- 규칙 상세 → [src/app/api/CLAUDE.md](../app/api/CLAUDE.md)

## 기능 추가 워크플로

1. `src/modules/<name>/api/` — `types.ts` → `service.ts` → `queries.ts`
2. `src/modules/<name>/hooks/` — `use-<name>s.ts`, `use-<name>-mutations.ts`
3. `src/modules/<name>/components/` — UI 컴포넌트
4. `src/app/(views)/<view>/` 또는 `src/app/dashboard/<name>/page.tsx`
5. `src/config/views.ts` 또는 `src/config/nav-config.ts` 네비게이션 아이템 등록
6. (Production만) `src/app/api/<name>/route.ts` — API 라우트
7. (선택) `src/components/icons.tsx` — 새 아이콘 등록

## 파일 구조 규칙

```
src/modules/<name>/api/
├── types.ts        # 타입 정의 (필수)
├── service.ts      # 데이터 접근 계층 (필수) — mock-store 직접 호출 또는 apiClient 사용
├── queries.ts      # TanStack Query 옵션 (필수)
├── mutations.ts    # TanStack Mutation 옵션 (CRUD 있을 때만)
└── mock-store.ts   # Demo 모듈 전용: in-memory 데이터 저장소 + seed
```

## Demo 모듈: mock-store 패턴

```typescript
// types.ts — 타입 정의
export interface Product { id: string; name: string; ... }

// mock-store.ts — in-memory 저장소
let items: Product[] = [];
function seed() { items = [{ id: '1', name: 'Sample', ... }]; }
seed();
export function getItems(): Product[] { return items; }
export function createItem(data): Product { ... }

// service.ts — mock-store re-export
export { getItems, createItem } from './mock-store';

// queries.ts — service 호출
export const itemsQueryOptions = queryOptions({
  queryFn: () => getItems()
});

// mutations.ts — service 호출
export const createItemMutation = mutationOptions({
  mutationFn: async (data) => createItem(data),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: itemKeys.all })
});
```

## Production 모듈: apiClient 패턴

```typescript
// types.ts — 타입 정의
export interface Subnet { id: string; network: string; ... }

// service.ts — apiClient로 HTTP API 호출
import { apiClient } from '@/lib/api-client';
export async function getSubnets(): Promise<Subnet[]> {
  return apiClient('/api/ipam/subnets');
}

// queries.ts — service 호출 (Demo와 동일)
export const subnetsQueryOptions = queryOptions({
  queryFn: () => getSubnets()
});

// src/app/api/ipam/subnets/route.ts — Route Handler (thin controller)
export async function GET() {
  const subnets = await getSubnetsHandler(); // → Prisma
  return NextResponse.json(success(subnets));
}
```

## 쿼리 키 컨벤션

```typescript
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,     // 복수형 통일
  detail: (id: string) => [...itemKeys.all, 'detail', id] as const,
};
```

- 키 네임스페이스는 모듈명과 일치시킨다 (예: `subnets`, `ip-addresses`, `dashboards`)
- `lists`(복수형) 사용 — `list`(단수)와 혼용 금지

## 정규 참조 구현

| 모듈 | 유형 | 참조 대상 |
|------|------|-----------|
| `src/modules/ipam/` | Production | Prisma + Zod + apiClient 전체 패턴 |
| `src/modules/dashboard/` | Demo | mock-store + in-memory seed 패턴 |
| `src/modules/products/` | Demo | `@/constants/mock-api` 공유 상수 패턴 |
| `src/app/api/ipam/` | Production API | Route Handler + Zod 검증 + 계층 분리 |

## 컴포넌트 배치
