"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { formatDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlaBadge } from "@/components/case-manager/cm-status-badges";

export default function CmCalendarPage() {
  const allCases = useCaseManagerStore((s) => s.cases);
  const cases = useMemo(
    () =>
      [...allCases]
        .filter((c) => !["Resolved", "Closed"].includes(c.status))
        .sort((a, b) => new Date(a.slaDue).getTime() - new Date(b.slaDue).getTime()),
    [allCases]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="Upcoming SLA deadlines across open cases." />
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">SLA deadlines</CardTitle></CardHeader>
        <CardContent className="p-0">
          {cases.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing due" description="No open cases with upcoming deadlines." className="border-0" />
          ) : (
            <ul className="divide-y">
              {cases.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-6 py-3">
                  <CalendarClock className="size-4 text-muted-foreground" />
                  <Link href={`/case-manager/cases/${c.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.displayId} · {c.assignee}</p>
                  </Link>
                  <span className="text-xs text-muted-foreground">{formatDateTime(c.slaDue)}</span>
                  <SlaBadge status={c.slaStatus} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
