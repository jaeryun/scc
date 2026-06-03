# Architecture

## Module-based structure

- Shared UI -> `src/components/`
- Domain data + UI -> `src/modules/<name>/`
- -> component-patterns.md

## View system

- Register views in `src/config/views.ts` (id, label, icon, navItems)
- Route groups: `src/app/(main)/<view-id>/page.tsx`
- Current views: `home`, `dcim` (product), `demo` (demo), `settings`, `api-reference`

## Demo vs Product boundary

- Product: `src/modules/<name>/` + Prisma + apiClient + API routes
- Demo: `src/modules/demo/<name>/` + in-memory mock data
- Product code must never import from `@/modules/demo/*`
- Boundary check: `bash scripts/check-demo-imports.sh`

## Component placement

- `src/components/` -> pure UI, no domain types
- `src/modules/<name>/components/` -> depends on domain types
- Detailed criteria: `docs/patterns/component-patterns.md`
