"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  Link2,
  Link2Off,
  RefreshCw,
  Search,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
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
import { EmptyState } from "@/components/shared/empty-state";
import { ShareFormDialog } from "@/components/marketing/analytics/share-form-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FORM_UTM_BY_SOURCE,
  FORM_UTM_SUBMISSIONS,
  FORM_UTM_SUMMARY,
  FORM_UTM_TREND,
  type FormUtmSubmission,
} from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const trendConfig: ChartConfig = {
  utm: { label: "With UTM", color: "var(--chart-1)" },
  direct: { label: "Direct / no UTM", color: "var(--muted-foreground)" },
};

type CoverageFilter = "all" | "utm" | "direct";

export function FormUtmDashboard() {
  const s = FORM_UTM_SUMMARY;
  const [range, setRange] = useState("30d");
  const [filter, setFilter] = useState<CoverageFilter>("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<FormUtmSubmission | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const utmPct = Math.round((s.withUtm / s.totalLeads) * 100);
  const directPct = 100 - utmPct;
  const maxSource = Math.max(...FORM_UTM_BY_SOURCE.map((r) => r.leads), 1);
  // Rank real sources most→least; pin the "Direct / none" bucket last (it isn't
  // a source, so it never earns the "Most leads" / "Fewest" badge).
  const trackedSorted = FORM_UTM_BY_SOURCE.filter((r) => !r.direct).sort(
    (a, b) => b.leads - a.leads
  );
  const directRow = FORM_UTM_BY_SOURCE.find((r) => r.direct);
  const rankedSources = [...trackedSorted, ...(directRow ? [directRow] : [])];
  const topKey = trackedSorted[0]?.key;
  const lowKey = trackedSorted[trackedSorted.length - 1]?.key;

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return FORM_UTM_SUBMISSIONS.filter((r) => {
      if (filter === "utm" && !r.source) return false;
      if (filter === "direct" && r.source) return false;
      if (q && !`${r.email} ${r.name} ${r.source ?? "direct"} ${r.campaign ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [filter, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${s.formName} — UTM Analytics`}
        description="Which sources brought leads to this form — and how many arrived with no UTM at all."
        actions={
          <div className="flex items-center gap-2">
            <ButtonLink href="/marketing/forms" variant="outline">
              <ArrowLeft className="size-4" /> Back to forms
            </ButtonLink>
            <Select value={range} onValueChange={(v) => setRange(v ?? "30d")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => toast.success("Refreshed")}>
              <RefreshCw className="size-4" />
            </Button>
            <Button onClick={() => setShareOpen(true)}>
              <Share2 className="size-4" /> Share &amp; get link
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 text-sm">
        <Badge variant="outline" className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          Published
        </Badge>
        <span className="text-muted-foreground">
          {s.views.toLocaleString()} views · {s.submissions} submissions · {s.submissionRate}% submission rate
        </span>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total leads" value={s.totalLeads} subtitle="From this form" icon={Users} />
        <StatCard
          title="With UTMs"
          value={`${s.withUtm}`}
          subtitle={`${utmPct}% of leads · tracked source`}
          icon={Link2}
          trend={{ value: "Attributed", positive: true }}
        />
        <StatCard
          title="Direct / no UTM"
          value={`${s.withoutUtm}`}
          subtitle={`${directPct}% arrived on the bare URL`}
          icon={Link2Off}
          trend={{ value: "Unattributed", positive: false }}
        />
        <StatCard title="Top source" value={s.topSource} subtitle={`${s.topSourceLeads} leads`} icon={TrendingUp} />
      </div>

      {/* Attribution coverage + trend */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Attribution coverage</CardTitle>
            <CardDescription>Leads with a UTM source vs. those that came direct.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-4 overflow-hidden rounded-full">
              <div
                className="bg-primary"
                style={{ width: `${utmPct}%` }}
                title={`With UTM ${utmPct}%`}
              />
              <div
                className="bg-muted-foreground/40"
                style={{ width: `${directPct}%` }}
                title={`Direct ${directPct}%`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Link2 className="size-3.5" /> With UTMs
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{s.withUtm}</p>
                <p className="text-xs text-muted-foreground">{utmPct}% of leads</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Link2Off className="size-3.5" /> Direct / no UTM
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{s.withoutUtm}</p>
                <p className="text-xs text-muted-foreground">{directPct}% of leads</p>
              </div>
            </div>
            <p className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
              Tip: tag every link that points to this form so more leads land in a known source instead of “Direct.”
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Submissions over time</CardTitle>
            <CardDescription>UTM-tagged vs. direct submissions by day.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="h-[220px] w-full">
              <BarChart data={FORM_UTM_TREND} margin={{ left: 4, right: 4, top: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="utm" stackId="a" fill="var(--color-utm)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="direct" stackId="a" fill="var(--color-direct)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leads by source — ranked most → least */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Leads by UTM source</CardTitle>
          <CardDescription>Ranked most to least. “Direct / none” groups leads that arrived with no UTM.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rankedSources.map((r) => {
            const isTop = r.key === topKey;
            const isLowest = r.key === lowKey;
            return (
              <div key={r.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    {r.direct ? (
                      <Link2Off className="size-3.5 text-muted-foreground" />
                    ) : (
                      <Link2 className="size-3.5 text-muted-foreground" />
                    )}
                    {r.source}
                    {!r.direct && (
                      <Badge variant="outline" className="border-0 bg-muted text-xs text-muted-foreground">
                        {r.medium}
                      </Badge>
                    )}
                    {isTop && (
                      <Badge variant="outline" className="border-0 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-400">
                        Most leads
                      </Badge>
                    )}
                    {isLowest && !r.direct && (
                      <Badge variant="outline" className="border-0 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400">
                        Fewest
                      </Badge>
                    )}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="tabular-nums text-muted-foreground">{r.pct}%</span>
                    <span className="w-8 text-right font-medium tabular-nums">{r.leads}</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", r.direct ? "bg-muted-foreground/40" : "bg-primary")}
                    style={{ width: `${(r.leads / maxSource) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Submissions table */}
      <Card className="shadow-none">
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Submissions</CardTitle>
            <CardDescription>Every lead this form captured and where it came from.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={filter} onValueChange={(v) => setFilter((v as CoverageFilter) ?? "all")}>
              <TabsList>
                <TabsTrigger value="all">All ({FORM_UTM_SUBMISSIONS.length})</TabsTrigger>
                <TabsTrigger value="utm">With UTM</TabsTrigger>
                <TabsTrigger value="direct">Direct</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative sm:w-64">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search email, source…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Link2Off}
                title="No submissions match"
                description="Try a different filter or clear the search."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Source / Medium</TableHead>
                  <TableHead className="hidden md:table-cell">Campaign</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setActive(r)}>
                    <TableCell>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </TableCell>
                    <TableCell>
                      {r.source ? (
                        <span className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="capitalize">{r.source}</Badge>
                          <span className="text-muted-foreground">/</span>
                          <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
                            {r.medium}
                          </Badge>
                        </span>
                      ) : (
                        <Badge variant="outline" className="border-0 bg-muted-foreground/10 text-muted-foreground">
                          <Link2Off className="mr-1 size-3" /> Direct
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                      {r.campaign ?? "—"}
                    </TableCell>
                    <TableCell className="hidden text-right text-xs text-muted-foreground lg:table-cell">
                      {formatDateTime(r.submittedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Lead detail drawer */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="sm:max-w-md">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle>{active.name}</SheetTitle>
                <SheetDescription>{active.email}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-6">
                {!active.source && (
                  <div className="flex items-center gap-2 rounded-lg border border-muted-foreground/20 bg-muted/40 p-3 text-sm">
                    <Link2Off className="size-4 text-muted-foreground" />
                    <span>Direct visit — arrived on the bare form URL with no UTM parameters.</span>
                  </div>
                )}
                <dl className="grid grid-cols-3 gap-x-3 gap-y-3 text-sm">
                  {[
                    ["Source", active.source],
                    ["Medium", active.medium],
                    ["Campaign", active.campaign],
                    ["Content", active.content],
                    ["Term", active.term],
                    ["Referrer", active.referrer],
                  ].map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="col-span-2 font-medium break-words">
                        {value ?? <span className="text-muted-foreground">—</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Landing URL</p>
                  <code className="block rounded-md bg-muted p-2 text-xs break-all">{active.landingUrl}</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDateTime(active.submittedAt)}
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ShareFormDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        formName={s.formName}
        baseUrl="https://forms.connectcrm.in/f/connect-with-tag"
      />
    </div>
  );
}
