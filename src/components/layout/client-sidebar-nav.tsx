"use client";

import { SidebarNav } from "./sidebar-nav";
import { useCurrentView } from "@/hooks/use-current-view";

export function ClientSidebarNav() {
  const view = useCurrentView();
  return <SidebarNav items={view?.navItems ?? []} />;
}
