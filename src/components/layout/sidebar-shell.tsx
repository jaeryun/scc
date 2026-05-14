import { cn } from "@/lib/utils";

interface SidebarShellProps {
  children: React.ReactNode;
  className?: string;
}

export function SidebarShell({ children, className }: SidebarShellProps) {
  return (
    <aside className={cn("w-64 border-r bg-background h-screen flex flex-col", className)}>
      {children}
    </aside>
  );
}
