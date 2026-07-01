import type { LifecycleStage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STAGE_CONFIG: Record<
  LifecycleStage,
  { label: string; className: string }
> = {
  subscriber: {
    label: "Subscriber",
    className: "bg-muted text-muted-foreground",
  },
  lead: {
    label: "Lead",
    className: "bg-secondary text-secondary-foreground",
  },
  mql: {
    label: "MQL",
    className: "border-border bg-background text-foreground",
  },
  sql: {
    label: "SQL",
    className: "bg-foreground/10 text-foreground",
  },
  customer: {
    label: "Customer",
    className: "bg-primary text-primary-foreground",
  },
  churned: {
    label: "Churned",
    className: "bg-destructive/10 text-destructive",
  },
};

interface LifecycleBadgeProps {
  stage: LifecycleStage;
  className?: string;
}

export function LifecycleBadge({ stage, className }: LifecycleBadgeProps) {
  const config = STAGE_CONFIG[stage];

  return (
    <Badge variant="secondary" className={cn("font-normal", config.className, className)}>
      {config.label}
    </Badge>
  );
}
