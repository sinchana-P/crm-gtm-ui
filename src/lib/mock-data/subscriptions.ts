// Mock data for the Subscriptions / Unsubscribes module (UI-only, no backend).
// Models topic-level subscriptions, a global suppression list, per-contact
// marketable status, a consent audit trail, and the open/click/unsub reporting trio.

export type MarketableStatus =
  | "subscribed"
  | "partial"
  | "unsubscribed"
  | "bounced"
  | "complained"
  | "suppressed"
  | "pending";

export type SuppressionReason =
  | "unsubscribe"
  | "bounce"
  | "complaint"
  | "manual"
  | "import"
  | "global-opt-out";

export type ConsentAction =
  | "subscribed"
  | "unsubscribed"
  | "resubscribed"
  | "suppressed"
  | "imported"
  | "bounced"
  | "complained";

export interface SubTopic {
  id: string;
  name: string;
  description: string;
  required: boolean;
  defaultOptIn: boolean;
  subscribers: number;
}

export interface SuppressionRow {
  id: string;
  email: string;
  name: string;
  reason: SuppressionReason;
  scope: "global" | "topic";
  topic?: string;
  addedAt: string;
  addedBy: string;
  note?: string;
}

export interface SubContact {
  id: string;
  name: string;
  email: string;
  status: MarketableStatus;
  topics: Record<string, boolean>; // topicId -> subscribed
  segments: string[];
  lastActivityAt: string;
  source: string;
}

export interface ConsentEvent {
  id: string;
  email: string;
  name: string;
  action: ConsentAction;
  topic?: string;
  source: string; // preference-page, form, import, admin, provider, one-click
  actor: string;
  at: string;
  reason?: string;
}

/* ------------------------------- TOPICS -------------------------------- */
export const SUB_TOPICS: SubTopic[] = [
  { id: "t-news", name: "Newsletter", description: "Monthly digest of tips and stories.", required: false, defaultOptIn: true, subscribers: 9420 },
  { id: "t-product", name: "Product updates", description: "New features, releases, and changelog.", required: false, defaultOptIn: true, subscribers: 11840 },
  { id: "t-offers", name: "Offers & promotions", description: "Discounts and limited-time deals.", required: false, defaultOptIn: false, subscribers: 6210 },
  { id: "t-events", name: "Events & webinars", description: "Invitations to live and virtual events.", required: false, defaultOptIn: false, subscribers: 4880 },
  { id: "t-txn", name: "Transactional", description: "Receipts, security, and account notices.", required: true, defaultOptIn: true, subscribers: 12847 },
];

/* --------------------------- STATUS SUMMARY ---------------------------- */
export const AUDIENCE_STATUS_COUNTS: { status: MarketableStatus; label: string; count: number }[] = [
  { status: "subscribed", label: "Subscribed", count: 11290 },
  { status: "partial", label: "Partially subscribed", count: 3120 },
  { status: "unsubscribed", label: "Unsubscribed (all)", count: 842 },
  { status: "bounced", label: "Bounced", count: 214 },
  { status: "complained", label: "Complained", count: 37 },
  { status: "suppressed", label: "Suppressed (manual)", count: 96 },
  { status: "pending", label: "Pending opt-in", count: 158 },
];

export const SUB_KPIS = {
  totalContacts: 15757,
  marketable: 14410,
  suppressedTotal: 1347, // unsubscribed + bounced + complained + manual
  netListGrowth: 3.9,
};

