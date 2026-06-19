import { logger } from '@/lib/logger';

export function GET() {
  const start = Date.now();
  const op = 'metrics';
  try {
    logger.debug({ op, durationMs: Date.now() - start }, 'Served metrics endpoint');
    return new Response('', { status: 200 });
  } catch (err) {
    logger.error({ err, op, durationMs: Date.now() - start }, 'Failed to serve metrics endpoint');
    return new Response('', { status: 500 });
  }
}
