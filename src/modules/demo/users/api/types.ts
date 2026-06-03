export type { User } from '@/constants/mock-api-users';

export type UserFilters = {
  page?: number;
  limit?: number;
  roles?: string;
  search?: string;
  sort?: string;
};

export type UsersResponse = {
  success: boolean;
  time: string;
  message: string;
  total_users: number;
  offset: number;
  limit: number;
  users: import('@/constants/mock-api-users').User[];
};

export type UserMutationPayload = {
  id: string;
  primary_team: string;
  secondary_team: string;
  role: string;
  status: string;
};
