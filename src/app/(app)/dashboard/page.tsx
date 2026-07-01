"use client";

import { RepDashboard } from "@/components/dashboard/rep-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { useClientStoresHydrated } from "@/hooks/use-client-stores-hydrated";
import { useViewLevelStore } from "@/lib/stores/view-level-store";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const hydrated = useClientStoresHydrated();
  const level = useViewLevelStore((s) => s.level);

  if (hydrated && level === "customer-portal") {
    redirect("/portal");
  }

  if (!hydrated) {
    return <AdminDashboard />;
  }

  if (level === "representative") {
    return <RepDashboard />;
  }

  return <AdminDashboard />;
}
