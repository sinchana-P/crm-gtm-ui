import { Mail, MessageCircle, Repeat, Send } from "lucide-react";
import type {
  Campaign,
  CampaignGoalMetric,
  RecipientEventType,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const GOAL_METRIC_LABELS: Record<CampaignGoalMetric, string> = {
  opens: "Opens",
  clicks: "Clicks",
  form_submissions: "Form submissions",
  conversions: "Conversions",
};

export const RECURRENCE_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  custom: "Custom (cron)",
};

export function rate(value: number, base: number) {
  return base > 0 ? ((value / base) * 100).toFixed(1) : "0.0";
}

export function CampaignTypeBadge({ type }: { type: Campaign["type"] }) {
  const oneTime = type === "one-time";
  const Icon = oneTime ? Send : Repeat;
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 gap-1",
        oneTime
          ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
          : "bg-violet-500/10 text-violet-700 dark:text-violet-400"
      )}
    >
      <Icon className="size-3" />
      {oneTime ? "One-time" : "Recurring"}
    </Badge>
  );
}

export function ChannelIcon({
  channel,
  className,
}: {
  channel: Campaign["channel"];
  className?: string;
}) {
  const Icon = channel === "email" ? Mail : MessageCircle;
  return <Icon className={cn("size-4 text-muted-foreground", className)} />;
}

const RECIPIENT_STATUS_STYLES: Record<RecipientEventType, string> = {
  queued: "bg-muted text-muted-foreground",
  sent: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  delivered: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  opened: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  clicked: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  converted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  bounced: "bg-red-500/10 text-red-700 dark:text-red-400",
  unsubscribed: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export function RecipientStatusBadge({ status }: { status: RecipientEventType }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-0 capitalize", RECIPIENT_STATUS_STYLES[status])}
    >
      {status}
    </Badge>
  );
}

export function buildUtmUrl(baseUrl: string, utm?: Campaign["utm"]) {
  if (!utm) return baseUrl;
  const params = new URLSearchParams();
  if (utm.source) params.set("utm_source", utm.source);
  if (utm.medium) params.set("utm_medium", utm.medium);
  if (utm.campaign) params.set("utm_campaign", utm.campaign);
  if (utm.term) params.set("utm_term", utm.term);
  if (utm.content) params.set("utm_content", utm.content);
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}
