import { defineConfig, env } from 'prisma/config';
import dotenv from 'dotenv';
import path from 'node:path';

// Prisma 7 does not auto-load .env files when using config-based setup.
// Bun auto-loads .env files, but for Node.js compatibility we load explicitly.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  schema: path.resolve(process.cwd(), 'prisma', 'models'),
  datasource: {
    url: env('DATABASE_URL'),
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL')
  },
  migrations: {
    seed: 'bun prisma/seeds/index.ts'
  }
});
