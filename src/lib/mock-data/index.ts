import type {
  ActivityItem,
  AssignmentRule,
  Automation,
  CalendarEvent,
  Campaign,
  CaseRecord,
  CaseTemplate,
  CaseTimelineEvent,
  ContactRecord,
  CustomField,
  DashboardStats,
  DeliverabilityHealth,
  DocumentRecord,
  DuplicatePair,
  EmailTemplate,
  EsignEnvelope,
  EsignTemplate,
  FunnelStage,
  InboxMessage,
  IntegrationStatus,
  ListRecord,
  MarketingForm,
  RepPeriodSummary,
  ScoringRule,
  Sequence,
  SequencePack,
  SequenceStep,
  SourceMixItem,
  SuppressionEntry,
  SurveyFlow,
  WorkQueueItem,
} from "@/lib/types";

const owners = ["Priya Sharma", "Arjun Mehta", "Neha Reddy", "Karthik N"];
const sources = ["Website", "WhatsApp", "Referral", "Trade Show", "Instagram", "Cold Call"];

function engagement(days: number): ContactRecord["engagement"] {
  return {
    lastTouchAt: new Date(Date.now() - days * 86400000).toISOString(),
    daysSinceContact: days,
    emailsSent: 12 - days,
    emailsOpened: 8 - Math.floor(days / 3),
    channelMix: { email: 5, phone: 2, whatsapp: 3, web: 1, instagram: 0, facebook: 0 },
  };
}

export const MOCK_CONTACTS: ContactRecord[] = [
  {
    id: "c1",
    type: "lead",
    firstName: "Ananya",
    lastName: "Iyer",
    email: "ananya.iyer@techcorp.in",
    phone: "+91 98765 43210",
    company: "TechCorp India",
    title: "Procurement Head",
    owner: owners[0],
    ownerId: "u1",
    source: "Website",
    lifecycleStage: "lead",
    leadScore: 82,
    healthScore: 76,
    tags: ["enterprise", "bangalore"],
    territory: "South",
    pincode: "560001",
    lastActivity: "Email opened — product brochure",
    nextActivity: "Follow-up call",
    createdAt: "2026-05-12T10:00:00Z",
    consent: { email: true, whatsapp: true, sms: false, topics: ["product-updates"] },
    engagement: engagement(2),
    openCases: 1,
    slaStatus: "amber",
  },
  {
    id: "c2",
    type: "contact",
    firstName: "Rahul",
    lastName: "Verma",
    email: "rahul.v@retailhub.com",
    phone: "+91 99887 76655",
    company: "RetailHub",
    title: "Store Manager",
    owner: owners[1],
    ownerId: "u2",
    source: "WhatsApp",
    lifecycleStage: "customer",
    leadScore: 65,
    healthScore: 88,
    tags: ["retail", "vip"],
    territory: "West",
    pincode: "400001",
    lastActivity: "WhatsApp reply received",
    nextActivity: "Quarterly check-in",
    createdAt: "2026-03-01T08:00:00Z",
    consent: { email: true, whatsapp: true, sms: true, topics: ["offers", "support"] },
    engagement: engagement(1),
    slaStatus: "green",
  },
  {
    id: "c3",
    type: "customer",
    firstName: "Sunita",
    lastName: "Patil",
    email: "sunita.p@govkarnataka.gov.in",
    phone: "+91 94480 12345",
    company: "Karnataka Municipal Corp",
    title: "Citizen Services Officer",
    owner: owners[2],
    ownerId: "u3",
    source: "Referral",
    lifecycleStage: "customer",
    leadScore: 45,
    healthScore: 62,
    tags: ["government", "priority"],
    territory: "South",
    pincode: "560040",
    lastActivity: "Case #CM-1042 updated",
    createdAt: "2026-01-15T09:00:00Z",
    consent: { email: true, whatsapp: false, sms: false, topics: ["service-updates"] },
    engagement: engagement(14),
    openCases: 2,
    slaStatus: "red",
  },
  {
    id: "c4",
    type: "lead",
    firstName: "Vikram",
    lastName: "Singh",
    email: "vikram.singh@startup.io",
    phone: "+91 91234 56789",
    company: "Startup.io",
    owner: owners[3],
    ownerId: "u4",
    source: "Instagram",
    lifecycleStage: "mql",
    leadScore: 71,
    healthScore: 54,
    tags: ["startup"],
    lastActivity: "Form submitted — demo request",
    nextActivity: "Demo scheduling",
    createdAt: "2026-06-20T14:00:00Z",
    consent: { email: true, whatsapp: true, sms: false, topics: [] },
    engagement: engagement(4),
    duplicateFlag: true,
  },
  {
    id: "c5",
    type: "contact",
    firstName: "Meera",
    lastName: "Krishnan",
    email: "meera.k@lawpartners.in",
    phone: "+91 98450 11223",
    company: "Law Partners LLP",
    title: "Partner",
    owner: owners[0],
    ownerId: "u1",
    source: "Cold Call",
    lifecycleStage: "sql",
    leadScore: 90,
    healthScore: 81,
    tags: ["legal", "nda-pending"],
    lastActivity: "NDA sent for signature",
    nextActivity: "Await signature",
    createdAt: "2026-06-10T11:00:00Z",
    consent: { email: true, whatsapp: false, sms: false, topics: ["legal"] },
    engagement: engagement(3),
  },
];