/* ----------------------------- SUPPRESSION ----------------------------- */
export const SUPPRESSIONS: SuppressionRow[] = [
  { id: "s1", email: "eddie.murphy@gmail.com", name: "Eddie Murphy", reason: "unsubscribe", scope: "global", addedAt: "2026-06-24T10:12:00Z", addedBy: "Recipient", note: "Unsubscribed from all" },
  { id: "s2", email: "no-reply@bounced.co", name: "—", reason: "bounce", scope: "global", addedAt: "2026-06-24T08:40:00Z", addedBy: "System", note: "Hard bounce (550 no such user)" },
  { id: "s3", email: "spam.reporter@mail.com", name: "—", reason: "complaint", scope: "global", addedAt: "2026-06-23T16:20:00Z", addedBy: "System", note: "Marked as spam" },
  { id: "s4", email: "rita.chen@oldcorp.com", name: "Rita Chen", reason: "unsubscribe", scope: "topic", topic: "Offers & promotions", addedAt: "2026-06-23T09:05:00Z", addedBy: "Recipient" },
  { id: "s5", email: "legal@donotcontact.org", name: "—", reason: "manual", scope: "global", addedAt: "2026-06-21T14:00:00Z", addedBy: "Priya Sharma", note: "Legal request" },
  { id: "s6", email: "bulk1@importlist.com", name: "—", reason: "import", scope: "global", addedAt: "2026-06-20T11:30:00Z", addedBy: "CSV import" },
  { id: "s7", email: "sam.torres@webmail.com", name: "Sam Torres", reason: "unsubscribe", scope: "global", addedAt: "2026-06-19T13:22:00Z", addedBy: "Recipient", note: "Too many emails" },
  { id: "s8", email: "hardbounce@nodomain.zz", name: "—", reason: "bounce", scope: "global", addedAt: "2026-06-18T07:11:00Z", addedBy: "System", note: "Hard bounce (domain not found)" },
];

/* --------------------- SUPPRESSION AUTO-SOURCES ------------------------ */
// The list is event-sourced: entries flow in automatically. "On request" is
// the only human-entered channel and exists purely for compliance edge cases.
export interface SuppressionSource {
  id: SuppressionReason | "provider" | "api";
  label: string;
  description: string;
  auto: boolean;
  twoWay?: boolean;
  last7d: number;
  total: number;
}
export const SUPPRESSION_SOURCES: SuppressionSource[] = [
  { id: "unsubscribe", label: "Unsubscribe links", description: "One-click & preference center", auto: true, last7d: 128, total: 842 },
  { id: "bounce", label: "Hard bounces", description: "Captured from the email provider", auto: true, last7d: 34, total: 214 },
  { id: "complaint", label: "Spam complaints", description: "ISP feedback loops", auto: true, last7d: 6, total: 37 },
  { id: "provider", label: "Provider sync", description: "Two-way with the email provider", auto: true, twoWay: true, last7d: 19, total: 512 },
  { id: "api", label: "API & integrations", description: "Programmatic opt-outs from your app", auto: true, last7d: 3, total: 88 },
  { id: "manual", label: "On request", description: "GDPR / legal / do-not-contact only", auto: false, last7d: 2, total: 96 },
];

export const SUPPRESSION_SYNC = {
  connected: true,
  lastSyncedLabel: "2 minutes ago",
  addedInSyncLast7d: 19,
  removedInSyncLast7d: 0,
};

// Reasons a human can pick when honoring an off-channel compliance request.
export const SUPPRESSION_REQUEST_TYPES: { value: string; label: string }[] = [
  { value: "gdpr", label: "GDPR / data-erasure request" },
  { value: "legal", label: "Legal / do-not-contact request" },
  { value: "support", label: "Support request to be removed" },
];

