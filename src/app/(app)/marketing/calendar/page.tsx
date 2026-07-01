"use client";

import { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Mail, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_CALENDAR_EVENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function CampaignCalendarPage() {
  const [month, setMonth] = useState(new Date(2026, 5, 1));

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof MOCK_CALENDAR_EVENTS>();
    MOCK_CALENDAR_EVENTS.forEach((e) => {
      const key = e.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign Calendar"
        description="Scheduled campaigns and sequence steps across the month."
      />

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{format(month, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: days[0].getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-24 bg-background" />
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const events = eventsByDate.get(key) ?? [];
              const today = isSameDay(day, new Date(2026, 5, 24));

              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-24 bg-background p-2",
                    today && "ring-2 ring-inset ring-primary/30"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      today && "text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {events.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-start gap-1 rounded border px-1.5 py-1 text-[10px] leading-tight"
                      >
                        {e.channel === "email" ? (
                          <Mail className="mt-0.5 size-3 shrink-0" />
                        ) : (
                          <MessageCircle className="mt-0.5 size-3 shrink-0" />
                        )}
                        <span className="line-clamp-2">{e.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <Badge variant="outline">Campaign</Badge>
            <Badge variant="secondary">Sequence step</Badge>
            <span className="flex items-center gap-1">
              <Mail className="size-3.5" /> Email
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" /> WhatsApp
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
