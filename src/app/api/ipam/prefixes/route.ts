import { NextRequest, NextResponse } from 'next/server';
import { success, failure } from '@/lib/api-response';
import { netboxAll } from '@/lib/netbox/auto-paginate';
import { checkCache, fetchAndCache, invalidateCache } from '@/lib/netbox/cache';
import { buildCacheKey } from '@/lib/netbox/paths';
import { withRetry } from '@/lib/netbox/retry';
import { envSchema } from '@/lib/netbox/env';
import { NetBoxHttpError } from '@/lib/netbox/errors';

function netboxClient() {
  const env = envSchema.parse(process.env);
  return {
    baseUrl: env.NETBOX_BASE_URL,
    token: env.NETBOX_API_TOKEN,
    headers: {
      Authorization: `Token ${env.NETBOX_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
}

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams) as Record<string, string>;
  const cacheKey = buildCacheKey('prefixes', 'list', params);

  const cached = await checkCache(cacheKey);
  if (cached?.fresh) return NextResponse.json(success(cached.data));

  try {
    const data = await withRetry(() => netboxAll('/api/ipam/prefixes/', params));
    await fetchAndCache(cacheKey, data);
    return NextResponse.json(success(data));
  } catch {
    if (cached?.data) return NextResponse.json(success(cached.data));
    return NextResponse.json(failure('NetBox service temporarily unavailable'), {
      status: 502
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { baseUrl, headers } = netboxClient();

    const res = await fetch(`${baseUrl}/api/ipam/prefixes/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const resBody = await res.json().catch(() => null);

    if (!res.ok) {
      throw new NetBoxHttpError(res.status, resBody);
    }

    await invalidateCache('netbox:prefixes:');

    return NextResponse.json(success(resBody), { status: 201 });
  } catch (error) {
    if (error instanceof NetBoxHttpError) {
      return NextResponse.json(failure(error.sanitizedMessage), {
        status: error.status
      });
    }
    return NextResponse.json(failure('Failed to create prefix'), { status: 500 });
  }
}
