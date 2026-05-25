import { prisma } from '@/lib/prisma';

const inFlight = new Map<string, Promise<unknown>>();

export async function checkCache<T>(url: string): Promise<{ data: T; fresh: boolean } | null> {
  const cached = await prisma.netBoxCache.findUnique({ where: { url } });
  if (!cached) return null;

  if (cached.expiresAt > new Date()) {
    await prisma.netBoxCache.update({
      where: { url },
      data: { hitCount: { increment: 1 } }
    });
    return { data: cached.data as T, fresh: true };
  }

  if (cached.staleUntil > new Date()) {
    return { data: cached.data as T, fresh: false };
  }

  return null;
}

export async function fetchAndCache(url: string, data: unknown): Promise<void> {
  const now = new Date();
  const ttl = parseInt(process.env.NETBOX_CACHE_TTL_SECONDS ?? '300', 10);
  await prisma.netBoxCache.upsert({
    where: { url },
    update: {
      data: data as any,
      expiresAt: new Date(now.getTime() + ttl * 1000),
      staleUntil: new Date(now.getTime() + 86400 * 1000)
    },
    create: {
      url,
      data: data as any,
      expiresAt: new Date(now.getTime() + ttl * 1000),
      staleUntil: new Date(now.getTime() + 86400 * 1000)
    }
  });
}

export async function invalidateCache(prefix: string): Promise<void> {
  await prisma.netBoxCache.deleteMany({
    where: { url: { startsWith: prefix } }
  });
}

export async function cachedFetch(url: string, fetcher: () => Promise<unknown>): Promise<unknown> {
  if (inFlight.has(url)) return inFlight.get(url)!;
  const promise = fetcher().finally(() => inFlight.delete(url));
  inFlight.set(url, promise);
  return promise;
}
