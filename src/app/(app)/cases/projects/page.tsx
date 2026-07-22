"use client";

import Link from "next/link";
import { ExternalLink, FolderKanban, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { CM_PROJECTS } from "@/lib/mock-data/case-manager";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProjectStatusBadge } from "@/components/case-manager/cm-status-badges";

export default function CaseProjectsPage() {
  const cases = useCaseManagerStore((s) => s.cases);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Back-office projects that cases are routed into. Managed in the Case Manager workspace; mirrored here for front-office visibility."
        actions={
          <Link href="/case-manager/projects" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Open in Case Manager <ExternalLink className="size-3.5" />
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {CM_PROJECTS.map((p) => {
          const liveOpen = cases.filter(
            (c) => c.projectId === p.id && !["Resolved", "Closed"].includes(c.status)
          ).length;
          return (
            <Card key={p.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <FolderKanban className="size-4.5" />
                    </span>
                    <div>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{p.displayId} · Lead: {p.lead}</p>
                    </div>
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Stat label="Open" value={liveOpen} />
                  <Stat label="Total" value={p.totalCases} />
                  <Stat label="Overdue" value={p.overdueCases} highlight={p.overdueCases > 0} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">SLA compliance</span>
                    <span className="font-medium">{p.slaCompliance}%</span>
                  </div>
                  <Progress value={p.slaCompliance} className="h-1.5" />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {p.crmCaseTypes.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] font-normal">{t}</Badge>
                  ))}
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3" /> {p.team.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="rounded-md border py-2">
      <p className={`text-lg font-semibold tabular-nums ${highlight ? "text-red-600" : ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
