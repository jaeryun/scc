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

  const currentViewId = useMemo(() => {
    const viewId = pathname.split("/")[1];
    return views.find((v) => v.id === viewId)?.id ?? views[0].id;
  }, [pathname]);

  return (
    <Select
      value={currentViewId}
      onValueChange={(value) => {
        router.push(`/${value}`);
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="뷰 선택" />
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
