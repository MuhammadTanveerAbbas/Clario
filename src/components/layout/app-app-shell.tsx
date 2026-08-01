"use client";

import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { cn } from "@/lib/utils";

export function AppAppShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <>
      <AppSidebar />
      <div
        className={cn(
          "min-h-screen w-full transition-[padding] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          collapsed ? "md:pl-[72px]" : "md:pl-[240px]",
        )}
      >
        {children}
      </div>
    </>
  );
}
