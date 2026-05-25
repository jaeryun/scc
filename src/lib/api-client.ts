export async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  const baseUrl =
    typeof window === 'undefined'
      ? (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
      : '';
  const absoluteUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const res = await fetch(absoluteUrl, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'API error');
  }
  return json.data;
}
