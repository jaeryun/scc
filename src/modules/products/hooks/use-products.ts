import { useSuspenseQuery } from '@tanstack/react-query';
import { productsQueryOptions, productByIdOptions } from '../api/queries';
import type { ProductFilters } from '../api/types';

export function useProducts(filters: ProductFilters) {
  return useSuspenseQuery(productsQueryOptions(filters));
}

export function useProductById(id: number) {
  return useSuspenseQuery(productByIdOptions(id));
}
