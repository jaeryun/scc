# CRUD Demo Module Architecture

## File Structure

```
src/modules/demo/<name>/
├── api/
│   ├── types.ts        # 타입 정의 (re-export from mock-api if applicable)
│   ├── service.ts      # 데이터 접근 — @/constants/mock-api-<name> import
│   ├── queries.ts      # queryOptions + query key factory
│   └── mutations.ts    # mutationOptions (create/update/delete)
├── hooks/
│   ├── use-<name>s.ts      # useSuspenseQuery hook
│   └── use-<name>-mutations.ts  # useMutation hooks
├── components/
│   ├── <name>-listing.tsx  # 목록 페이지 (서버 prefetch)
│   ├── <name>-view-page.tsx
│   ├── <name>-form.tsx     # 생성/수정 폼
│   └── <name>-table/
│       ├── index.tsx       # 클라이언트 테이블 (useSuspenseQuery + useDataTable)
│       ├── columns.tsx     # ColumnDef[]
│       └── cell-action.tsx # 행 액션 (수정/삭제)
├── schemas/
│   └── <name>.ts       # Zod schema
└── constants/
    └── <name>-options.ts  # 필터 옵션
```

## Data Flow

```
mock-api-<name>.ts  →  api/service.ts  →  api/queries.ts  →  hooks/  →  components
(data source)           (data access)      (key factory +       (useSuspenseQuery
                                             queryOptions)        + useMutation)
```

## Mock API Pattern

Mock data lives in `src/constants/mock-api-<name>.ts` using faker + match-sorter:

```typescript
import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type Entity = { id: number; name: string; /* ... */ };

export const fakeEntities = {
  records: [] as Entity[],

  initialize() {
    for (let i = 1; i <= 20; i++) {
      this.records.push({ id: i, name: faker.commerce.productName(), /* ... */ });
    }
  },

  async getEntities(params: { page?: number; limit?: number; search?: string }) {
    await delay(800);
    let items = [...this.records];
    if (params.search) {
      items = matchSorter(items, params.search, { keys: ['name'] });
    }
    const total = items.length;
    items = items.slice(((params.page ?? 1) - 1) * (params.limit ?? 10), (params.page ?? 1) * (params.limit ?? 10));
    return { items, total_items: total };
  },

  async getEntityById(id: number) { /* ... */ },
  async createEntity(data: Omit<Entity, 'id'>) { /* ... */ },
  async updateEntity(id: number, data: Partial<Entity>) { /* ... */ },
  async deleteEntity(id: number) { /* ... */ },
};

fakeEntities.initialize();
```

## Service Layer

```typescript
// api/service.ts
import { fakeEntities } from '@/constants/mock-api-entities';
import type { EntityFilters, EntitiesResponse, EntityMutationPayload } from './types';

export async function getEntities(filters: EntityFilters): Promise<EntitiesResponse> {
  return fakeEntities.getEntities(filters);
}
export async function createEntity(data: EntityMutationPayload) {
  return fakeEntities.createEntity(data);
}
```

## Query Key Factory

```typescript
// api/queries.ts
import { queryOptions } from '@tanstack/react-query';
import { getEntities } from './service';

export const entityKeys = {
  all: ['entities'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  list: (filters: EntityFilters) => [...entityKeys.lists(), filters] as const,
  details: () => [...entityKeys.all, 'detail'] as const,
  detail: (id: number) => [...entityKeys.details(), id] as const,
};

export const entitiesQueryOptions = (filters: EntityFilters) =>
  queryOptions({ queryKey: entityKeys.list(filters), queryFn: () => getEntities(filters) });
```

## Mutation Options

```typescript
// api/mutations.ts
import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createEntity, updateEntity, deleteEntity } from './service';
import { entityKeys } from './queries';

export const createEntityMutation = mutationOptions({
  mutationFn: (data: EntityMutationPayload) => createEntity(data),
  onSuccess: () => getQueryClient().invalidateQueries({ queryKey: entityKeys.all }),
});
```

## Reference Implementation

- `src/modules/demo/products/` — full CRUD with mock-api
- `src/modules/demo/users/` — full CRUD with sheet forms
