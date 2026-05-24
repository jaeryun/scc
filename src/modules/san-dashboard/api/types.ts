export interface DashboardItem {
  id: string;
  type: 'switch-table' | 'switch-summary' | 'server-card' | 'text';
  targetId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: Record<string, unknown>;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  layout: DashboardLayout;
  items: DashboardItem[];
  createdAt: string;
  updatedAt: string;
}

export type CreateDashboardPayload = {
  name: string;
  description?: string;
  layout?: DashboardLayout;
  items?: DashboardItem[];
};

export type UpdateDashboardPayload = {
  name?: string;
  description?: string;
  layout?: DashboardLayout;
  items?: DashboardItem[];
};
