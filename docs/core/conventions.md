# Core conventions

> Detailed rules in the `rules/` directory. This file contains only project-level decisions.

## Must follow

- `cn()` for className merging -- string concatenation, template literals forbidden
- Icons only from `@/components/icons` -- use `Icons.name`
- `bun tsc --noEmit` + `bun run build` must pass

## Rule references

| Rule | File |
|------|------|
| React components | `rules/react.md` |
| TypeScript | `rules/typescript.md` |
| Styling | `rules/styling.md` |
| Naming | `rules/naming.md` |
| Data layer | `rules/data-layer.md` |
| Forms | `rules/forms.md` |
| Prisma | `rules/prisma.md` |
| Architecture | `architecture.md` |
| AI behavior | `behavior.md` |
