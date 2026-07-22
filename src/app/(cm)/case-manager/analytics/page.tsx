"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock, ShieldCheck, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { CM_PROJECTS } from "@/lib/mock-data/case-manager";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function CmAnalyticsPage() {
  const cases = useCaseManagerStore((s) => s.cases);
  const resolved = cases.filter((c) => ["Resolved", "Closed"].includes(c.status)).length;
  const avgSla = Math.round(CM_PROJECTS.reduce((a, p) => a + p.slaCompliance, 0) / CM_PROJECTS.length);
  const csats = cases.filter((c) => c.csatScore).map((c) => c.csatScore!);
  const avgCsat = csats.length ? (csats.reduce((a, b) => a + b, 0) / csats.length).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Back-office resolution metrics. For the full front-office ↔ back-office view, open cross-platform analytics in Connect CRM."
        actions={
          <Link href="/cases/analytics" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Cross-platform analytics <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Resolved" value={resolved} icon={CheckCircle2} />
        <StatCard title="Avg SLA compliance" value={`${avgSla}%`} icon={ShieldCheck} />
        <StatCard title="Avg resolution" value="14h" icon={Clock} />
        <StatCard title="Avg CSAT" value={avgCsat} icon={Star} subtitle={`${csats.length} responses`} />
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">SLA compliance by project</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {CM_PROJECTS.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-sm font-medium">{p.name}</span>
              <Progress value={p.slaCompliance} className="h-2 flex-1" />
              <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">{p.slaCompliance}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
