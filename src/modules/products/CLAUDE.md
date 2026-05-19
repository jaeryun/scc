# Products 모듈

## 아키텍처: mock-api 직접 호출

Products는 `service.ts`에서 `@/constants/mock-api`의 `fakeProducts`를 직접 호출합니다.
Route Handler나 Prisma를 거치지 않는 단순 구조입니다.

```
컴포넌트 → hooks → queries.ts → service.ts → fakeProducts (mock-api)
```

- `service.ts` 주석에 4가지 백엔드 연결 패턴(Server Actions / Route Handlers / BFF / Direct API)이 문서화되어 있음.
- 실제 백엔드 연결 시 `service.ts` 본문만 해당 패턴으로 교체.

## 데이터 모델 (mock-api)

```typescript
// types.ts — Product 타입은 mock-api에서 re-export
export type { Product } from '@/constants/mock-api';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string;
  created_at?: string;
}
```

## API 엔드포인트 (Route Handler - 프록시)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/products?page=&limit=&categories=&search=&sort=` | 제품 목록 (필터/검색/정렬) |
| `GET` | `/api/products/[id]` | 제품 상세 |
| `POST` | `/api/products` | 제품 생성 |
| `PUT` | `/api/products/[id]` | 제품 수정 |
| `DELETE` | `/api/products/[id]` | 제품 삭제 |

## 필터/검색/정렬 (`ProductFilters`)

```typescript
type ProductFilters = {
  page?: number;
  limit?: number;
  categories?: string;   // CSV (e.g. "beauty,electronics")
  search?: string;       // 제품명 검색
  sort?: string;         // 정렬 기준 (e.g. "price", "name")
};
```

- 쿼리 키에 `filters` 객체가 포함되므로 필터 변경 시 자동 refetch.
- URL 검색 파라미터: `src/lib/searchparams.ts`에서 `parseAsString`/`parseAsInteger`로 관리.

## 쿼리 키

```typescript
export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => [...productKeys.all, 'list', filters] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const
};
```

> 참고: `list`(단수) 사용 — IPAM의 `lists`(복수)와 다름. 컨벤션보다 기존 코드 우선.

## 뮤테이션

```typescript
// updateProductMutation — id와 values를 분리하여 전달
mutationFn: ({ id, values }: { id: number; values: ProductMutationPayload }) =>
  updateProduct(id, values),
```

## 폼 스키마

- **위치**: `schemas/product.ts` (디렉토리 기반)
- `productSchema`: image(파일 유효성 검사 포함), name, category, price, description
- 이미지 검증: 최대 5MB, 허용 형식(jpg, jpeg, png, webp)

## 카테고리 옵션

- **위치**: `constants/product-options.ts`
- `categoryOptions`: `beauty`, `electronics`, `home`, `sports`

## 특별 규칙

### RSC 데이터 페칭 패턴 (Products 전용)
Products는 `searchParams` → RSC `fetch` → 데이터를 props로 클라이언트 테이블에 전달하는 **서버 컴포넌트 패치 패턴**을 사용합니다.
Users의 `prefetchQuery` + `useSuspenseQuery` 패턴과 다릅니다. (참고: [modules/users/info-content.ts](../users/info-content.ts))
