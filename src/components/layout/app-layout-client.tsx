"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { AdminOnlyGuard, ViewScopeBanner } from "@/components/shared/view-scope";
import { cn } from "@/lib/utils";

const RECORD_PAGE_PATTERN = /^\/(leads|contacts|customers)\/[^/]+$/;

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRecordPage = RECORD_PAGE_PATTERN.test(pathname);

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div
            className={cn(
              "mx-auto w-full",
              isRecordPage ? "max-w-none p-0" : "max-w-7xl p-6 lg:p-8"
            )}
          >
            <AdminOnlyGuard>
              {!isRecordPage ? <ViewScopeBanner /> : null}
              {children}
            </AdminOnlyGuard>
          </div>
        </main>
      </div>
    </div>
  );
}
