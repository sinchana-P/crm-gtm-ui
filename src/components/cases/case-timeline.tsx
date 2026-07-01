"use client";

import { useMemo } from "react";
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  MessageSquare,
  Plus,
  UserCheck,
} from "lucide-react";
import { getTimelineForContact } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import type { CaseTimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const iconMap: Record<CaseTimelineEvent["type"], React.ElementType> = {
  created: Plus,
  status: ArrowRightLeft,
  comment: MessageSquare,
  assignment: UserCheck,
  sla: AlertCircle,
  resolved: CheckCircle2,
};

const colorMap: Record<CaseTimelineEvent["type"], string> = {
  created: "bg-sky-500/10 text-sky-600",
  status: "bg-violet-500/10 text-violet-600",
  comment: "bg-muted text-muted-foreground",
  assignment: "bg-blue-500/10 text-blue-600",
  sla: "bg-red-500/10 text-red-600",
  resolved: "bg-emerald-500/10 text-emerald-600",
};

interface CaseTimelineProps {
  contactId: string;
  className?: string;
  maxHeight?: string;
}

export function CaseTimeline({ contactId, className, maxHeight = "320px" }: CaseTimelineProps) {
  const events = useMemo(
    () =>
      getTimelineForContact(contactId).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [contactId]
  );

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No case activity for this contact.</p>
    );
  }

  return (
    <ScrollArea className={cn("pr-3", className)} style={{ maxHeight }}>
      <ol className="relative space-y-4 border-l border-border pl-4">
        {events.map((event) => {
          const Icon = iconMap[event.type];
          return (
            <li key={event.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[1.35rem] flex size-6 items-center justify-center rounded-full ring-4 ring-background",
                  colorMap[event.type]
                )}
              >
                <Icon className="size-3" />
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">{event.title}</p>
                {event.body ? (
                  <p className="text-sm text-muted-foreground">{event.body}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {event.actor} · {formatRelative(event.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </ScrollArea>
  );
}
