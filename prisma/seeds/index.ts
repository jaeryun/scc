import { logger } from '../../src/lib/logger';

async function main() {
  const start = Date.now();
  logger.info({ op: 'seedRun', durationMs: Date.now() - start }, 'Seed: no-op (placeholder)');
}

main().catch((e) => {
  logger.error({ err: e, op: 'seedRun' }, 'Seed failed');
  process.exit(1);
});
