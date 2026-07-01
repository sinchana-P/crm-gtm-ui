import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type HealthStatus = "green" | "amber" | "red";

const STATUS_CONFIG: Record<
  HealthStatus,
  { label: string; className: string }
> = {
  green: {
    label: "Healthy",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  amber: {
    label: "At risk",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  red: {
    label: "Critical",
    className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

const SLA_LABELS: Record<HealthStatus, string> = {
  green: "On track",
  amber: "At risk",
  red: "Breached",
};

function scoreToStatus(score: number): HealthStatus {
  if (score >= 80) return "green";
  if (score >= 60) return "amber";
  return "red";
}

type HealthBadgeProps =
  | {
      status: HealthStatus;
      label?: string;
      variant?: "health" | "sla";
      className?: string;
    }
  | {
      score: number;
      label?: string;
      variant?: "health" | "sla";
      className?: string;
    };

export function HealthBadge(props: HealthBadgeProps) {
  const status = "score" in props ? scoreToStatus(props.score) : props.status;
  const variant = props.variant ?? ("score" in props ? "health" : "sla");
  const config = STATUS_CONFIG[status];
  const defaultLabel =
    variant === "sla" ? SLA_LABELS[status] : config.label;
  const label = props.label ?? defaultLabel;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-normal", config.className, props.className)}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "green" && "bg-emerald-500",
          status === "amber" && "bg-amber-500",
          status === "red" && "bg-red-500"
        )}
      />
      {label}
    </Badge>
  );
}
