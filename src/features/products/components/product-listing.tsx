import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { productsQueryOptions } from '../api/queries';
import { ProductTable } from './product-tables';

export default function ProductListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const categories = searchParamsCache.get('category');
  const sortRaw = searchParamsCache.get('sort');
  const sort = sortRaw ? JSON.parse(sortRaw) : [];

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories }),
    ...(sort.length > 0 && sortRaw && { sort: sortRaw })
  };

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(productsQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductTable />
    </HydrationBoundary>
  );
}
