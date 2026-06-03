# rules/ -- SCC-specific coding rules

Industry-standard rules are covered by `vercel-react-best-practices` and `next-best-practices` skills.
This directory contains only **decisions unique to the SCC project**. Each rule is tagged `[required]`/`[recommended]`.

- `react.md`        -- Function declaration components, Props interfaces, 'use client', HydrationBoundary+Suspense
- `typescript.md`   -- any forbidden (+@reason exception), interface-first, env vars
- `styling.md`      -- cn() required, static colors forbidden, CSS variable token mapping
- `naming.md`       -- kebab-case files, PascalCase components, use-prefix hooks
- `data-layer.md`   -- types->service->queries->hooks layer, mutationOptions pattern, query key factory
- `forms.md`        -- useAppForm + useFormFields<T>(), AppField render props
- `prisma.md`       -- migrate dev only, db push forbidden