export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "a1",
    contactId: "c1",
    type: "email",
    title: "Product brochure sent",
    channel: "email",
    createdAt: "2026-06-22T09:30:00Z",
    createdBy: "Priya Sharma",
  },
  {
    id: "a2",
    contactId: "c1",
    type: "call",
    title: "Discovery call",
    channel: "phone",
    outcome: "Interested — send pricing",
    duration: 18,
    createdAt: "2026-06-20T15:00:00Z",
    createdBy: "Priya Sharma",
  },
  {
    id: "a3",
    contactId: "c3",
    type: "case",
    title: "Case CM-1042 — Water supply complaint",
    body: "Status changed to In Progress",
    createdAt: "2026-06-21T10:00:00Z",
    createdBy: "System",
  },
  {
    id: "a4",
    contactId: "c5",
    type: "esign",
    title: "NDA envelope sent",
    body: "Awaiting signature from Meera Krishnan",
    createdAt: "2026-06-23T08:00:00Z",
    createdBy: "Priya Sharma",
  },
];

export const MOCK_DUPLICATES: DuplicatePair[] = [
  {
    id: "d1",
    contactA: MOCK_CONTACTS[3],
    contactB: {
      ...MOCK_CONTACTS[3],
      id: "c4-dup",
      email: "vikram@startup.io",
      phone: "+91 9123456789",
      source: "Website",
    },
    matchReason: "Email domain + phone similarity",
    confidence: 94,
  },
];

export const MOCK_LISTS: ListRecord[] = [
  { id: "l1", name: "Bangalore — not contacted 60d", type: "dynamic", count: 342, criteria: "city=Bangalore AND days_since_contact>60", updatedAt: "2026-06-23T00:00:00Z" },
  { id: "l2", name: "VIP Retail Customers", type: "static", count: 89, updatedAt: "2026-06-20T00:00:00Z" },
  { id: "l3", name: "Government accounts", type: "dynamic", count: 56, criteria: "tag=government", updatedAt: "2026-06-22T00:00:00Z" },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "cp1", name: "June Product Launch", status: "sent", channel: "email", segmentName: "Active Leads Q2", sent: 4200, delivered: 4150, opened: 1890, clicked: 420, bounced: 50, unsubscribed: 12 },
  { id: "cp2", name: "Monsoon Offer — WhatsApp", status: "scheduled", channel: "whatsapp", segmentName: "Retail VIP", scheduledAt: "2026-06-25T10:00:00Z", sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 },
  { id: "cp3", name: "Re-engagement Win-back", status: "sending", channel: "email", segmentName: "Cold 90d", sent: 800, delivered: 790, opened: 210, clicked: 45, bounced: 10, unsubscribed: 3 },
];

export const MOCK_SEQUENCES: Sequence[] = [
  { id: "s1", name: "New Lead Welcome", type: "marketing", status: "active", enrolled: 1240, completed: 890, replied: 156, steps: 5, pauseOnReply: false },
  { id: "s2", name: "Outbound Sales Cadence", type: "sales", status: "active", enrolled: 320, completed: 180, replied: 72, steps: 7, pauseOnReply: true },
  { id: "s3", name: "Post-Event Follow-up", type: "marketing", status: "draft", enrolled: 0, completed: 0, replied: 0, steps: 4, pauseOnReply: false },
];

export const MOCK_CASES: CaseRecord[] = [
  {
    id: "case1",
    number: "CM-1042",
    title: "Water supply interruption — Ward 12",
    contactId: "c3",
    contactName: "Sunita Patil",
    type: "Citizen Complaint",
    priority: "high",
    status: "open",
    assignee: "Back-office Team A",
    slaDue: "2026-06-24T18:00:00Z",
    slaStatus: "red",
    createdAt: "2026-06-20T09:00:00Z",
    updatedAt: "2026-06-23T07:00:00Z",
    description: "Resident reports no water supply for 48 hours in Ward 12.",
  },
  {
    id: "case2",
    number: "CM-1048",
    title: "Billing discrepancy on invoice #8821",
    contactId: "c2",
    contactName: "Rahul Verma",
    type: "Billing",
    priority: "medium",
    status: "pending",
    assignee: "Finance Queue",
    slaDue: "2026-06-26T12:00:00Z",
    slaStatus: "green",
    createdAt: "2026-06-22T14:00:00Z",
    updatedAt: "2026-06-22T16:00:00Z",
    description: "Customer disputes line item on latest invoice.",
  },
  {
    id: "case3",
    number: "CM-1051",
    title: "Demo access not received",
    contactId: "c1",
    contactName: "Ananya Iyer",
    type: "Technical Support",
    priority: "urgent",
    status: "new",
    assignee: "Unassigned",
    slaDue: "2026-06-24T09:00:00Z",
    slaStatus: "amber",
    createdAt: "2026-06-23T08:30:00Z",
    updatedAt: "2026-06-23T08:30:00Z",
    description: "Lead completed demo form but did not receive credentials.",
  },
];

