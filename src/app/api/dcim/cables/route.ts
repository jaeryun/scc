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

const cableCreateSchema = z
  .object({
    type: z.string().optional(),
    termination_a_type: z.string().min(1),
    termination_a_id: z.number(),
    termination_b_type: z.string().min(1),
    termination_b_id: z.number(),
    status: z.string().optional(),
    label: z.string().optional(),
    description: z.string().optional()
  })
  .strip();

export async function GET(req: NextRequest) {
  const start = Date.now();
  const op = 'listCables';
  const params = Object.fromEntries(req.nextUrl.searchParams) as Record<string, string>;
  const cacheKey = buildCacheKey('cables', 'list', params);

  const cached = await checkCache(cacheKey);
  if (cached?.fresh) {
    logger.info({ op, cached: true, durationMs: Date.now() - start }, 'Listed cables (cache hit)');
    return NextResponse.json(success(cached.data));
  }

  try {
    const data = await withRetry(() => netboxAll('/api/dcim/cables/', params));
    await fetchAndCache(cacheKey, data);
    logger.info({ op, count: data.length, durationMs: Date.now() - start }, 'Listed cables');
    return NextResponse.json(success(data));
  } catch (err) {
    logger.error(
      { err, op, durationMs: Date.now() - start, url: req.url },
      'Failed to list cables'
    );
    if (cached?.data) return NextResponse.json(success(cached.data));
    return NextResponse.json(failure('NetBox service temporarily unavailable'), {
      status: 502
    });
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const op = 'createCable';
  try {
    const body = cableCreateSchema.parse(await req.json());
    const { baseUrl, headers } = netboxClient();

    const res = await fetch(`${baseUrl}/api/dcim/cables/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const resBody = await res.json().catch(() => null);

    if (!res.ok) {
      throw new NetBoxHttpError(res.status, resBody);
    }

    await invalidateCache('netbox:cables:');
    await invalidateCache('netbox:interfaces:');

    logger.info({ op, durationMs: Date.now() - start }, 'Created cable');
    return NextResponse.json(success(resBody), { status: 201 });
  } catch (error) {
    logger.error(
      { err: error, op, durationMs: Date.now() - start, url: req.url },
      'Failed to create cable'
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
    return NextResponse.json(failure('Failed to create cable'), { status: 500 });
  }
}
