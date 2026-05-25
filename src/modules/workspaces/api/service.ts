import type {
  Workspace,
  TeamMember,
  CreateWorkspacePayload,
  UpdateMemberRolePayload
} from './types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

let workspaces: Workspace[] = [
  {
    id: 'ws-001',
    name: '인프라팀',
    description: '사내 인프라 관리 및 SE Command Center 운영',
    memberCount: 8,
    createdAt: '2025-01-15T00:00:00.000Z'
  },
  {
    id: 'ws-002',
    name: '프론트엔드팀',
    description: '웹 프론트엔드 개발 및 디자인 시스템 관리',
    memberCount: 6,
    createdAt: '2025-03-01T00:00:00.000Z'
  },
  {
    id: 'ws-003',
    name: '백엔드팀',
    description: 'API 서버 개발 및 데이터베이스 관리',
    memberCount: 5,
    createdAt: '2025-02-20T00:00:00.000Z'
  },
  {
    id: 'ws-004',
    name: 'DevOps팀',
    description: 'CI/CD 파이프라인 및 클라우드 인프라 운영',
    memberCount: 4,
    createdAt: '2025-04-10T00:00:00.000Z'
  }
];

let teamMembers: Record<string, TeamMember[]> = {
  'ws-001': [
    { id: 'm-001', name: '김철수', email: 'chulsoo@example.com', role: 'owner' },
    { id: 'm-002', name: '이영희', email: 'younghee@example.com', role: 'admin' },
    { id: 'm-003', name: '박지민', email: 'jimin@example.com', role: 'member' },
    { id: 'm-004', name: '최유진', email: 'yujin@example.com', role: 'member' },
    { id: 'm-005', name: '정민수', email: 'minsu@example.com', role: 'member' },
    { id: 'm-006', name: '강하늘', email: 'haneul@example.com', role: 'member' },
    { id: 'm-007', name: '윤서연', email: 'seoyeon@example.com', role: 'member' },
    { id: 'm-008', name: '장우진', email: 'woojin@example.com', role: 'member' }
  ],
  'ws-002': [
    { id: 'm-101', name: '한소희', email: 'sohee@example.com', role: 'owner' },
    { id: 'm-102', name: '배수지', email: 'suji@example.com', role: 'member' },
    { id: 'm-103', name: '임재현', email: 'jaehyun@example.com', role: 'member' },
    { id: 'm-104', name: '오세훈', email: 'sehun@example.com', role: 'member' },
    { id: 'm-105', name: '류지원', email: 'jiwon@example.com', role: 'member' },
    { id: 'm-106', name: '송민아', email: 'mina@example.com', role: 'member' }
  ],
  'ws-003': [
    { id: 'm-201', name: '홍길동', email: 'gildong@example.com', role: 'owner' },
    { id: 'm-202', name: '김나영', email: 'nayoung@example.com', role: 'admin' },
    { id: 'm-203', name: '이준호', email: 'junho@example.com', role: 'member' },
    { id: 'm-204', name: '박서준', email: 'seojun@example.com', role: 'member' },
    { id: 'm-205', name: '최다현', email: 'dahyun@example.com', role: 'member' }
  ],
  'ws-004': [
    { id: 'm-301', name: '손흥민', email: 'heungmin@example.com', role: 'owner' },
    { id: 'm-302', name: '조현우', email: 'hyunwoo@example.com', role: 'member' },
    { id: 'm-303', name: '김민재', email: 'minjae@example.com', role: 'member' },
    { id: 'm-304', name: '이강인', email: 'kangin@example.com', role: 'member' }
  ]
};

export async function getWorkspaces(): Promise<Workspace[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...workspaces];
}

export async function createWorkspace(data: CreateWorkspacePayload): Promise<Workspace> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const workspace: Workspace = {
    id: `ws-${generateId()}`,
    name: data.name,
    description: data.description,
    memberCount: 0,
    createdAt: new Date().toISOString()
  };
  workspaces = [workspace, ...workspaces];
  teamMembers[workspace.id] = [];
  return workspace;
}

export async function getTeamMembers(workspaceId: string): Promise<TeamMember[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return teamMembers[workspaceId] ?? [];
}

export async function getWorkspaceById(workspaceId: string): Promise<Workspace | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return workspaces.find((w) => w.id === workspaceId);
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  role: UpdateMemberRolePayload['role']
): Promise<TeamMember> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const members = teamMembers[workspaceId];
  if (!members) throw new Error('워크스페이스를 찾을 수 없습니다');
  const member = members.find((m) => m.id === memberId);
  if (!member) throw new Error('멤버를 찾을 수 없습니다');
  member.role = role;
  return { ...member };
}
