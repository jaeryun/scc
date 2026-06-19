import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { success, failure } from '@/lib/api-response';
import { netboxAll } from '@/lib/netbox/auto-paginate';
import { checkCache, fetchAndCache } from '@/lib/netbox/cache';
import { buildCacheKey } from '@/lib/netbox/paths';
import { withRetry } from '@/lib/netbox/retry';

export async function GET(req: NextRequest) {
  const start = Date.now();
  const op = 'listSites';
  const params = Object.fromEntries(req.nextUrl.searchParams) as Record<string, string>;
  const cacheKey = buildCacheKey('sites', 'list', params);

  const cached = await checkCache(cacheKey);
  if (cached?.fresh) {
    logger.info({ op, cached: true, durationMs: Date.now() - start }, 'Listed sites (cache hit)');
    return NextResponse.json(success(cached.data));
  }

  try {
    const data = await withRetry(() => netboxAll('/api/dcim/sites/', params));
    await fetchAndCache(cacheKey, data);
    logger.info({ op, count: data.length, durationMs: Date.now() - start }, 'Listed sites');
    return NextResponse.json(success(data));
  } catch (err) {
    logger.error({ err, op, durationMs: Date.now() - start, url: req.url }, 'Failed to list sites');
    if (cached?.data) return NextResponse.json(success(cached.data));
    return NextResponse.json(failure('NetBox service temporarily unavailable'), {
      status: 502
    });
  }
}
