const NETBOX_URL = process.env.NETBOX_URL ?? 'http://localhost:8000'
const NETBOX_TOKEN = process.env.NETBOX_TOKEN ?? ''

export async function netboxGet<T>(path: string): Promise<T> {
  const url = `${NETBOX_URL}/api${path}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${NETBOX_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json; indent=4',
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NetBox API ${res.status}: ${text.slice(0, 500)}`)
  }
  return res.json()
}

export function netboxUrl(): string {
  return NETBOX_URL
}
