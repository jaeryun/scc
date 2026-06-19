import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { success, failure } from '@/lib/api-response';
import { netboxAll } from '@/lib/netbox/auto-paginate';
import { checkCache, fetchAndCache } from '@/lib/netbox/cache';
import { buildCacheKey } from '@/lib/netbox/paths';
import { withRetry } from '@/lib/netbox/retry';

export async function GET(req: NextRequest) {
  const start = Date.now();
  const op = 'listDeviceRoles';
  const params = Object.fromEntries(req.nextUrl.searchParams) as Record<string, string>;
  const cacheKey = buildCacheKey('device-roles', 'list', params);

  const cached = await checkCache(cacheKey);
  if (cached?.fresh) {
    logger.info(
      { op, cached: true, durationMs: Date.now() - start },
      'Listed device roles (cache hit)'
    );
    return NextResponse.json(success(cached.data));
  }

  try {
    const data = await withRetry(() => netboxAll('/api/dcim/device-roles/', params));
    await fetchAndCache(cacheKey, data);
    logger.info({ op, count: data.length, durationMs: Date.now() - start }, 'Listed device roles');
    return NextResponse.json(success(data));
  } catch (err) {
    logger.error(
      { err, op, durationMs: Date.now() - start, url: req.url },
      'Failed to list device roles'
    );
    if (cached?.data) return NextResponse.json(success(cached.data));
    return NextResponse.json(failure('NetBox service temporarily unavailable'), {
      status: 502
    });
  }
}
