export const NETBOX_PATHS = {
  devices: '/api/dcim/devices/',
  interfaces: '/api/dcim/interfaces/',
  cables: '/api/dcim/cables/',
  prefixes: '/api/ipam/prefixes/',
  'ip-addresses': '/api/ipam/ip-addresses/',
  sites: '/api/dcim/sites/',
  racks: '/api/dcim/racks/',
  'device-roles': '/api/dcim/device-roles/',
  platforms: '/api/dcim/platforms/'
} as const;

export type NetBoxEntity = keyof typeof NETBOX_PATHS;

export function buildCacheKey(
  entity: string,
  type: 'list' | 'detail',
  params?: Record<string, string>
): string {
  const base = `netbox:${entity}:${type}`;
  if (!params) return base;

  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return `${base}:${sorted}`;
}
