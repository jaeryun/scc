import { z } from "zod";

export const subnetSchema = z.object({
  id: z.string().optional(),
  network: z.string().min(1, "네트워크 주소는 필수입니다"),
  description: z.string().optional(),
  vlanId: z.string().optional(),
});

export const ipAddressSchema = z.object({
  id: z.string().optional(),
  ip: z.string().min(1, "IP 주소는 필수입니다"),
  status: z.enum(["FREE", "ALLOCATED", "RESERVED", "DISABLED"]).default("FREE"),
  hostname: z.string().optional(),
  description: z.string().optional(),
  subnetId: z.string().min(1, "서브넷 ID는 필수입니다"),
});

export type SubnetInput = z.infer<typeof subnetSchema>;
export type IpAddressInput = z.infer<typeof ipAddressSchema>;
