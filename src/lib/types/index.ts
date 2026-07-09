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

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "paused"
  | "completed";

export type CampaignType = "one-time" | "recurring";

export type CampaignGoalMetric =
  | "opens"
  | "clicks"
  | "form_submissions"
  | "conversions";

export interface CampaignGoal {
  metric: CampaignGoalMetric;
  target: number;
  current: number;
}

export interface CampaignRecurrence {
  frequency: "daily" | "weekly" | "monthly" | "custom";
  /** Cron expression backing the schedule (shown for custom frequency). */
  cron: string;
  startDate: string;
  endDate?: string;
}

export interface ConversionTarget {
  id: string;
  type: "form" | "landing_page";
  name: string;
  url?: string;
  conversions: number;
}

export interface UtmParameters {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

export interface AbTestVariant {
  id: string;
  label: string;
  subject: string;
  sent: number;
  opened: number;
  clicked: number;
  winner?: boolean;
}

export interface AbTestConfig {
  enabled: boolean;
  winnerCriteria: "open_rate" | "click_rate";
  /** Percentage of audience used for the test send. */
  samplePercent: number;
  variants: AbTestVariant[];
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  archived?: boolean;
  channel: "email" | "whatsapp";
  segmentId?: string;
  segmentName: string;
  templateId?: string;
  templateName?: string;
  owner: string;
  goals: CampaignGoal[];
  conversionTargets: ConversionTarget[];
  utmEnabled: boolean;
  utm?: UtmParameters;
  abTest?: AbTestConfig;
  recurrence?: CampaignRecurrence;
  scheduledAt?: string;
  lastRunAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  converted: number;
}

export type RecipientEventType =
  | "queued"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "unsubscribed"
  | "converted";

export interface RecipientTimelineEvent {
  id: string;
  type: RecipientEventType;
  at: string;
  detail?: string;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  contactId?: string;
  name: string;
  email: string;
  status: RecipientEventType;
  lastEventAt: string;
  events: RecipientTimelineEvent[];
}

export interface CampaignDailyStat {
  campaignId: string;
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
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
  // — extended (Module 3) —
  description?: string;
  owner?: string;
  channel?: "email" | "whatsapp" | "multi";
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  activeCount?: number;
  exitedCount?: number;
  sender?: SequenceSender;
  triggers?: SequenceTrigger[];
  exit?: SequenceExitConfig;
  flow?: SequenceStep[];
}

export type SequenceSenderMode = "rep_inbox" | "marketing_address";

export interface SequenceSender {
  mode: SequenceSenderMode;
  /** Marketing mode only — the verified from-name/address and reply-to. */
  fromName?: string;
  fromAddress?: string;
  replyTo?: string;
}

export type SequenceTriggerType =
  | "segment_joined"
  | "form_submitted"
  | "tag_added"
  | "manual"
  | "property_changed"
  | "email_engagement"
  | "date_based"
  | "another_sequence"
  | "webhook"
  | "custom_event";

export interface SequenceTrigger {
  id: string;
  type: SequenceTriggerType;
  segmentId?: string;
  formId?: string;
  tag?: string;
  property?: string;
  operator?: string;
  value?: string;
  engagementEvent?: "opened" | "clicked" | "not_opened";
  engagementRef?: string;
  dateField?: string;
  dateOffsetDays?: number;
  sourceSequenceId?: string;
  eventName?: string;
}

export type ReEnrollmentPolicy = "never" | "cooldown" | "always";

export interface SequenceExitConfig {
  pauseOnReply: boolean;
  goalEnabled: boolean;
  goalCondition?: string;
  suppressionSegmentId?: string;
  unenrollOnSegmentExit: boolean;
  reEnrollment: ReEnrollmentPolicy;
  reEnrollCooldownDays?: number;
  oneActivePerContact: boolean;
}

export type WaitMode = "duration" | "until_date" | "until_condition";

export type SequenceActionType =
  | "create_task"
  | "notify_owner"
  | "adjust_score"
  | "update_property"
  | "add_tag"
  | "remove_tag"
  | "enroll_sequence"
  | "unenroll_sequence"
  | "webhook";

export interface SequenceBranchPath {
  id: string;
  label: string;
  /** Filter expression for the if/else "match" path. */
  condition?: string;
  /** Weight for a percentage split path. */
  percent?: number;
  steps: SequenceStep[];
}

export interface SequenceStepStats {
  reached: number;
  sent: number;
  opened: number;
  clicked: number;
  continued: number;
}

export interface SequenceStep {
  id: string;
  type: SequenceStepType;
  label: string;
  /** Legacy one-line config summary (still rendered as a fallback). */
  config?: string;
  order?: number;
  // email
  templateId?: string;
  subject?: string;
  // whatsapp
  snippet?: string;
  // wait
  waitMode?: WaitMode;
  waitValue?: number;
  waitUnit?: "minutes" | "hours" | "days";
  waitDate?: string;
  waitField?: string;
  waitCondition?: string;
  waitTimeoutDays?: number;
  businessDaysOnly?: boolean;
  // branch
  branchKind?: "if_else" | "percentage";
  branches?: SequenceBranchPath[];
  // action
  actionType?: SequenceActionType;
  actionSummary?: string;
  // goal
  goalCondition?: string;
  // per-step performance (email/whatsapp)
  stats?: SequenceStepStats;
}

export type SequenceEnrollmentState = "active" | "completed" | "exited";

export type SequenceExitReason =
  | "replied"
  | "goal_met"
  | "manual"
  | "suppressed"
  | "criteria_no_longer_met"
  | "bounced";

export interface SequenceEnrollmentEvent {
  id: string;
  stepLabel: string;
  at: string;
  outcome:
    | "enrolled"
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "waiting"
    | "branched"
    | "task_created"
    | "completed"
    | "exited";
  detail?: string;
}

export interface SequenceEnrollment {
  id: string;
  sequenceId: string;
  contactId?: string;
  contactName: string;
  email: string;
  state: SequenceEnrollmentState;
  currentStepLabel?: string;
  exitReason?: SequenceExitReason;
  source: SequenceTriggerType;
  enrolledAt: string;
  updatedAt: string;
  events: SequenceEnrollmentEvent[];
}

export interface SequenceTemplate {
  id: string;
  name: string;
  description: string;
  type: "marketing" | "sales";
  category: "welcome" | "re-engage" | "event" | "feedback" | "onboarding" | "sales";
  channel: "email" | "whatsapp" | "multi";
  sender: SequenceSender;
  triggers: SequenceTrigger[];
  exit: SequenceExitConfig;
  flow: SequenceStep[];
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

export type SequenceStepType =
  | "email"
  | "whatsapp"
  | "wait"
  | "branch"
  | "action"
  | "goal"
  | "task";

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

export type EmailBlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "social"
  | "columns"
  | "html"
  | "dynamic";

export interface EmailDynamicVariant {
  id: string;
  label: string;
  condition?: string;
  text: string;
}

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  text?: string;
  level?: 1 | 2 | 3;
  align?: "left" | "center" | "right";
  url?: string;
  src?: string;
  alt?: string;
  height?: number;
  socials?: string[];
  html?: string;
  /** Two/three column layout — one entry of text per column. */
  colText?: string[];
  /** Phase-2 dynamic content — first variant is the default/fallback. */
  dynamicVariants?: EmailDynamicVariant[];
  bgColor?: string;
  textColor?: string;
  buttonColor?: string;
}

export type EmailTemplateStatus = "draft" | "published" | "archived";

export type EmailTemplateType =
  | "newsletter"
  | "promotional"
  | "transactional"
  | "announcement"
  | "welcome"
  | "event";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  sent: number;
  openRate: number;
  clickRate: number;
  updatedAt: string;
  // — extended (Email Marketing module) —
  description?: string;
  status?: EmailTemplateStatus;
  type?: EmailTemplateType;
  preheader?: string;
  fromName?: string;
  owner?: string;
  createdAt?: string;
  accent?: string;
  blocks?: EmailBlock[];
  htmlMode?: boolean;
  rawHtml?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
  predictiveSendTime?: boolean;
  deliveredRate?: number;
  bounceRate?: number;
  unsubRate?: number;
}

