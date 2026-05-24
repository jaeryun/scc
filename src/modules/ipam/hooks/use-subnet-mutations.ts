'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSubnet, updateSubnet, deleteSubnet } from '../api/service';
import { CreateSubnetPayload, UpdateSubnetPayload } from '../api/types';
import { subnetKeys } from '../api/queries';

export function useSubnetMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateSubnetPayload) => createSubnet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subnetKeys.all });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSubnetPayload) => updateSubnet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subnetKeys.all });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubnet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subnetKeys.all });
    }
  });

  return { createMutation, updateMutation, deleteMutation };
}
