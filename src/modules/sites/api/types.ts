export interface Site {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface Rack {
  id: number;
  name: string;
  siteId: number;
}

export interface DeviceRole {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
}
