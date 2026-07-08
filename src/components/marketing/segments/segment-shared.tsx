import { Bot, Copy as CopyIcon, GitBranch, Mail, Sparkles, Workflow, Zap } from "lucide-react";
import type { SegmentOrigin, SegmentRecord, SegmentUsageRef } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SegmentTypeBadge({ type }: { type: SegmentRecord["type"] }) {
  const dynamic = type === "dynamic";
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 gap-1",
        dynamic
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-slate-500/10 text-slate-700 dark:text-slate-400"
      )}
    >
      <Zap className={cn("size-3", !dynamic && "hidden")} />
      {dynamic ? "Active" : "Static"}
    </Badge>
  );
}

export function SegmentOriginBadge({ origin }: { origin: SegmentOrigin }) {
  if (origin === "manual") return null;
  const ai = origin === "ai_suggested";
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 gap-1",
        ai
          ? "bg-violet-500/10 text-violet-700 dark:text-violet-400"
          : "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400"
      )}
    >
      {ai ? <Sparkles className="size-3" /> : <CopyIcon className="size-3" />}
      {ai ? "AI suggested" : "Lookalike"}
    </Badge>
  );
}

export const USAGE_MODULE_META: Record<
  SegmentUsageRef["module"],
  { label: string; icon: typeof Mail; href: (refId: string) => string | undefined }
> = {
  campaign: {
    label: "Campaign",
    icon: Mail,
    href: (refId) => `/marketing/campaigns/${refId}`,
  },
  sequence: { label: "Sequence", icon: GitBranch, href: () => "/marketing/sequences" },
  automation: { label: "Automation", icon: Workflow, href: () => "/marketing/automations" },
};

export function WeeklyTrend({ change }: { change: number }) {
  if (change === 0)
    return <span className="text-xs text-muted-foreground">±0 this week</span>;
  const positive = change > 0;
  return (
    <span
      className={cn(
        "text-xs font-medium",
        positive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
      )}
    >
      {positive ? "+" : ""}
      {change.toLocaleString()} this week
    </span>
  );
}

export function AiIcon({ className }: { className?: string }) {
  return <Bot className={className} />;
}
