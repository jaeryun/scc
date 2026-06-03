# TypeScript rules

## `any` forbidden (required)

- Use `unknown` + type guard instead
- Third-party generic constraints, TanStack Form + Zod mismatches: allow with `// @reason` comment

## Object types (recommended)

- `interface` first for object definitions (merge/extend friendly)
- `type` for unions and mapped types

## Environment variables (required)

- Only `NEXT_PUBLIC_` prefix for client-accessible variables
- Never expose secrets via `NEXT_PUBLIC_`

## Form types (required)

- Always `z.infer<typeof schema>` for form value types -- never type manually
