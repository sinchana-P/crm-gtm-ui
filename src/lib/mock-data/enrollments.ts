import { SAMPLE_WORKFLOWS, catalogItem } from "@/lib/mock-data/automations";

export type EnrollKind = "sequence" | "automation";
export type EnrollStatus = "active" | "paused" | "completed" | "exited";
export type RecordType = "lead" | "contact" | "customer";

export interface EnrollContact {
  id: string;
  name: string;
  email: string;
  type: RecordType;
  company: string;
  owner: string;
  score: number;
}

export interface SeqTarget {
  id: string;
  name: string;
  type: "sales" | "marketing";
  steps: number;
  goal: string;
}

export interface AutoTarget {
  id: string;
  name: string;
  object: "lead" | "customer";
  triggerLabel: string;
}

export interface EnrollmentRow {
  id: string;
  contactId: string;
  kind: EnrollKind;
  targetId: string;
  status: EnrollStatus;
  step: string;
  enrolledAt: string;
  replied?: boolean;
}

/* ---------------- contacts ---------------- */
export const ENROLL_CONTACTS: EnrollContact[] = [
  { id: "p1", name: "Ananya Rao", email: "ananya@brightloop.io", type: "lead", company: "BrightLoop", owner: "Priya S", score: 84 },
  { id: "p2", name: "Marcus Steele", email: "marcus@savannahsecure.com", type: "lead", company: "Savannah Secure", owner: "Dev K", score: 61 },
  { id: "p3", name: "Sunita Menon", email: "sunita@northwind.com", type: "customer", company: "Northwind", owner: "Priya S", score: 92 },
  { id: "p4", name: "Vikram Shah", email: "vikram@acmehealth.in", type: "lead", company: "Acme Health", owner: "Ravi T", score: 45 },
  { id: "p5", name: "Meera Iyer", email: "meera@columbusfintech.com", type: "contact", company: "Columbus Fintech", owner: "Dev K", score: 73 },
  { id: "p6", name: "Jordan Ellis", email: "jordan.ellis@bluegrid.io", type: "lead", company: "BlueGrid", owner: "Priya S", score: 88 },
  { id: "p7", name: "Grace Whitfield", email: "grace@decaturhealth.com", type: "customer", company: "Decatur Health", owner: "Ravi T", score: 79 },
  { id: "p8", name: "Omar Farooq", email: "omar@zenithapps.com", type: "lead", company: "Zenith Apps", owner: "Dev K", score: 52 },
  { id: "p9", name: "Lena Costa", email: "lena@harborcrm.com", type: "contact", company: "Harbor", owner: "Priya S", score: 66 },
  { id: "p10", name: "Tushar Baddi", email: "tushar@ivoyant.com", type: "customer", company: "iVoyant", owner: "Ravi T", score: 95 },
  { id: "p11", name: "Nadia Rehman", email: "nadia@peakleads.io", type: "lead", company: "PeakLeads", owner: "Dev K", score: 40 },
  { id: "p12", name: "Chris Doyle", email: "chris@foundryhq.com", type: "lead", company: "Foundry", owner: "Priya S", score: 70 },
];

/* ---------------- sequence targets ---------------- */
export const SEQ_TARGETS: SeqTarget[] = [
  { id: "seq-welcome", name: "New Lead Welcome", type: "marketing", steps: 4, goal: "Replied" },
  { id: "seq-outbound", name: "Outbound Sales Cadence", type: "sales", steps: 6, goal: "Meeting booked" },
  { id: "seq-noshow", name: "Re-engage No-show", type: "sales", steps: 4, goal: "Meeting booked" },
  { id: "seq-webinar", name: "Post-webinar Follow-up", type: "marketing", steps: 3, goal: "Replied" },
  { id: "seq-winback", name: "90-Day Win-back", type: "marketing", steps: 4, goal: "Replied" },
  { id: "seq-feedback", name: "Feedback / Review Request", type: "marketing", steps: 2, goal: "Survey done" },
];