export const MOCK_ENVELOPES: EsignEnvelope[] = [
  { id: "e1", name: "Mutual NDA — Law Partners", contactId: "c5", contactName: "Meera Krishnan", status: "sent", signingOrder: "sequential", signers: 2, signed: 0, sentAt: "2026-06-23T08:00:00Z", expiresAt: "2026-06-30T08:00:00Z" },
  { id: "e2", name: "Vendor Agreement — RetailHub", contactId: "c2", contactName: "Rahul Verma", status: "signed", signingOrder: "parallel", signers: 3, signed: 3, sentAt: "2026-06-15T10:00:00Z" },
  { id: "e3", name: "Employee Onboarding Pack", contactId: "c1", contactName: "Ananya Iyer", status: "viewed", signingOrder: "sequential", signers: 1, signed: 0, sentAt: "2026-06-22T12:00:00Z", expiresAt: "2026-06-29T12:00:00Z" },
];

export const SNIPPETS = [
  { id: "sn1", name: "Follow-up after demo", body: "Hi {{firstName}}, thanks for your time today. As discussed, I am sharing the next steps..." },
  { id: "sn2", name: "WhatsApp intro", body: "Hello {{firstName}}, this is {{owner}} from Connect. Reaching out regarding your inquiry." },
];

export const MOCK_FORMS: MarketingForm[] = [
  { id: "f1", name: "Demo Request", status: "published", submissions: 284, conversionRate: 12.4, abandonmentRecoverySequenceId: "s1", recaptchaEnabled: true, steps: 3, updatedAt: "2026-06-22T00:00:00Z" },
  { id: "f2", name: "Newsletter Signup", status: "published", submissions: 1420, conversionRate: 28.1, recaptchaEnabled: false, steps: 1, updatedAt: "2026-06-18T00:00:00Z" },
  { id: "f3", name: "Event Registration — Connect Summit", status: "draft", submissions: 0, conversionRate: 0, recaptchaEnabled: true, steps: 4, updatedAt: "2026-06-24T00:00:00Z" },
];

export const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: "t1", name: "Product Launch Hero", subject: "Introducing the next chapter", category: "Campaign", sent: 4200, openRate: 45.2, clickRate: 10.1, updatedAt: "2026-06-20T00:00:00Z" },
  { id: "t2", name: "Welcome — Day 1", subject: "Welcome to Connect, {{firstName}}", category: "Sequence", sent: 1240, openRate: 62.8, clickRate: 18.4, updatedAt: "2026-06-15T00:00:00Z" },
  { id: "t3", name: "Re-engagement Offer", subject: "We miss you — exclusive offer inside", category: "Campaign", sent: 890, openRate: 23.6, clickRate: 5.2, updatedAt: "2026-06-10T00:00:00Z" },
  { id: "t4", name: "Event Follow-up", subject: "Thanks for joining Connect Summit", category: "Sequence", sent: 340, openRate: 71.2, clickRate: 24.8, updatedAt: "2026-06-08T00:00:00Z" },
];

export const TEMPLATE_PLACEHOLDERS = [
  "{{firstName}}", "{{lastName}}", "{{company}}", "{{owner}}", "{{unsubscribeLink}}", "{{meetingLink}}",
];

export const MOCK_INBOX: InboxMessage[] = [
  { id: "i1", contactName: "Ananya Iyer", contactEmail: "ananya.iyer@techcorp.in", channel: "email", subject: "Re: Product brochure", preview: "Thanks for sending the brochure. Can we schedule a call next week?", assignee: "Priya Sharma", unread: true, receivedAt: "2026-06-24T08:15:00Z" },
  { id: "i2", contactName: "Rahul Verma", contactEmail: "+91 99887 76655", channel: "whatsapp", subject: "Monsoon offer inquiry", preview: "Is the 15% discount applicable on bulk orders?", assignee: "Arjun Mehta", unread: false, receivedAt: "2026-06-23T16:40:00Z" },
  { id: "i3", contactName: "Vikram Singh", contactEmail: "vikram.singh@startup.io", channel: "email", subject: "Demo access", preview: "I still haven't received demo credentials. Please resend.", unread: true, receivedAt: "2026-06-23T11:20:00Z" },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "ce1", title: "Monsoon Offer — WhatsApp", type: "campaign", date: "2026-06-25", channel: "whatsapp" },
  { id: "ce2", title: "New Lead Welcome — Step 3", type: "sequence", date: "2026-06-26", channel: "email" },
  { id: "ce3", title: "Q3 Newsletter", type: "campaign", date: "2026-06-28", channel: "email" },
  { id: "ce4", title: "Outbound Sales — Day 5", type: "sequence", date: "2026-06-30", channel: "email" },
];

export const MOCK_AUTOMATIONS: Automation[] = [
  { id: "au1", name: "Form submit → Welcome sequence", status: "active", trigger: "Form submitted", actions: 3, enrolled: 284, lastRun: "2026-06-24T07:00:00Z" },
  { id: "au2", name: "Lead score > 80 → Assign rep", status: "active", trigger: "Lead score changed", actions: 2, enrolled: 42, lastRun: "2026-06-23T14:30:00Z" },
  { id: "au3", name: "Case resolved → NPS survey", status: "paused", trigger: "Case status = resolved", actions: 4, enrolled: 18 },
];

