"use client";

import Link from "next/link";
import { AlarmClock, CheckCircle2, Clock, LifeBuoy, TriangleAlert } from "lucide-react";
import { CM_PROJECTS, CM_QUEUES } from "@/lib/mock-data/case-manager";
import { getContactById } from "@/lib/mock-data";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { CURRENT_REP } from "@/lib/stores/view-level-store";
import { formatRelative } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/case-manager/cm-status-badges";

export default function CaseManagerHome() {
  const cases = useCaseManagerStore((s) => s.cases);
  const total = cases.length;
  const inProgress = cases.filter((c) => c.status === "In Progress").length;
  const resolved = cases.filter((c) => ["Resolved", "Closed"].includes(c.status)).length;
  const highPriority = cases.filter(
    (c) => ["high", "urgent"].includes(c.priority) && !["Resolved", "Closed"].includes(c.status)
  ).length;
  const recent = [...cases]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome, {CURRENT_REP.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Here&rsquo;s the pulse of your back office.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={LifeBuoy} label="Total cases" value={total} tint="indigo" />
        <MetricCard icon={Clock} label="In progress" value={inProgress} tint="sky" />
        <MetricCard icon={CheckCircle2} label="Resolved" value={resolved} tint="emerald" />
        <MetricCard icon={TriangleAlert} label="High priority" value={highPriority} tint="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent cases</CardTitle>
            <Link href="/case-manager/cases" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((c) => {
                  const contact = c.clientIds[0] ? getContactById(c.clientIds[0]) : undefined;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link href={`/case-manager/cases/${c.id}`} className="block">
                          <span className="font-medium">{c.title}</span>
                          <span className="block font-mono text-xs text-muted-foreground">{c.displayId}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        {contact ? `${contact.firstName} ${contact.lastName}` : "—"}
                      </TableCell>
                      <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                      <TableCell><CaseStatusBadge status={c.status} /></TableCell>
                      <TableCell><SlaBadge status={c.slaStatus} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatRelative(c.updatedAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Queues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {CM_QUEUES.map((q) => (
              <Link
                key={q.id}
                href="/case-manager/queues"
                className="flex items-center gap-3 rounded-lg border px-3 py-2 hover:bg-muted/50"
              >
                <AlarmClock className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{q.name}</p>
                  <p className="text-xs text-muted-foreground">{q.projectName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{q.openCases}</p>
                  {q.slaBreaches > 0 && <p className="text-xs text-red-600">{q.slaBreaches} breach</p>}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Projects</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CM_PROJECTS.map((p) => (
            <Link
              key={p.id}
              href="/case-manager/projects"
              className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <p className="text-sm font-medium">{p.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.openCases} open · {p.slaCompliance}% SLA</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const TINTS: Record<string, string> = {
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function MetricCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof LifeBuoy;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-5">
        <span className={`flex size-10 items-center justify-center rounded-lg ${TINTS[tint]}`}>
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