export interface EmailStarter {
  id: string;
  name: string;
  description: string;
  type: EmailTemplateType;
  accent: string;
  subject: string;
  blocks: EmailBlock[];
}

export interface PersonalizationToken {
  token: string;
  label: string;
  sample: string;
}

export interface UnsubscribeTopic {
  id: string;
  label: string;
  description: string;
  subscribers: number;
  required?: boolean;
}

export interface UnsubscribeReasonStat {
  reason: string;
  count: number;
}

export type InboxCategory =
  | "lead"
  | "complaint"
  | "request"
  | "question"
  | "billing"
  | "support";

export interface InboxMessage {
  id: string;
  contactId?: string;
  contactName: string;
  contactEmail: string;
  channel: "email" | "whatsapp";
  subject: string;
  preview: string;
  /** Full inbound message body; falls back to preview when absent. */
  body?: string;
  category?: InboxCategory;
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
  // — extended (visual workflow canvas) —
  description?: string;
  owner?: string;
  category?: string;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  activeCount?: number;
  completedCount?: number;
  triggers?: AutomationTrigger[];
  nodes?: AutomationNode[];
  settings?: AutomationSettings;
  runLog?: AutomationRunLogEntry[];
  goalMet?: number;
}

export type AutomationTriggerType =
  | "form_submitted"
  | "segment_joined"
  | "list_membership"
  | "property_changed"
  | "tag_added"
  | "page_viewed"
  | "email_engagement"
  | "deal_stage"
  | "date_based"
  | "custom_event"
  | "webhook"
  | "manual";

