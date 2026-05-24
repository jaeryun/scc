export type IpStatus = 'FREE' | 'ALLOCATED' | 'RESERVED' | 'DISABLED';

export interface Subnet {
  id: string;
  network: string;
  description?: string | null;
  vlanId?: string | null;
  purpose?: string | null;
  centers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IpAddress {
  id: string;
  ip: string;
  status: IpStatus;
  hostname?: string | null;
  description?: string | null;
  subnetId: string;
  createdAt: Date;
  updatedAt: Date;
}
