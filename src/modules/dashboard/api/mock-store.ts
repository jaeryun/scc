import type {
  Dashboard,
  DashboardFolder,
  CreateDashboardPayload,
  UpdateDashboardPayload,
  CreateFolderPayload,
  UpdateFolderPayload
} from './types';

let dashboards: Dashboard[] = [];
let folders: DashboardFolder[] = [];
let idCounter = 0;

function uid(): string {
  return `${Date.now().toString(36)}-${(idCounter++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function now(): string {
  return new Date().toISOString();
}

function seed() {
  const folderId = uid();

  folders = [
    {
      id: folderId,
      title: '데모 폴더',
      parentId: null,
      children: [],
      createdAt: now(),
      updatedAt: now()
    }
  ];

  const chartId = uid();
  const statId1 = uid();
  const statId2 = uid();
  const statId3 = uid();
  const statId4 = uid();
  const listId = uid();
  const textId = uid();
  const infoId = uid();

  dashboards = [
    {
      id: uid(),
      title: 'Overview',
      description: '통계, 차트, 목록이 포함된 데모 대시보드',
      folderId: null,
      schemaVersion: 1,
      layout: { columns: 12, rowHeight: 80 },
      panels: [
        {
          id: statId1,
          type: 'stat',
          title: '총 수익',
          gridPos: { x: 0, y: 0, w: 3, h: 3 },
          options: {
            value: '1,250,000',
            unit: '',
            title: '총 수익',
            prefix: '₩',
            trend: 'up',
            trendValue: '+12.5%',
            footer: '최근 6개월 기준'
          }
        },
        {
          id: statId2,
          type: 'stat',
          title: '신규 고객',
          gridPos: { x: 3, y: 0, w: 3, h: 3 },
          options: {
            value: '1,234',
            unit: '명',
            title: '신규 고객',
            trend: 'down',
            trendValue: '-20%',
            footer: '유입 개선 필요'
          }
        },
        {
          id: statId3,
          type: 'stat',
          title: '활성 계정',
          gridPos: { x: 6, y: 0, w: 3, h: 3 },
          options: {
            value: '45,678',
            unit: '',
            title: '활성 계정',
            trend: 'up',
            trendValue: '+12.5%',
            footer: '목표 초과 달성'
          }
        },
        {
          id: statId4,
          type: 'stat',
          title: '성장률',
          gridPos: { x: 9, y: 0, w: 3, h: 3 },
          options: {
            value: '4.5',
            unit: '%',
            title: '성장률',
            trend: 'up',
            trendValue: '+4.5%',
            footer: '예측치 달성'
          }
        },
        {
          id: chartId,
          type: 'chart',
          title: '월별 트래픽',
          gridPos: { x: 0, y: 3, w: 6, h: 4 },
          options: { chartType: 'bar' }
        },
        {
          id: listId,
          type: 'list',
          title: 'Recent Sales',
          gridPos: { x: 6, y: 3, w: 6, h: 4 },
          options: {
            title: 'Recent Sales',
            columns: [
              { key: 'name', label: '이름', type: 'avatar' },
              { key: 'email', label: '이메일', type: 'text' },
              { key: 'amount', label: '금액', type: 'amount' }
            ],
            rows: [
              { name: 'Olivia Martin', email: 'olivia@example.com', amount: '+₩1,999.00' },
              { name: 'Jackson Lee', email: 'jackson@example.com', amount: '+₩39.00' },
              { name: 'Isabella Nguyen', email: 'isabella@example.com', amount: '+₩299.00' },
              { name: 'William Kim', email: 'william@example.com', amount: '+₩99.00' },
              { name: 'Sofia Davis', email: 'sofia@example.com', amount: '+₩39.00' }
            ]
          }
        },
        {
          id: textId,
          type: 'text',
          title: '메모',
          gridPos: { x: 0, y: 7, w: 6, h: 3 },
          options: {
            content:
              'SCC 인프라팀 대시보드입니다. 위젯을 추가, 이동, 크기 조절, 편집할 수 있습니다.\n\n오른쪽 위 "편집" 버튼으로 편집 모드로 전환하세요.'
          }
        },
        {
          id: infoId,
          type: 'info-card',
          title: '시스템 상태',
          gridPos: { x: 6, y: 7, w: 6, h: 3 },
          options: {
            description:
              '현재 모든 인프라 시스템이 정상 운영 중입니다. 점검은 내일 오전 2시 예정입니다.',
            status: 'active',
            color: 'green',
            showBorder: true
          }
        }
      ],
      createdAt: now(),
      updatedAt: now()
    }
  ];
}

seed();

export function getDashboards(folderId?: string | null): Dashboard[] {
  let result = dashboards;
  if (folderId !== undefined) {
    result = result.filter((d) =>
      folderId === null ? d.folderId === null : d.folderId === folderId
    );
  }
  return result
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getDashboardById(id: string): Dashboard | null {
  return dashboards.find((d) => d.id === id) ?? null;
}

export function createDashboard(data: CreateDashboardPayload): Dashboard {
  const dashboard: Dashboard = {
    id: uid(),
    title: data.title,
    description: data.description ?? null,
    folderId: data.folderId ?? null,
    schemaVersion: 1,
    layout: { columns: 12, rowHeight: 80 },
    panels: [],
    createdAt: now(),
    updatedAt: now()
  };
  dashboards.push(dashboard);
  return dashboard;
}

export function updateDashboard(id: string, data: UpdateDashboardPayload): Dashboard | null {
  const index = dashboards.findIndex((d) => d.id === id);
  if (index === -1) return null;
  const existing = dashboards[index];
  dashboards[index] = {
    ...existing,
    ...(data.title !== undefined && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.folderId !== undefined && { folderId: data.folderId }),
    ...(data.layout !== undefined && { layout: data.layout }),
    ...(data.panels !== undefined && { panels: data.panels }),
    updatedAt: now()
  };
  return dashboards[index];
}

export function deleteDashboard(id: string): Dashboard | null {
  const index = dashboards.findIndex((d) => d.id === id);
  if (index === -1) return null;
  const [deleted] = dashboards.splice(index, 1);
  return deleted;
}

export function getFolders(parentId?: string | null): DashboardFolder[] {
  const result =
    parentId === undefined
      ? folders
      : folders.filter((f) => (parentId === null ? f.parentId === null : f.parentId === parentId));
  return result.map((f) => ({
    ...f,
    children: folders.filter((c) => c.parentId === f.id).map((c) => ({ ...c, children: [] }))
  }));
}

export function getFolderById(id: string): DashboardFolder | null {
  return folders.find((f) => f.id === id) ?? null;
}

export function getFolderPath(folderId: string): DashboardFolder[] {
  const path: DashboardFolder[] = [];
  let current = getFolderById(folderId);
  while (current) {
    path.unshift(current);
    if (!current.parentId) break;
    current = getFolderById(current.parentId);
  }
  return path;
}

export function createFolder(data: CreateFolderPayload): DashboardFolder {
  const folder: DashboardFolder = {
    id: uid(),
    title: data.title,
    parentId: data.parentId ?? null,
    children: [],
    createdAt: now(),
    updatedAt: now()
  };
  folders.push(folder);
  return folder;
}

export function updateFolder(id: string, data: UpdateFolderPayload): DashboardFolder | null {
  const index = folders.findIndex((f) => f.id === id);
  if (index === -1) return null;
  const existing = folders[index];
  folders[index] = {
    ...existing,
    ...(data.title !== undefined && { title: data.title }),
    ...(data.parentId !== undefined && { parentId: data.parentId }),
    updatedAt: now()
  };
  return folders[index];
}

export function deleteFolder(id: string): DashboardFolder | null {
  const index = folders.findIndex((f) => f.id === id);
  if (index === -1) return null;
  const [deleted] = folders.splice(index, 1);
  return deleted;
}

export function isFolderTitleTaken(
  title: string,
  parentId: string | null,
  excludeId?: string
): boolean {
  return folders.some(
    (f) =>
      f.title === title &&
      f.parentId === parentId &&
      (excludeId === undefined || f.id !== excludeId)
  );
}

export function isDashboardTitleTaken(
  title: string,
  folderId: string | null,
  excludeId?: string
): boolean {
  return dashboards.some(
    (d) =>
      d.title === title &&
      d.folderId === folderId &&
      (excludeId === undefined || d.id !== excludeId)
  );
}

export function batchMove(
  moves: { type: 'dashboard' | 'folder'; id: string; targetFolderId: string | null }[]
): number {
  let count = 0;
  for (const m of moves) {
    if (m.type === 'dashboard') {
      const updated = updateDashboard(m.id, { folderId: m.targetFolderId });
      if (updated) count++;
    } else {
      const updated = updateFolder(m.id, { parentId: m.targetFolderId });
      if (updated) count++;
    }
  }
  return count;
}
