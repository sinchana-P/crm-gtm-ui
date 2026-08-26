import {
  AtSign,
  Bell,
  Calculator,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileInput,
  Filter,
  FormInput,
  GitBranch,
  Globe,
  Hourglass,
  ListChecks,
  Mail,
  MousePointerClick,
  Phone,
  Repeat,
  RotateCcw,
  Route,
  Shuffle,
  Star,
  StickyNote,
  Tag,
  TagsIcon,
  TrendingUp,
  UserPlus,
  Users,
  Waypoints,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type WfObject = "lead" | "customer";

export interface CatalogItem {
  type: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  objects: WfObject[];
  /** Branch output port labels — presence means this is a branching step. */
  outputs?: string[];
  group?: "Actions" | "Delays & waits" | "Flow control" | "Data" | "Integrations";
}

/* ---------------- Triggers ---------------- */
export const TRIGGER_CATALOG: CatalogItem[] = [
  { type: "lead.created", label: "Lead Created", desc: "A new lead is created in the CRM.", icon: UserPlus, objects: ["lead"] },
  { type: "customer.created", label: "Customer Created", desc: "A new customer record is created (e.g. a deal closes).", icon: Users, objects: ["customer"] },
  { type: "contact.updated", label: "Record Updated", desc: "Any field on the record changes.", icon: RotateCcw, objects: ["lead", "customer"] },
  { type: "lifecycle.changed", label: "Lifecycle Stage Changed", desc: "The lifecycle stage changes (e.g. New → MQL).", icon: Route, objects: ["lead", "customer"] },
  { type: "lead.score.threshold", label: "Score Threshold Crossed", desc: "The lead score crosses a threshold.", icon: TrendingUp, objects: ["lead"] },
  { type: "owner.assigned", label: "Owner Assigned", desc: "The owner field changes.", icon: UserPlus, objects: ["lead", "customer"] },
  { type: "activity.logged", label: "Activity Logged", desc: "A call, note, or task is added to the timeline.", icon: StickyNote, objects: ["lead", "customer"] },
  { type: "days.since.contact", label: "Days Since Last Contact", desc: "Inactivity exceeds a threshold (daily scan).", icon: CalendarClock, objects: ["lead", "customer"] },
  { type: "form.submitted", label: "Form Submitted", desc: "A marketing/CRM form is submitted.", icon: FormInput, objects: ["lead", "customer"] },
  { type: "survey.submitted", label: "Survey Submitted", desc: "A survey/NPS response is received.", icon: FileInput, objects: ["lead", "customer"] },
  { type: "segment.entered", label: "Entered Segment", desc: "The contact enters a segment (list membership).", icon: Filter, objects: ["lead", "customer"] },
  { type: "task.completed", label: "Task Completed", desc: "A task on the record is marked done.", icon: CheckCircle2, objects: ["lead", "customer"] },
  { type: "task.overdue", label: "Task Overdue", desc: "A task passes its due date (daily scan).", icon: Clock, objects: ["lead", "customer"] },
];

/* ---------------- Actions / steps ---------------- */
export const ACTION_CATALOG: CatalogItem[] = [
  // Actions
  { type: "sendEmail", label: "Send Email", desc: "Send a templated, personalized email.", icon: Mail, objects: ["lead", "customer"], group: "Actions" },
  { type: "createTask", label: "Create Task", desc: "Create a follow-up task for the owner.", icon: ListChecks, objects: ["lead", "customer"], group: "Actions" },
  { type: "addTag", label: "Add Tag", desc: "Add a tag to the record.", icon: Tag, objects: ["lead", "customer"], group: "Actions" },
  { type: "removeTag", label: "Remove Tag", desc: "Remove a tag from the record.", icon: TagsIcon, objects: ["lead", "customer"], group: "Actions" },
  { type: "assignOwner", label: "Assign Owner", desc: "Set the owner, or run assignment rules.", icon: UserPlus, objects: ["lead", "customer"], group: "Actions" },
  { type: "changeLifecycle", label: "Change Lifecycle Stage", desc: "Move the record to a different stage.", icon: Route, objects: ["lead", "customer"], group: "Actions" },
  { type: "updateScore", label: "Update Lead Score", desc: "Add or subtract points from the score.", icon: Star, objects: ["lead"], group: "Actions" },
  { type: "logNote", label: "Log Note", desc: "Add a note to the timeline.", icon: StickyNote, objects: ["lead", "customer"], group: "Actions" },
  { type: "notifyUser", label: "Send Notification", desc: "Send an in-app notification to a user.", icon: Bell, objects: ["lead", "customer"], group: "Actions" },
  { type: "enrollInSequence", label: "Enroll in Sequence", desc: "Hand off to a rep's 1:1 sequence. (Bridge to Sequences)", icon: Waypoints, objects: ["lead", "customer"], group: "Actions" },
  { type: "unenrollSequence", label: "Unenroll from Sequence", desc: "Remove the record from a sequence.", icon: Waypoints, objects: ["lead", "customer"], group: "Actions" },
  // Delays & waits
  { type: "delay.fixed", label: "Wait", desc: "Pause for a fixed amount of time.", icon: Hourglass, objects: ["lead", "customer"], group: "Delays & waits" },
  { type: "delay.untilDate", label: "Wait Until Date", desc: "Pause until a specific date/time.", icon: CalendarClock, objects: ["lead", "customer"], group: "Delays & waits" },
  { type: "waitForEvent", label: "Wait For Event", desc: "Hold until an event occurs or times out.", icon: Clock, objects: ["lead", "customer"], group: "Delays & waits" },
  // Flow control
  { type: "if", label: "If / Then Branch", desc: "Split by an AND/OR condition.", icon: GitBranch, objects: ["lead", "customer"], group: "Flow control", outputs: ["Yes", "No"] },
  { type: "valueEquals", label: "Value Equals Branch", desc: "One branch per value of a property.", icon: GitBranch, objects: ["lead", "customer"], group: "Flow control", outputs: ["Free", "Pro", "Enterprise"] },
  { type: "randomSplit", label: "Random Split", desc: "Randomly route by weight (A/B testing).", icon: Shuffle, objects: ["lead", "customer"], group: "Flow control", outputs: ["Path A", "Path B"] },
  { type: "goto", label: "Go To Action", desc: "Continue at another step by name.", icon: Repeat, objects: ["lead", "customer"], group: "Flow control" },
  // Data
  { type: "calculate", label: "Calculate", desc: "Arithmetic into an output property.", icon: Calculator, objects: ["lead", "customer"], group: "Data" },
  { type: "format", label: "Format Data", desc: "Transform a value (case, trim).", icon: AtSign, objects: ["lead", "customer"], group: "Data" },
  { type: "validatePhone", label: "Validate & Format Phone", desc: "Normalize a phone number.", icon: Phone, objects: ["lead", "customer"], group: "Data" },
  // Integrations
  { type: "webhook", label: "Trigger Webhook", desc: "POST the record to an external URL.", icon: Globe, objects: ["lead", "customer"], group: "Integrations" },
];

export const CATEGORY_ORDER = ["Actions", "Delays & waits", "Flow control", "Data", "Integrations"] as const;

export function catalogItem(type: string): CatalogItem | undefined {
  return [...TRIGGER_CATALOG, ...ACTION_CATALOG].find((c) => c.type === type);
}

/* ---------------- Workflow model ---------------- */
export interface WfStep {
  id: string;
  type: string;
  summary?: string;
  /** For branching steps: one lane per output. */
  lanes?: { label: string; steps: WfStep[] }[];
}

export interface Workflow {
  id: string;
  name: string;
  object: WfObject;
  triggerType: string;
  enabled: boolean;
  runs: number;
  updated: string;
  steps: WfStep[];
}

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

/* ---------------- Sample workflows ---------------- */
export const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    id: "wf-demo",
    name: "Demo request → route, score & hand off",
    object: "lead",
    triggerType: "form.submitted",
    enabled: true,
    runs: 214,
    updated: "2h ago",
    steps: [
      { id: uid("s"), type: "addTag", summary: "Add tag “demo-request”" },
      { id: uid("s"), type: "updateScore", summary: "Score +20" },
      { id: uid("s"), type: "assignOwner", summary: "Assign by territory" },
      { id: uid("s"), type: "notifyUser", summary: "Notify owner: 🔥 New demo request" },
      {
        id: uid("s"),
        type: "if",
        summary: "If score ≥ 80",
        lanes: [
          {
            label: "Yes",
            steps: [
              { id: uid("s"), type: "changeLifecycle", summary: "Set “Sales Qualified”" },
              { id: uid("s"), type: "enrollInSequence", summary: "Enroll in “AE fast-track” sequence" },
            ],
          },
          {
            label: "No",
            steps: [
              { id: uid("s"), type: "enrollInSequence", summary: "Enroll in “Nurture” sequence" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "wf-onboard",
    name: "Customer onboarding",
    object: "customer",
    triggerType: "customer.created",
    enabled: true,
    runs: 63,
    updated: "1d ago",
    steps: [
      { id: uid("s"), type: "sendEmail", summary: "Send “Welcome aboard” email" },
      { id: uid("s"), type: "createTask", summary: "CSM task: Schedule kickoff" },
      { id: uid("s"), type: "delay.fixed", summary: "Wait 3 days" },
      { id: uid("s"), type: "sendEmail", summary: "Send “Getting started” tips" },
    ],
  },
  {
    id: "wf-nps",
    name: "NPS survey → save or delight",
    object: "customer",
    triggerType: "survey.submitted",
    enabled: false,
    runs: 0,
    updated: "just now",
    steps: [
      {
        id: uid("s"),
        type: "if",
        summary: "If NPS ≤ 6 (detractor)",
        lanes: [
          { label: "Yes", steps: [{ id: uid("s"), type: "createTask", summary: "Urgent: CSM call to save account" }] },
          { label: "No", steps: [{ id: uid("s"), type: "sendEmail", summary: "Ask promoter for a review" }] },
        ],
      },
    ],
  },
];

/* ---------------- Prebuilt packs ---------------- */
export interface WorkflowPack {
  key: string;
  name: string;
  object: WfObject;
  desc: string;
  triggerType: string;
  steps: number;
}
export const WORKFLOW_PACKS: WorkflowPack[] = [
  { key: "lead-welcome", name: "Lead welcome", object: "lead", desc: "Greet & route every new lead.", triggerType: "lead.created", steps: 4 },
  { key: "hot-lead", name: "Hot-lead promotion", object: "lead", desc: "Promote & alert when score crosses 80.", triggerType: "lead.score.threshold", steps: 3 },
  { key: "customer-onboarding", name: "Customer onboarding", object: "customer", desc: "Welcome, kickoff task, tips.", triggerType: "customer.created", steps: 4 },
  { key: "reengage", name: "Inactivity re-engage", object: "lead", desc: "Win back after 30 days silent.", triggerType: "days.since.contact", steps: 3 },
  { key: "form-nurture", name: "Form → nurture", object: "lead", desc: "Every form submission starts a nurture.", triggerType: "form.submitted", steps: 3 },
  { key: "survey-followup", name: "Survey detractor → task", object: "customer", desc: "Detractor → task, promoter → review.", triggerType: "survey.submitted", steps: 2 },
];
