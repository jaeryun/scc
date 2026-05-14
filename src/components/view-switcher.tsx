"use client";

import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { views } from "@/config/views";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const currentView = useMemo(() => {
    const viewId = pathname.split("/")[1];
    return views.find((v) => v.id === viewId) ?? views[0];
  }, [pathname]);

  return (
    <Select
      value={currentView.id}
      onValueChange={(value) => {
        router.push(`/${value}`);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="뷰 선택">
          {currentView.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {views.map((view) => (
          <SelectItem key={view.id} value={view.id}>
            {view.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
