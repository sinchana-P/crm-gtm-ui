"use client";

import { useState } from "react";
import Link from "next/link";
import { GripVertical, MoveRight } from "lucide-react";
import { toast } from "sonner";
import { getContactById } from "@/lib/mock-data";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { formatRelative } from "@/lib/format";
import { CM_CASE_LIFECYCLE, type CmCase, type CmCaseStatus } from "@/lib/types/case-manager";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge, SlaBadge } from "@/components/case-manager/cm-status-badges";

const COLUMN_ACCENT: Record<CmCaseStatus, string> = {
  New: "border-t-violet-500",
  "In Progress": "border-t-sky-500",
  Pending: "border-t-amber-500",
  Resolved: "border-t-emerald-500",
  Closed: "border-t-muted-foreground/40",
};

export function CaseBoard({ projectId }: { projectId: string }) {
  const cases = useCaseManagerStore((s) => s.cases);
  const updateStatus = useCaseManagerStore((s) => s.updateCaseStatus);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<CmCaseStatus | null>(null);

  const projectCases = cases.filter((c) => c.projectId === projectId);

  const handleDrop = (status: CmCaseStatus) => {
    setOverCol(null);
    if (!dragId) return;
    const dragged = cases.find((c) => c.id === dragId);
    setDragId(null);
    if (!dragged || dragged.status === status) return;
    updateStatus(dragId, status);
    toast.success(`${dragged.displayId} → ${status}`);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {CM_CASE_LIFECYCLE.map((status) => {
        const colCases = projectCases.filter((c) => c.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(status);
            }}
            onDragLeave={() => setOverCol((s) => (s === status ? null : s))}
            onDrop={() => handleDrop(status)}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-xl border border-t-2 bg-muted/30 transition-colors",
              COLUMN_ACCENT[status],
              overCol === status && "bg-primary/5 ring-2 ring-primary/30"
            )}
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-medium">{status}</span>
              <span className="rounded-full bg-background px-2 text-xs tabular-nums text-muted-foreground">
                {colCases.length}
              </span>
            </div>
            <div className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
              {colCases.map((c) => (
                <BoardCard
                  key={c.id}
                  case={c}
                  dragging={dragId === c.id}
                  onDragStart={() => setDragId(c.id)}
                  onDragEnd={() => setDragId(null)}
                />
              ))}
              {colCases.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">Drop cases here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BoardCard({
  case: c,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  case: CmCase;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const updateStatus = useCaseManagerStore((s) => s.updateCaseStatus);
  const contact = c.clientIds[0] ? getContactById(c.clientIds[0]) : undefined;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group cursor-grab rounded-lg border bg-background p-3 shadow-sm transition-opacity active:cursor-grabbing",
        dragging && "opacity-40"
      )}
    >
      <div className="flex items-start gap-1.5">
        <GripVertical className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/case-manager/cases/${c.id}`}
              className="font-mono text-[11px] text-muted-foreground hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {c.displayId}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Move case"
                  >
                    <MoveRight className="size-3.5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                {CM_CASE_LIFECYCLE.filter((s) => s !== c.status).map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => {
                      updateStatus(c.id, s);
                      toast.success(`${c.displayId} → ${s}`);
                    }}
                  >
                    Move to {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm font-medium leading-snug">{c.title}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <PriorityBadge priority={c.priority} />
            <SlaBadge status={c.slaStatus} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="truncate">{contact ? `${contact.firstName} ${contact.lastName}` : c.assignee}</span>
            <span className="shrink-0">{formatRelative(c.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
