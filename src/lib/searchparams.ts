import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  name: parseAsString,
  role: parseAsString,
  category: parseAsString,
  sort: parseAsString
});
