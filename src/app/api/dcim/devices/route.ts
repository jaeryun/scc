import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { success, failure } from '@/lib/api-response';
import { netboxAll } from '@/lib/netbox/auto-paginate';
import { checkCache, fetchAndCache, invalidateCache } from '@/lib/netbox/cache';
import { buildCacheKey } from '@/lib/netbox/paths';
import { withRetry } from '@/lib/netbox/retry';
import { envSchema } from '@/lib/netbox/env';
import { NetBoxHttpError } from '@/lib/netbox/errors';
import { z, ZodError } from 'zod';

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

const deviceCreateSchema = z
  .object({
    name: z.string().min(1),
    device_type: z.number(),
    role: z.number(),
    site: z.number(),
    status: z.string().optional()
  })
  .strip();

export async function GET(req: NextRequest) {
  const start = Date.now();
  const op = 'listDevices';
  const params = Object.fromEntries(req.nextUrl.searchParams) as Record<string, string>;
  const cacheKey = buildCacheKey('devices', 'list', params);

  const cached = await checkCache(cacheKey);
  if (cached?.fresh) {
    logger.info({ op, cached: true, durationMs: Date.now() - start }, 'Listed devices (cache hit)');
    return NextResponse.json(success(cached.data));
  }

  try {
    const data = await withRetry(() => netboxAll('/api/dcim/devices/', params));
    await fetchAndCache(cacheKey, data);
    logger.info({ op, count: data.length, durationMs: Date.now() - start }, 'Listed devices');
    return NextResponse.json(success(data));
  } catch (err) {
    logger.error(
      { err, op, durationMs: Date.now() - start, url: req.url },
      'Failed to list devices'
    );
    if (cached?.data) return NextResponse.json(success(cached.data));
    return NextResponse.json(failure('NetBox service temporarily unavailable'), {
      status: 502
    });
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const op = 'createDevice';
  try {
    const body = deviceCreateSchema.parse(await req.json());
    const { baseUrl, headers } = netboxClient();

    const res = await fetch(`${baseUrl}/api/dcim/devices/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const resBody = await res.json().catch(() => null);

    if (!res.ok) {
      throw new NetBoxHttpError(res.status, resBody);
    }

    await invalidateCache('netbox:devices:');
    await invalidateCache('netbox:interfaces:');
    await invalidateCache('netbox:cables:');

    logger.info({ op, durationMs: Date.now() - start }, 'Created device');
    return NextResponse.json(success(resBody), { status: 201 });
  } catch (error) {
    logger.error(
      { err: error, op, durationMs: Date.now() - start, url: req.url },
      'Failed to create device'
    );
    if (error instanceof ZodError) {
      return NextResponse.json(
        failure(error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')),
        { status: 400 }
      );
    }
    if (error instanceof NetBoxHttpError) {
      return NextResponse.json(failure(error.sanitizedMessage), {
        status: error.status
      });
    }
    return NextResponse.json(failure('Failed to create device'), { status: 500 });
  }
}
