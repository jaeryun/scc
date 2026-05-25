import { envSchema } from './env';

const MAX_PAGES = 200;
const PAGE_LIMIT = 50;

async function fetchPage(
  pathOrUrl: string,
  params: Record<string, string>,
  baseUrl: string,
  apiToken: string
): Promise<{ results: unknown[]; next: string | null }> {
  let url: URL;
  if (pathOrUrl.startsWith('http')) {
    url = new URL(pathOrUrl);
  } else {
    url = new URL(`${baseUrl}${pathOrUrl}`);
  }
  Object.entries({ ...params, limit: String(PAGE_LIMIT) }).forEach(([k, v]) => {
    url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Token ${apiToken}` },
    signal: AbortSignal.timeout(30_000)
  });

  if (!res.ok) {
    throw new Error(`NetBox API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

export async function netboxAll(path: string, params?: Record<string, string>): Promise<unknown[]> {
  const env = envSchema.parse(process.env);
  const results: unknown[] = [];
  let nextPath: string | null = path;

  for (let page = 0; page < MAX_PAGES && nextPath; page++) {
    const pageData = await fetchPage(
      nextPath,
      params ?? {},
      env.NETBOX_BASE_URL,
      env.NETBOX_API_TOKEN
    );
    results.push(...pageData.results);
    nextPath = pageData.next;

    if (pageData.results.length === 0) break;
    if (nextPath) await new Promise((r) => setTimeout(r, 100));
  }

  return results;
}