export const AUTOMATION_TEMPLATES = [
  { id: "at1", name: "Lead nurture", description: "Enroll new leads in welcome sequence after form submit", trigger: "Form submitted", actions: 2 },
  { id: "at2", name: "Win-back", description: "Re-engage contacts inactive for 90 days", trigger: "Days since contact > 90", actions: 3 },
  { id: "at3", name: "Event follow-up", description: "Send thank-you and resources after event attendance", trigger: "Tag added: event-attendee", actions: 4 },
];

export const MOCK_DELIVERABILITY: DeliverabilityHealth = {
  score: 87,
  spf: "verified",
  dkim: "verified",
  dmarc: "pending",
  bounceRate: 1.2,
  complaintRate: 0.04,
};

export const MOCK_SUPPRESSION: SuppressionEntry[] = [
  { id: "sp1", email: "bounced@invalid-domain.in", reason: "bounce", addedAt: "2026-06-20T00:00:00Z" },
  { id: "sp2", email: "optout@example.com", reason: "unsubscribe", addedAt: "2026-06-18T00:00:00Z" },
  { id: "sp3", email: "spam@complaint.net", reason: "complaint", addedAt: "2026-06-15T00:00:00Z" },
];

export const SEQUENCE_PACKS: SequencePack[] = [
  { id: "pk1", name: "Welcome Series", description: "5-touch onboarding for new subscribers and leads", type: "marketing", steps: 5, category: "welcome" },
  { id: "pk2", name: "Re-engage Cold Contacts", description: "Win back contacts with no activity in 90+ days", type: "marketing", steps: 4, category: "re-engage" },
  { id: "pk3", name: "Event Follow-up", description: "Post-event thank you, resources, and meeting request", type: "marketing", steps: 4, category: "event" },
  { id: "pk4", name: "NPS & Feedback", description: "Collect feedback after purchase or case resolution", type: "marketing", steps: 3, category: "feedback" },
];

export const MOCK_SEQUENCE_STEPS: Record<string, SequenceStep[]> = {
  s1: [
    { id: "st1", type: "email", label: "Welcome email", config: "Template: Welcome — Day 1", order: 1 },
    { id: "st2", type: "wait", label: "Wait 2 days", config: "Duration: 2 days", order: 2 },
    { id: "st3", type: "email", label: "Product overview", config: "Template: Product Launch Hero", order: 3 },
    { id: "st4", type: "wait", label: "Wait 3 days", config: "Duration: 3 days", order: 4 },
    { id: "st5", type: "task", label: "Rep follow-up call", config: "Assign to owner", order: 5 },
  ],
  s2: [
    { id: "st6", type: "email", label: "Introduction", config: "Template: Welcome — Day 1", order: 1 },
    { id: "st7", type: "wait", label: "Wait 1 day", config: "Duration: 1 day", order: 2 },
    { id: "st8", type: "whatsapp", label: "WhatsApp check-in", config: "Snippet: WhatsApp intro", order: 3 },
    { id: "st9", type: "branch", label: "If replied", config: "Exit sequence on reply", order: 4 },
    { id: "st10", type: "email", label: "Case study share", config: "Template: Re-engagement Offer", order: 5 },
    { id: "st11", type: "wait", label: "Wait 2 days", config: "Duration: 2 days", order: 6 },
    { id: "st12", type: "task", label: "Schedule demo", config: "Assign to owner", order: 7 },
  ],
  s3: [
    { id: "st13", type: "email", label: "Thank you", config: "Template: Event Follow-up", order: 1 },
    { id: "st14", type: "wait", label: "Wait 1 day", config: "Duration: 1 day", order: 2 },
    { id: "st15", type: "email", label: "Resource pack", config: "Template: Product Launch Hero", order: 3 },
    { id: "st16", type: "task", label: "Book meeting", config: "Assign to owner", order: 4 },
  ],
};

export const SEGMENT_FIELDS = [
  { value: "lifecycleStage", label: "Lifecycle stage" },
  { value: "leadScore", label: "Lead score" },
  { value: "territory", label: "Territory" },
  { value: "tags", label: "Tags" },
  { value: "daysSinceContact", label: "Days since contact" },
  { value: "source", label: "Source" },
];

export const SEGMENT_OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
  { value: "contains", label: "contains" },
];

