import { mutationOptions } from '@tanstack/react-query';
import { createDevice, updateDevice, deleteDevice } from './service';
import { deviceKeys } from './queries';
import { getQueryClient } from '@/lib/query-client';

export const createDeviceMutation = mutationOptions({
  mutationFn: createDevice,
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: deviceKeys.all });
  }
});

export const updateDeviceMutation = mutationOptions({
  mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
    updateDevice(id, body),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: deviceKeys.all });
  }
});

export const deleteDeviceMutation = mutationOptions({
  mutationFn: deleteDevice,
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: deviceKeys.all });
  }
});
