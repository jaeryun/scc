import { queryOptions } from '@tanstack/react-query';
import { getSwitchesByRole, getSwitchPorts } from './service';

export const switchKeys = {
  all: ['switches'] as const,
  byRole: (role: string) => [...switchKeys.all, 'byRole', role] as const,
  detail: (id: string) => [...switchKeys.all, 'detail', id] as const
};

export const switchesByRoleOptions = (role: string) =>
  queryOptions({
    queryKey: switchKeys.byRole(role),
    queryFn: () => getSwitchesByRole(role),
    enabled: !!role,
    staleTime: 30 * 1000
  });

export const switchDetailOptions = (deviceId: string) =>
  queryOptions({
    queryKey: switchKeys.detail(deviceId),
    queryFn: () => getSwitchPorts(deviceId),
    enabled: !!deviceId,
    staleTime: 30 * 1000
  });
