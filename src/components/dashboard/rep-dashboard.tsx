"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Mail,
  MessageCircle,
  PenLine,
  Phone,
  Sparkles,
  Target,
} from "lucide-react";
import { useOpenRecord } from "@/hooks/use-open-record";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { REP_DASHBOARD_DATA } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import { CURRENT_REP } from "@/lib/stores/view-level-store";
import type { RepActionItem, RepTimeframe } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIORITY_VARIANT = {
  low: "secondary" as const,
  medium: "outline" as const,
  high: "default" as const,
  urgent: "destructive" as const,
};

const ACTION_ICONS: Record<RepActionItem["type"], typeof Phone> = {
  overdue_followup: Phone,
  hot_lead: Target,
  sla_breach: Target,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  esign: PenLine,
  inbox: MessageCircle,
};

const TIMEFRAME_LABELS: Record<RepTimeframe, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
};

function ActionRow({
  item,
  onOpen,
}: {
  item: RepActionItem;
  onOpen: (id: string) => void;
}) {
  const Icon = ACTION_ICONS[item.type] ?? Phone;

  return (
    <TableRow>
      <TableCell>
        <Badge variant={PRIORITY_VARIANT[item.priority]} className="capitalize">
          {item.priority}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-2">
          <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.contactName}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatRelative(item.dueAt)}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{item.suggestedAction}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onOpen(item.contactId)}>
          Open
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function RepDashboard() {
  const [timeframe, setTimeframe] = useState<RepTimeframe>("today");
  const [todayLabel, setTodayLabel] = useState("");
  const openRecord = useOpenRecord();

  const period = REP_DASHBOARD_DATA[timeframe];

  useEffect(() => {
    setTodayLabel(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    );
  }, []);

  const openContact = openRecord;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good morning, ${CURRENT_REP.name.split(" ")[0]}`}
        description={
          todayLabel
            ? `${todayLabel} · ${period.headline}`
            : period.headline
        }
        actions={
          <div className="flex gap-2">
            <ButtonLink href="/marketing/inbox" variant="outline" size="sm">
              <MessageCircle className="mr-2 size-4" />
              Inbox
            </ButtonLink>
            <ButtonLink href="/work-queue" variant="outline" size="sm">
              Full queue
            </ButtonLink>
          </div>
        }
      />

      <Card className="border-primary/20 bg-muted/30 shadow-none">
        <CardContent className="flex gap-3 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Where to focus</p>
            <p className="mt-1 text-sm text-muted-foreground">{period.focus}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={timeframe}
        onValueChange={(v) => setTimeframe(v as RepTimeframe)}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This week</TabsTrigger>
          <TabsTrigger value="month">This month</TabsTrigger>
        </TabsList>

        {(["today", "week", "month"] as const).map((tf) => {
          const data = REP_DASHBOARD_DATA[tf];
          return (
            <TabsContent key={tf} value={tf} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.stats.map((stat) => (
                  <StatCard
                    key={stat.id}
                    title={stat.label}
                    value={stat.value}
                    subtitle={stat.hint}
                    trend={
                      stat.trend
                        ? { value: stat.trend, positive: stat.positive ?? false }
                        : undefined
                    }
                  />
                ))}
              </div>

              {data.goals && data.goals.length > 0 && (
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {TIMEFRAME_LABELS[tf]} goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-3">
                    {data.goals.map((goal) => {
                      const pct = Math.min(
                        100,
                        Math.round((goal.current / goal.target) * 100)
                      );
                      return (
                        <div key={goal.label} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{goal.label}</span>
                            <span className="tabular-nums text-muted-foreground">
                              {goal.current}/{goal.target}
                            </span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    Priority actions — {TIMEFRAME_LABELS[tf].toLowerCase()}
                  </CardTitle>
                  {tf === "today" && (
                    <Link
                      href="/work-queue"
                      className={cn(
                        "text-sm text-muted-foreground underline-offset-4 hover:underline"
                      )}
                    >
                      View all tasks
                    </Link>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Next step</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.actions.map((item) => (
                        <ActionRow
                          key={item.id}
                          item={item}
                          onOpen={openContact}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
