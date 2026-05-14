import { prisma } from "@/lib/prisma";
import { IpAddressInput } from "../schemas";

export async function getIpAddresses(subnetId?: string) {
  return prisma.ipAddress.findMany({
    where: subnetId ? { subnetId } : undefined,
    orderBy: { ip: "asc" },
  });
}

export async function createIpAddress(data: IpAddressInput) {
  return prisma.ipAddress.create({ data });
}

export async function updateIpAddress(id: string, data: IpAddressInput) {
  return prisma.ipAddress.update({ where: { id }, data });
}

export async function deleteIpAddress(id: string) {
  return prisma.ipAddress.delete({ where: { id } });
}
