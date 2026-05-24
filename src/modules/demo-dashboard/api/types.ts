export interface GridPos {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Panel {
  id: string;
  type: string;
  title: string;
  gridPos: GridPos;
  options: Record<string, unknown>;
}

export interface PanelType {
  type: string;
  label: string;
  description: string;
  icon: string;
  defaultGridPos: {
    w: number;
    h: number;
  };
  defaultOptions: Record<string, unknown>;
}

export interface DemoDashboardFolder {
  id: string;
  title: string;
  parentId: string | null;
  children: DemoDashboardFolder[];
  createdAt: string;
  updatedAt: string;
}

export interface DemoDashboard {
  id: string;
  title: string;
  description: string | null;
  folderId: string | null;
  schemaVersion: number;
  layout: {
    columns: number;
    rowHeight: number;
  };
  panels: Panel[];
  createdAt: string;
  updatedAt: string;
}

export type CreateDemoDashboardPayload = {
  title: string;
  description?: string;
  folderId?: string | null;
};

export type UpdateDemoDashboardPayload = {
  title?: string;
  description?: string;
  folderId?: string | null;
  layout?: {
    columns: number;
    rowHeight: number;
  };
  panels?: Panel[];
};

export type CreateFolderPayload = {
  title: string;
  parentId?: string | null;
};

export type UpdateFolderPayload = {
  title?: string;
  parentId?: string | null;
};
