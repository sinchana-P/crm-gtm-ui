"use client";

import { useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useOpenRecord } from "@/hooks/use-open-record";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_WORK_QUEUE } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import { useViewScope } from "@/hooks/use-view-scope";
import type { WorkQueueTaskType } from "@/lib/types";

const TYPE_LABELS: Record<WorkQueueTaskType, string> = {
  overdue_followup: "Overdue follow-up",
  hot_lead: "Hot lead",
  sla_breach: "SLA breach",
};

const PRIORITY_VARIANT = {
  low: "secondary" as const,
  medium: "outline" as const,
  high: "default" as const,
  urgent: "destructive" as const,
};

export default function WorkQueuePage() {
  const { filterWorkQueue, isRep, title, rep } = useViewScope();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const openRecord = useOpenRecord();

  const filtered = useMemo(() => {
    return filterWorkQueue(MOCK_WORK_QUEUE).filter((item) => {
      const matchType = typeFilter === "all" || item.type === typeFilter;
      const matchPriority =
        priorityFilter === "all" || item.priority === priorityFilter;
      return matchType && matchPriority;
    });
  }, [typeFilter, priorityFilter, filterWorkQueue]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={title("Work Queue")}
        description={
          isRep
            ? `Tasks assigned to ${rep.name} — prioritized by urgency.`
            : "Prioritized tasks across follow-ups, hot leads, and SLA breaches."
        }
      />

      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Task type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="overdue_followup">Overdue follow-ups</SelectItem>
            <SelectItem value="hot_lead">Hot leads</SelectItem>
            <SelectItem value="sla_breach">SLA breaches</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Queue is clear"
          description="No tasks match your filters. Adjust filters or check back later."
        />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Due</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant={PRIORITY_VARIANT[item.priority]}>
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs font-medium">
                    {item.title}
                  </TableCell>
                  <TableCell>{item.contactName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{TYPE_LABELS[item.type]}</Badge>
                  </TableCell>
                  <TableCell>{item.owner}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelative(item.dueAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRecord(item.contactId)}
                    >
                      Open contact
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
