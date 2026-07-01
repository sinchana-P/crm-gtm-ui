"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { useViewScope } from "@/hooks/use-view-scope";
import { useClientStoresHydrated } from "@/hooks/use-client-stores-hydrated";
import { ADMIN_ONLY_PATHS } from "@/lib/view-scope";
import { toast } from "sonner";

export function AdminOnlyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useClientStoresHydrated();
  const { isRep } = useViewScope();

  const blocked =
    hydrated &&
    isRep &&
    ADMIN_ONLY_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

  useEffect(() => {
    if (blocked) {
      toast.message("Admin view required", {
        description: "Switch to Admin view in the header to access this page.",
      });
      router.replace("/dashboard");
    }
  }, [blocked, router]);

  if (blocked) return null;

  return <>{children}</>;
}

export function ViewScopeBanner() {
  const hydrated = useClientStoresHydrated();
  const { isRep, rep } = useViewScope();

  if (!hydrated) return null;

  return (
    <div
      className={
        isRep
          ? "mb-6 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm"
          : "mb-6 flex items-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-2 text-sm text-muted-foreground"
      }
    >
      <Shield className="size-4 shrink-0" />
      {isRep ? (
        <span>
          <span className="font-medium">Representative view</span>
          <span className="text-muted-foreground">
            {" "}
            — showing records owned by {rep.name} only
          </span>
        </span>
      ) : (
        <span>
          <span className="font-medium">Admin view</span>
          <span> — organization-wide data and configuration</span>
        </span>
      )}
    </div>
  );
}