export interface AutomationTrigger {
  id: string;
  type: AutomationTriggerType;
  segmentId?: string;
  formId?: string;
  listName?: string;
  property?: string;
  operator?: string;
  value?: string;
  tag?: string;
  pageUrl?: string;
  engagementEvent?: "opened" | "clicked" | "not_opened";
  engagementRef?: string;
  dealStage?: string;
  dateField?: string;
  dateOffsetDays?: number;
  eventName?: string;
}

export type AutomationNodeType =
  | "send_email"
  | "send_whatsapp"
  | "delay"
  | "branch"
  | "action"
  | "goal"
  | "end";

export type AutomationActionType =
  | "set_property"
  | "add_tag"
  | "remove_tag"
  | "adjust_score"
  | "set_lifecycle"
  | "create_task"
  | "create_deal"
  | "rotate_owner"
  | "notify_team"
  | "enroll_sequence"
  | "unenroll_sequence"
  | "webhook";

export interface AutomationBranchPath {
  id: string;
  label: string;
  condition?: string;
  percent?: number;
  nodes: AutomationNode[];
}

export interface AutomationNode {
  id: string;
  type: AutomationNodeType;
  label: string;
  // communication
  templateId?: string;
  subject?: string;
  snippet?: string;
  // delay
  delayMode?: "duration" | "until_date" | "until_condition";
  delayValue?: number;
  delayUnit?: "minutes" | "hours" | "days";
  delayField?: string;
  delayCondition?: string;
  delayTimeoutDays?: number;
  businessDaysOnly?: boolean;
  // branch
  branchKind?: "if_else" | "percentage";
  branches?: AutomationBranchPath[];
  // action
  actionType?: AutomationActionType;
  actionSummary?: string;
  // goal
  goalCondition?: string;
  // per-node stats
  reached?: number;
  completed?: number;
}

export interface AutomationSettings {
  reEnrollment: ReEnrollmentPolicy;
  reEnrollCooldownDays?: number;
  suppressionSegmentId?: string;
  goalCondition?: string;
  quietHours?: boolean;
}

export interface AutomationRunLogEntry {
  id: string;
  contactName: string;
  at: string;
  nodeLabel: string;
  outcome: "enrolled" | "action" | "email_sent" | "branched" | "waiting" | "goal_met" | "completed" | "exited" | "error";
  detail?: string;
}

