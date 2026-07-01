"use client";

import Link from "next/link";
import {
  Activity,
  Copy,
  TrendingUp,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useOpenRecord } from "@/hooks/use-open-record";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CONVERSION_FUNNEL,
  DASHBOARD_STATS,
  HEALTH_TREND,
  MOCK_WORK_QUEUE,
  SOURCE_MIX,
} from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";

const healthChartConfig = {
  score: { label: "Health avg", color: "var(--chart-1)" },
};

const TASK_LABELS = {
  overdue_followup: "Overdue follow-up",
  hot_lead: "Hot lead",
  sla_breach: "SLA breach",
};

export function AdminDashboard() {
  const openRecord = useOpenRecord();

  const maxFunnel = Math.max(...CONVERSION_FUNNEL.map((f) => f.count));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contact Health"
        description="Organization-wide pipeline health, engagement trends, and team work queue."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total contacts"
          value={DASHBOARD_STATS.totalContacts.toLocaleString()}
          icon={Users}
          trend={{ value: "+4.2% vs last month", positive: true }}
        />
        <StatCard
          title="New this week"
          value={DASHBOARD_STATS.newThisWeek}
          icon={TrendingUp}
          subtitle="Across all sources"
        />
        <StatCard
          title="Health average"
          value={DASHBOARD_STATS.healthAvg}
          icon={Activity}
          trend={{ value: "+2 pts vs last week", positive: true }}
        />
        <StatCard
          title="Duplicates pending"
          value={DASHBOARD_STATS.duplicatesPending}
          icon={Copy}
          subtitle="Review in Duplicates"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Health trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={healthChartConfig} className="h-[220px] w-full">
              <BarChart data={HEALTH_TREND}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis domain={[60, 80]} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Source mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SOURCE_MIX.map((s) => {
              const total = SOURCE_MIX.reduce((a, b) => a + b.count, 0);
              const pct = Math.round((s.count / total) * 100);
              return (
                <div key={s.source}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{s.source}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Conversion funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {CONVERSION_FUNNEL.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-muted-foreground">
                  {stage.stage}
                </span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
                    <div
                      className="flex h-full items-center rounded bg-primary/60 pl-2 text-xs font-medium text-primary-foreground"
                      style={{
                        width: `${Math.max(8, (stage.count / maxFunnel) * 100)}%`,
                      }}
                    >
                      {stage.count.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Team work queue</CardTitle>
            <Link
              href="/work-queue"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_WORK_QUEUE.slice(0, 4).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="max-w-[200px] truncate font-medium">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.contactName}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {TASK_LABELS[item.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{item.owner}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelative(item.dueAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openRecord(item.contactId)}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
