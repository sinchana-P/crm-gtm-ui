"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { MailOpen, MousePointerClick, UserMinus } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  REPORT_BY_CAMPAIGN,
  REPORT_KPIS,
  REPORT_TREND,
  UNSUB_REASONS_BREAKDOWN,
  type ReportCampaignRow,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const engageConfig: ChartConfig = {
  open: { label: "Open rate %", color: "var(--chart-1)" },
  click: { label: "Click rate %", color: "var(--chart-2)" },
};
const unsubConfig: ChartConfig = { unsub: { label: "Unsub rate %", color: "var(--chart-4)" } };

const STATUS_STYLES: Record<ReportCampaignRow["unsubStatus"], string> = {
  healthy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  watch: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  high: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function ReportingTab() {
  const [range, setRange] = useState("8w");
  const k = REPORT_KPIS;
  const maxReason = Math.max(...UNSUB_REASONS_BREAKDOWN.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Open, click-through, and unsubscribe performance across all sends.</p>
        <Select value={range} onValueChange={(v) => setRange(v ?? "8w")}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="4w">Last 4 weeks</SelectItem>
            <SelectItem value="8w">Last 8 weeks</SelectItem>
            <SelectItem value="12w">Last 12 weeks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Open rate" value={`${k.openRate}%`} subtitle={`Benchmark ${k.openBenchmark}%`} icon={MailOpen} trend={{ value: `+${k.openDelta} pts`, positive: true }} />
        <StatCard title="Click-through rate" value={`${k.clickRate}%`} subtitle={`Benchmark ${k.clickBenchmark}%`} icon={MousePointerClick} trend={{ value: `+${k.clickDelta} pts`, positive: true }} />
        <StatCard title="Unsubscribe rate" value={`${k.unsubRate}%`} subtitle={`Benchmark ${k.unsubBenchmark}%`} icon={UserMinus} trend={{ value: `${k.unsubDelta} pts`, positive: k.unsubDelta <= 0 }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Open &amp; click rate over time</CardTitle>
            <CardDescription>Engagement trend per send.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={engageConfig} className="h-[220px] w-full">
              <LineChart data={REPORT_TREND} margin={{ left: 4, right: 4, top: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={36} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="open" stroke="var(--color-open)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="click" stroke="var(--color-click)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Unsubscribe rate</CardTitle>
            <CardDescription>vs. benchmark ({k.unsubBenchmark}%).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={unsubConfig} className="h-[220px] w-full">
              <AreaChart data={REPORT_TREND} margin={{ left: 4, right: 4, top: 4 }}>
                <defs>
                  <linearGradient id="fill-unsub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-unsub)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-unsub)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={40} domain={[0, 0.5]} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine y={k.unsubBenchmark} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="unsub" stroke="var(--color-unsub)" fill="url(#fill-unsub)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">By campaign</CardTitle>
          <CardDescription>Open, click, and unsubscribe rate for recent sends.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="hidden sm:table-cell">Sent</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead className="text-right">Open</TableHead>
                <TableHead className="text-right">Click</TableHead>
                <TableHead className="text-right">Unsub</TableHead>
                <TableHead className="text-right">Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {REPORT_BY_CAMPAIGN.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.campaign}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">{formatDate(r.sentAt)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{r.sent.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.openRate}%</TableCell>
                  <TableCell className="text-right tabular-nums">{r.clickRate}%</TableCell>
                  <TableCell className="text-right tabular-nums">{r.unsubRate}%</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={cn("border-0 capitalize", STATUS_STYLES[r.unsubStatus])}>
                      {r.unsubStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Why people unsubscribe</CardTitle>
          <CardDescription>Captured on the unsubscribe confirmation page (last 30 days).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {UNSUB_REASONS_BREAKDOWN.map((r) => (
            <div key={r.reason} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>{r.reason}</span>
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-muted-foreground">{r.pct}%</span>
                  <span className="w-8 text-right font-medium tabular-nums">{r.count}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground/70" style={{ width: `${(r.count / maxReason) * 100}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
