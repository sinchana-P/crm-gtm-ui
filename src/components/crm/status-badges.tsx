import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CaseRecord, EsignEnvelope } from "@/lib/types";

const slaStyles: Record<CaseRecord["slaStatus"], string> = {
  green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const priorityStyles: Record<CaseRecord["priority"], string> = {
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  medium: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  high: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  urgent: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const caseStatusStyles: Record<CaseRecord["status"], string> = {
  new: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  open: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  closed: "bg-muted text-muted-foreground",
};

const envelopeStatusStyles: Record<EsignEnvelope["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  viewed: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  signed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  declined: "bg-red-500/10 text-red-700 dark:text-red-400",
  expired: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export function SlaBadge({ status }: { status: CaseRecord["slaStatus"] }) {
  const labels = { green: "On track", amber: "At risk", red: "Breached" };
  return (
    <Badge variant="outline" className={cn("font-normal", slaStyles[status])}>
      {labels[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: CaseRecord["priority"] }) {
  return (
    <Badge variant="outline" className={cn("font-normal capitalize", priorityStyles[priority])}>
      {priority}
    </Badge>
  );
}

export function CaseStatusBadge({ status }: { status: CaseRecord["status"] }) {
  return (
    <Badge variant="outline" className={cn("font-normal capitalize", caseStatusStyles[status])}>
      {status}
    </Badge>
  );
}

export function EnvelopeStatusBadge({ status }: { status: EsignEnvelope["status"] }) {
  return (
    <Badge variant="outline" className={cn("font-normal capitalize", envelopeStatusStyles[status])}>
      {status}
    </Badge>
  );
}
