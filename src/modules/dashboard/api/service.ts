import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import {
  Dashboard,
  DashboardFolder,
  CreateDashboardPayload,
  UpdateDashboardPayload,
  CreateFolderPayload,
  UpdateFolderPayload
} from './types';

function serializeDashboard(
  raw: Awaited<ReturnType<typeof prisma.dashboard.findUnique>>
): Dashboard | null {
  if (!raw) return null;
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    folderId: raw.folderId,
    schemaVersion: raw.schemaVersion,
    layout: raw.layout as unknown as Dashboard['layout'],
    panels: raw.panels as unknown as Dashboard['panels'],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString()
  };
}

function serializeDashboardListRow(raw: {
  id: string;
  title: string;
  description: string | null;
  folderId: string | null;
  schemaVersion: number;
  layout: Prisma.JsonValue;
  panels: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): Dashboard {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    folderId: raw.folderId,
    schemaVersion: raw.schemaVersion,
    layout: raw.layout as unknown as Dashboard['layout'],
    panels: raw.panels as unknown as Dashboard['panels'],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString()
  };
}

function serializeFolder(
  raw: Awaited<ReturnType<typeof prisma.dashboardFolder.findUnique>>
): DashboardFolder | null {
  if (!raw) return null;
  return {
    id: raw.id,
    title: raw.title,
    parentId: raw.parentId,
    children: [],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString()
  };
}

function serializeFolderWithChildren(raw: {
  id: string;
  title: string;
  parentId: string | null;
  children: {
    id: string;
    title: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}): DashboardFolder {
  return {
    id: raw.id,
    title: raw.title,
    parentId: raw.parentId,
    children: raw.children.map((c) => ({
      id: c.id,
      title: c.title,
      parentId: c.parentId,
      children: [],
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString()
    })),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString()
  };
}

export async function getDashboards(folderId?: string | null): Promise<Dashboard[]> {
  const rows = await prisma.dashboard.findMany({
    where:
      folderId === undefined ? undefined : folderId === null ? { folderId: null } : { folderId },
    orderBy: { createdAt: 'desc' }
  });
  return rows.map(serializeDashboardListRow);
}

export async function getDashboardById(id: string): Promise<Dashboard | null> {
  const row = await prisma.dashboard.findUnique({ where: { id } });
  return serializeDashboard(row);
}

export async function createDashboard(data: CreateDashboardPayload): Promise<Dashboard> {
  const row = await prisma.dashboard.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      folderId: data.folderId ?? null,
      layout: { columns: 12, rowHeight: 80 } as unknown as Prisma.InputJsonValue,
      panels: [] as unknown as Prisma.InputJsonValue
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
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.folderId !== undefined && { folderId: data.folderId }),
      ...(data.layout !== undefined && { layout: data.layout as unknown as Prisma.InputJsonValue }),
      ...(data.panels !== undefined && { panels: data.panels as unknown as Prisma.InputJsonValue })
    }
  });
  return serializeDashboard(row);
}

export async function deleteDashboard(id: string): Promise<Dashboard | null> {
  const row = await prisma.dashboard.delete({ where: { id } });
  return serializeDashboard(row);
}

export async function getFolders(parentId?: string | null): Promise<DashboardFolder[]> {
  const rows = await prisma.dashboardFolder.findMany({
    where:
      parentId === undefined ? undefined : parentId === null ? { parentId: null } : { parentId },
    include: { children: true },
    orderBy: { title: 'asc' }
  });
  return rows.map(serializeFolderWithChildren);
}

export async function getFolderById(id: string): Promise<DashboardFolder | null> {
  const row = await prisma.dashboardFolder.findUnique({
    where: { id },
    include: { children: true }
  });
  return row ? serializeFolderWithChildren(row) : null;
}

export async function getFolderPath(folderId: string): Promise<DashboardFolder[]> {
  const path: DashboardFolder[] = [];
  let current: DashboardFolder | null = await getFolderById(folderId);
  while (current) {
    path.unshift(current);
    if (!current.parentId) break;
    current = await getFolderById(current.parentId);
  }
  return path;
}

export async function createFolder(data: CreateFolderPayload): Promise<DashboardFolder> {
  const row = await prisma.dashboardFolder.create({
    data: {
      title: data.title,
      parentId: data.parentId ?? null
    },
    include: { children: true }
  });
  return serializeFolderWithChildren(row);
}

export async function updateFolder(
  id: string,
  data: UpdateFolderPayload
): Promise<DashboardFolder | null> {
  const row = await prisma.dashboardFolder.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.parentId !== undefined && { parentId: data.parentId })
    },
    include: { children: true }
  });
  return serializeFolderWithChildren(row);
}

export async function deleteFolder(id: string): Promise<DashboardFolder | null> {
  const row = await prisma.dashboardFolder.delete({
    where: { id },
    include: { children: true }
  });
  return serializeFolderWithChildren(row);
}

export async function isFolderTitleTaken(
  title: string,
  parentId: string | null,
  excludeId?: string
): Promise<boolean> {
  const where: Prisma.DashboardFolderWhereInput = {
    title,
    parentId: parentId ?? null
  };
  if (excludeId) where.id = { not: excludeId };
  const existing = await prisma.dashboardFolder.findFirst({ where });
  return existing !== null;
}

export async function isDashboardTitleTaken(
  title: string,
  folderId: string | null,
  excludeId?: string
): Promise<boolean> {
  const where: Prisma.DashboardWhereInput = {
    title,
    folderId: folderId ?? null
  };
  if (excludeId) where.id = { not: excludeId };
  const existing = await prisma.dashboard.findFirst({ where });
  return existing !== null;
}
