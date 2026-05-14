'use client';

import { useMemo } from 'react';
import type { NavItem, NavGroup } from '@/types';

export function useFilteredNavItems(items: NavItem[]) {
  // No RBAC filtering without Clerk - return all items
  return items;
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  return useMemo(() => groups, [groups]);
}
