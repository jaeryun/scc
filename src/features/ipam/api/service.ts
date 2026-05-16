import { apiClient } from "@/lib/api-client";
import { IpAddress } from "../types";
import {
  SubnetListResponse,
  SubnetDetailResponse,
  IpAddressListResponse,
  CreateSubnetPayload,
  UpdateSubnetPayload,
  CreateIpAddressPayload,
  UpdateIpAddressPayload,
  IpAddressFilters,
} from "./types";

// ─── Subnets ───

export async function getSubnets(): Promise<SubnetListResponse> {
  return apiClient("/api/ipam/subnets");
}

export async function getSubnetById(
  id: string
): Promise<SubnetDetailResponse> {
  return apiClient(`/api/ipam/subnets/${id}`);
}

export async function createSubnet(
  data: CreateSubnetPayload
): Promise<SubnetDetailResponse> {
  return apiClient("/api/ipam/subnets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSubnet(
  data: UpdateSubnetPayload
): Promise<SubnetDetailResponse> {
  const { id, ...rest } = data;
  return apiClient(`/api/ipam/subnets/${id}`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });
}

export async function deleteSubnet(id: string): Promise<null> {
  return apiClient(`/api/ipam/subnets/${id}`, { method: "DELETE" });
}

// ─── IP Addresses ───

export async function getIpAddresses(
  filters: IpAddressFilters = {}
): Promise<IpAddressListResponse> {
  const url = filters.subnetId
    ? `/api/ipam/ip-addresses?subnetId=${encodeURIComponent(filters.subnetId)}`
    : "/api/ipam/ip-addresses";
  return apiClient(url);
}

export async function createIpAddress(
  data: CreateIpAddressPayload
): Promise<IpAddress> {
  return apiClient("/api/ipam/ip-addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateIpAddress(
  data: UpdateIpAddressPayload
): Promise<IpAddress> {
  const { id, ...rest } = data;
  return apiClient(`/api/ipam/ip-addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });
}

export async function deleteIpAddress(id: string): Promise<null> {
  return apiClient(`/api/ipam/ip-addresses/${id}`, { method: "DELETE" });
}
