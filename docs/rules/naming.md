# 명명 규칙

> 실제 코드베이스 관행 기준. 모든 신규 코드는 이 규칙을 따른다.

## 파일명
- **kebab-case**: `use-nav.ts`, `api-client.ts`, `nav-config.ts`, `app-sidebar.tsx`
- **예외**: `schema.prisma`, `middleware.ts`, `layout.tsx`, `page.tsx`, `route.ts` 등 Next.js 규약 파일

## 컴포넌트
- **PascalCase**: `AppSidebar.tsx`, `SubmitButton.tsx`, `DataTable.tsx`
- 정의: `function ComponentName() {}` (화살표 함수 금지)

## 훅
- **`use` 접두사 + camelCase**: `useSubnets`, `useCurrentView`, `useQueryStates`
- 파일명: `use-<name>.ts` (kebab-case)

## 타입/인터페이스
- **PascalCase**: `NavItem`, `ViewConfig`, `SubnetDetail`
- Props: `{ComponentName}Props` (예: `AppSidebarProps`)

## 유틸 함수
- **camelCase**: `cn`, `formatBytes`, `getQueryClient`

## Zod 스키마
- **camelCase + Schema 접미사**: `productSchema`, `subnetSchema`, `ipAddressSchema`

## 디렉토리
- **kebab-case**: `demo-components`, `react-query-demo`, `view-settings`

## API 라우트
- **kebab-case**: `ip-addresses`, `view-settings`, `products`
- 동적 세그먼트: `[id]` (대괄호)
