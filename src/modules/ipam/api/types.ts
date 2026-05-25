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