/* ------------------------------ CONTACTS ------------------------------- */
const T = SUB_TOPICS.map((t) => t.id);
export const SUB_CONTACTS: SubContact[] = [
  { id: "c1", name: "Brandon Fields", email: "brandon.fields@buckheadcloud.com", status: "subscribed", topics: { [T[0]]: true, [T[1]]: true, [T[2]]: true, [T[3]]: true, [T[4]]: true }, segments: ["Georgia Innovators"], lastActivityAt: "2026-06-25T09:12:00Z", source: "Form" },
  { id: "c2", name: "Rachel Kim", email: "rachel.kim@sandyspringsdev.com", status: "partial", topics: { [T[0]]: true, [T[1]]: false, [T[2]]: false, [T[3]]: true, [T[4]]: true }, segments: ["Georgia Innovators", "Newsletter"], lastActivityAt: "2026-06-24T16:40:00Z", source: "Form" },
  { id: "c3", name: "Eddie Murphy", email: "eddie.murphy@gmail.com", status: "unsubscribed", topics: { [T[0]]: false, [T[1]]: false, [T[2]]: false, [T[3]]: false, [T[4]]: true }, segments: ["Newsletter", "Georgia Innovators"], lastActivityAt: "2026-06-24T10:12:00Z", source: "Import" },
  { id: "c4", name: "Rita Chen", email: "rita.chen@oldcorp.com", status: "partial", topics: { [T[0]]: true, [T[1]]: true, [T[2]]: false, [T[3]]: true, [T[4]]: true }, segments: ["Offers"], lastActivityAt: "2026-06-23T09:05:00Z", source: "Form" },
  { id: "c5", name: "Sam Torres", email: "sam.torres@webmail.com", status: "unsubscribed", topics: { [T[0]]: false, [T[1]]: false, [T[2]]: false, [T[3]]: false, [T[4]]: true }, segments: ["Newsletter"], lastActivityAt: "2026-06-19T13:22:00Z", source: "Form" },
  { id: "c6", name: "Priya Raman", email: "priya.raman@northgatehealth.com", status: "subscribed", topics: { [T[0]]: true, [T[1]]: true, [T[2]]: true, [T[3]]: true, [T[4]]: true }, segments: ["Health Tech"], lastActivityAt: "2026-06-20T17:30:00Z", source: "Form" },
  { id: "c7", name: "Devin Clarke", email: "devin.clarke@midtownai.com", status: "bounced", topics: { [T[0]]: true, [T[1]]: true, [T[2]]: false, [T[3]]: false, [T[4]]: true }, segments: ["Georgia Innovators"], lastActivityAt: "2026-06-18T07:11:00Z", source: "Import" },
  { id: "c8", name: "Olivia Martinez", email: "olivia.martinez@gwinnettsoft.com", status: "pending", topics: { [T[0]]: false, [T[1]]: false, [T[2]]: false, [T[3]]: false, [T[4]]: true }, segments: ["Newsletter"], lastActivityAt: "2026-06-19T09:08:00Z", source: "Form (double opt-in)" },
];

/* ---------------------------- CONSENT LOG ------------------------------ */
export const CONSENT_EVENTS: ConsentEvent[] = [
  { id: "e1", email: "eddie.murphy@gmail.com", name: "Eddie Murphy", action: "unsubscribed", source: "one-click", actor: "Recipient", at: "2026-06-24T10:12:00Z", reason: "Too many emails" },
  { id: "e2", email: "no-reply@bounced.co", name: "—", action: "bounced", source: "provider", actor: "System", at: "2026-06-24T08:40:00Z", reason: "Hard bounce" },
  { id: "e3", email: "spam.reporter@mail.com", name: "—", action: "complained", source: "provider", actor: "System", at: "2026-06-23T16:20:00Z", reason: "Spam report" },
  { id: "e4", email: "rita.chen@oldcorp.com", name: "Rita Chen", action: "unsubscribed", topic: "Offers & promotions", source: "preference-page", actor: "Recipient", at: "2026-06-23T09:05:00Z" },
  { id: "e5", email: "legal@donotcontact.org", name: "—", action: "suppressed", source: "admin", actor: "Priya Sharma", at: "2026-06-21T14:00:00Z", reason: "Legal request" },
  { id: "e6", email: "bulk1@importlist.com", name: "—", action: "imported", source: "import", actor: "CSV import", at: "2026-06-20T11:30:00Z" },
  { id: "e7", email: "grace.lee@example.com", name: "Grace Lee", action: "resubscribed", source: "preference-page", actor: "Recipient", at: "2026-06-19T15:40:00Z" },
  { id: "e8", email: "brandon.fields@buckheadcloud.com", name: "Brandon Fields", action: "subscribed", topic: "Newsletter", source: "form", actor: "Recipient", at: "2026-06-18T12:00:00Z" },
];

