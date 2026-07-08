import {
  ArrowRightLeft,
  Bell,
  CalendarClock,
  Clock,
  Flag,
  Forward,
  GitBranch,
  Hash,
  Mail,
  MailCheck,
  MessageCircle,
  MousePointerClick,
  PenLine,
  Plus,
  Settings2,
  ShieldOff,
  SplitSquareVertical,
  Tag,
  UserPlus,
  Webhook,
  Zap,
} from "lucide-react";
import type {
  Sequence,
  SequenceActionType,
  SequenceExitReason,
  SequenceStep,
  SequenceStepType,
  SequenceTrigger,
  SequenceTriggerType,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_EMAIL_TEMPLATES,
  MOCK_FORMS,
  MOCK_SEGMENTS,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type IconType = typeof Mail;

export const STEP_META: Record<
  SequenceStepType,
  { label: string; icon: IconType; accent: string; tint: string }
> = {
  email: { label: "Send email", icon: Mail, accent: "border-l-sky-500", tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  whatsapp: { label: "Send WhatsApp", icon: MessageCircle, accent: "border-l-emerald-500", tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  wait: { label: "Wait / delay", icon: Clock, accent: "border-l-amber-500", tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  branch: { label: "If / else branch", icon: GitBranch, accent: "border-l-violet-500", tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  action: { label: "Internal action", icon: Settings2, accent: "border-l-slate-500", tint: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
  goal: { label: "Goal", icon: Flag, accent: "border-l-rose-500", tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  task: { label: "Task", icon: Settings2, accent: "border-l-slate-500", tint: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
};

export const TRIGGER_META: Record<
  SequenceTriggerType,
  { label: string; icon: IconType; description: string; phase?: string }
> = {
  segment_joined: { label: "Joins a segment", icon: Zap, description: "Enroll when a contact enters a segment (with live count preview)." },
  form_submitted: { label: "Submits a form", icon: PenLine, description: "Enroll when a marketing form is submitted." },
  tag_added: { label: "Tag added", icon: Tag, description: "Enroll when a specific tag is applied." },
  manual: { label: "Manual enrollment", icon: UserPlus, description: "Reps add contacts individually or in bulk." },
  property_changed: { label: "Property changes", icon: PenLine, description: "Enroll when a CRM property changes to a value." },
  email_engagement: { label: "Email engagement", icon: MailCheck, description: "Enroll on open, click, or non-open of a prior campaign." },
  date_based: { label: "Date-based", icon: CalendarClock, description: "Enroll on a date field, with an optional day offset." },
  another_sequence: { label: "From another sequence", icon: Forward, description: "Enrolled by a step in a different sequence." },
  webhook: { label: "Webhook received", icon: Webhook, description: "Enroll when an inbound webhook fires.", phase: "Phase 2" },
  custom_event: { label: "Custom event", icon: Hash, description: "Enroll when a tracked custom event is recorded.", phase: "Phase 2" },
};

export const ACTION_META: Record<SequenceActionType, { label: string; icon: IconType }> = {
  create_task: { label: "Create task", icon: Settings2 },
  notify_owner: { label: "Notify owner", icon: Bell },
  adjust_score: { label: "Adjust lead score", icon: MousePointerClick },
  update_property: { label: "Update property", icon: PenLine },
  add_tag: { label: "Add tag", icon: Tag },
  remove_tag: { label: "Remove tag", icon: Tag },
  enroll_sequence: { label: "Enroll in another sequence", icon: Forward },
  unenroll_sequence: { label: "Unenroll from a sequence", icon: ArrowRightLeft },
  webhook: { label: "Send webhook", icon: Webhook },
};

export const EXIT_REASON_LABELS: Record<SequenceExitReason, string> = {
  replied: "Replied",
  goal_met: "Goal met",
  manual: "Manually unenrolled",
  suppressed: "Suppressed",
  criteria_no_longer_met: "Criteria no longer met",
  bounced: "Bounced",
};

export function SequenceArchivedNote() {
  return <span className="text-xs font-medium text-muted-foreground">(Archived)</span>;
}

export function ChannelIcon({ channel, className }: { channel?: Sequence["channel"]; className?: string }) {
  if (channel === "whatsapp") return <MessageCircle className={cn("size-4 text-muted-foreground", className)} />;
  if (channel === "multi")
    return (
      <span className={cn("flex items-center", className)}>
        <Mail className="size-4 text-muted-foreground" />
      </span>
    );
  return <Mail className={cn("size-4 text-muted-foreground", className)} />;
}

function segmentName(id?: string) {
  return MOCK_SEGMENTS.find((s) => s.id === id)?.name ?? id ?? "a segment";
}
function formName(id?: string) {
  return MOCK_FORMS.find((f) => f.id === id)?.name ?? id ?? "a form";
}
export function templateName(id?: string) {
  return MOCK_EMAIL_TEMPLATES.find((t) => t.id === id)?.name ?? id ?? "no template";
}

export function triggerSummary(t: SequenceTrigger): string {
  switch (t.type) {
    case "segment_joined":
      return `Joins segment “${segmentName(t.segmentId)}”`;
    case "form_submitted":
      return `Submits form “${formName(t.formId)}”`;
    case "tag_added":
      return `Tag “${t.tag ?? "…"}” is added`;
    case "manual":
      return "Manually enrolled by a rep";
    case "property_changed":
      return `${t.property ?? "Property"} ${t.operator ?? "is"} ${t.value ?? "…"}`;
    case "email_engagement":
      return `${t.engagementEvent ?? "Engaged"} — ${t.engagementRef ?? "any campaign"}`;
    case "date_based":
      return `${t.dateField ?? "Date field"}${t.dateOffsetDays ? ` ${t.dateOffsetDays > 0 ? "+" : ""}${t.dateOffsetDays}d` : ""}`;
    case "another_sequence":
      return "Enrolled from another sequence";
    case "webhook":
      return "Inbound webhook received";
    case "custom_event":
      return `Event “${t.eventName ?? "custom"}”`;
    default:
      return "Enrollment trigger";
  }
}

export function waitSummary(step: SequenceStep): string {
  if (step.waitMode === "until_date") {
    const offset = step.waitValue
      ? ` ${step.waitValue > 0 ? "+" : ""}${step.waitValue} ${step.waitUnit ?? "days"}`
      : "";
    return `Wait until ${step.waitField ?? "a date"}${offset}`;
  }
  if (step.waitMode === "until_condition") {
    return `Wait until ${step.waitCondition ?? "a condition"}${step.waitTimeoutDays ? ` (max ${step.waitTimeoutDays}d)` : ""}`;
  }
  return `Wait ${step.waitValue ?? 1} ${step.waitUnit ?? "days"}${step.businessDaysOnly ? " (business days)" : ""}`;
}

export function stepSummary(step: SequenceStep): string {
  switch (step.type) {
    case "email":
      return step.subject ? `“${step.subject}” · ${templateName(step.templateId)}` : templateName(step.templateId);
    case "whatsapp":
      return step.snippet ?? "WhatsApp message";
    case "wait":
      return waitSummary(step);
    case "branch":
      return step.branchKind === "percentage"
        ? `Percentage split · ${(step.branches ?? []).map((b) => `${b.percent ?? 0}%`).join(" / ")}`
        : `If / else · ${(step.branches ?? []).length} paths`;
    case "action":
      return step.actionSummary ?? (step.actionType ? ACTION_META[step.actionType].label : "Action");
    case "goal":
      return step.goalCondition ?? "Goal reached";
    default:
      return step.config ?? "";
  }
}

/** Total number of steps across the main path and all nested branch paths. */
export function countSteps(flow: SequenceStep[]): number {
  return flow.reduce((n, step) => {
    if (step.type === "branch" && step.branches) {
      return n + 1 + step.branches.reduce((m, b) => m + countSteps(b.steps), 0);
    }
    return n + 1;
  }, 0);
}

/** Which channels a flow uses, for the channel badge. */
export function flowChannel(flow: SequenceStep[]): Sequence["channel"] {
  let email = false;
  let whatsapp = false;
  const walk = (steps: SequenceStep[]) => {
    for (const s of steps) {
      if (s.type === "email") email = true;
      if (s.type === "whatsapp") whatsapp = true;
      if (s.branches) s.branches.forEach((b) => walk(b.steps));
    }
  };
  walk(flow);
  if (email && whatsapp) return "multi";
  if (whatsapp) return "whatsapp";
  return "email";
}

export function StepTypeBadge({ type }: { type: SequenceStepType }) {
  const meta = STEP_META[type];
  return (
    <Badge variant="outline" className={cn("border-0 gap-1", meta.tint)}>
      <meta.icon className="size-3" />
      {meta.label}
    </Badge>
  );
}

export const ADD_STEP_ICON = Plus;
export const SUPPRESS_ICON = ShieldOff;
export const SPLIT_ICON = SplitSquareVertical;
