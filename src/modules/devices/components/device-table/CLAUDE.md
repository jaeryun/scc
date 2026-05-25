# Devices 모듈

## 페이지 래퍼 규칙

반드시 `PageContainer` (`src/components/layout/page-container.tsx`) 로 페이지를 감싼다.

**이유**: `PageContainer` 는 `flex flex-1 flex-col` 을 제공한다. `DataTable` 컴포넌트는 이 flex 체인에 의존한다. 일반 `<div>` 로 감싸면 테이블 본문이 렌더링되지 않는다.

```tsx
// ✅ 올바른 패턴
import PageContainer from '@/components/layout/page-container';

export default function DevicesPage() {
  return (
    <PageContainer pageTitle="Devices">
      <DeviceTable />
    </PageContainer>
  );
}

// ❌ 틀린 패턴 — DataTable 렌더링 실패
export default function DevicesPage() {
  return (
    <div className="p-6">
      <DeviceTable />
    </div>
  );
}
```

## 컴포넌트 구조

- `columns.tsx` — TanStack Table 컬럼 정의 (accessorKey, filter, cell 렌더링)
- `index.tsx` — `useReactTable` + `DataTable` + `DataTableToolbar`
