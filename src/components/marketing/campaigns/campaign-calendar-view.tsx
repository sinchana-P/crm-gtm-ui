"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Campaign } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChannelIcon } from "@/components/marketing/campaigns/campaign-shared";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_COLORS: Record<Campaign["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  running: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  paused: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

/** The date a campaign occupies on the calendar: schedule, last run, or completion. */
function campaignDates(campaign: Campaign): string[] {
  const dates = new Set<string>();
  if (campaign.scheduledAt) dates.add(campaign.scheduledAt.slice(0, 10));
  if (campaign.lastRunAt) dates.add(campaign.lastRunAt.slice(0, 10));
  return [...dates];
}

export function CampaignCalendarView({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }),
    [month]
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Campaign[]>();
    campaigns.forEach((c) => {
      campaignDates(c).forEach((d) => {
        if (!map.has(d)) map.set(d, []);
        map.get(d)!.push(c);
      });
    });
    return map;
  }, [campaigns]);

  const leadingBlanks = getDay(startOfMonth(month));

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{format(month, "MMMM yyyy")}</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="bg-muted/50 px-2 py-1.5 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} className="min-h-24 bg-background/60" />
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const items = byDate.get(key) ?? [];
            const today = format(new Date(), "yyyy-MM-dd") === key;
            return (
              <div
                key={key}
                className={cn(
                  "min-h-24 bg-background p-1.5",
                  !isSameMonth(day, month) && "opacity-40"
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-5 items-center justify-center rounded-full text-xs",
                    today
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {items.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => router.push(`/marketing/campaigns/${c.id}`)}
                      className={cn(
                        "flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-xs font-medium hover:opacity-80",
                        STATUS_COLORS[c.status]
                      )}
                      title={`${c.name} — ${c.status}`}
                    >
                      <ChannelIcon channel={c.channel} className="size-3 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {(Object.keys(STATUS_COLORS) as Campaign["status"][]).map((s) => (
            <span key={s} className="flex items-center gap-1.5 capitalize">
              <span className={cn("size-2.5 rounded-full", STATUS_COLORS[s].split(" ")[0])} />
              {s}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
