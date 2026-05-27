export interface Prefix {
  id: number;
  prefix: string;
  description: string;
  vlan: string | null;
  site: string | null;
  role: string | null;
}

export interface IpAddress {
  id: number;
  address: string;
  status: string;
  dnsName: string;
  description: string;
  assignedObject: string | null;
}

export interface NetBoxPrefixRaw {
  id: number;
  prefix: string;
  description: string;
  vlan: { name: string } | null;
  site: { name: string } | null;
  role: { name: string } | null;
}

export interface NetBoxIpRaw {
  id: number;
  address: string;
  status: { value: string } | string;
  dns_name: string;
  description: string;
  assigned_object_type: string | null;
  assigned_object_id: number | null;
}
