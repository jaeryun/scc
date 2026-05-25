import { NextRequest, NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { netboxAll } from '@/lib/netbox/auto-paginate';
import { checkCache, fetchAndCache } from '@/lib/netbox/cache';
import { buildCacheKey } from '@/lib/netbox/paths';
import { withRetry } from '@/lib/netbox/retry';

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams) as Record<string, string>;
  const cacheKey = buildCacheKey('interfaces', 'list', params);

  const cached = await checkCache(cacheKey);
  if (cached?.fresh) return NextResponse.json(success(cached.data));

  try {
    const data = await withRetry(() => netboxAll('/api/dcim/interfaces/', params));
    await fetchAndCache(cacheKey, data);
    return NextResponse.json(success(data));
  } catch {
    if (cached?.data) return NextResponse.json(success(cached.data));
    return NextResponse.json(failure('NetBox service temporarily unavailable'), {
      status: 502
    });
  }
}
