"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Eye,
  Lightbulb,
  Link2,
  Link2Off,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  getSourceMeta,
  type FormUtmData,
  type FormUtmSubmission,
} from "@/lib/mock-data";
import {
  buildSourceShare,
  totalViews,
  type UtmDimension,
} from "@/lib/marketing/utm-analytics";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";
import { SubmissionSheet } from "./submission-sheet";
import { UtmBreakdownTable } from "./utm-breakdown-table";

type RangeKey = "7d" | "30d" | "90d" | "all";

const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30, "90d": 90, all: 9999 };

const trendConfig: ChartConfig = {
  utm: { label: "Tagged", color: "var(--chart-1)" },
  direct: { label: "Direct / untracked", color: "var(--muted-foreground)" },
};

function pctDelta(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

interface KpiProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  spark: number[];
  sparkColor?: string;
  delta: number | null;
  deltaGood?: boolean;
  compare: boolean;
}

function KpiCard({ title, value, subtitle, icon: Icon, spark, sparkColor, delta, deltaGood = true, compare }: KpiProps) {
  const showDelta = compare && delta != null;
  const up = (delta ?? 0) >= 0;
  const good = up ? deltaGood : !deltaGood;
  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          <Sparkline data={spark} color={sparkColor} />
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          {showDelta && (
            <span
              className={cn(
                "flex items-center gap-0.5 rounded px-1 py-0.5 font-medium",
                delta === 0
                  ? "bg-muted text-muted-foreground"
                  : good
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
              )}
            >
              {delta !== 0 && (up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />)}
              {Math.abs(delta ?? 0)}%
            </span>
          )}
          <span className="text-muted-foreground">{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface Props {
  data: FormUtmData;
}

export function FormUtmDashboard({ data }: Props) {
  const [range, setRange] = useState<RangeKey>("30d");
  const [dimension, setDimension] = useState<UtmDimension>("source");
  const [compare, setCompare] = useState(false);
  const [active, setActive] = useState<FormUtmSubmission | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);

  const scoped = useMemo(() => {
    if (range === "all") return data.submissions;
    const maxTime = Math.max(...data.submissions.map((s) => new Date(s.submittedAt).getTime()));
    const cutoff = maxTime - RANGE_DAYS[range] * 86_400_000;
    return data.submissions.filter((s) => new Date(s.submittedAt).getTime() >= cutoff);
  }, [data.submissions, range]);

  const share = useMemo(() => buildSourceShare(scoped), [scoped]);
  const shareTotal = scoped.length || 1;

  const kpis = useMemo(() => {
    const views = totalViews(scoped);
    const submissions = scoped.length;
    const withUtm = scoped.filter((s) => s.source).length;
    const convRate = views > 0 ? Math.round((submissions / views) * 1000) / 10 : 0;
    const utmPct = submissions ? Math.round((withUtm / submissions) * 100) : 0;

    const asc = [...scoped].sort((a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt));
    const mid = Math.floor(asc.length / 2);
    const earlier = asc.slice(0, mid);
    const recent = asc.slice(mid);
    const d = (fn: (x: FormUtmSubmission[]) => number) => pctDelta(fn(recent), fn(earlier));

    return {
      views,
      submissions,
      withUtm,
      utmPct,
      convRate,
      dViews: d((x) => totalViews(x)),
      dSubs: d((x) => x.length),
      dConv: d((x) => { const v = totalViews(x); return v ? (x.length / v) * 100 : 0; }),
      dWithUtm: d((x) => x.filter((s) => s.source).length),
    };
  }, [scoped]);

  // Clean KPI sparklines derived from the daily trend (not noisy per-row buckets).
  const sparks = useMemo(() => {
    const subs = data.trend.map((t) => t.utm + t.direct);
    return {
      visits: subs.map((n) => n * 5),
      subs,
      conv: subs,
      attributed: data.trend.map((t) => t.utm),
    };
  }, [data.trend]);

  const donutConfig = useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = {};
    share.forEach((s) => { cfg[s.source] = { label: s.label, color: s.color }; });
    return cfg;
  }, [share]);

  const insight = useMemo(() => {
    const top = share.find((s) => s.source !== "direct");
    const direct = share.find((s) => s.source === "direct");
    if (!top) return null;
    const topPct = Math.round((top.submissions / shareTotal) * 100);
    const directPct = direct ? Math.round((direct.submissions / shareTotal) * 100) : 0;
    return { topLabel: top.label, topSubs: top.submissions, topPct, directSubs: direct?.submissions ?? 0, directPct };
  }, [share, shareTotal]);

  const sourceSubs = useMemo(
    () => (activeSource ? scoped.filter((s) => (s.source ?? "direct") === activeSource) : []),
    [activeSource, scoped]
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={(v) => setRange((v as RangeKey) ?? "30d")}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
            <Switch checked={compare} onCheckedChange={setCompare} />
            Compare to previous
          </label>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline"><Download className="size-4" /> Export</Button>} />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.success("Exporting breakdown (CSV)")}>Export breakdown (CSV)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Exporting respondents (CSV)")}>Export respondents (CSV)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Insight line */}
      {insight && (
        <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3 text-sm">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{insight.topLabel}</span> is your top source —{" "}
            {insight.topSubs} submission{insight.topSubs === 1 ? "" : "s"} ({insight.topPct}%).
            {insight.directSubs > 0 && (
              <>
                {" "}
                <span className="font-medium text-foreground">{insight.directSubs} ({insight.directPct}%)</span> arrived
                with no UTM — tag those links to attribute them.
              </>
            )}
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Visits" value={kpis.views.toLocaleString()} subtitle="From tagged links" icon={Eye} spark={sparks.visits} delta={kpis.dViews} compare={compare} />
        <KpiCard title="Submissions" value={kpis.submissions} subtitle="Leads captured" icon={CheckCircle2} sparkColor="var(--chart-2)" spark={sparks.subs} delta={kpis.dSubs} compare={compare} />
        <KpiCard title="Conversion rate" value={`${kpis.convRate}%`} subtitle="Submissions ÷ visits" icon={Percent} sparkColor="var(--chart-3)" spark={sparks.conv} delta={kpis.dConv} compare={compare} />
        <KpiCard title="Attributed" value={`${kpis.utmPct}%`} subtitle={`${kpis.withUtm} of ${kpis.submissions} tagged`} icon={Link2} sparkColor="var(--chart-4)" spark={sparks.attributed} delta={kpis.dWithUtm} compare={compare} />
      </div>

      {/* Trend + composition */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-none lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Submissions over time</CardTitle>
            <CardDescription>Tagged vs. untracked submissions by day.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="h-[240px] w-full">
              <BarChart data={data.trend} margin={{ left: 4, right: 4, top: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="utm" stackId="a" fill="var(--color-utm)" />
                <Bar dataKey="direct" stackId="a" fill="var(--color-direct)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Submissions by source</CardTitle>
            <CardDescription>Click a source to drill in.</CardDescription>
          </CardHeader>
          <CardContent>
            {share.length ? (
              <div className="flex items-center gap-4">
                <ChartContainer config={donutConfig} className="aspect-square h-[150px] shrink-0">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
                    <Pie data={share} dataKey="submissions" nameKey="label" innerRadius={42} strokeWidth={2}>
                      {share.map((s) => (
                        <Cell key={s.source} fill={s.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex-1 space-y-1.5">
                  {share.map((s) => (
                    <button
                      key={s.source}
                      type="button"
                      onClick={() => setActiveSource(s.source)}
                      className="flex w-full items-center justify-between gap-2 rounded px-1.5 py-1 text-sm transition-colors hover:bg-muted/60"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="truncate">{s.label}</span>
                      </span>
                      <span className="shrink-0 tabular-nums">
                        <span className="font-medium">{s.submissions}</span>
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {Math.round((s.submissions / shareTotal) * 100)}%
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState icon={Link2Off} title="No source data" description="No submissions in range." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance table (hero) */}
      <Card className="shadow-none">
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Channel performance</CardTitle>
            <CardDescription>Expand a row to drill from source into medium and campaign.</CardDescription>
          </div>
          <Tabs value={dimension} onValueChange={(v) => setDimension((v as UtmDimension) ?? "source")}>
            <TabsList>
              <TabsTrigger value="source">Source</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="campaign">Campaign</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <UtmBreakdownTable submissions={scoped} dimension={dimension} />
        </CardContent>
      </Card>

      <SubmissionSheet submission={active} onClose={() => setActive(null)} />

      <SourceSheet
        source={activeSource}
        submissions={sourceSubs}
        onClose={() => setActiveSource(null)}
        onSelectSubmission={(s) => { setActiveSource(null); setActive(s); }}
      />
    </div>
  );
}

function SourceSheet({
  source,
  submissions,
  onClose,
  onSelectSubmission,
}: {
  source: string | null;
  submissions: FormUtmSubmission[];
  onClose: () => void;
  onSelectSubmission: (s: FormUtmSubmission) => void;
}) {
  const meta = getSourceMeta(source === "direct" ? null : source);
  const views = totalViews(submissions);
  const convRate = views > 0 ? Math.round((submissions.length / views) * 1000) / 10 : 0;
  return (
    <Sheet open={!!source} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ backgroundColor: meta.chart }} />
            {meta.label}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto px-4 pb-6">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Visits" value={views} />
            <Stat label="Submissions" value={submissions.length} />
            <Stat label="Conv. rate" value={`${convRate}%`} />
          </div>
          <div className="space-y-1">
            {submissions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSubmission(s)}
                className="w-full rounded-md border p-2.5 text-left text-sm transition-colors hover:bg-muted/50"
              >
                <p className="font-medium">{s.email}</p>
                <p className="text-xs text-muted-foreground">{s.campaign ?? "—"} · {formatDateTime(s.submittedAt)}</p>
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
