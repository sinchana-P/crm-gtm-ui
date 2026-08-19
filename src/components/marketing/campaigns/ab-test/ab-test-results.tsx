"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ErrorBar,
  XAxis,
  YAxis,
} from "recharts";
import type { AbTestConfig, AbTestVariant, AbWinnerMetric } from "@/lib/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  WINNER_METRIC_LABELS,
  delivered,
  liftVsControl,
  metricParts,
  metricRate,
  pct,
  ratio,
  wilsonInterval,
} from "@/lib/ab-testing";
import {
  ControlBadge,
  LiftCell,
  RateCell,
  WinnerBadge,
} from "@/components/marketing/campaigns/ab-test/ab-test-shared";

/* ── results table ─────────────────────────────────────────────────────── */

/**
 * The primary artefact. The deciding metric is emphasised and every other
 * column is muted, so there is never ambiguity about which number decided the
 * outcome. Guardrail columns turn amber at 2x the control.
 */
export function VariantResultsTable({
  config,
  metric,
  live = false,
}: {
  config: AbTestConfig;
  metric: AbWinnerMetric;
  live?: boolean;
}) {
  const control = config.variants.find((v) => v.isControl) ?? config.variants[0];
  const columns: AbWinnerMetric[] = ["open_rate", "click_rate", "click_through_rate"];

  const controlUnsub = ratio(control.unsubscribed ?? 0, delivered(control));
  const controlBounce = ratio(control.bounced ?? 0, delivered(control));

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[220px]">Version</TableHead>
            <TableHead className="text-right">Recipients</TableHead>
            <TableHead className="text-right">Delivered</TableHead>
            {columns.map((c) => (
              <TableHead
                key={c}
                className={cn("text-right", c === metric && "text-foreground font-semibold")}
              >
                {WINNER_METRIC_LABELS[c]}
                {c === metric && <span className="ml-1 text-[10px] font-normal">(deciding)</span>}
              </TableHead>
            ))}
            <TableHead className="text-right">Unsub</TableHead>
            <TableHead className="text-right">Bounce</TableHead>
            <TableHead className="text-right">Lift vs A</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {config.variants.map((v) => {
            const isControl = v.id === control.id;
            const unsub = ratio(v.unsubscribed ?? 0, delivered(v));
            const bounce = ratio(v.bounced ?? 0, delivered(v));
            const unsubHot = !isControl && controlUnsub > 0 && unsub > controlUnsub * 2;
            const bounceHot = !isControl && controlBounce > 0 && bounce > controlBounce * 2;
            return (
              <TableRow
                key={v.id}
                className={cn(v.winner && !live && "bg-emerald-500/5")}
              >
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{v.name || v.label}</span>
                    {isControl && <ControlBadge />}
                    {v.winner && !live && <WinnerBadge />}
                    {v.archived && (
                      <span className="text-xs text-muted-foreground">archived</span>
                    )}
                  </div>
                  <p className="mt-0.5 max-w-[280px] truncate text-xs text-muted-foreground">
                    {`“${v.subject}”`}
                    {v.templateName ? ` · ${v.templateName}` : ""}
                    {v.senderName ? ` · from ${v.senderName}` : ""}
                  </p>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {(v.assigned ?? v.sent).toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {delivered(v).toLocaleString()}
                </TableCell>
                {columns.map((c) => (
                  <TableCell key={c} className="text-right">
                    <RateCell variant={v} metric={c} emphasised={c === metric} />
                  </TableCell>
                ))}
                <TableCell
                  className={cn(
                    "text-right tabular-nums",
                    unsubHot ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                  )}
                >
                  {pct(unsub, 2)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums",
                    bounceHot ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                  )}
                >
                  {pct(bounce, 2)}
                </TableCell>
                <TableCell className="text-right">
                  <LiftCell lift={isControl ? null : liftVsControl(v, control, metric)} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ── bar chart with confidence intervals ──────────────────────────────── */

/**
 * Overlapping confidence intervals communicate "not significant" better than
 * any p-value, which is why the whiskers matter more than the bars.
 */
export function MetricComparisonChart({
  variants,
  metric,
}: {
  variants: AbTestVariant[];
  metric: AbWinnerMetric;
}) {
  const data = useMemo(
    () =>
      variants.map((v) => {
        const { num, den } = metricParts(v, metric);
        const ci = wilsonInterval(num, den);
        const rate = metricRate(v, metric) * 100;
        return {
          label: (v.name || v.label).replace("Version ", ""),
          rate: Number(rate.toFixed(2)),
          // ErrorBar takes [distance below, distance above]
          error: [
            Number((rate - ci.lower * 100).toFixed(2)),
            Number((ci.upper * 100 - rate).toFixed(2)),
          ] as [number, number],
          winner: !!v.winner,
        };
      }),
    [variants, metric]
  );

  const config: ChartConfig = {
    rate: { label: WINNER_METRIC_LABELS[metric], color: "var(--chart-1)" },
  };

  return (
    <div>
      <ChartContainer config={config} className="h-[220px] w-full">
        <BarChart data={data} margin={{ left: 4, right: 12, top: 12 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} interval={0} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={42}
            fontSize={11}
            tickFormatter={(v) => `${v}%`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="rate" fill="var(--color-rate)" radius={4}>
            <ErrorBar dataKey="error" width={6} strokeWidth={1.5} stroke="var(--muted-foreground)" />
          </Bar>
        </BarChart>
      </ChartContainer>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Whiskers show the 95% confidence range. Where they overlap, the difference may be chance.
      </p>
    </div>
  );
}

/* ── funnel ────────────────────────────────────────────────────────────── */

/** Shows where a version won or lost, not just that it did. */
export function VariantFunnel({ variants }: { variants: AbTestVariant[] }) {
  const stages: { key: keyof AbTestVariant | "delivered"; label: string }[] = [
    { key: "delivered", label: "Delivered" },
    { key: "opened", label: "Opened" },
    { key: "clicked", label: "Clicked" },
    { key: "converted", label: "Converted" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {variants.map((v) => {
        const base = delivered(v) || 1;
        return (
          <div key={v.id} className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{v.name || v.label}</p>
              {v.winner && <WinnerBadge />}
            </div>
            <div className="mt-3 grid gap-2">
              {stages.map((s) => {
                const value =
                  s.key === "delivered" ? delivered(v) : ((v[s.key as keyof AbTestVariant] as number) ?? 0);
                const width = Math.max(2, (value / base) * 100);
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="tabular-nums font-medium">{value.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", v.winner ? "bg-emerald-500" : "bg-primary")}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── pairwise comparison detail ───────────────────────────────────────── */

/** Auditable by design — most platforms hide this entirely. */
export function ComparisonDetail({ config }: { config: AbTestConfig }) {
  if (!config.comparisons?.length) return null;
  const nameOf = (id: string) => {
    const v = config.variants.find((x) => x.id === id);
    return v?.name || v?.label || id;
  };
  const multiple = config.comparisons.length > 1;

  return (
    <div className="rounded-lg border">
      <div className="border-b px-3 py-2">
        <p className="text-sm font-medium">How the winner was determined</p>
        <p className="text-xs text-muted-foreground">
          Two-proportion z-test
          {multiple && ", Holm-Bonferroni corrected for multiple comparisons"}.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Comparison</TableHead>
            <TableHead className="text-right">p-value</TableHead>
            {multiple && <TableHead className="text-right">Adjusted</TableHead>}
            <TableHead className="text-right">Verdict</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {config.comparisons.map((c) => (
            <TableRow key={`${c.leaderId}-${c.againstId}`}>
              <TableCell className="text-sm">
                {nameOf(c.leaderId)} vs {nameOf(c.againstId)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {c.rawPValue.toFixed(4)}
              </TableCell>
              {multiple && (
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {c.adjustedPValue.toFixed(4)}
                </TableCell>
              )}
              <TableCell className="text-right">
                <span
                  className={cn(
                    "text-xs font-medium",
                    c.significant
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  )}
                >
                  {c.significant ? "Significant" : "Not significant"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
