import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import {
  GridDashboard,
  GridDashboardFolder,
  CreateGridDashboardPayload,
  UpdateGridDashboardPayload,
  CreateFolderPayload,
  UpdateFolderPayload
} from './types';

function serializeGridDashboard(
  raw: Awaited<ReturnType<typeof prisma.gridDashboard.findUnique>>
): GridDashboard | null {
  if (!raw) return null;
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    folderId: raw.folderId,
    schemaVersion: raw.schemaVersion,
    layout: raw.layout as unknown as GridDashboard['layout'],
    panels: raw.panels as unknown as GridDashboard['panels'],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString()
  };
}

function serializeGridDashboardListRow(raw: {
  id: string;
  title: string;
  description: string | null;
  folderId: string | null;
  schemaVersion: number;
  layout: Prisma.JsonValue;
  panels: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): GridDashboard {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    folderId: raw.folderId,
    schemaVersion: raw.schemaVersion,
    layout: raw.layout as unknown as GridDashboard['layout'],
    panels: raw.panels as unknown as GridDashboard['panels'],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString()
  };
}

function serializeFolder(
  raw: Awaited<ReturnType<typeof prisma.gridDashboardFolder.findUnique>>
): GridDashboardFolder | null {
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
}): GridDashboardFolder {
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

export async function getGridDashboards(folderId?: string | null): Promise<GridDashboard[]> {
  const rows = await prisma.gridDashboard.findMany({
    where:
      folderId === undefined ? undefined : folderId === null ? { folderId: null } : { folderId },
    orderBy: { createdAt: 'desc' }
  });
  return rows.map(serializeGridDashboardListRow);
}

export async function getGridDashboardById(id: string): Promise<GridDashboard | null> {
  const row = await prisma.gridDashboard.findUnique({ where: { id } });
  return serializeGridDashboard(row);
}

export async function createGridDashboard(
  data: CreateGridDashboardPayload
): Promise<GridDashboard> {
  const row = await prisma.gridDashboard.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      folderId: data.folderId ?? null,
      layout: { columns: 12, rowHeight: 80 } as unknown as Prisma.InputJsonValue,
      panels: [] as unknown as Prisma.InputJsonValue
    }
  });
  return serializeGridDashboard(row)!;
}

export async function updateGridDashboard(
  id: string,
  data: UpdateGridDashboardPayload
): Promise<GridDashboard | null> {
  const row = await prisma.gridDashboard.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.folderId !== undefined && { folderId: data.folderId }),
      ...(data.layout !== undefined && { layout: data.layout as unknown as Prisma.InputJsonValue }),
      ...(data.panels !== undefined && { panels: data.panels as unknown as Prisma.InputJsonValue })
    }
  });
  return serializeGridDashboard(row);
}

export async function deleteGridDashboard(id: string): Promise<GridDashboard | null> {
  const row = await prisma.gridDashboard.delete({ where: { id } });
  return serializeGridDashboard(row);
}

export async function getFolders(parentId?: string | null): Promise<GridDashboardFolder[]> {
  const rows = await prisma.gridDashboardFolder.findMany({
    where:
      parentId === undefined ? undefined : parentId === null ? { parentId: null } : { parentId },
    include: { children: true },
    orderBy: { title: 'asc' }
  });
  return rows.map(serializeFolderWithChildren);
}

export async function getFolderById(id: string): Promise<GridDashboardFolder | null> {
  const row = await prisma.gridDashboardFolder.findUnique({
    where: { id },
    include: { children: true }
  });
  return row ? serializeFolderWithChildren(row) : null;
}

export async function getFolderPath(folderId: string): Promise<GridDashboardFolder[]> {
  const path: GridDashboardFolder[] = [];
  let current: GridDashboardFolder | null = await getFolderById(folderId);
  while (current) {
    path.unshift(current);
    if (!current.parentId) break;
    current = await getFolderById(current.parentId);
  }
  return path;
}

export async function createFolder(data: CreateFolderPayload): Promise<GridDashboardFolder> {
  const row = await prisma.gridDashboardFolder.create({
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
): Promise<GridDashboardFolder | null> {
  const row = await prisma.gridDashboardFolder.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.parentId !== undefined && { parentId: data.parentId })
    },
    include: { children: true }
  });
  return serializeFolderWithChildren(row);
}

export async function deleteFolder(id: string): Promise<GridDashboardFolder | null> {
  const row = await prisma.gridDashboardFolder.delete({
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
  const where: Prisma.GridDashboardFolderWhereInput = {
    title,
    parentId: parentId ?? null
  };
  if (excludeId) where.id = { not: excludeId };
  const existing = await prisma.gridDashboardFolder.findFirst({ where });
  return existing !== null;
}

export async function isDashboardTitleTaken(
  title: string,
  folderId: string | null,
  excludeId?: string
): Promise<boolean> {
  const where: Prisma.GridDashboardWhereInput = {
    title,
    folderId: folderId ?? null
  };
  if (excludeId) where.id = { not: excludeId };
  const existing = await prisma.gridDashboard.findFirst({ where });
  return existing !== null;
}