export interface AutomationRecipe {
  id: string;
  name: string;
  description: string;
  category: "lead" | "sales" | "retention" | "ops" | "event";
  triggers: AutomationTrigger[];
  nodes: AutomationNode[];
  settings: AutomationSettings;
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

export type SegmentType = "dynamic" | "static";

export type SegmentOrigin = "manual" | "ai_suggested" | "lookalike";

export type SegmentFieldCategory = "crm" | "behavioral" | "custom";

export interface SegmentCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface SegmentConditionGroup {
  id: string;
  /** How conditions inside this group combine. */
  match: "all" | "any";
  conditions: SegmentCondition[];
}

export interface SegmentDefinition {
  /** How groups combine with each other. */
  match: "all" | "any";
  groups: SegmentConditionGroup[];
}

export interface SegmentRefreshEntry {
  id: string;
  at: string;
  trigger: "scheduled" | "manual";
  delta: number;
  durationMs: number;
}

export interface SegmentRefreshConfig {
  mode: "scheduled" | "manual";
  frequency?: "hourly" | "daily" | "weekly";
  lastRefreshedAt?: string;
  nextRefreshAt?: string;
  history: SegmentRefreshEntry[];
}

export interface SegmentUsageRef {
  module: "campaign" | "sequence" | "automation";
  refId: string;
  name: string;
  status: string;
}

export interface SegmentRecord {
  id: string;
  name: string;
  description?: string;
  type: SegmentType;
  origin: SegmentOrigin;
  archived?: boolean;
  memberCount: number;
  /** Net member change over the last 7 days. */
  weeklyChange: number;
  definition?: SegmentDefinition;
  staticMemberIds?: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
  refresh: SegmentRefreshConfig;
  usedIn: SegmentUsageRef[];
}

export interface SegmentSuggestion {
  id: string;
  name: string;
  rationale: string;
  predictedCount: number;
  confidence: number;
  definition: SegmentDefinition;
}

export interface SegmentGrowthPoint {
  segmentId: string;
  date: string;
  count: number;
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

// ── AI Chatbot ──────────────────────────────────────────────────────────────

export type ChatbotStatus = "active" | "paused" | "draft";

export type ChatbotLauncherPosition = "bottom-right" | "bottom-left";

export type ChatbotSourceType = "document" | "url" | "faq" | "text";
export type ChatbotSourceStatus = "trained" | "training" | "queued" | "error";

export interface ChatbotKnowledgeSource {
  id: string;
  type: ChatbotSourceType;
  name: string;
  detail?: string;
  status: ChatbotSourceStatus;
  chunks?: number;
  updatedAt: string;
}

export type ChatIntentAction = "answer" | "route_team" | "capture_lead" | "handoff" | "link";

export interface ChatbotIntent {
  id: string;
  name: string;
  description?: string;
  examples: string[];
  action: ChatIntentAction;
  target?: string;
}

export type ChatLeadAskWhen = "start" | "after_intent" | "before_handoff";

export interface ChatLeadField {
  id: string;
  label: string;
  crmField: string;
  required: boolean;
  askWhen: ChatLeadAskWhen;
}

export type ChatHandoffTrigger =
  | "user_request"
  | "negative_sentiment"
  | "no_answer"
  | "high_intent"
  | "keyword"
  | "off_hours";

export interface ChatHandoffRule {
  id: string;
  trigger: ChatHandoffTrigger;
  keyword?: string;
  routeTo: "inbox" | "owner" | "team";
  target?: string;
}

export interface ChatbotWidget {
  botName: string;
  headerSubtitle?: string;
  themeColor: string;
  launcher: ChatbotLauncherPosition;
  avatarInitials?: string;
  welcomeMessage: string;
  suggestedPrompts: string[];
}

/** Where a bot's embeddable widget appears on the external website. */
export interface ChatbotPlacement {
  mode: "everywhere" | "targeted";
  /** URL path patterns the bot shows on (targeted mode). */
  include: string[];
  /** URL path patterns the bot is always hidden on. */
  exclude: string[];
  /** Allowed domains the embed is authorized for. */
  domains: string[];
}

export interface ChatbotCrmSync {
  createContact: boolean;
  updateContact: boolean;
  logTranscript: boolean;
  defaultOwner?: string;
  lifecycleStage?: string;
}

export interface Chatbot {
  id: string;
  name: string;
  description?: string;
  status: ChatbotStatus;
  archived?: boolean;
  owner?: string;
  createdAt: string;
  updatedAt: string;
  widget: ChatbotWidget;
  placement?: ChatbotPlacement;
  sources: ChatbotKnowledgeSource[];
  intents: ChatbotIntent[];
  leadFields: ChatLeadField[];
  handoffRules: ChatHandoffRule[];
  crm: ChatbotCrmSync;
  // rolling stats
  conversations: number;
  resolvedByBot: number;
  leadsCaptured: number;
  handoffs: number;
  deflectionRate: number;
}

export type ChatMessageRole = "bot" | "visitor" | "agent" | "system";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  text: string;
  at: string;
}

export type ChatConversationStatus = "bot" | "handed_off" | "resolved" | "abandoned";
export type ChatSentiment = "positive" | "neutral" | "negative";

export interface ChatConversation {
  id: string;
  chatbotId: string;
  visitorName: string;
  visitorEmail?: string;
  contactId?: string;
  status: ChatConversationStatus;
  intent?: string;
  leadCaptured: boolean;
  sentiment?: ChatSentiment;
  assignedTo?: string;
  page?: string;
  startedAt: string;
  lastAt: string;
  messages: ChatMessage[];
}

export interface ChatIntentStat {
  intent: string;
  count: number;
}

export interface ChatVolumePoint {
  date: string;
  conversations: number;
  resolved: number;
}

// ── AI-Powered Email Draft Assistance ───────────────────────────────────────

export type AiTone =
  | "friendly"
  | "professional"
  | "playful"
  | "concise"
  | "persuasive"
  | "empathetic";

export type AiLength = "short" | "medium" | "long";

export interface AiDraftContext {
  goal: string;
  audience: string;
  tone: AiTone;
  keyMessage: string;
  length: AiLength;
  cta: string;
  applyBrandVoice: boolean;
}

export interface AiSubjectOption {
  id: string;
  text: string;
  preheader: string;
  rationale: string;
}

export type AiSectionKind = "greeting" | "paragraph" | "cta" | "signoff";

export interface AiDraftSection {
  id: string;
  kind: AiSectionKind;
  label: string;
  text: string;
}

export type AiRewriteAction =
  | "shorten"
  | "expand"
  | "formalize"
  | "casual"
  | "strengthen_cta"
  | "brand_voice";

export interface BrandVoice {
  attributes: string[];
  readingLevel: "simple" | "standard" | "expert";
  emoji: "none" | "sparingly" | "liberal";
  doList: string[];
  dontList: string[];
  sample: string;
  signature: string;
}

export type AiNextActionType = "campaign" | "sequence" | "segment" | "send_time" | "content";

export interface AiNextAction {
  id: string;
  title: string;
  rationale: string;
  type: AiNextActionType;
  impact: string;
  confidence: number;
}

export type AiAgentStepStatus =
  | "pending"
  | "awaiting_approval"
  | "approved"
  | "done"
  | "rejected";

export interface AiAgentStep {
  id: string;
  title: string;
  detail: string;
  requiresApproval: boolean;
  status: AiAgentStepStatus;
}

export interface AiAgentRun {
  id: string;
  goal: string;
  status: "planning" | "awaiting_approval" | "running" | "completed";
  steps: AiAgentStep[];
}

/** A one-click starting point that prefills the composer/compose brief. */
export interface AiEmailStarter {
  id: string;
  label: string;
  /** lucide icon name, mapped in the UI. */
  icon: string;
  description: string;
  goal: string;
  tone: AiTone;
  cta: string;
}

/** Brief for composing a fresh, one-off email to a specific recipient. */
export interface AiComposeContext {
  goal: string;
  tone: AiTone;
  keyPoints: string;
  recipientName?: string;
}

export type AiDraftStatus = "idle" | "generating" | "ready" | "error";

export type AiDraftSource = "studio" | "compose" | "inbox" | "editor";

export type AiSavedDraftStatus = "draft" | "scheduled" | "sent";

/** A generated draft persisted to the draft-history store. */
export interface AiSavedDraft {
  id: string;
  subject: string;
  /** Assembled plain-text body. */
  body: string;
  goal: string;
  tone: AiTone;
  audience: string;
  recipientName?: string;
  recipientEmail?: string;
  source: AiDraftSource;
  status: AiSavedDraftStatus;
  createdAt: string;
  updatedAt: string;
}
