"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  CheckCheck,
  FlaskConical,
  Link2,
  Mail,
  MousePointerClick,
  Send,
  Target,
  UserMinus,
} from "lucide-react";
import { format } from "date-fns";
import type { Campaign } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { MOCK_CAMPAIGN_DAILY_STATS } from "@/lib/mock-data";
import {
  GOAL_METRIC_LABELS,
  buildUtmUrl,
  rate,
} from "@/components/marketing/campaigns/campaign-shared";

const trendConfig = {
  opened: { label: "Opened", color: "var(--chart-1)" },
  clicked: { label: "Clicked", color: "var(--chart-2)" },
  converted: { label: "Converted", color: "var(--chart-3)" },
} satisfies ChartConfig;

const funnelConfig = {
  value: { label: "Recipients", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function CampaignOverviewTab({ campaign }: { campaign: Campaign }) {
  const daily = useMemo(
    () =>
      MOCK_CAMPAIGN_DAILY_STATS.filter((d) => d.campaignId === campaign.id).map((d) => ({
        ...d,
        label: format(new Date(d.date), "MMM d"),
      })),
    [campaign.id]
  );

  const funnel = [
    { stage: "Sent", value: campaign.sent },
    { stage: "Delivered", value: campaign.delivered },
    { stage: "Opened", value: campaign.opened },
    { stage: "Clicked", value: campaign.clicked },
    { stage: "Converted", value: campaign.converted },
  ];

  const kpis = [
    { label: "Sent", value: campaign.sent, icon: Send },
    { label: "Delivered", value: campaign.delivered, icon: CheckCheck, base: campaign.sent },
    { label: "Opened", value: campaign.opened, icon: Mail, base: campaign.sent },
    { label: "Clicked", value: campaign.clicked, icon: MousePointerClick, base: campaign.sent },
    { label: "Bounced", value: campaign.bounced, icon: AlertTriangle, base: campaign.sent, negative: true },
    { label: "Converted", value: campaign.converted, icon: Target, base: campaign.sent },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-none">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                <k.icon className="size-3.5 text-muted-foreground" />
              </div>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {k.value.toLocaleString()}
              </p>
              {k.base !== undefined && (
                <p
                  className={`text-xs ${k.negative ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {rate(k.value, k.base)}%
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Engagement over time</CardTitle>
          </CardHeader>
          <CardContent>
            {daily.length > 0 ? (
              <ChartContainer config={trendConfig} className="h-[240px] w-full">
                <LineChart data={daily}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="opened" stroke="var(--color-opened)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="clicked" stroke="var(--color-clicked)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="converted" stroke="var(--color-converted)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Engagement data will appear once the campaign starts sending.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Delivery funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={funnelConfig} className="h-[240px] w-full">
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-muted-foreground" />
              Goal progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaign.goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No goals configured. Add success metrics in Setup.
              </p>
            ) : (
              campaign.goals.map((g) => {
                const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
                return (
                  <div key={g.metric} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{GOAL_METRIC_LABELS[g.metric]}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {g.current.toLocaleString()} / {g.target.toLocaleString()}
                        {pct >= 100 && (
                          <Badge
                            variant="outline"
                            className="ml-2 border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          >
                            Achieved
                          </Badge>
                        )}
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="size-4 text-muted-foreground" />
              Conversion targets & UTM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaign.conversionTargets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No conversion endpoints linked to this campaign.
              </p>
            ) : (
              <div className="space-y-2">
                {campaign.conversionTargets.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.type === "form" ? "Form" : "Landing page"}
                        {t.url ? ` · ${t.url}` : ""}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {t.conversions.toLocaleString()}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        conversions
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-medium">UTM tracking</p>
              {campaign.utmEnabled && campaign.utm ? (
                <p className="mt-1 font-mono text-xs break-all text-muted-foreground">
                  {buildUtmUrl("https://connectnx.io", campaign.utm)}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Disabled — outbound links are not tagged.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {campaign.abTest?.enabled && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="size-4 text-muted-foreground" />
              A/B subject line test
              <span className="text-xs font-normal text-muted-foreground">
                Winner by{" "}
                {campaign.abTest.winnerCriteria === "open_rate" ? "open rate" : "click rate"} ·{" "}
                {campaign.abTest.samplePercent}% sample
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {campaign.abTest.variants.map((v) => (
                <div
                  key={v.id}
                  className={`rounded-lg border p-4 ${v.winner ? "border-emerald-500/50 bg-emerald-500/5" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{v.label}</p>
                    {v.winner && (
                      <Badge
                        variant="outline"
                        className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      >
                        Winner
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">“{v.subject}”</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="font-semibold tabular-nums">{v.sent.toLocaleString()}</p>
                      <p className="text-muted-foreground">Sent</p>
                    </div>
                    <div>
                      <p className="font-semibold tabular-nums">{rate(v.opened, v.sent)}%</p>
                      <p className="text-muted-foreground">Open rate</p>
                    </div>
                    <div>
                      <p className="font-semibold tabular-nums">{rate(v.clicked, v.sent)}%</p>
                      <p className="text-muted-foreground">Click rate</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <UserMinus className="size-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {campaign.unsubscribed.toLocaleString()} unsubscribed ·{" "}
                {campaign.bounced.toLocaleString()} bounced across both variants.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
