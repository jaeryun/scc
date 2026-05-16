import { Subnet, IpAddress } from "../types";

// ─── API Response Types ───

export type SubnetListResponse = Array<
  Subnet & { _count?: { ipAddresses: number } }
>;

export type SubnetDetailResponse = Subnet & {
  ipAddresses: IpAddress[];
};

export type IpAddressListResponse = IpAddress[];

// ─── Filter Types ───

export interface IpAddressFilters {
  subnetId?: string;
}

// ─── Mutation Payload Types ───

export interface CreateSubnetPayload {
  network: string;
  description?: string | null;
  vlanId?: string | null;
}

export interface UpdateSubnetPayload extends CreateSubnetPayload {
  id: string;
}

export interface CreateIpAddressPayload {
  ip: string;
  status: "FREE" | "ALLOCATED" | "RESERVED" | "DISABLED";
  hostname?: string | null;
  description?: string | null;
  subnetId: string;
}

export interface UpdateIpAddressPayload extends CreateIpAddressPayload {
  id: string;
}