export const MOCK_CASE_TEMPLATES: CaseTemplate[] = [
  {
    id: "ct1",
    name: "Citizen Complaint",
    type: "Citizen Complaint",
    description: "Public service complaints routed to Kaayaka back-office.",
    defaultPriority: "high",
    defaultAssignee: "Back-office Team A",
    slaHours: 48,
    fieldMappings: [
      { templateField: "Reporter Name", contactField: "firstName + lastName" },
      { templateField: "Phone", contactField: "phone" },
      { templateField: "Ward / Pincode", contactField: "pincode" },
      { templateField: "Organization", contactField: "company" },
    ],
    active: true,
  },
  {
    id: "ct2",
    name: "Billing Dispute",
    type: "Billing",
    description: "Invoice and payment disputes for finance queue.",
    defaultPriority: "medium",
    defaultAssignee: "Finance Queue",
    slaHours: 72,
    fieldMappings: [
      { templateField: "Account Name", contactField: "company" },
      { templateField: "Contact Email", contactField: "email" },
      { templateField: "Account Owner", contactField: "owner" },
    ],
    active: true,
  },
  {
    id: "ct3",
    name: "Technical Support",
    type: "Technical Support",
    description: "Product access, demo, and technical issues.",
    defaultPriority: "urgent",
    defaultAssignee: "Support Tier 1",
    slaHours: 24,
    fieldMappings: [
      { templateField: "Requester", contactField: "firstName + lastName" },
      { templateField: "Email", contactField: "email" },
      { templateField: "Company", contactField: "company" },
    ],
    active: true,
  },
];

export const MOCK_CASE_TIMELINE: CaseTimelineEvent[] = [
  { id: "te1", caseId: "case1", type: "created", title: "Case created", body: "Intake from citizen portal", actor: "Sunita Patil", createdAt: "2026-06-20T09:00:00Z" },
  { id: "te2", caseId: "case1", type: "assignment", title: "Assigned to Back-office Team A", actor: "System", createdAt: "2026-06-20T09:01:00Z" },
  { id: "te3", caseId: "case1", type: "status", title: "Status changed to Open", actor: "Neha Reddy", createdAt: "2026-06-21T10:00:00Z" },
  { id: "te4", caseId: "case1", type: "comment", title: "Field team dispatched", body: "Ward 12 inspection scheduled for tomorrow morning.", actor: "Back-office Team A", createdAt: "2026-06-22T14:30:00Z" },
  { id: "te5", caseId: "case1", type: "sla", title: "SLA at risk", body: "Resolution due in 6 hours", actor: "System", createdAt: "2026-06-23T07:00:00Z" },
  { id: "te6", caseId: "case3", type: "created", title: "Case created", body: "Demo access request", actor: "Ananya Iyer", createdAt: "2026-06-23T08:30:00Z" },
];

export const MOCK_ESIGN_TEMPLATES: EsignTemplate[] = [
  {
    id: "et1",
    name: "Mutual NDA",
    category: "Legal",
    description: "Standard mutual non-disclosure agreement for prospects.",
    fields: [
      { label: "Signer Name", crmField: "firstName + lastName" },
      { label: "Company", crmField: "company" },
      { label: "Email", crmField: "email" },
      { label: "Title", crmField: "title" },
    ],
    lastUsed: "2026-06-23T08:00:00Z",
    active: true,
  },
  {
    id: "et2",
    name: "Vendor Agreement",
    category: "Procurement",
    description: "Master vendor terms for retail and distribution partners.",
    fields: [
      { label: "Vendor Contact", crmField: "firstName + lastName" },
      { label: "Business Name", crmField: "company" },
      { label: "Signatory Email", crmField: "email" },
    ],
    lastUsed: "2026-06-15T10:00:00Z",
    active: true,
  },
  {
    id: "et3",
    name: "Employee Onboarding Pack",
    category: "HR",
    description: "Offer letter, policies, and tax declarations.",
    fields: [
      { label: "Employee Name", crmField: "firstName + lastName" },
      { label: "Personal Email", crmField: "email" },
    ],
    active: true,
  },
];

export const MOCK_ASSIGNMENT_RULES: AssignmentRule[] = [
  { id: "ar1", name: "South territory leads", objectType: "lead", criteria: "territory = South", method: "round_robin", assignees: ["Priya Sharma", "Neha Reddy"], priority: 1, active: true },
  { id: "ar2", name: "Government accounts", objectType: "case", criteria: "tag contains government", method: "territory", assignees: ["Back-office Team A"], priority: 2, active: true },
  { id: "ar3", name: "Unassigned cases fallback", objectType: "case", criteria: "assignee is empty", method: "load_balanced", assignees: ["Support Tier 1", "Finance Queue"], priority: 10, active: true },
  { id: "ar4", name: "West retail contacts", objectType: "contact", criteria: "territory = West AND tag contains retail", method: "round_robin", assignees: ["Arjun Mehta", "Karthik N"], priority: 3, active: false },
];

export const MOCK_SCORING_RULES: ScoringRule[] = [
  { id: "sr1", name: "Enterprise company size", type: "rule", condition: "company employees > 500", points: 25, active: true },
  { id: "sr2", name: "Demo requested", type: "rule", condition: "last activity contains demo", points: 30, active: true },
  { id: "sr3", name: "Email engagement (7d)", type: "behavioral", condition: "emails opened >= 3 in 7 days", points: 15, active: true },
  { id: "sr4", name: "WhatsApp reply", type: "behavioral", condition: "whatsapp reply within 48h", points: 20, active: true },
  { id: "sr5", name: "AI fit score boost", type: "ai", condition: "predicted close probability > 70%", points: 35, active: true },
  { id: "sr6", name: "Cold source penalty", type: "rule", condition: "source = Cold Call AND no reply 14d", points: -10, active: false },
];

