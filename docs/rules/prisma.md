# Prisma rules

## `prisma db push` absolutely forbidden

- `prisma db push` destroys all existing data and corrupts migration history
- `--accept-data-loss` flag means data loss -- do not use anywhere (dev/staging/production)
- Always use `prisma migrate dev` or `prisma migrate deploy` instead

## Allowed commands

| Command | Purpose |
| ------- | ------- |
| `prisma migrate dev --name YYMMDD_description` | Create + apply migration on schema change |
| `prisma migrate deploy` | Apply all pending migrations (new env/DB migration) |
| `prisma generate` | Regenerate Prisma Client |
| `prisma migrate status` | Check migration application status |
| `prisma migrate diff` | Detect drift between schema and migrations |

## Migration naming

- Format: `YYMMDD_what-was-done`
- Example: `270524_add_batch_move_api`, `270523_add_folder_and_remove_tags`

> For practical workflows and Shadow DB setup, see `prisma/CLAUDE.md`.
