export type Workspace = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
};

export type CreateWorkspacePayload = {
  name: string;
  description: string;
};

export type UpdateMemberRolePayload = {
  role: 'owner' | 'admin' | 'member';
};