export const MOCK_CUSTOM_FIELDS: CustomField[] = [
  { id: "cf1", objectType: "contact", label: "GST Number", apiName: "gst_number", fieldType: "text", required: false, visible: true },
  { id: "cf2", objectType: "contact", label: "Annual Revenue", apiName: "annual_revenue", fieldType: "number", required: false, visible: true },
  { id: "cf3", objectType: "lead", label: "Product Interest", apiName: "product_interest", fieldType: "picklist", required: true, visible: true },
  { id: "cf4", objectType: "case", label: "Ward Number", apiName: "ward_number", fieldType: "text", required: false, visible: true },
  { id: "cf5", objectType: "case", label: "Escalated", apiName: "escalated", fieldType: "boolean", required: false, visible: false },
];

export const MOCK_INTEGRATIONS: IntegrationStatus[] = [
  { id: "int1", name: "Kaayaka Case Manager", category: "cases", provider: "Kaayaka", status: "connected", lastSync: "2026-06-23T07:45:00Z", description: "Back-office case resolution and project mapping." },
  { id: "int2", name: "DocuSign", category: "esign", provider: "DocuSign", status: "connected", lastSync: "2026-06-22T18:00:00Z", description: "Primary e-signature provider." },
  { id: "int3", name: "Dropbox Sign", category: "esign", provider: "Dropbox Sign", status: "disconnected", description: "Alternative e-sign provider." },
  { id: "int4", name: "SignNow", category: "esign", provider: "SignNow", status: "pending", description: "Enterprise sign workflows." },
  { id: "int5", name: "WhatsApp Business", category: "messaging", provider: "Meta", status: "connected", lastSync: "2026-06-23T06:00:00Z", description: "Outbound and inbound WhatsApp messaging." },
  { id: "int6", name: "Gmail", category: "email", provider: "Google", status: "connected", lastSync: "2026-06-23T08:10:00Z", description: "Email sync and send via Gmail." },
  { id: "int7", name: "Outlook", category: "email", provider: "Microsoft", status: "error", lastSync: "2026-06-20T12:00:00Z", description: "Microsoft 365 email integration." },
];

export const KAAYAKA_PROJECTS = [
  { id: "kp1", crmType: "Citizen Complaint", kaayakaProject: "Municipal Services", status: "mapped" },
  { id: "kp2", crmType: "Billing", kaayakaProject: "Finance Operations", status: "mapped" },
  { id: "kp3", crmType: "Technical Support", kaayakaProject: "IT Helpdesk", status: "mapped" },
];

export function getContactById(id: string) {
  return MOCK_CONTACTS.find((c) => c.id === id);
}

export function getActivitiesForContact(contactId: string) {
  return MOCK_ACTIVITIES.filter((a) => a.contactId === contactId);
}

export function getCasesForContact(contactId: string) {
  return MOCK_CASES.filter((c) => c.contactId === contactId);
}

export function getTimelineForCase(caseId: string) {
  return MOCK_CASE_TIMELINE.filter((e) => e.caseId === caseId);
}

export function getTimelineForContact(contactId: string) {
  const caseIds = MOCK_CASES.filter((c) => c.contactId === contactId).map((c) => c.id);
  return MOCK_CASE_TIMELINE.filter((e) => caseIds.includes(e.caseId));
}

export function mapContactField(contact: ContactRecord, field: string): string {
  switch (field) {
    case "firstName + lastName":
      return `${contact.firstName} ${contact.lastName}`;
    case "firstName":
      return contact.firstName;
    case "lastName":
      return contact.lastName;
    default:
      return String(contact[field as keyof ContactRecord] ?? "");
  }
}

export const DASHBOARD_STATS: DashboardStats = {
  totalContacts: 12847,
  newThisWeek: 186,
  healthAvg: 74,
  duplicatesPending: MOCK_DUPLICATES.length,
};

export const SOURCE_MIX: SourceMixItem[] = [
  { source: "Website", count: 4200 },
  { source: "WhatsApp", count: 3100 },
  { source: "Referral", count: 2100 },
  { source: "Trade Show", count: 980 },
  { source: "Instagram", count: 1450 },
  { source: "Cold Call", count: 1017 },
];

export const CONVERSION_FUNNEL: FunnelStage[] = [
  { stage: "Subscriber", count: 8200 },
  { stage: "Lead", count: 4100 },
  { stage: "MQL", count: 2100 },
  { stage: "SQL", count: 980 },
  { stage: "Customer", count: 620 },
];

export const HEALTH_TREND = [
  { week: "W1", score: 68 },
  { week: "W2", score: 71 },
  { week: "W3", score: 69 },
  { week: "W4", score: 74 },
  { week: "W5", score: 76 },
  { week: "W6", score: 74 },
];

