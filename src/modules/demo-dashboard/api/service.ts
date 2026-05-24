import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import {
  DemoDashboard,
  DemoDashboardFolder,
  CreateDemoDashboardPayload,
  UpdateDemoDashboardPayload,
  CreateFolderPayload,
  UpdateFolderPayload
} from './types';

function serializeDemoDashboard(
  raw: Awaited<ReturnType<typeof prisma.demoDashboard.findUnique>>
): DemoDashboard | null {
  if (!raw) return null;
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    folderId: raw.folderId,
    schemaVersion: raw.schemaVersion,
    layout: raw.layout as unknown as DemoDashboard['layout'],
    panels: raw.panels as unknown as DemoDashboard['panels'],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString()
  };
}

function serializeDemoDashboardListRow(raw: {
  id: string;
  title: string;
  description: string | null;
  folderId: string | null;
  schemaVersion: number;
  layout: Prisma.JsonValue;
  panels: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): DemoDashboard {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    folderId: raw.folderId,
    schemaVersion: raw.schemaVersion,
    layout: raw.layout as unknown as DemoDashboard['layout'],
    panels: raw.panels as unknown as DemoDashboard['panels'],
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString()
  };
}

function serializeFolder(
  raw: Awaited<ReturnType<typeof prisma.demoDashboardFolder.findUnique>>
): DemoDashboardFolder | null {
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
}): DemoDashboardFolder {
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

export async function getDemoDashboards(folderId?: string | null): Promise<DemoDashboard[]> {
  const rows = await prisma.demoDashboard.findMany({
    where:
      folderId === undefined ? undefined : folderId === null ? { folderId: null } : { folderId },
    orderBy: { createdAt: 'desc' }
  });
  return rows.map(serializeDemoDashboardListRow);
}

export async function getDemoDashboardById(id: string): Promise<DemoDashboard | null> {
  const row = await prisma.demoDashboard.findUnique({ where: { id } });
  return serializeDemoDashboard(row);
}

export async function createDemoDashboard(
  data: CreateDemoDashboardPayload
): Promise<DemoDashboard> {
  const row = await prisma.demoDashboard.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      folderId: data.folderId ?? null,
      layout: { columns: 12, rowHeight: 80 } as unknown as Prisma.InputJsonValue,
      panels: [] as unknown as Prisma.InputJsonValue
    }
  });
  return serializeDemoDashboard(row)!;
}

export async function updateDemoDashboard(
  id: string,
  data: UpdateDemoDashboardPayload
): Promise<DemoDashboard | null> {
  const row = await prisma.demoDashboard.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.folderId !== undefined && { folderId: data.folderId }),
      ...(data.layout !== undefined && { layout: data.layout as unknown as Prisma.InputJsonValue }),
      ...(data.panels !== undefined && { panels: data.panels as unknown as Prisma.InputJsonValue })
    }
  });
  return serializeDemoDashboard(row);
}

export async function deleteDemoDashboard(id: string): Promise<DemoDashboard | null> {
  const row = await prisma.demoDashboard.delete({ where: { id } });
  return serializeDemoDashboard(row);
}

export async function getFolders(parentId?: string | null): Promise<DemoDashboardFolder[]> {
  const rows = await prisma.demoDashboardFolder.findMany({
    where:
      parentId === undefined ? undefined : parentId === null ? { parentId: null } : { parentId },
    include: { children: true },
    orderBy: { title: 'asc' }
  });
  return rows.map(serializeFolderWithChildren);
}

export async function getFolderById(id: string): Promise<DemoDashboardFolder | null> {
  const row = await prisma.demoDashboardFolder.findUnique({
    where: { id },
    include: { children: true }
  });
  return row ? serializeFolderWithChildren(row) : null;
}

export async function getFolderPath(folderId: string): Promise<DemoDashboardFolder[]> {
  const path: DemoDashboardFolder[] = [];
  let current: DemoDashboardFolder | null = await getFolderById(folderId);
  while (current) {
    path.unshift(current);
    if (!current.parentId) break;
    current = await getFolderById(current.parentId);
  }
  return path;
}

export async function createFolder(data: CreateFolderPayload): Promise<DemoDashboardFolder> {
  const row = await prisma.demoDashboardFolder.create({
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
): Promise<DemoDashboardFolder | null> {
  const row = await prisma.demoDashboardFolder.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.parentId !== undefined && { parentId: data.parentId })
    },
    include: { children: true }
  });
  return serializeFolderWithChildren(row);
}

export async function deleteFolder(id: string): Promise<DemoDashboardFolder | null> {
  const row = await prisma.demoDashboardFolder.delete({
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
  const where: Prisma.DemoDashboardFolderWhereInput = {
    title,
    parentId: parentId ?? null
  };
  if (excludeId) where.id = { not: excludeId };
  const existing = await prisma.demoDashboardFolder.findFirst({ where });
  return existing !== null;
}

export async function isDashboardTitleTaken(
  title: string,
  folderId: string | null,
  excludeId?: string
): Promise<boolean> {
  const where: Prisma.DemoDashboardWhereInput = {
    title,
    folderId: folderId ?? null
  };
  if (excludeId) where.id = { not: excludeId };
  const existing = await prisma.demoDashboard.findFirst({ where });
  return existing !== null;
}
