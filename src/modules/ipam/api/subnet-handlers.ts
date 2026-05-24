import { prisma } from '@/lib/prisma';
import { SubnetInput } from '../schemas';

export async function getSubnets() {
  return prisma.subnet.findMany({
    include: { _count: { select: { ipAddresses: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getSubnetById(id: string) {
  return prisma.subnet.findUnique({
    where: { id },
    include: { ipAddresses: true }
  });
}

export async function createSubnet(data: SubnetInput) {
  return prisma.subnet.create({ data });
}

export async function updateSubnet(id: string, data: SubnetInput) {
  return prisma.subnet.update({ where: { id }, data });
}

export async function deleteSubnet(id: string) {
  return prisma.subnet.delete({ where: { id } });
}
