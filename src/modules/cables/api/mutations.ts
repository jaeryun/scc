import { mutationOptions } from '@tanstack/react-query';
import { createCable, deleteCable } from './service';
import { cableKeys } from './queries';
import { getQueryClient } from '@/lib/query-client';

export const createCableMutation = mutationOptions({
  mutationFn: createCable,
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: cableKeys.all });
  }
});

export const deleteCableMutation = mutationOptions({
  mutationFn: deleteCable,
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: cableKeys.all });
  }
});
