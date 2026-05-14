"use client";

import { usePathname } from "next/navigation";
import { getViewByPath, ViewConfig } from "@/config/views";

export function useCurrentView(): ViewConfig | undefined {
  const pathname = usePathname();
  return getViewByPath(pathname);
}
