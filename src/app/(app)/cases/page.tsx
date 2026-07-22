"use client";

import Link from "next/link";
import {
  AlarmClock,
  ArrowUpRight,
  CheckCircle2,
  Inbox,
  LifeBuoy,
  Plug,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { CM_PROJECTS } from "@/lib/mock-data/case-manager";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { useIntegrationStore } from "@/lib/stores/integration-store";
import { formatRelative } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CaseStatusBadge,
  PriorityBadge,
  SlaBadge,
  SourceBadge,
} from "@/components/case-manager/cm-status-badges";

export default function CaseManagerCommandCenter() {
  const cases = useCaseManagerStore((s) => s.cases);
  const intake = useCaseManagerStore((s) => s.intake);
  const connection = useIntegrationStore((s) => s.connection);

  const open = cases.filter((c) => !["Resolved", "Closed"].includes(c.status));
  const slaAtRisk = cases.filter(
    (c) => c.slaStatus !== "green" && !["Resolved", "Closed"].includes(c.status)
  );
  const breached = cases.filter(
    (c) => c.slaStatus === "red" && !["Resolved", "Closed"].includes(c.status)
  );
  const awaitingTriage = intake.filter((i) => i.status === "New");
  const converted = intake.filter((i) => i.status === "Converted");
  const conversionRate = intake.length
    ? Math.round((converted.length / intake.length) * 100)
    : 0;
  const resolvedThisCycle = cases.filter((c) => ["Resolved", "Closed"].includes(c.status));

  const slaQueue = [...open]
    .filter((c) => c.slaStatus !== "green")
    .sort((a, b) => new Date(a.slaDue).getTime() - new Date(b.slaDue).getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Case Manager · Command Center"
        description="The bridge between your front office and back office. Triage intake, watch SLAs, and keep both workspaces in sync."
        actions={
          <>
            <Link href="/cases/intake" className={buttonVariants({ variant: "outline" })}>
              <Inbox className="size-4" /> Triage intake
              {awaitingTriage.length > 0 && (
                <span className="ml-1 rounded bg-primary/10 px-1.5 text-xs text-primary">
                  {awaitingTriage.length}
                </span>
              )}
            </Link>
            <Link href="/cases/list" className={buttonVariants()}>
              <LifeBuoy className="size-4" /> All cases
            </Link>
          </>
        }
      />

      {/* Integration health strip */}
      <Card className="border-indigo-500/20 bg-indigo-500/5">
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-8 items-center justify-center rounded-md ${
                connection.connected
                  ? "bg-indigo-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Plug className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">
                {connection.connected ? "Case Manager connected" : "Not connected"}
              </p>
              <p className="text-xs text-muted-foreground">Two-way sync · shared contacts</p>
            </div>
          </div>
          <HealthStat
            icon={RefreshCw}
            label="Last sync"
            value={connection.lastSyncAt ? formatRelative(connection.lastSyncAt) : "—"}
          />
          <HealthStat
            icon={CheckCircle2}
            label="Records synced"
            value={connection.recordsSynced.toLocaleString()}
          />
          <HealthStat icon={TrendingUp} label="Request → case" value={`${conversionRate}%`} />
          <Link
            href="/settings/integrations"
            className="ml-auto text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Manage integration <ArrowUpRight className="inline size-3.5" />
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Open cases" value={open.length} icon={LifeBuoy} subtitle={`${cases.length} total`} />
        <StatCard
          title="SLA at risk"
          value={slaAtRisk.length}
          icon={AlarmClock}
          trend={breached.length ? { value: `${breached.length} breached`, positive: false } : undefined}
        />
        <StatCard title="Awaiting triage" value={awaitingTriage.length} icon={Inbox} subtitle="portal + inquiries" />
        <StatCard title="Resolved" value={resolvedThisCycle.length} icon={CheckCircle2} subtitle="this cycle" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Request → case funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Request → Case funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FunnelRow label="Intake received" value={intake.length} total={intake.length} />
            <FunnelRow
              label="Triaged / responded"
              value={intake.filter((i) => i.status !== "New").length}
              total={intake.length}
            />
            <FunnelRow label="Converted to case" value={converted.length} total={intake.length} />
            <FunnelRow label="Resolved" value={resolvedThisCycle.length} total={intake.length} />
          </CardContent>
        </Card>

        {/* Open by project */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Open cases by project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {CM_PROJECTS.filter((p) => p.status === "Active").map((p) => {
              const projOpen = open.filter((c) => c.projectId === p.id).length;
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <Link
                    href="/cases/projects"
                    className="w-40 shrink-0 truncate text-sm font-medium hover:underline"
                  >
                    {p.name}
                  </Link>
                  <Progress value={p.slaCompliance} className="h-2 flex-1" />
                  <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                    {projOpen} open · {p.slaCompliance}% SLA
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* SLA queue */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">SLA priority queue</CardTitle>
          <Link href="/cases/list" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {slaQueue.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              Nothing at risk — every open case is on track.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slaQueue.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/cases/${c.id}`} className="block">
                        <span className="font-medium">{c.title}</span>
                        <span className="block text-xs text-muted-foreground">{c.displayId}</span>
                      </Link>
                    </TableCell>
                    <TableCell><SourceBadge source={c.source} /></TableCell>
                    <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                    <TableCell><CaseStatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-sm">{c.assignee}</TableCell>
                    <TableCell><SlaBadge status={c.slaStatus} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatRelative(c.slaDue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HealthStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof RefreshCw;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function FunnelRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
