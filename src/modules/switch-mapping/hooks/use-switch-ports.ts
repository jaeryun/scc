import { useSuspenseQuery } from '@tanstack/react-query';
import { switchPortsQueryOptions } from '../api/queries';

export function useSwitchPorts(deviceId: string) {
  return useSuspenseQuery(switchPortsQueryOptions(deviceId));
}
