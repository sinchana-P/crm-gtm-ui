/**
 * Case Manager integration types (UI-only mocks).
 *
 * Grounded on the real case-manager-ui domain model:
 * - Cases carry a `displayId` (e.g. DIS-2607-0105), belong to a Project + Queue,
 *   and link to CRM contacts via `clientIds` (CM's `Case.clientId: number[]`).
 * - CM's default case statuses are Open / In Progress / Closed / Resolved; we add
 *   New + Pending to align with the CRM Customer Portal request lifecycle.
 * - Inquiry intake statuses mirror CM's InquiryStatusEnum (NEW/RESPONDED/CONVERTED/CLOSED).
 * - Project statuses mirror CM's ProjectStatusTitle.
 */

export type CmPriority = "low" | "medium" | "high" | "urgent";
export type SlaStatus = "green" | "amber" | "red";

export type CmCaseStatus =
  | "New"
  | "In Progress"
  | "Pending"
  | "Resolved"
  | "Closed";

/** Ordered lifecycle used by the status stepper + guarded transitions. */
export const CM_CASE_LIFECYCLE: CmCaseStatus[] = [
  "New",
  "In Progress",
  "Pending",
  "Resolved",
  "Closed",
];

/** Where the case originated — drives the intake funnel + 360 back-sync. */
export type CaseSource = "portal" | "inquiry" | "crm" | "email";

export type CmTimelineType =
  | "created"
  | "assignment"
  | "status"
  | "comment"
  | "sla"
  | "escalation"
  | "resolved"
  | "document"
  | "handback"
  | "sync";

export interface CmTimelineEvent {
  id: string;
  type: CmTimelineType;
  title: string;
  body?: string;
  actor: string;
  createdAt: string;
}

export interface CmTask {
  id: string;
  title: string;
  assignee: string;
  done: boolean;
  dueAt?: string;
}

export interface CmDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CmCustomField {
  label: string;
  value: string;
}

export interface CmCase {
  id: string;
  /** CM-style human id, e.g. DIS-2607-0105 */
  displayId: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  queueId: string;
  queueName: string;
  caseType: string;
  status: CmCaseStatus;
  priority: CmPriority;
  assignee: string;
  watchers: string[];
  /** CRM contact ids (maps to CM Case.clientId[]). */
  clientIds: string[];
  slaDue: string;
  slaStatus: SlaStatus;
  source: CaseSource;
  /** Portal request number / inquiry display id / CRM record id. */
  sourceRef?: string;
  escalationTier?: 1 | 2 | 3;
  createdAt: string;
  updatedAt: string;
  customFields: CmCustomField[];
  timeline: CmTimelineEvent[];
  tasks: CmTask[];
  documents: CmDocument[];
  linkedCaseIds: string[];
  /** Set when a resolved case has been handed back to sales. */
  handbackRef?: string;
  csatScore?: number;
}

export type CmProjectStatus =
  | "Active"
  | "Completed"
  | "On Hold"
  | "Cancelled"
  | "Archived";

export interface CmProject {
  id: string;
  displayId: string;
  name: string;
  description: string;
  status: CmProjectStatus;
  lead: string;
  team: string[];
  openCases: number;
  totalCases: number;
  overdueCases: number;
  slaCompliance: number;
  /** CRM case type(s) routed into this project. */
  crmCaseTypes: string[];
}

export interface CmQueue {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  openCases: number;
  slaBreaches: number;
  avgResolutionHrs: number;
  members: string[];
}

export interface CmTemplateField {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "number" | "attachment";
  required: boolean;
  /** CRM contact field this prefills from, if any. */
  crmField?: string;
}

export interface CmCaseTemplate {
  id: string;
  name: string;
  caseType: string;
  projectId: string;
  projectName: string;
  defaultPriority: CmPriority;
  defaultQueueId: string;
  slaHours: number;
  fields: CmTemplateField[];
  active: boolean;
  usageCount: number;
}

/* ---------- Intake (front-office → back-office bridge) ---------- */

export type IntakeChannel = "portal" | "inquiry" | "email";
/** Mirrors CM InquiryStatusEnum. */
export type IntakeStatus = "New" | "Responded" | "Converted" | "Closed";

export interface IntakeItem {
  id: string;
  channel: IntakeChannel;
  status: IntakeStatus;
  subject: string;
  body: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone?: string;
  /** Matched CRM contact (undefined = anonymous, needs new contact). */
  linkedContactId?: string;
  /** Set once converted. */
  caseId?: string;
  priority: CmPriority;
  receivedAt: string;
  /** Portal request number or inquiry display id. */
  sourceRef?: string;
  /** Points at another intake id when a likely duplicate is detected. */
  duplicateOfId?: string;
  /** Inquiry form name, when channel === "inquiry". */
  formName?: string;
}

/* ---------- Automations / routing (mirrors CM WORKFLOW_*) ---------- */

export type CmAutomationTrigger =
  | "NEW_CASE_CREATED"
  | "QUEUE_CHANGED"
  | "STATUS_CHANGED"
  | "SLA_AT_RISK"
  | "EMAIL_RECEIVED"
  | "INTAKE_RECEIVED";

export interface CmAutomationCondition {
  field: string;
  operator: string;
  value: string;
}

export interface CmAutomationAction {
  type: "assign" | "notify" | "escalate" | "comment" | "set_priority" | "route";
  target?: string;
  value?: string;
}

export interface CmAutomation {
  id: string;
  name: string;
  enabled: boolean;
  scope: "global" | string;
  trigger: CmAutomationTrigger;
  conditions: CmAutomationCondition[];
  actions: CmAutomationAction[];
  runs: number;
  lastRunAt?: string;
}

/* ---------- Integration governance ---------- */

export type SyncDirection = "crm_to_cm" | "cm_to_crm" | "both";

export interface SyncLogEntry {
  id: string;
  direction: Exclude<SyncDirection, "both">;
  entity: "Contact" | "Customer" | "Case" | "Request" | "Inquiry" | "Note";
  recordLabel: string;
  action: "create" | "update" | "link" | "resolve" | "escalate";
  status: "success" | "pending" | "failed";
  at: string;
  detail?: string;
}

export interface FieldMapping {
  id: string;
  crmObject: string;
  crmField: string;
  cmObject: string;
  cmField: string;
  direction: SyncDirection;
  transform?: string;
}

export interface ValueMapping {
  label: string;
  crmValue: string;
  cmValue: string;
}

export type ConflictRule =
  | "crm_wins"
  | "cm_wins"
  | "latest_wins"
  | "manual";

export interface IntegrationConnection {
  connected: boolean;
  /** Step 1: CM integration token pasted into CRM. */
  cmTokenAccepted: boolean;
  /** Step 2: CRM-issued API key (cnx_live_...). */
  crmApiKey?: string;
  lastSyncAt?: string;
  recordsSynced: number;
  syncDirection: SyncDirection;
  conflictRule: ConflictRule;
  autoConvertInquiries: boolean;
  syncResolutionToPortal: boolean;
}
