import { parseAsJson } from 'nuqs';
import type { SortingState } from '@tanstack/react-table';

export function getSortingStateParser(columnIds?: string[]) {
  return parseAsJson<SortingState>((value) => {
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        typeof item.id === 'string' &&
        (!columnIds || columnIds.includes(item.id)) &&
        'desc' in item &&
        typeof item.desc === 'boolean'
    );
  });
}
