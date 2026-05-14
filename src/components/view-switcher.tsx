"use client";

import { useRouter, usePathname } from "next/navigation";
import { views } from "@/config/views";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ViewSwitcherProps {
  currentViewId?: string;
}

export function ViewSwitcher({ currentViewId }: ViewSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const viewId = currentViewId ?? pathname.split("/")[1] ?? "";

  return (
    <Select
      value={viewId}
      onValueChange={(value) => {
        router.push(`/${value}`);
      }}
    >
      <SelectTrigger className="w-full">
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
