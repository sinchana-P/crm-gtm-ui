export type PluginId = "marketing" | "cases" | "esign";

export type LifecycleStage =
  | "subscriber"
  | "lead"
  | "mql"
  | "sql"
  | "customer"
  | "churned";

export type Channel = "email" | "phone" | "whatsapp" | "web" | "instagram" | "facebook";

export interface ConsentPreferences {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
  topics: string[];
}

export interface EngagementSummary {
  lastTouchAt: string;
  daysSinceContact: number;
  emailsSent: number;
  emailsOpened: number;
  channelMix: Record<Channel, number>;
}

export interface ContactRecord {
  id: string;
  type: "lead" | "contact" | "customer";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  title?: string;
  owner: string;
  ownerId: string;
  source: string;
  lifecycleStage: LifecycleStage;
  leadScore: number;
  healthScore: number;
  tags: string[];
  territory?: string;
  pincode?: string;
  lastActivity: string;
  nextActivity?: string;
  createdAt: string;
  consent: ConsentPreferences;
  engagement: EngagementSummary;
  duplicateFlag?: boolean;
  openCases?: number;
  slaStatus?: "green" | "amber" | "red";
}

export interface ActivityItem {
  id: string;
  contactId: string;
  type: "note" | "email" | "call" | "task" | "meeting" | "case" | "esign" | "campaign";
  title: string;
  body?: string;
  channel?: Channel;
  outcome?: string;
  duration?: number;
  createdAt: string;
  createdBy: string;
}

export interface DuplicatePair {
  id: string;
  contactA: ContactRecord;
  contactB: ContactRecord;
  matchReason: string;
  confidence: number;
}

export interface ListRecord {
  id: string;
  name: string;
  type: "static" | "dynamic";
  count: number;
  criteria?: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused";
  channel: "email" | "whatsapp";
  segmentName: string;
  scheduledAt?: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export interface Sequence {
  id: string;
  name: string;
  type: "marketing" | "sales";
  status: "active" | "paused" | "draft";
  enrolled: number;
  completed: number;
  replied: number;
  steps: number;
  pauseOnReply: boolean;
}

export interface CaseRecord {
  id: string;
  number: string;
  title: string;
  contactId: string;
  contactName: string;
  type: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "new" | "open" | "pending" | "resolved" | "closed";
  assignee: string;
  slaDue: string;
  slaStatus: "green" | "amber" | "red";
  createdAt: string;
  updatedAt: string;
  description: string;
}

export interface EsignEnvelope {
  id: string;
  name: string;
  contactId: string;
  contactName: string;
  status: "draft" | "sent" | "viewed" | "signed" | "declined" | "expired";
  signingOrder: "sequential" | "parallel";
  signers: number;
  signed: number;
  sentAt?: string;
  expiresAt?: string;
}

export interface NavItem {
  id: string;
  label: string;
  /** Optional for parent items that only expand/collapse their children. */
  href?: string;
  icon: string;
  plugin?: PluginId;
  section: "core" | "marketing" | "cases" | "esign" | "settings";
  badge?: string;
  /** Nested sub-items rendered under a collapsible parent. */
  children?: NavItem[];
}

export type SequenceStepType = "email" | "wait" | "task" | "whatsapp" | "branch";

export interface SequenceStep {
  id: string;
  type: SequenceStepType;
  label: string;
  config: string;
  order: number;
}

export interface SequencePack {
  id: string;
  name: string;
  description: string;
  type: "marketing" | "sales";
  steps: number;
  category: "welcome" | "re-engage" | "event" | "feedback";
}

export interface MarketingForm {
  id: string;
  name: string;
  status: "draft" | "published";
  submissions: number;
  conversionRate: number;
  abandonmentRecoverySequenceId?: string;
  recaptchaEnabled: boolean;
  steps: number;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  sent: number;
  openRate: number;
  clickRate: number;
  updatedAt: string;
}

export interface InboxMessage {
  id: string;
  contactId?: string;
  contactName: string;
  contactEmail: string;
  channel: "email" | "whatsapp";
  subject: string;
  preview: string;
  assignee?: string;
  unread: boolean;
  receivedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "campaign" | "sequence";
  date: string;
  channel: "email" | "whatsapp";
}

export interface Automation {
  id: string;
  name: string;
  status: "active" | "paused" | "draft";
  trigger: string;
  actions: number;
  enrolled: number;
  lastRun?: string;
}

export interface SuppressionEntry {
  id: string;
  email: string;
  reason: "bounce" | "unsubscribe" | "complaint" | "manual";
  addedAt: string;
}

export interface DeliverabilityHealth {
  score: number;
  spf: "verified" | "pending" | "failed";
  dkim: "verified" | "pending" | "failed";
  dmarc: "verified" | "pending" | "failed";
  bounceRate: number;
  complaintRate: number;
}

export interface SegmentCriterion {
  field: string;
  operator: string;
  value: string;
}

export interface CaseTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  defaultPriority: CaseRecord["priority"];
  defaultAssignee: string;
  slaHours: number;
  fieldMappings: { templateField: string; contactField: string }[];
  active: boolean;
}

