# Demo / Product Boundary

## Rule

**Product code must not import from demo modules.**

Product code = `src/modules/<name>/` where `<name>` is NOT `demo/`
Product pages = `src/app/(main)/dcim/**`, `src/app/(main)/settings/**`, `src/app/(main)/home/**`

## Enforcement

`scripts/check-demo-imports.sh` runs in CI:

```bash
#!/usr/bin/env bash
# Product modules must not import from @/modules/demo/
grep -rn "from ['\"]@/modules/demo/" src/modules/ \
   --include='*.ts' --include='*.tsx' \
   | grep -v "src/modules/demo/" && exit 1

# Product modules must not import from @/constants/mock-api
grep -rn "from ['\"]@/constants/mock-api" src/modules/ \
   --include='*.ts' --include='*.tsx' \
   | grep -v "src/modules/demo/" && exit 1
```

## What IS Allowed

- `src/app/(main)/layout.tsx` → `@/modules/demo/...` (global layout serves all views, including demo)
- `src/components/` — shared UI, no domain types
- `src/hooks/` — generic hooks only
- `src/lib/` — utilities

## Graduating a Demo Module to Production

1. Copy the module: `cp -r src/modules/demo/<name> src/modules/<name>`
2. Replace `service.ts`: mock-api imports → `apiClient` + Prisma
3. Add API routes: `src/app/api/<name>/route.ts`
4. Move page from demo route to product route
5. Delete the original from `src/modules/demo/<name>/`
