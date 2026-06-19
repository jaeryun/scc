import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { success, failure } from '@/lib/api-response';
import { netboxAll } from '@/lib/netbox/auto-paginate';
import { checkCache, fetchAndCache } from '@/lib/netbox/cache';
import { buildCacheKey } from '@/lib/netbox/paths';
import { withRetry } from '@/lib/netbox/retry';

export async function GET(req: NextRequest) {
  const start = Date.now();
  const op = 'searchIpAddresses';
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (!q) {
    logger.warn(
      { op, durationMs: Date.now() - start, url: req.url },
      'Missing search query parameter "q"'
    );
    return NextResponse.json(failure('Missing search query parameter "q"'), {
      status: 400
    });
  }

  const params: Record<string, string> = { q };

  const cacheKey = buildCacheKey('ip-addresses', 'list', params);

  const cached = await checkCache(cacheKey);
  if (cached?.fresh) {
    logger.info(
      { op, q, cached: true, durationMs: Date.now() - start },
      'Searched IP addresses (cache hit)'
    );
    return NextResponse.json(success(cached.data));
  }

  try {
    const data = await withRetry(() => netboxAll('/api/ipam/ip-addresses/', { q }));
    await fetchAndCache(cacheKey, data);
    logger.info(
      { op, q, count: data.length, durationMs: Date.now() - start },
      'Searched IP addresses'
    );
    return NextResponse.json(success(data));
  } catch (err) {
    logger.error(
      { err, op, durationMs: Date.now() - start, url: req.url },
      'Failed to search IP addresses'
    );
    if (cached?.data) return NextResponse.json(success(cached.data));
    return NextResponse.json(failure('NetBox service temporarily unavailable'), {
      status: 502
    });
  }
}
