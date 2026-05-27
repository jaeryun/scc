# Products 모듈

@src/modules/CLAUDE.md 템플릿 적용.

## 아키텍처: mock-api 직접 호출

컴포넌트 → hooks → queries.ts → service.ts → fakeProducts (mock-api)

- `service.ts`에 4가지 백엔드 연결 패턴(Server Actions / Route Handlers / BFF / Direct API) 문서화.
- 실제 백엔드 연결 시 `service.ts` 본문만 교체.

## 데이터 모델

```typescript
// types.ts — Product 타입은 mock-api에서 re-export
export type { Product } from '@/constants/mock-api';

interface Product {
  id: number; name: string; category: string;
  price: number; description: string; image?: string; created_at?: string;
}
```

## API 엔드포인트

GET/POST `/api/products`, GET/PUT/DELETE `/api/products/[id]`
필터: `page`, `limit`, `categories`, `search`, `sort`

## 모듈 특이사항

- **RSC fetch 패턴**: `searchParams` → 서버 `fetch` → props. `prefetchQuery` + `useSuspenseQuery` 대신 이전 패턴 사용. 신규 페이지에는 Users 패턴 권장.
- **카테고리**: `constants/product-options.ts` (`beauty`, `electronics`, `home`, `sports`)
- **이미지 업로드**: 5MB 제한, jpg/jpeg/png/webp
- **쿼리 키**: `list`(단수) 사용 — 기존 코드 우선
