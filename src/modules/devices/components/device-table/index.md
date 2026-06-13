# device-table/ — 디바이스 테이블 컴포넌트

## 디렉터리 용도

디바이스 목록을 표시하는 TanStack Table 기반 데이터 테이블 컴포넌트.

## 디렉터리 구조

| 디렉토리/파일 | 용도 | 키워드 |
|----------|------|---------|
| `columns.tsx` | TanStack Table 컬럼 정의 (accessorKey, filter, cell 렌더링) | column, TanStack |
| `index.tsx` | `useReactTable` + `DataTable` + `DataTableToolbar` | table, toolbar |

## 포함 금지 항목

- device-table 외의 컴포넌트 → 상위 `devices/components/`에 배치
- 데이터 페칭 로직 → `devices/api/` 또는 `devices/hooks/`에 배치
- 공통 UI 컴포넌트 → `src/components/`에 배치