/* --------------------------- REPORTING TRIO ---------------------------- */
export const REPORT_KPIS = {
  openRate: 42.1,
  openDelta: 2.3,
  openBenchmark: 38.0,
  clickRate: 6.9,
  clickDelta: 0.8,
  clickBenchmark: 6.2,
  unsubRate: 0.24,
  unsubDelta: -0.07,
  unsubBenchmark: 0.26,
};

export interface ReportTrendPoint {
  label: string;
  open: number;
  click: number;
  unsub: number;
}
export const REPORT_TREND: ReportTrendPoint[] = [
  { label: "Wk 1", open: 39.2, click: 6.1, unsub: 0.34 },
  { label: "Wk 2", open: 40.1, click: 6.3, unsub: 0.31 },
  { label: "Wk 3", open: 41.0, click: 6.5, unsub: 0.29 },
  { label: "Wk 4", open: 40.8, click: 6.4, unsub: 0.27 },
  { label: "Wk 5", open: 41.6, click: 6.6, unsub: 0.26 },
  { label: "Wk 6", open: 42.0, click: 6.8, unsub: 0.25 },
  { label: "Wk 7", open: 43.1, click: 7.0, unsub: 0.22 },
  { label: "Wk 8", open: 42.1, click: 6.9, unsub: 0.24 },
];

export interface ReportCampaignRow {
  id: string;
  campaign: string;
  sentAt: string;
  sent: number;
  openRate: number;
  clickRate: number;
  unsubRate: number;
  unsubStatus: "healthy" | "watch" | "high";
}
export const REPORT_BY_CAMPAIGN: ReportCampaignRow[] = [
  { id: "r1", campaign: "June Newsletter", sentAt: "2026-06-24T09:00:00Z", sent: 11840, openRate: 46.2, clickRate: 9.1, unsubRate: 0.15, unsubStatus: "healthy" },
  { id: "r2", campaign: "Top 40 Nominations — Reminder", sentAt: "2026-06-22T10:00:00Z", sent: 9210, openRate: 38.4, clickRate: 5.2, unsubRate: 0.45, unsubStatus: "high" },
  { id: "r3", campaign: "Membership Q2 Push", sentAt: "2026-06-20T08:30:00Z", sent: 8640, openRate: 41.0, clickRate: 6.8, unsubRate: 0.28, unsubStatus: "watch" },
  { id: "r4", campaign: "GA Tech Summit Invite", sentAt: "2026-06-18T14:00:00Z", sent: 6120, openRate: 44.7, clickRate: 8.0, unsubRate: 0.15, unsubStatus: "healthy" },
  { id: "r5", campaign: "Product Update — May", sentAt: "2026-06-14T11:00:00Z", sent: 12040, openRate: 43.3, clickRate: 7.4, unsubRate: 0.18, unsubStatus: "healthy" },
  { id: "r6", campaign: "Weekend Offer", sentAt: "2026-06-10T07:00:00Z", sent: 7350, openRate: 33.1, clickRate: 4.1, unsubRate: 0.45, unsubStatus: "high" },
];

export const UNSUB_REASONS_BREAKDOWN = [
  { reason: "Too many emails", count: 142, pct: 38.6 },
  { reason: "No longer relevant", count: 98, pct: 26.6 },
  { reason: "Never signed up", count: 54, pct: 14.7 },
  { reason: "Content not useful", count: 41, pct: 11.1 },
  { reason: "Other", count: 33, pct: 9.0 },
];

/* --------------------- ENFORCEMENT (segment preview) ------------------- */
export const SEGMENT_ELIGIBILITY = {
  segment: "Georgia Innovators",
  total: 1248,
  eligible: 1180,
  suppressed: 68,
  breakdown: [
    { label: "Unsubscribed", count: 41 },
    { label: "Bounced", count: 18 },
    { label: "Complained", count: 3 },
    { label: "Manually suppressed", count: 6 },
  ],
};
