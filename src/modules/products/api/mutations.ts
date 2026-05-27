import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, updateProduct, deleteProduct } from './service';
import { productKeys } from './queries';
import type { ProductMutationPayload } from './types';

export function useProductMutations() {
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: (data: ProductMutationPayload) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: ProductMutationPayload }) =>
      updateProduct(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    }
  });

  return { createProductMutation, updateProductMutation, deleteProductMutation };
}
