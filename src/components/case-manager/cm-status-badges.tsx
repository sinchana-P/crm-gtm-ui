import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  CaseSource,
  CmCaseStatus,
  CmPriority,
  CmProjectStatus,
  IntakeStatus,
  SlaStatus,
} from "@/lib/types/case-manager";

const caseStatusStyles: Record<CmCaseStatus, string> = {
  New: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  "In Progress": "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Closed: "bg-muted text-muted-foreground border-transparent",
};

const priorityStyles: Record<CmPriority, string> = {
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-transparent",
  medium: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-transparent",
  high: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-transparent",
  urgent: "bg-red-500/10 text-red-700 dark:text-red-400 border-transparent",
};

const slaStyles: Record<SlaStatus, string> = {
  green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const intakeStatusStyles: Record<IntakeStatus, string> = {
  New: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  Responded: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  Converted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Closed: "bg-muted text-muted-foreground border-transparent",
};

const projectStatusStyles: Record<CmProjectStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  Completed: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
  "On Hold": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  Cancelled: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  Archived: "bg-muted text-muted-foreground border-transparent",
};

const channelLabels: Record<CaseSource, string> = {
  portal: "Portal",
  inquiry: "Inquiry",
  crm: "CRM",
  email: "Email",
};

export function CaseStatusBadge({ status }: { status: CmCaseStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", caseStatusStyles[status])}>
      {status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: CmPriority }) {
  return (
    <Badge variant="outline" className={cn("font-normal capitalize", priorityStyles[priority])}>
      {priority}
    </Badge>
  );
}

export function SlaBadge({ status, label }: { status: SlaStatus; label?: string }) {
  const labels = { green: "On track", amber: "At risk", red: "Breached" };
  return (
    <Badge variant="outline" className={cn("font-normal", slaStyles[status])}>
      {label ?? labels[status]}
    </Badge>
  );
}

export function IntakeStatusBadge({ status }: { status: IntakeStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", intakeStatusStyles[status])}>
      {status}
    </Badge>
  );
}

export function ProjectStatusBadge({ status }: { status: CmProjectStatus }) {
  return (
    <Badge variant="outline" className={cn("font-normal", projectStatusStyles[status])}>
      {status}
    </Badge>
  );
}

export function SourceBadge({ source }: { source: CaseSource }) {
  return (
    <Badge variant="secondary" className="font-normal">
      {channelLabels[source]}
    </Badge>
  );
}
