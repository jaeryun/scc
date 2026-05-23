import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { Dashboard, CreateDashboardPayload, UpdateDashboardPayload } from './types';

function serializeDashboard(
  raw: Awaited<ReturnType<typeof prisma.dashboard.findUnique>>
): Dashboard | null {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    layout: raw.layout as unknown as Dashboard['layout'],
    items: raw.items as unknown as Dashboard['items'],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString()
  };
}

export async function getDashboards(): Promise<Dashboard[]> {
  const rows = await prisma.dashboard.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    layout: row.layout as unknown as Dashboard['layout'],
    items: row.items as unknown as Dashboard['items'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  }));
}

export async function getDashboardById(id: string): Promise<Dashboard | null> {
  const row = await prisma.dashboard.findUnique({ where: { id } });
  return serializeDashboard(row);
}

export async function createDashboard(data: CreateDashboardPayload): Promise<Dashboard> {
  const row = await prisma.dashboard.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      layout: (data.layout ?? { columns: 12, rowHeight: 80 }) as unknown as Prisma.InputJsonValue,
      items: (data.items ?? []) as unknown as Prisma.InputJsonValue
    }
  });
  return serializeDashboard(row)!;
}

export async function updateDashboard(
  id: string,
  data: UpdateDashboardPayload
): Promise<Dashboard | null> {
  const row = await prisma.dashboard.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.layout !== undefined && { layout: data.layout as unknown as Prisma.InputJsonValue }),
      ...(data.items !== undefined && { items: data.items as unknown as Prisma.InputJsonValue })
    }
  });
  return serializeDashboard(row);
}

export async function deleteDashboard(id: string): Promise<Dashboard | null> {
  const row = await prisma.dashboard.delete({ where: { id } });
  return serializeDashboard(row);
}

export async function duplicateDashboard(id: string): Promise<Dashboard> {
  const original = await prisma.dashboard.findUnique({ where: { id } });
  if (!original) throw new Error('Dashboard not found');

  const row = await prisma.dashboard.create({
    data: {
      name: `${original.name} (Copy)`,
      description: original.description,
      layout: original.layout as unknown as Prisma.InputJsonValue,
      items: original.items as unknown as Prisma.InputJsonValue
    }
  });
  return serializeDashboard(row)!;
}
