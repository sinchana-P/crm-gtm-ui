import {
  Bell,
  Braces,
  CalendarClock,
  Clock,
  Flag,
  Forward,
  GitBranch,
  Hash,
  Mail,
  MessageCircle,
  MousePointerClick,
  PenLine,
  PlusCircle,
  Repeat,
  ShieldCheck,
  Signpost,
  SquareStack,
  Tag,
  Target,
  UserCog,
  UserPlus,
  Users,
  Webhook,
  Workflow,
} from "lucide-react";
import type {
  AutomationActionType,
  AutomationNode,
  AutomationNodeType,
  AutomationTrigger,
  AutomationTriggerType,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { MOCK_EMAIL_TEMPLATES, MOCK_FORMS, MOCK_SEGMENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type IconType = typeof Mail;

export type NodeCategory = "communication" | "delay" | "branch" | "crm" | "flow";

export const NODE_META: Record<
  AutomationNodeType,
  { label: string; icon: IconType; accent: string; tint: string; category: NodeCategory }
> = {
  send_email: { label: "Send email", icon: Mail, accent: "border-l-sky-500", tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400", category: "communication" },
  send_whatsapp: { label: "Send WhatsApp", icon: MessageCircle, accent: "border-l-emerald-500", tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", category: "communication" },
  delay: { label: "Delay", icon: Clock, accent: "border-l-amber-500", tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400", category: "delay" },
  branch: { label: "If / then branch", icon: GitBranch, accent: "border-l-violet-500", tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400", category: "branch" },
  action: { label: "Action", icon: SquareStack, accent: "border-l-slate-500", tint: "bg-slate-500/10 text-slate-600 dark:text-slate-400", category: "crm" },
  goal: { label: "Goal", icon: Flag, accent: "border-l-rose-500", tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400", category: "flow" },
  end: { label: "End workflow", icon: Signpost, accent: "border-l-muted-foreground", tint: "bg-muted text-muted-foreground", category: "flow" },
};

export const ACTION_META: Record<AutomationActionType, { label: string; icon: IconType }> = {
  set_property: { label: "Set a property", icon: PenLine },
  add_tag: { label: "Add tag", icon: Tag },
  remove_tag: { label: "Remove tag", icon: Tag },
  adjust_score: { label: "Adjust lead score", icon: MousePointerClick },
  set_lifecycle: { label: "Set lifecycle stage", icon: Signpost },
  create_task: { label: "Create task", icon: SquareStack },
  create_deal: { label: "Create deal", icon: PlusCircle },
  rotate_owner: { label: "Rotate / assign owner", icon: UserCog },
  notify_team: { label: "Notify team", icon: Bell },
  enroll_sequence: { label: "Enroll in sequence", icon: Forward },
  unenroll_sequence: { label: "Unenroll from sequence", icon: Forward },
  webhook: { label: "Send webhook", icon: Webhook },
};

export const TRIGGER_META: Record<
  AutomationTriggerType,
  { label: string; icon: IconType; description: string; phase?: string }
> = {
  form_submitted: { label: "Form submitted", icon: PenLine, description: "Enroll when a marketing form is submitted." },
  segment_joined: { label: "Joins a segment", icon: Users, description: "Enroll when a contact enters a segment." },
  list_membership: { label: "Added to a list", icon: SquareStack, description: "Enroll when added to a static list." },
  property_changed: { label: "Property changes", icon: PenLine, description: "Enroll when a CRM property changes to a value." },
  tag_added: { label: "Tag added", icon: Tag, description: "Enroll when a specific tag is applied." },
  page_viewed: { label: "Page viewed", icon: MousePointerClick, description: "Enroll on a tracked page view." },
  email_engagement: { label: "Email engagement", icon: Mail, description: "Enroll on open / click / non-open of a campaign." },
  deal_stage: { label: "Deal stage changes", icon: Target, description: "Enroll when a deal moves stage." },
  date_based: { label: "Date-based", icon: CalendarClock, description: "Enroll relative to a date field." },
  custom_event: { label: "Custom event", icon: Hash, description: "Enroll when a tracked event fires." },
  webhook: { label: "Webhook received", icon: Webhook, description: "Enroll from an inbound webhook.", phase: "Phase 2" },
  manual: { label: "Manual enrollment", icon: UserPlus, description: "Enroll contacts manually or in bulk." },
};

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  communication: "Communication",
  delay: "Delays",
  branch: "Branches",
  crm: "CRM & data",
  flow: "Flow control",
};

export const RE_ENROLL_ICON = Repeat;
export const QUIET_ICON = ShieldCheck;
export const WORKFLOW_ICON = Workflow;
export const BRACES_ICON = Braces;

function segmentName(id?: string) {
  return MOCK_SEGMENTS.find((s) => s.id === id)?.name ?? id ?? "a segment";
}
function formName(id?: string) {
  return MOCK_FORMS.find((f) => f.id === id)?.name ?? id ?? "a form";
}
export function templateName(id?: string) {
  return MOCK_EMAIL_TEMPLATES.find((t) => t.id === id)?.name ?? id ?? "no template";
}

export function triggerSummary(t: AutomationTrigger): string {
  switch (t.type) {
    case "form_submitted":
      return `Submits “${formName(t.formId)}”`;
    case "segment_joined":
      return `Joins segment “${segmentName(t.segmentId)}”`;
    case "list_membership":
      return `Added to list “${t.listName ?? "…"}”`;
    case "property_changed":
      return `${t.property ?? "Property"} ${t.operator ?? "is"} ${t.value ?? "…"}`;
    case "tag_added":
      return `Tag “${t.tag ?? "…"}” added`;
    case "page_viewed":
      return `Views ${t.pageUrl ?? "a page"}`;
    case "email_engagement":
      return `${t.engagementEvent ?? "Engaged"} — ${t.engagementRef ?? "any campaign"}`;
    case "deal_stage":
      return `Deal → ${t.dealStage ?? "a stage"}`;
    case "date_based":
      return `${t.dateField ?? "Date field"}${t.dateOffsetDays ? ` ${t.dateOffsetDays > 0 ? "+" : ""}${t.dateOffsetDays}d` : ""}`;
    case "custom_event":
      return `Event “${t.eventName ?? "custom"}”`;
    case "webhook":
      return "Inbound webhook";
    case "manual":
      return "Manually enrolled";
    default:
      return "Trigger";
  }
}

export function delaySummary(node: AutomationNode): string {
  if (node.delayMode === "until_date") {
    const offset = node.delayValue ? ` ${node.delayValue > 0 ? "+" : ""}${node.delayValue} ${node.delayUnit ?? "days"}` : "";
    return `Until ${node.delayField ?? "a date"}${offset}`;
  }
  if (node.delayMode === "until_condition") {
    return `Until ${node.delayCondition ?? "a condition"}${node.delayTimeoutDays ? ` (max ${node.delayTimeoutDays}d)` : ""}`;
  }
  return `${node.delayValue ?? 1} ${node.delayUnit ?? "days"}${node.businessDaysOnly ? " (business days)" : ""}`;
}

export function nodeSummary(node: AutomationNode): string {
  switch (node.type) {
    case "send_email":
      return node.subject ? `“${node.subject}” · ${templateName(node.templateId)}` : templateName(node.templateId);
    case "send_whatsapp":
      return node.snippet || "WhatsApp message";
    case "delay":
      return delaySummary(node);
    case "branch":
      return node.branchKind === "percentage"
        ? `Split · ${(node.branches ?? []).map((b) => `${b.percent ?? 0}%`).join(" / ")}`
        : `If / then · ${(node.branches ?? []).length} paths`;
    case "action":
      return node.actionSummary || (node.actionType ? ACTION_META[node.actionType].label : "Action");
    case "goal":
      return node.goalCondition || "Goal reached";
    case "end":
      return "Ends the workflow";
    default:
      return "";
  }
}

export function AutomationStatusBadge({ status }: { status: "active" | "paused" | "draft" }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    draft: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={cn("border-0 capitalize", styles[status])}>
      {status}
    </Badge>
  );
}