export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  type: "created" | "status" | "comment" | "assignment" | "sla" | "resolved";
  title: string;
  body?: string;
  actor: string;
  createdAt: string;
}

export interface EsignTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: { label: string; crmField: string }[];
  lastUsed?: string;
  active: boolean;
}

export interface AssignmentRule {
  id: string;
  name: string;
  objectType: "lead" | "contact" | "case";
  criteria: string;
  method: "round_robin" | "load_balanced" | "territory";
  assignees: string[];
  priority: number;
  active: boolean;
}

export interface ScoringRule {
  id: string;
  name: string;
  type: "rule" | "behavioral" | "ai";
  condition: string;
  points: number;
  active: boolean;
}

export interface CustomField {
  id: string;
  objectType: "contact" | "lead" | "case" | "deal";
  label: string;
  apiName: string;
  fieldType: "text" | "number" | "date" | "picklist" | "boolean";
  required: boolean;
  visible: boolean;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  category: "cases" | "esign" | "messaging" | "email";
  provider: string;
  status: "connected" | "disconnected" | "error" | "pending";
  lastSync?: string;
  description: string;
}

export type WorkQueueTaskType = "overdue_followup" | "hot_lead" | "sla_breach";

export interface WorkQueueItem {
  id: string;
  contactId: string;
  contactName: string;
  type: WorkQueueTaskType;
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  dueAt: string;
  owner: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  contactId: string;
  contactName: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface SurveyFlow {
  id: string;
  name: string;
  status: "active" | "draft" | "paused";
  responses: number;
  nps?: number;
  channels: string[];
  promoterPath: string;
  detractorPath: string;
  trigger?: string;
  followUpAction?: string;
}

export type OutreachChannel = "email" | "whatsapp" | "sms" | "portal";

export type OutreachDispatchStatus =
  | "draft"
  | "sent"
  | "opened"
  | "in_progress"
  | "completed"
  | "expired"
  | "bounced";

export interface DocumentChecklistItem {
  id: string;
  label: string;
  description?: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeMb: number;
}

export interface DocumentRequestTemplate {
  id: string;
  name: string;
  description: string;
  category: "onboarding" | "kyc" | "compliance" | "support" | "custom";
  items: DocumentChecklistItem[];
  defaultTtlDays: number;
  defaultChannels: OutreachChannel[];
}

export interface OutreachDispatch {
  id: string;
  type: "document_request" | "survey";
  contactId: string;
  contactName: string;
  contactEmail: string;
  subject: string;
  templateId?: string;
  templateName?: string;
  surveyId?: string;
  surveyName?: string;
  channels: OutreachChannel[];
  status: OutreachDispatchStatus;
  sentAt: string;
  expiresAt: string;
  openedAt?: string;
  completedAt?: string;
  progress?: { completed: number; total: number };
  magicLinkToken: string;
  sentBy: string;
  notes?: string;
}

export interface MagicLinkSession {
  token: string;
  contactName: string;
  company: string;
  repName: string;
  repEmail: string;
  purpose: string;
  expiresAt: string;
  items: DocumentChecklistItem[];
  completedItemIds: string[];
}

export interface DashboardStats {
  totalContacts: number;
  newThisWeek: number;
  healthAvg: number;
  duplicatesPending: number;
}

export interface SourceMixItem {
  source: string;
  count: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
}

export type RepTimeframe = "today" | "week" | "month";

export interface RepStat {
  id: string;
  label: string;
  value: number | string;
  hint?: string;
  trend?: string;
  positive?: boolean;
}

export interface RepActionItem {
  id: string;
  contactId: string;
  contactName: string;
  title: string;
  type: WorkQueueTaskType | "call" | "email" | "meeting" | "esign" | "inbox";
  priority: "low" | "medium" | "high" | "urgent";
  dueAt: string;
  timeframe: RepTimeframe;
  suggestedAction: string;
  channel?: Channel;
}

export interface RepPeriodSummary {
  timeframe: RepTimeframe;
  headline: string;
  focus: string;
  stats: RepStat[];
  actions: RepActionItem[];
  goals?: { label: string; current: number; target: number }[];
}
