# Phase 4: hooks/ 계층 보완 + mutation hook 패턴 통일

> **이전 Phase:** Phase 3 (view-settings 모듈) 완료 후 진행.
> **원본 감사 보고서:** `docs/audits/2026-05-27-src-convention-audit.md` §M1, M2, M3

---

## 1. 문제 설명

### 4.1 hooks/ 계층 누락 — 7개 모듈

컨벤션 "데이터 계층 — types.ts → service.ts → queries.ts → hooks 순서" 위반.
아래 모듈은 `api/` 계층은 있으나 `hooks/`가 없어 컴포넌트가 `api/service.ts`나 `api/queries.ts`를 직접 import:

| 모듈 | 현재 문제 |
|------|----------|
| `billing` | `billing-view.tsx` → `api/queries.ts` 직접 import |
| `dashboard` | `dashboard-canvas.tsx`, `dashboard-list.tsx` → api 직접 import |
| `exclusive` | `exclusive-view.tsx` → `api/queries.ts` 직접 import |
| `products` | `product-form.tsx`, `product-tables/cell-action.tsx` → api 직접 import |
| `users` | `user-form-sheet.tsx`, `users-table/cell-action.tsx` → api 직접 import |
| `view-settings` | Phase 3에서 이미 처리됨 |
| `workspaces` | `workspace-view.tsx`, `team-view.tsx` → `api/queries.ts` / `api/mutations.ts` 직접 import |

### 4.2 useMutation 인라인 확장 패턴 (6개 모듈)

ipam/devices/cables는 **전용 mutation hook** (`useDeviceMutations()`)을 export 하지만,
dashboard/products/users/workspaces는 `mutationOptions`만 export 후 컴포넌트에서 `useMutation({...options})` 인라인 호출.

**변경 전 (현재):**
```typescript
// mutations.ts
export const createProductMutation = mutationOptions({ mutationFn: createProduct, ... });

// component
const createMutation = useMutation({ ...createProductMutation, onSuccess: () => { invalidate ... } });
```

**변경 후 (목표):**
```typescript
// mutations.ts → useProductMutations() hook export
export function useProductMutations() {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
  // ...
  return { createMutation, updateMutation, deleteMutation };
}

// component
const { createMutation } = useProductMutations();
```

### 4.3 Query Key Factory 누락 — 2개 모듈

- `src/modules/interfaces/api/queries.ts` — `['netbox', 'interfaces', deviceId]` 하드코딩
- `src/modules/sites/api/queries.ts` — `['netbox', 'sites']` 등 하드코딩

---

## 3. 해결 방향

### Task 1: hooks/ 신규 생성 (7개 모듈)

각 모듈에 2개 파일 생성:

```
src/modules/<name>/hooks/
├── use-<name>s.ts              ← useSuspenseQuery/useQuery 래핑
└── use-<name>-mutations.ts     ← api/mutations.ts의 hook re-export
```

**패턴 (데이터 훅):**
```typescript
// use-<name>s.ts
import { useSuspenseQuery } from '@tanstack/react-query';
import { <name>sQueryOptions } from '../api/queries';

export function use<Name>s() {
  return useSuspenseQuery(<name>sQueryOptions());
}
```

**패턴 (mutation 훅 — 재 export만):**
```typescript
// use-<name>-mutations.ts
export { use<Name>Mutations } from '../api/mutations';
```

### Task 2: 컴포넌트에서 직접 import 제거

각 컴포넌트가 `api/queries.ts` / `api/service.ts` 대신 `hooks/`를 통해 데이터에 접근하도록 수정.

**변경 전:**
```typescript
import { productsQueryOptions } from '@/modules/products/api/queries';
import { createProduct } from '@/modules/products/api/service';
```

**변경 후:**
```typescript
import { useProducts } from '@/modules/products/hooks/use-products';
import { useProductMutations } from '@/modules/products/hooks/use-product-mutations';
```

### Task 3: mutationOptions → useXxxMutations() 패턴 전환

6개 모듈(dashboard, products, users, workspaces, view-settings, billing*)의 `api/mutations.ts` 수정:

현재 `mutationOptions()` export → `useXxxMutations()` hook export로 변경.
컴포넌트는 `const { createMutation } = useProductMutations()` 형태로 사용.

* billing은 읽기 전용이므로 생략 가능.

### Task 4: Query Key Factory 추가 (interfaces, sites)

```typescript
// interfaces/api/queries.ts
export const interfaceKeys = {
  all: ['netbox', 'interfaces'] as const,
  list: (deviceId?: string) => [...interfaceKeys.all, 'list', deviceId] as const,
};

// sites/api/queries.ts
export const siteKeys = {
  all: ['netbox', 'sites'] as const,
  lists: () => [...siteKeys.all, 'list'] as const,
  racks: (siteId?: string) => [...siteKeys.all, 'racks', siteId] as const,
  roles: () => [...siteKeys.all, 'roles'] as const,
  platforms: () => [...siteKeys.all, 'platforms'] as const,
};
```

---

## 4. 검증 방법

```bash
# TypeScript 컴파일 체크
bun tsc --noEmit

# 빌드 검증
bun run build

# 각 모듈 hooks/ 디렉토리 존재 확인
for m in billing dashboard exclusive products users workspaces view-settings; do
  echo "$m: $(ls src/modules/$m/hooks/ 2>/dev/null || echo 'MISSING')"
done

# 컴포넌트에서 api 직접 import 잔존 확인
rg "from.*modules/(billing|dashboard|exclusive|products|users|workspaces)/api/(service|queries)" --glob "*.tsx" src/

# mutationOptions 잔존 확인 (hook 패턴으로 전환되었는지)
rg "mutationOptions" --glob "**/api/mutations.ts" src/

# Query Key 하드코딩 확인
rg "queryKey: \[" --glob "**/api/queries.ts" src/modules/interfaces/
rg "queryKey: \[" --glob "**/api/queries.ts" src/modules/sites/
```

### 완료 조건

- `bun tsc --noEmit` 통과
- `bun run build` 성공
- 7개 모듈에 `hooks/use-<name>s.ts` + `hooks/use-<name>-mutations.ts` 존재
- 컴포넌트에서 `api/service.ts` 또는 `api/queries.ts` 직접 import 0건
- `api/mutations.ts`에서 `mutationOptions` export → `useXxxMutations()` hook export로 모두 전환
- `interfaces/api/queries.ts`와 `sites/api/queries.ts`에 Key Factory 존재

---

## 5. 참고 자료

- 원본 감사: `docs/audits/2026-05-27-src-convention-audit.md` §M1, M2, M3
- 참조 구현 (완전한 패턴):
  - `src/modules/ipam/hooks/use-ip-addresses.ts` + `use-ip-mutations.ts`
  - `src/modules/devices/hooks/use-devices.ts` + `use-device-mutations.ts`
  - `src/modules/cables/hooks/use-cables.ts` + `use-cable-mutations.ts`
- 컨벤션: `docs/core/conventions.md` §"아키텍처", §"상태 관리"
