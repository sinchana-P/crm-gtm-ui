"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { Gauge, SlidersHorizontal, TrendingDown, UserMinus } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
import {
  UNSUB_BY_CAMPAIGN,
  UNSUB_BY_TOPIC,
  UNSUB_KPIS,
  UNSUB_RATE_TREND,
  UNSUB_REASONS,
  type UnsubByCampaign,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const rateConfig: ChartConfig = {
  rate: { label: "Unsub rate %", color: "var(--chart-1)" },
};

const STATUS_STYLES: Record<UnsubByCampaign["status"], string> = {
  healthy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  watch: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  high: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function UnsubscribeRates() {
  const [range, setRange] = useState("8w");
  const rateDelta = UNSUB_KPIS.rate30d - UNSUB_KPIS.ratePrev;
  const belowBenchmark = UNSUB_KPIS.rate30d < UNSUB_KPIS.benchmark;
  const campaigns = [...UNSUB_BY_CAMPAIGN].sort((a, b) => b.rate - a.rate);
  const maxTopic = Math.max(...UNSUB_BY_TOPIC.map((t) => t.optOuts), 1);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Unsubscribe rate (30d)"
          value={`${UNSUB_KPIS.rate30d}%`}
          subtitle={`Benchmark ${UNSUB_KPIS.benchmark}%`}
          icon={UserMinus}
          trend={{
            value: `${rateDelta <= 0 ? "" : "+"}${rateDelta.toFixed(2)} pts vs prev.`,
            positive: rateDelta <= 0,
          }}
        />
        <StatCard
          title="vs. industry benchmark"
          value={belowBenchmark ? "Below avg" : "Above avg"}
          subtitle={`${Math.abs(((UNSUB_KPIS.rate30d - UNSUB_KPIS.benchmark) / UNSUB_KPIS.benchmark) * 100).toFixed(0)}% ${belowBenchmark ? "lower" : "higher"}`}
          icon={Gauge}
          trend={{ value: belowBenchmark ? "Healthy" : "Needs attention", positive: belowBenchmark }}
        />
        <StatCard
          title="Total unsubscribes"
          value={UNSUB_KPIS.totalUnsubs30d.toLocaleString()}
          subtitle={`${UNSUB_KPIS.optDowns} chose “manage preferences”`}
          icon={TrendingDown}
        />
        <StatCard
          title="Net list growth"
          value={`+${UNSUB_KPIS.listGrowthNet}%`}
          subtitle="Opt-ins minus opt-outs"
          icon={SlidersHorizontal}
          trend={{ value: "Growing", positive: true }}
        />
      </div>

      {/* Rate trend */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base">Unsubscribe rate over time</CardTitle>
            <CardDescription>
              Rate per send, with the industry benchmark ({UNSUB_KPIS.benchmark}%) marked.
            </CardDescription>
          </div>
          <Select value={range} onValueChange={(v) => setRange(v ?? "8w")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4w">Last 4 weeks</SelectItem>
              <SelectItem value="8w">Last 8 weeks</SelectItem>
              <SelectItem value="12w">Last 12 weeks</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ChartContainer config={rateConfig} className="h-[240px] w-full">
            <AreaChart data={UNSUB_RATE_TREND} margin={{ left: 4, right: 4, top: 4 }}>
              <defs>
                <linearGradient id="fill-rate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-rate)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-rate)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 0.5]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine
                y={UNSUB_KPIS.benchmark}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="var(--color-rate)"
                fill="url(#fill-rate)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* By campaign */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Unsubscribe rate by campaign</CardTitle>
          <CardDescription>Recent sends ranked by unsubscribe rate — spot fatigue early.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="hidden sm:table-cell">Sent</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead className="text-right">Unsubs</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.campaign}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {formatDate(c.sentAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {c.delivered.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{c.unsubs}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{c.rate}%</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={cn("border-0 capitalize", STATUS_STYLES[c.status])}>
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Topic + reasons */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Opt-outs by topic</CardTitle>
            <CardDescription>Which subscription topics drive the most opt-outs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {UNSUB_BY_TOPIC.map((t) => (
              <div key={t.topic} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{t.topic}</span>
                  <span className="flex items-center gap-3">
                    <span className="tabular-nums text-muted-foreground">{t.rate}%</span>
                    <span className="tabular-nums font-medium">{t.optOuts}</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(t.optOuts / maxTopic) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Why people unsubscribe</CardTitle>
            <CardDescription>Captured on the unsubscribe confirmation page (last 30 days).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {UNSUB_REASONS.map((r) => (
              <div key={r.reason} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{r.reason}</span>
                  <span className="flex items-center gap-3">
                    <span className="tabular-nums text-muted-foreground">{r.pct}%</span>
                    <span className="tabular-nums font-medium">{r.count}</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/70"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