export const MOCK_WORK_QUEUE: WorkQueueItem[] = [
  {
    id: "wq1",
    contactId: "c3",
    contactName: "Sunita Patil",
    type: "sla_breach",
    priority: "urgent",
    title: "Case CM-1042 SLA breached — water supply complaint",
    dueAt: "2026-06-24T18:00:00Z",
    owner: "Neha Reddy",
  },
  {
    id: "wq2",
    contactId: "c1",
    contactName: "Ananya Iyer",
    type: "overdue_followup",
    priority: "high",
    title: "Follow-up call overdue after brochure send",
    dueAt: "2026-06-22T09:00:00Z",
    owner: "Priya Sharma",
  },
  {
    id: "wq3",
    contactId: "c4",
    contactName: "Vikram Singh",
    type: "hot_lead",
    priority: "high",
    title: "Demo request — score 71, no owner response in 48h",
    dueAt: "2026-06-24T12:00:00Z",
    owner: "Karthik N",
  },
  {
    id: "wq4",
    contactId: "c5",
    contactName: "Meera Krishnan",
    type: "overdue_followup",
    priority: "medium",
    title: "NDA signature pending — chase required",
    dueAt: "2026-06-23T17:00:00Z",
    owner: "Priya Sharma",
  },
  {
    id: "wq5",
    contactId: "c2",
    contactName: "Rahul Verma",
    type: "sla_breach",
    priority: "medium",
    title: "Billing case CM-1048 approaching SLA deadline",
    dueAt: "2026-06-26T12:00:00Z",
    owner: "Arjun Mehta",
  },
];

export const MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: "doc1",
    name: "Product Brochure Q2.pdf",
    contactId: "c1",
    contactName: "Ananya Iyer",
    type: "PDF",
    size: "2.4 MB",
    uploadedAt: "2026-06-22T09:30:00Z",
    uploadedBy: "Priya Sharma",
  },
  {
    id: "doc2",
    name: "Mutual NDA — Law Partners.pdf",
    contactId: "c5",
    contactName: "Meera Krishnan",
    type: "PDF",
    size: "890 KB",
    uploadedAt: "2026-06-23T08:00:00Z",
    uploadedBy: "Priya Sharma",
  },
  {
    id: "doc3",
    name: "Vendor Agreement — Signed.pdf",
    contactId: "c2",
    contactName: "Rahul Verma",
    type: "PDF",
    size: "1.1 MB",
    uploadedAt: "2026-06-15T10:00:00Z",
    uploadedBy: "Arjun Mehta",
  },
  {
    id: "doc4",
    name: "Citizen Complaint Evidence.zip",
    contactId: "c3",
    contactName: "Sunita Patil",
    type: "ZIP",
    size: "5.6 MB",
    uploadedAt: "2026-06-20T09:00:00Z",
    uploadedBy: "Neha Reddy",
  },
];

export const MOCK_SURVEYS: SurveyFlow[] = [
  {
    id: "sv1",
    name: "Post-Purchase NPS",
    status: "active",
    responses: 1240,
    nps: 42,
    channels: ["email", "whatsapp"],
    promoterPath: "Thank you + referral ask + upsell offer",
    detractorPath: "Apology + case creation + manager callback within 4h",
    trigger: "Deal closed won",
    followUpAction: "Detractor → auto-create case with priority High",
  },
  {
    id: "sv2",
    name: "Support Resolution CSAT",
    status: "active",
    responses: 890,
    nps: 58,
    channels: ["email"],
    promoterPath: "Public review request + loyalty points",
    detractorPath: "Reopen case + priority queue escalation",
    trigger: "Case status = resolved",
    followUpAction: "Score ≤ 3 → reopen case + notify manager",
  },
  {
    id: "sv3",
    name: "Event Follow-up Feedback",
    status: "draft",
    responses: 0,
    channels: ["email", "web"],
    promoterPath: "Schedule demo + send case study",
    detractorPath: "Remove from nurture + manual review",
    trigger: "Campaign attendance",
    followUpAction: "Promoter → add to referral nurture list",
  },
];

export const IMPORT_FIELD_OPTIONS = [
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Company",
  "Title",
  "Source",
  "Owner",
  "Tags",
];

export const REPORT_OBJECTS = ["Contacts", "Leads", "Customers", "Activities"];
export const REPORT_DIMENSIONS = [
  "Owner",
  "Source",
  "Lifecycle Stage",
  "Territory",
  "Created Date",
  "Health Score Band",
];

