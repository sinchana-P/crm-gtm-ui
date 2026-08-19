"use client";

import { AlertTriangle, Crown, FlaskConical, Minus, ShieldAlert, TrendingUp } from "lucide-react";
import type { AbTestStatus, AbTestVariant, AbWinnerMetric } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RECOMMENDED_SAMPLE, metricParts, pct } from "@/lib/ab-testing";

/* ── status badge ──────────────────────────────────────────────────────── */

const STATUS_STYLES: Record<AbTestStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
  running: { label: "Testing", className: "bg-violet-500/10 text-violet-700 dark:text-violet-400" },
  evaluating: { label: "Evaluating", className: "bg-violet-500/10 text-violet-700 dark:text-violet-400" },
  awaiting_decision: { label: "Awaiting decision", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  winner_selected: { label: "Winner selected", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  inconclusive: { label: "Inconclusive", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  rolled_out: { label: "Winner sent", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  completed: { label: "Completed", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  stopped: { label: "Stopped", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
};

/**
 * `prefixed` is for surfaces that already show the campaign's own status — the
 * header would otherwise read "Draft" twice with no way to tell which is which.
 */
export function AbStatusBadge({
  status,
  prefixed = false,
}: {
  status: AbTestStatus;
  prefixed?: boolean;
}) {
  const meta = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <Badge variant="outline" className={cn("border-0 gap-1", meta.className)}>
      {prefixed && <FlaskConical className="size-3" />}
      {prefixed ? `A/B: ${meta.label}` : meta.label}
    </Badge>
  );
}

/* ── significance chip ────────────────────────────────────────────────── */

/**
 * Deliberately never shows a bare p-value in the primary surface, and never
 * shows green for a forced pick — a manual override must not later read as a
 * proven win.
 */
export function SignificanceChip({
  confidence,
  threshold = 0.95,
  sampleMet = true,
  minObserved,
  forced = false,
  live = false,
}: {
  confidence: number;
  threshold?: number;
  sampleMet?: boolean;
  minObserved?: number;
  forced?: boolean;
  live?: boolean;
}) {
  if (live) {
    return (
      <Badge variant="outline" className="border-0 bg-muted text-muted-foreground gap-1">
        <Minus className="size-3" />
        Not final
      </Badge>
    );
  }
  if (forced) {
    return (
      <Badge variant="outline" className="border-0 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1">
        <AlertTriangle className="size-3" />
        Selected manually — not statistically significant
      </Badge>
    );
  }
  if (!sampleMet) {
    return (
      <Badge variant="outline" className="border-0 bg-muted text-muted-foreground gap-1">
        <AlertTriangle className="size-3" />
        Not enough data
        {minObserved !== undefined && ` (${minObserved.toLocaleString()} of ${RECOMMENDED_SAMPLE.toLocaleString()})`}
      </Badge>
    );
  }
  if (confidence >= threshold) {
    return (
      <Badge variant="outline" className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1">
        <TrendingUp className="size-3" />
        {Math.round(confidence * 100)}% confident
      </Badge>
    );
  }
  if (confidence >= 0.8) {
    return (
      <Badge variant="outline" className="border-0 bg-amber-500/10 text-amber-700 dark:text-amber-400">
        Leaning ahead ({Math.round(confidence * 100)}%) — not conclusive
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
      No meaningful difference
    </Badge>
  );
}

export function WinnerBadge() {
  return (
    <Badge variant="outline" className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1">
      <Crown className="size-3" />
      Winner
    </Badge>
  );
}

export function ControlBadge() {
  return (
    <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
      Control
    </Badge>
  );
}

export function GuardrailChip({ note }: { note?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className="border-0 bg-red-500/10 text-red-700 dark:text-red-400 gap-1">
          <ShieldAlert className="size-3" />
          Guardrail flagged
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        {note ?? "This version's unsubscribe or bounce rate is unusually high."}
      </TooltipContent>
    </Tooltip>
  );
}

/* ── a rate cell that always exposes its counts ───────────────────────── */

/**
 * Rates alone hide sample size, which is how people talk themselves into bad
 * decisions. The underlying fraction is always one hover away.
 */
export function RateCell({
  variant,
  metric,
  emphasised = false,
}: {
  variant: AbTestVariant;
  metric: AbWinnerMetric;
  emphasised?: boolean;
}) {
  const { num, den } = metricParts(variant, metric);
  const value = den > 0 ? num / den : 0;
  return (
    <Tooltip>
      <TooltipTrigger className="cursor-default">
        <span
          className={cn(
            "tabular-nums",
            emphasised ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {den > 0 ? pct(value) : "—"}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {num.toLocaleString()} of {den.toLocaleString()}
      </TooltipContent>
    </Tooltip>
  );
}

export function LiftCell({ lift }: { lift: number | null }) {
  if (lift === null) {
    return <span className="text-xs text-muted-foreground">baseline</span>;
  }
  const positive = lift > 0;
  const flat = Math.abs(lift) < 0.005;
  return (
    <span
      className={cn(
        "tabular-nums font-medium",
        flat
          ? "text-muted-foreground"
          : positive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400"
      )}
    >
      {flat ? "±0.0%" : `${positive ? "+" : ""}${(lift * 100).toFixed(1)}%`}
    </span>
  );
}
