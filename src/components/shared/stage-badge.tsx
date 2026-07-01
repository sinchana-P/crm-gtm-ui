import { Badge } from "@/components/ui/badge";
import type { LifecycleStage } from "@/lib/types";

const STAGE_LABELS: Record<LifecycleStage, string> = {
  subscriber: "Subscriber",
  lead: "Lead",
  mql: "MQL",
  sql: "SQL",
  customer: "Customer",
  churned: "Churned",
};

export function StageBadge({ stage }: { stage: LifecycleStage }) {
  return (
    <Badge variant="outline" className="capitalize">
      {STAGE_LABELS[stage]}
    </Badge>
  );
}
