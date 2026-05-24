'use client';

import { SidebarNav } from './sidebar-nav';
import { useCurrentView } from '@/hooks/use-current-view';
import { views } from '@/config/views';

export function ClientSidebarNav() {
  const view = useCurrentView();

  // If no view detected (e.g., on root path /), show first view's nav
  const effectiveView = view ?? views[0];

  return <SidebarNav items={effectiveView.navItems} />;
}
