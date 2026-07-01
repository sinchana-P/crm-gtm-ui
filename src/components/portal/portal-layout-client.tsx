"use client";

import { PortalHeader } from "@/components/portal/portal-header";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useViewLevelStore } from "@/lib/stores/view-level-store";

export function PortalLayoutClient({ children }: { children: React.ReactNode }) {
  const setLevel = useViewLevelStore((s) => s.setLevel);
  const pathname = usePathname();
  const isStandaloneUpload = pathname?.startsWith("/portal/upload/");

  useEffect(() => {
    setLevel("customer-portal");
  }, [setLevel]);

  if (isStandaloneUpload) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <PortalSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PortalHeader />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="mx-auto w-full max-w-6xl p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