/* ---------------- automation targets (from workflows) ---------------- */
export const AUTO_TARGETS: AutoTarget[] = SAMPLE_WORKFLOWS.map((w) => ({
  id: w.id,
  name: w.name,
  object: w.object,
  triggerLabel: catalogItem(w.triggerType)?.label ?? w.triggerType,
}));

/* ---------------- seed enrollments ---------------- */
const seqSteps = ["Step 1 · Intro email", "Step 2 · Call task", "Step 3 · Value email", "Step 4 · Break-up"];
const autoSteps = ["Assign owner", "Notify owner", "If score ≥ 80", "Enroll in sequence"];

export const SEED_ENROLLMENTS: EnrollmentRow[] = [
  // sequences
  { id: "e1", contactId: "p1", kind: "sequence", targetId: "seq-outbound", status: "active", step: seqSteps[1], enrolledAt: "2d ago" },
  { id: "e2", contactId: "p2", kind: "sequence", targetId: "seq-outbound", status: "active", step: seqSteps[0], enrolledAt: "1d ago" },
  { id: "e3", contactId: "p6", kind: "sequence", targetId: "seq-outbound", status: "exited", step: seqSteps[2], enrolledAt: "5d ago", replied: true },
  { id: "e4", contactId: "p4", kind: "sequence", targetId: "seq-noshow", status: "active", step: seqSteps[0], enrolledAt: "3h ago" },
  { id: "e5", contactId: "p8", kind: "sequence", targetId: "seq-noshow", status: "paused", step: seqSteps[1], enrolledAt: "4d ago" },
  { id: "e6", contactId: "p1", kind: "sequence", targetId: "seq-welcome", status: "completed", step: "Completed", enrolledAt: "1w ago" },
  { id: "e7", contactId: "p9", kind: "sequence", targetId: "seq-webinar", status: "active", step: seqSteps[0], enrolledAt: "6h ago" },
  { id: "e8", contactId: "p3", kind: "sequence", targetId: "seq-feedback", status: "active", step: "Step 1 · Ask review", enrolledAt: "1d ago" },
  { id: "e9", contactId: "p11", kind: "sequence", targetId: "seq-winback", status: "active", step: seqSteps[0], enrolledAt: "2d ago" },
  { id: "e10", contactId: "p12", kind: "sequence", targetId: "seq-outbound", status: "active", step: seqSteps[3], enrolledAt: "8d ago" },
  // automations
  { id: "a1", contactId: "p1", kind: "automation", targetId: "wf-demo", status: "completed", step: autoSteps[3], enrolledAt: "2d ago" },
  { id: "a2", contactId: "p2", kind: "automation", targetId: "wf-demo", status: "active", step: autoSteps[2], enrolledAt: "1d ago" },
  { id: "a3", contactId: "p6", kind: "automation", targetId: "wf-demo", status: "completed", step: autoSteps[3], enrolledAt: "5d ago" },
  { id: "a4", contactId: "p3", kind: "automation", targetId: "wf-onboard", status: "active", step: "Send welcome email", enrolledAt: "1d ago" },
  { id: "a5", contactId: "p7", kind: "automation", targetId: "wf-onboard", status: "active", step: "Wait 3 days", enrolledAt: "3d ago" },
  { id: "a6", contactId: "p10", kind: "automation", targetId: "wf-onboard", status: "completed", step: "Completed", enrolledAt: "1w ago" },
  { id: "a7", contactId: "p3", kind: "automation", targetId: "wf-nps", status: "active", step: "If NPS ≤ 6", enrolledAt: "5h ago" },
];

export function targetName(kind: EnrollKind, id: string): string {
  return kind === "sequence"
    ? SEQ_TARGETS.find((s) => s.id === id)?.name ?? id
    : AUTO_TARGETS.find((a) => a.id === id)?.name ?? id;
}
export function contactById(id: string) {
  return ENROLL_CONTACTS.find((c) => c.id === id);
}
