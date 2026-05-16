'use client';

import { useMemo } from 'react';
import type { NavItem, NavGroup } from '@/types';

/**
 * Hook to filter navigation items based on RBAC
 * Without Clerk, all items are visible
 */
export function useFilteredNavItems(items: NavItem[]) {
  const filteredItems = useMemo(() => {
    return items;
  }, [items]);

  return filteredItems;
}

/**
 * Hook to filter navigation groups based on RBAC
 * Without Clerk, all groups are visible
 */
export function useFilteredNavGroups(groups: NavGroup[]) {
  return useMemo(() => {
    return groups.filter((group) => group.items.length > 0);
  }, [groups]);
}
