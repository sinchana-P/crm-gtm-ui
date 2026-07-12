"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  Clock,
  Copy,
  Eye,
  ExternalLink,
  FlaskConical,
  Globe,
  History,
  MousePointerClick,
  Pencil,
  Rocket,
  Trophy,
  Undo2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { LandingPage } from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, formatRelative } from "@/lib/format";
import { useLandingPageStore } from "@/lib/stores/landing-page-store";
import { LandingPageThumbnail } from "@/components/marketing/landing-pages/landing-page-thumbnail";
import {
  LandingStatusBadge,
  LandingTypeBadge,
  formatDuration,
} from "@/components/marketing/landing-pages/landing-shared";

const trendConfig = {
  views: { label: "Views", color: "var(--chart-1)" },
  submissions: { label: "Submissions", color: "var(--chart-2)" },
} satisfies ChartConfig;

const sourceConfig = { views: { label: "Views", color: "var(--chart-1)" } } satisfies ChartConfig;

export function LandingPageDetail({ pageId }: { pageId: string }) {
  const router = useRouter();
  const page = useLandingPageStore((s) => s.pages.find((p) => p.id === pageId));
  const duplicatePage = useLandingPageStore((s) => s.duplicatePage);
  const setStatus = useLandingPageStore((s) => s.setStatus);
  const endAbTest = useLandingPageStore((s) => s.endAbTest);
  const [tab, setTab] = useState("overview");

  if (!page) {
    return (
      <EmptyState
        title="Page not found"
        description="This landing page may have been deleted."
        action={<Button variant="outline" onClick={() => router.push("/marketing/landing-pages")}><ArrowLeft className="size-4" /> Back to pages</Button>}
      />
    );
  }

  const a = page.analytics;
  const liveUrl = `https://${page.domain}/${page.slug}`;
  const funnel = [
    { stage: "Visitors", value: a.views },
    { stage: "Engaged", value: Math.round(a.views * (1 - a.bounceRate / 100)) },
    { stage: "Started form", value: Math.round(a.submissions * 1.8) },
    { stage: "Submitted", value: a.submissions },
  ];

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/marketing/landing-pages")}><ArrowLeft className="size-4" /></Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{page.name}</h1>
              <LandingStatusBadge status={page.status} />
              {page.abTest?.enabled && <Badge variant="outline" className="border-0 bg-violet-500/10 text-violet-600"><FlaskConical className="size-3" /> A/B</Badge>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <LandingTypeBadge type={page.type} />
              <button className="flex items-center gap-1 font-mono text-xs hover:text-foreground" onClick={() => { navigator.clipboard?.writeText(liveUrl); toast.success("URL copied"); }}>
                <Globe className="size-3" /> {page.domain}/{page.slug} <Copy className="size-3" />
              </button>
              {page.scheduledFor && <span className="flex items-center gap-1 text-xs text-blue-600"><Clock className="size-3" /> Scheduled {formatRelative(page.scheduledFor)}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {page.status === "published" && <Button variant="outline" size="sm" onClick={() => window.open(liveUrl, "_blank")}><ExternalLink className="size-4" /> View live</Button>}
          <Button variant="outline" size="sm" onClick={() => { duplicatePage(page.id); toast.success("Page duplicated"); }}><Copy className="size-4" /> Duplicate</Button>
          {page.status === "published" ? (
            <Button variant="outline" size="sm" onClick={() => { setStatus(page.id, "unpublished"); toast.success("Page unpublished"); }}><Undo2 className="size-4" /> Unpublish</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => { setStatus(page.id, "published"); toast.success("Page published"); }}><Rocket className="size-4" /> Publish</Button>
          )}
          <Button size="sm" onClick={() => router.push(`/marketing/landing-pages/${page.id}/edit`)}><Pencil className="size-4" /> Edit</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v ?? "overview")}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          {page.abTest?.enabled && <TabsTrigger value="abtest">A/B test</TabsTrigger>}
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-5 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Views" value={a.views.toLocaleString()} icon={Eye} />
            <StatCard title="Unique visitors" value={a.uniqueVisitors.toLocaleString()} icon={Users} />
            <StatCard title="Submissions" value={a.submissions.toLocaleString()} icon={MousePointerClick} />
            <StatCard title="Conversion" value={`${a.conversionRate}%`} trend={{ value: "▲ vs. account avg", positive: true }} />
            <StatCard title="Avg. time" value={formatDuration(a.avgTimeSeconds)} subtitle={`${a.bounceRate}% bounce`} icon={Clock} />
          </div>

          {a.views > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-none">
                <CardHeader><CardTitle className="text-base">Views & submissions</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={trendConfig} className="h-[240px] w-full">
                    <AreaChart data={a.daily}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={40} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="views" stroke="var(--color-views)" fill="var(--color-views)" fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="submissions" stroke="var(--color-submissions)" fill="var(--color-submissions)" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardHeader><CardTitle className="text-base">Conversion funnel</CardTitle></CardHeader>
                <CardContent className="space-y-3 pt-2">
                  {funnel.map((f, i) => {
                    const pct = funnel[0].value > 0 ? Math.round((f.value / funnel[0].value) * 100) : 0;
                    return (
                      <div key={f.stage} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{f.stage}</span>
                          <span className="tabular-nums text-muted-foreground">{f.value.toLocaleString()} · {pct}%</span>
                        </div>
                        <Progress value={pct} className={i === funnel.length - 1 ? "[&>div]:bg-emerald-500" : undefined} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyState icon={Eye} title="No traffic yet" description="Analytics will appear here once this page is published and receiving visitors." />
          )}
        </TabsContent>

        {/* Traffic */}
        <TabsContent value="traffic" className="mt-5 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-none">
              <CardHeader><CardTitle className="text-base">Traffic sources</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Source</TableHead><TableHead className="text-right">Views</TableHead><TableHead className="text-right">Conv. rate</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {a.sources.map((s) => (
                      <TableRow key={s.source}>
                        <TableCell className="font-medium">{s.source}</TableCell>
                        <TableCell className="text-right tabular-nums">{s.views.toLocaleString()}</TableCell>
                        <TableCell className="text-right tabular-nums">{s.conversionRate.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader><CardTitle className="text-base">By source</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={sourceConfig} className="h-[240px] w-full">
                  <BarChart data={a.sources} layout="vertical">
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="source" tickLine={false} axisLine={false} width={90} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="views" fill="var(--color-views)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-none">
            <CardHeader><CardTitle className="text-base">Devices</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {a.devices.map((d) => (
                <div key={d.device} className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-semibold tabular-nums">{d.share}%</p>
                  <p className="text-xs capitalize text-muted-foreground">{d.device}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B test */}
        {page.abTest?.enabled && (
          <TabsContent value="abtest" className="mt-5 space-y-6">
            <AbTestPanel page={page} onEnd={(w) => { endAbTest(page.id, w); toast.success("Winner promoted"); }} />
          </TabsContent>
        )}

        {/* Submissions */}
        <TabsContent value="submissions" className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{a.submissions.toLocaleString()} total submissions</p>
            <Button variant="outline" size="sm" onClick={() => toast.success("Export started — you'll get a CSV by email")}>Export CSV</Button>
          </div>
          {a.submissionsList.length > 0 ? (
            <Card className="shadow-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Source</TableHead><TableHead>Device</TableHead><TableHead>Submitted</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {a.submissionsList.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.email}</TableCell>
                        <TableCell>{s.source}</TableCell>
                        <TableCell className="capitalize">{s.device}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDateTime(s.submittedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="No submissions yet" description="Form submissions from this page will show up here as leads come in." />
          )}
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="mt-5">
          <div className="rounded-xl border bg-muted/30 p-6">
            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
              <LandingPageThumbnail page={page} />
            </div>
          </div>
        </TabsContent>

        {/* Versions */}
        <TabsContent value="versions" className="mt-5">
          <Card className="shadow-none">
            <CardHeader><CardTitle className="text-base">Version history</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {(page.revisions ?? []).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-muted"><History className="size-4 text-muted-foreground" /></span>
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium">{r.label} {r.current && <Badge variant="outline" className="border-0 bg-emerald-500/10 text-[10px] text-emerald-600">Current</Badge>}</p>
                      <p className="text-xs text-muted-foreground">{r.author} · {formatDateTime(r.createdAt)}</p>
                    </div>
                  </div>
                  {!r.current && <Button variant="outline" size="sm" onClick={() => toast.success(`Restored “${r.label}”`)}><Undo2 className="size-4" /> Restore</Button>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AbTestPanel({ page, onEnd }: { page: LandingPage; onEnd: (winnerId?: string) => void }) {
  const test = page.abTest!;
  const variants = test.variants;
  const rateOf = (v: (typeof variants)[number]) => (v.views > 0 ? (v.conversions / v.views) * 100 : 0);
  const best = [...variants].sort((x, y) => rateOf(y) - rateOf(x))[0];
  const running = test.status === "running";

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium"><FlaskConical className="size-4 text-violet-500" /> A/B test {running ? "running" : "ended"}</p>
          <p className="text-xs text-muted-foreground">Goal: {test.goal.replace("_", " ")} · {variants.reduce((n, v) => n + v.views, 0).toLocaleString()} visitors tested</p>
        </div>
        {running && <Button size="sm" onClick={() => onEnd(best.id)}><Trophy className="size-4" /> Declare winner</Button>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {variants.map((v) => {
          const rate = rateOf(v);
          const isWinner = test.winnerVariantId === v.id || (!running && best.id === v.id);
          const isBest = best.id === v.id;
          return (
            <Card key={v.id} className={isBest ? "border-violet-300 shadow-none ring-1 ring-violet-200" : "shadow-none"}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{v.label}</CardTitle>
                <div className="flex items-center gap-1.5">
                  {v.isControl && <Badge variant="outline" className="text-[10px]">Control</Badge>}
                  {isWinner && <Badge variant="outline" className="border-0 bg-emerald-500/10 text-[10px] text-emerald-600"><Trophy className="size-2.5" /> Winner</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-semibold tabular-nums">{rate.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">conversion</span>
                </div>
                <Progress value={rate} className={isBest ? "[&>div]:bg-violet-500" : undefined} />
                <div className="flex items-center gap-4 border-t pt-2 text-xs text-muted-foreground tabular-nums">
                  <span>{v.weight}% traffic</span>
                  <span>{v.views.toLocaleString()} views</span>
                  <span>{v.conversions.toLocaleString()} conversions</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {running && (
        <p className="text-center text-xs text-muted-foreground">
          {best.label} is leading by {(rateOf(best) - rateOf(variants.find((v) => v.id !== best.id) ?? best)).toFixed(1)} points. Keep running for statistical confidence.
        </p>
      )}
    </>
  );
}
