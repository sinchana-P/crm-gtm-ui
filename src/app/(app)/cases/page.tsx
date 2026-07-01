"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlarmClock, LifeBuoy, Plus } from "lucide-react";
import { MOCK_CASES } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { CreateCaseDialog } from "@/components/cases/create-case-dialog";
import {
  CaseStatusBadge,
  PriorityBadge,
  SlaBadge,
} from "@/components/crm/status-badges";
import { useViewScope } from "@/hooks/use-view-scope";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CasesPage() {
  const { filterCases, isRep, title, rep } = useViewScope();
  const [createOpen, setCreateOpen] = useState(false);

  const cases = useMemo(() => filterCases(MOCK_CASES), [filterCases]);
  const openCases = cases.filter((c) => !["resolved", "closed"].includes(c.status));
  const slaAtRisk = cases.filter((c) => c.slaStatus !== "green").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title("Cases")}
        description={
          isRep
            ? `Cases for contacts owned by ${rep.name}. Create a case in two clicks from any contact.`
            : "Front-office intake with Kaayaka back-office resolution. Open a case in two clicks from any contact."
        }
        actions={
          <>
            <Link href="/cases/queue" className={buttonVariants({ variant: "outline" })}>
              <AlarmClock className="mr-2 size-4" />
              Open queue
            </Link>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" />
              Create case
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard icon={LifeBuoy} label="Open cases" value={openCases.length} />
        <MetricCard icon={AlarmClock} label="SLA at risk" value={slaAtRisk} highlight={slaAtRisk > 0} />
        {!isRep && (
          <MetricCard
            icon={Plus}
            label="Unassigned"
            value={MOCK_CASES.filter((c) => c.assignee === "Unassigned").length}
            highlight
          />
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {isRep ? "Assigned cases" : "All cases"}
          </CardTitle>
          {!isRep && (
            <Link href="/cases/templates" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Manage templates
            </Link>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.number}</TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium">{c.title}</TableCell>
                  <TableCell>{c.contactName}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={c.priority} />
                  </TableCell>
                  <TableCell>
                    <CaseStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <SlaBadge status={c.slaStatus} />
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(c.slaDue)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.assignee}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateCaseDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={`flex size-10 items-center justify-center rounded-lg ${
            highlight ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
