import type { Campaign, Sequence } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CampaignStatusBadge({ status }: { status: Campaign["status"] }) {
  const variants: Record<Campaign["status"], string> = {
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    sending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    sent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    paused: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  };
  return (
    <Badge variant="outline" className={cn("border-0 capitalize", variants[status])}>
      {status}
    </Badge>
  );
}

export function SequenceTypeBadge({ type }: { type: Sequence["type"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-0 capitalize",
        type === "sales"
          ? "bg-violet-500/10 text-violet-700 dark:text-violet-400"
          : "bg-sky-500/10 text-sky-700 dark:text-sky-400"
      )}
    >
      {type}
    </Badge>
  );
}

export function SequenceStatusBadge({ status }: { status: Sequence["status"] }) {
  const variants: Record<Sequence["status"], string> = {
    active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    draft: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={cn("border-0 capitalize", variants[status])}>
      {status}
    </Badge>
  );
}
