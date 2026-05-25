import { queryOptions } from '@tanstack/react-query';
import { getSwitchesByRole, getSwitchPorts } from './service';

export const switchKeys = {
  byRole: (role: string) => ['netbox', 'switches', role] as const,
  ports: (deviceId: string) => ['netbox', 'switch-ports', deviceId] as const
};

export const switchesQueryOptions = (role: string) =>
  queryOptions({
    queryKey: switchKeys.byRole(role),
    queryFn: () => getSwitchesByRole(role),
    staleTime: 2 * 60 * 1000
  });

export const switchPortsQueryOptions = (deviceId: string) =>
  queryOptions({
    queryKey: switchKeys.ports(deviceId),
    queryFn: () => getSwitchPorts(deviceId),
    staleTime: 2 * 60 * 1000
  });
