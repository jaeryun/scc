# Naming rules

> Based on actual codebase conventions. All new code must follow these rules.

## Files

- **kebab-case**: `use-nav.ts`, `api-client.ts`, `nav-config.ts`, `app-sidebar.tsx`
- **Exceptions**: `schema.prisma`, `middleware.ts`, `layout.tsx`, `page.tsx`, `route.ts` (Next.js convention files)

## Components

- **PascalCase**: `AppSidebar.tsx`, `SubmitButton.tsx`, `DataTable.tsx`
- Definition: `function ComponentName() {}` (no arrow functions)

## Hooks

- **`use` prefix + camelCase**: `useSubnets`, `useCurrentView`, `useQueryStates`
- File name: `use-<name>.ts` (kebab-case)

## Types/interfaces

- **PascalCase**: `NavItem`, `ViewConfig`, `SubnetDetail`
- Props: `{ComponentName}Props` (e.g. `AppSidebarProps`)

## Utility functions

- **camelCase**: `cn`, `formatBytes`, `getQueryClient`

## Zod schemas

- **camelCase + Schema suffix**: `productSchema`, `subnetSchema`, `ipAddressSchema`

## Directories

- **kebab-case**: `demo-components`, `react-query-demo`, `view-settings`

## API routes

- **kebab-case**: `ip-addresses`, `view-settings`, `products`
- Dynamic segments: `[id]` (bracket notation)
