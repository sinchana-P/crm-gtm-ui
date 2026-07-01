"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { MOCK_CASES } from "@/lib/mock-data";
import { formatDateTime, formatRelative, slaUrgencyScore } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import {
  CaseStatusBadge,
  PriorityBadge,
  SlaBadge,
} from "@/components/crm/status-badges";
import { useViewScope } from "@/hooks/use-view-scope";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function CasesQueuePage() {
  const { filterCases, isRep, title } = useViewScope();

  const queue = useMemo(
    () =>
      filterCases(MOCK_CASES)
        .filter((c) => !["resolved", "closed"].includes(c.status))
        .sort((a, b) => slaUrgencyScore(b) - slaUrgencyScore(a)),
    [filterCases]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={title("Open Cases Queue")}
        description={
          isRep
            ? "Your contacts' open cases, sorted by SLA urgency."
            : "Smart queue sorted by SLA urgency — breached and at-risk cases surface first."
        }
        actions={
          <Link href="/cases" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            {isRep ? "Assigned cases" : "All cases"}
          </Link>
        }
      />

      <div className="space-y-3">
        {queue.map((c, index) => {
          const urgencyPct = c.slaStatus === "red" ? 95 : c.slaStatus === "amber" ? 65 : 30;
          return (
            <Card key={c.id} className={c.slaStatus === "red" ? "border-red-500/30" : undefined}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium tabular-nums">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{c.number}</span>
                    <PriorityBadge priority={c.priority} />
                    <CaseStatusBadge status={c.status} />
                    <SlaBadge status={c.slaStatus} />
                  </div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.contactName} · {c.assignee}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    Due {formatDateTime(c.slaDue)} ({formatRelative(c.slaDue)})
                  </div>
                  <Progress value={urgencyPct} className="h-1.5 max-w-xs" />
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  Take case
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
