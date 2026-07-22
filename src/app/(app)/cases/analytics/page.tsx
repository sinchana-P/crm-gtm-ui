"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, ShieldCheck, Star, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { CM_PROJECTS } from "@/lib/mock-data/case-manager";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const SOURCE_COLORS: Record<string, string> = {
  portal: "var(--chart-1)",
  inquiry: "var(--chart-2)",
  email: "var(--chart-3)",
  crm: "var(--chart-4)",
};

const slaConfig: ChartConfig = {
  compliance: { label: "SLA compliance %", color: "var(--chart-1)" },
};
const sourceConfig: ChartConfig = {
  portal: { label: "Portal", color: "var(--chart-1)" },
  inquiry: { label: "Inquiry", color: "var(--chart-2)" },
  email: { label: "Email", color: "var(--chart-3)" },
  crm: { label: "CRM", color: "var(--chart-4)" },
};

export default function CaseAnalyticsPage() {
  const cases = useCaseManagerStore((s) => s.cases);
  const intake = useCaseManagerStore((s) => s.intake);

  const resolved = cases.filter((c) => ["Resolved", "Closed"].includes(c.status));
  const avgResolution = Math.round(
    CM_PROJECTS.reduce((a, p) => a + p.slaCompliance, 0) / CM_PROJECTS.length
  );
  const csatScores = cases.filter((c) => c.csatScore).map((c) => c.csatScore!);
  const avgCsat = csatScores.length
    ? (csatScores.reduce((a, b) => a + b, 0) / csatScores.length).toFixed(1)
    : "—";
  const conversion = intake.length
    ? Math.round((intake.filter((i) => i.status === "Converted").length / intake.length) * 100)
    : 0;

  const slaData = CM_PROJECTS.map((p) => ({ name: p.displayId, compliance: p.slaCompliance }));

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach((c) => (counts[c.source] = (counts[c.source] ?? 0) + 1));
    return Object.entries(counts).map(([source, value]) => ({
      source,
      label: source[0].toUpperCase() + source.slice(1),
      value,
      color: SOURCE_COLORS[source] ?? "var(--muted-foreground)",
    }));
  }, [cases]);
  const sourceTotal = sourceData.reduce((a, s) => a + s.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Case Manager · Analytics"
        description="Cross-platform reporting across the front-office intake and back-office resolution — the numbers no single system could show alone."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Avg SLA compliance" value={`${avgResolution}%`} icon={ShieldCheck} />
        <StatCard title="Avg resolution" value="14h" icon={Clock} subtitle="across projects" />
        <StatCard title="Avg CSAT" value={avgCsat} icon={Star} subtitle={`${csatScores.length} responses`} />
        <StatCard title="Request → case" value={`${conversion}%`} icon={TrendingUp} subtitle={`${resolved.length} resolved`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SLA compliance by project</CardTitle>
            <CardDescription>Back-office resolution health per project.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={slaConfig} className="h-[240px] w-full">
              <BarChart data={slaData} margin={{ left: 4, right: 4, top: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={32} domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="compliance" fill="var(--color-compliance)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cases by source</CardTitle>
            <CardDescription>Where casework originates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ChartContainer config={sourceConfig} className="aspect-square h-[150px] shrink-0">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
                  <Pie data={sourceData} dataKey="value" nameKey="label" innerRadius={40} strokeWidth={2}>
                    {sourceData.map((s) => (
                      <Cell key={s.source} fill={s.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex-1 space-y-1.5">
                {sourceData.map((s) => (
                  <div key={s.source} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </span>
                    <span className="tabular-nums">
                      <span className="font-medium">{s.value}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {sourceTotal ? Math.round((s.value / sourceTotal) * 100) : 0}%
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
