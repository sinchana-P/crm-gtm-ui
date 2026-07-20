"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { InsightMetric, InsightSeriesPoint } from "@/lib/marketing-copilot";

/** Accent palette shared by capability cards (matches the violet AI motif). */
export const ACCENTS: Record<
  string,
  { text: string; bg: string; border: string; ring: string; fill: string }
> = {
  violet: {
    text: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    ring: "bg-violet-500/[0.03]",
    fill: "var(--chart-1)",
  },
  blue: {
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    ring: "bg-blue-500/[0.03]",
    fill: "var(--chart-2)",
  },
  emerald: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    ring: "bg-emerald-500/[0.03]",
    fill: "var(--chart-3)",
  },
  amber: {
    text: "text-amber-700 dark:text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    ring: "bg-amber-500/[0.03]",
    fill: "var(--chart-4)",
  },
};

export function AiAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400",
        className
      )}
    >
      <Sparkles className="size-4" />
    </div>
  );
}

export function ThinkingBubble() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border bg-card px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function MetricGrid({ metrics }: { metrics: InsightMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-lg border bg-background p-3">
          <p className="text-xs text-muted-foreground">{m.label}</p>
          <p
            className={cn(
              "mt-0.5 text-lg font-semibold tabular-nums",
              m.positive === true && "text-emerald-600 dark:text-emerald-500",
              m.positive === false && "text-amber-600 dark:text-amber-500"
            )}
          >
            {m.value}
          </p>
          {m.hint ? <p className="text-[11px] text-muted-foreground">{m.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function InsightChart({
  type,
  data,
  valueLabel,
  secondaryLabel,
  fill = "var(--chart-1)",
}: {
  type: "bar" | "line";
  data: InsightSeriesPoint[];
  valueLabel: string;
  secondaryLabel?: string;
  fill?: string;
}) {
  const config: ChartConfig = {
    value: { label: valueLabel, color: fill },
    ...(secondaryLabel ? { secondary: { label: secondaryLabel, color: "var(--chart-2)" } } : {}),
  };

  return (
    <ChartContainer config={config} className="h-[200px] w-full">
      {type === "bar" ? (
        <BarChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} interval={0} />
          <YAxis tickLine={false} axisLine={false} width={36} fontSize={11} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={4} />
        </BarChart>
      ) : (
        <LineChart data={data} margin={{ left: 4, right: 4, top: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} width={36} fontSize={11} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
          {secondaryLabel ? (
            <Line type="monotone" dataKey="secondary" stroke="var(--color-secondary)" strokeWidth={2} dot={false} />
          ) : null}
        </LineChart>
      )}
    </ChartContainer>
  );
}

export function InsightBullets({ bullets, sources }: { bullets: string[]; sources: string[] }) {
  return (
    <div className="space-y-3">
      <ul className="space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground/90">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-violet-500" />
            <span className="leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
      {sources.length > 0 ? (
        <p className="text-[11px] text-muted-foreground">
          Based on: {sources.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
