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

export async function assignIpFromSubnet(subnetId: string, hostname?: string, description?: string) {
  const subnet = await prisma.subnet.findUnique({ where: { id: subnetId } });
  if (!subnet) throw new Error("Subnet not found");

  const freeIp = await prisma.ipAddress.findFirst({
    where: { subnetId, status: "FREE" },
    orderBy: { ip: "asc" },
  });

  if (freeIp) {
    return prisma.ipAddress.update({
      where: { id: freeIp.id },
      data: {
        status: "ALLOCATED",
        hostname: hostname ?? freeIp.hostname,
        description: description ?? freeIp.description,
      },
    });
  }

  const ips = await prisma.ipAddress.findMany({
    where: { subnetId },
    select: { ip: true },
    orderBy: { ip: "asc" },
  });

  const cidr = subnet.network;
  const [base, prefixLen] = cidr.split("/");
  const prefix = parseInt(prefixLen);
  const baseParts = base.split(".").map(Number);
  const totalHosts = Math.pow(2, 32 - prefix) - 2;
  const usedIps = new Set(ips.map((i) => i.ip));

  const baseInt =
    ((baseParts[0] << 24) >>> 0) +
    ((baseParts[1] << 16) >>> 0) +
    ((baseParts[2] << 8) >>> 0) +
    baseParts[3];

  for (let i = 1; i <= totalHosts && i <= 254; i++) {
    const ipInt = baseInt + i;
    const ip = `${(ipInt >>> 24) & 0xff}.${(ipInt >>> 16) & 0xff}.${(ipInt >>> 8) & 0xff}.${ipInt & 0xff}`;
    if (!usedIps.has(ip)) {
      return prisma.ipAddress.create({
        data: {
          ip,
          status: "ALLOCATED",
          hostname: hostname ?? null,
          description: description ?? null,
          subnetId,
        },
      });
    }
  }

  throw new Error("서브넷에 사용 가능한 IP가 없습니다");
}

export async function searchIpByHostname(hostname: string) {
  return prisma.ipAddress.findMany({
    where: { hostname: { contains: hostname }, status: "ALLOCATED" },
    include: { subnet: true },
    orderBy: { ip: "asc" },
  });
}

export async function releaseIp(id: string) {
  return prisma.ipAddress.update({
    where: { id },
    data: { status: "FREE", hostname: null, description: null },
  });
}