export const REP_DASHBOARD_DATA: Record<"today" | "week" | "month", RepPeriodSummary> = {
  today: {
    timeframe: "today",
    headline: "4 priority actions before end of day",
    focus:
      "Start with Ananya Iyer (demo access case) and Meera Krishnan (NDA pending). Both are high-intent and overdue.",
    stats: [
      { id: "s1", label: "Due today", value: 6, hint: "Tasks & follow-ups" },
      { id: "s2", label: "Overdue", value: 2, hint: "Needs immediate attention", trend: "+1 vs yesterday" },
      { id: "s3", label: "Hot leads", value: 1, hint: "Score > 70, no reply 48h" },
      { id: "s4", label: "Inbox unread", value: 2, hint: "Email & WhatsApp" },
      { id: "s5", label: "Calls scheduled", value: 3, hint: "Click-to-call ready" },
      { id: "s6", label: "Open cases", value: 1, hint: "Assigned to you" },
    ],
    actions: [
      {
        id: "ra1",
        contactId: "c1",
        contactName: "Ananya Iyer",
        title: "Demo access not received — case CM-1051",
        type: "sla_breach",
        priority: "urgent",
        dueAt: "2026-06-24T09:00:00Z",
        timeframe: "today",
        suggestedAction: "Call now",
        channel: "phone",
      },
      {
        id: "ra2",
        contactId: "c5",
        contactName: "Meera Krishnan",
        title: "NDA signature pending — chase required",
        type: "esign",
        priority: "high",
        dueAt: "2026-06-24T12:00:00Z",
        timeframe: "today",
        suggestedAction: "Send reminder",
        channel: "email",
      },
      {
        id: "ra3",
        contactId: "c1",
        contactName: "Ananya Iyer",
        title: "Follow-up call after brochure open",
        type: "overdue_followup",
        priority: "high",
        dueAt: "2026-06-24T14:00:00Z",
        timeframe: "today",
        suggestedAction: "Schedule call",
        channel: "phone",
      },
      {
        id: "ra4",
        contactId: "c4",
        contactName: "Vikram Singh",
        title: "Reply to demo inquiry in inbox",
        type: "inbox",
        priority: "medium",
        dueAt: "2026-06-24T16:00:00Z",
        timeframe: "today",
        suggestedAction: "Reply in inbox",
        channel: "email",
      },
    ],
  },
  week: {
    timeframe: "week",
    headline: "18 touchpoints planned this week",
    focus:
      "You have 5 new leads assigned Mon–Wed. Block 2 hours Thursday for government account follow-ups.",
    stats: [
      { id: "w1", label: "Follow-ups", value: 12, hint: "Scheduled this week" },
      { id: "w2", label: "New leads", value: 5, hint: "Assigned to you", trend: "+2 vs last week", positive: true },
      { id: "w3", label: "Meetings", value: 4, hint: "Demos & check-ins" },
      { id: "w4", label: "Sequences active", value: 8, hint: "Contacts enrolled" },
      { id: "w5", label: "Cases to update", value: 3, hint: "Awaiting your input" },
      { id: "w6", label: "Est. conversions", value: 2, hint: "SQL → Customer" },
    ],
    goals: [
      { label: "Calls completed", current: 9, target: 20 },
      { label: "Emails sent", current: 24, target: 40 },
      { label: "Meetings held", current: 2, target: 4 },
    ],
    actions: [
      {
        id: "rw1",
        contactId: "c3",
        contactName: "Sunita Patil",
        title: "Quarterly check-in — government account",
        type: "meeting",
        priority: "medium",
        dueAt: "2026-06-26T10:00:00Z",
        timeframe: "week",
        suggestedAction: "Book meeting",
        channel: "phone",
      },
      {
        id: "rw2",
        contactId: "c2",
        contactName: "Rahul Verma",
        title: "Sequence step 3 — product overview email",
        type: "email",
        priority: "low",
        dueAt: "2026-06-27T09:00:00Z",
        timeframe: "week",
        suggestedAction: "Review before send",
        channel: "email",
      },
      {
        id: "rw3",
        contactId: "c4",
        contactName: "Vikram Singh",
        title: "Demo scheduling — sales cadence day 5",
        type: "hot_lead",
        priority: "high",
        dueAt: "2026-06-25T15:00:00Z",
        timeframe: "week",
        suggestedAction: "Send calendar link",
        channel: "email",
      },
    ],
  },
  month: {
    timeframe: "month",
    headline: "On track for monthly activity goals",
    focus:
      "Conversion rate from MQL is 18% — above team average. Prioritize enterprise tags in Bangalore for the last week of June.",
    stats: [
      { id: "m1", label: "Activities logged", value: 86, hint: "Calls, emails, meetings", trend: "+14% vs last month", positive: true },
      { id: "m2", label: "Leads converted", value: 4, hint: "Lead → Customer" },
      { id: "m3", label: "Avg response time", value: "4.2h", hint: "First touch" },
      { id: "m4", label: "Health score delta", value: "+6", hint: "On your contacts", positive: true },
      { id: "m5", label: "Pipeline influenced", value: "₹12.4L", hint: "Est. deal value" },
      { id: "m6", label: "CSAT / NPS", value: 42, hint: "From surveys sent" },
    ],
    goals: [
      { label: "Leads worked", current: 38, target: 50 },
      { label: "Customers won", current: 4, target: 6 },
      { label: "Cases resolved", current: 11, target: 15 },
    ],
    actions: [
      {
        id: "rm1",
        contactId: "c1",
        contactName: "Ananya Iyer",
        title: "Move to SQL — enterprise evaluation",
        type: "hot_lead",
        priority: "medium",
        dueAt: "2026-06-30T00:00:00Z",
        timeframe: "month",
        suggestedAction: "Update lifecycle",
      },
      {
        id: "rm2",
        contactId: "c5",
        contactName: "Meera Krishnan",
        title: "Post-NDA onboarding sequence enroll",
        type: "email",
        priority: "low",
        dueAt: "2026-06-28T00:00:00Z",
        timeframe: "month",
        suggestedAction: "Enroll after sign",
      },
    ],
  },
};

export {
  DOCUMENT_REQUEST_TEMPLATES,
  MAGIC_LINK_SESSIONS,
  MOCK_OUTREACH_DISPATCHES,
  getMagicLinkSession,
  getOutreachDispatch,
} from "./outreach";
