import type {
  ActivityItem,
  AssignmentRule,
  Automation,
  AutomationRecipe,
  CalendarEvent,
  Campaign,
  CampaignDailyStat,
  CampaignRecipient,
  CaseRecord,
  CaseTemplate,
  CaseTimelineEvent,
  ContactRecord,
  CustomField,
  DashboardStats,
  DeliverabilityHealth,
  DocumentRecord,
  DuplicatePair,
  EmailStarter,
  EmailTemplate,
  PersonalizationToken,
  UnsubscribeReasonStat,
  UnsubscribeTopic,
  EsignEnvelope,
  EsignTemplate,
  FunnelStage,
  InboxMessage,
  IntegrationStatus,
  ListRecord,
  MarketingForm,
  RepPeriodSummary,
  ScoringRule,
  SegmentGrowthPoint,
  SegmentRecord,
  SegmentSuggestion,
  Sequence,
  SequenceEnrollment,
  SequenceExitConfig,
  SequencePack,
  SequenceStep,
  SequenceTemplate,
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

export const MOCK_SEGMENTS: SegmentRecord[] = [
  {
    id: "sg1",
    name: "Active Leads Q2",
    description: "Leads with a lead score above 60 who were touched in the last 30 days.",
    type: "dynamic",
    origin: "manual",
    memberCount: 2450,
    weeklyChange: 128,
    definition: {
      match: "all",
      groups: [
        {
          id: "g1",
          match: "all",
          conditions: [
            { id: "c1", field: "lifecycleStage", operator: "equals", value: "lead" },
            { id: "c2", field: "leadScore", operator: "greater_than", value: "60" },
            { id: "c3", field: "daysSinceContact", operator: "less_than", value: "30" },
          ],
        },
      ],
    },
    owner: "Priya Sharma",
    createdAt: "2026-04-02T10:00:00Z",
    updatedAt: "2026-07-06T09:00:00Z",
    refresh: {
      mode: "scheduled",
      frequency: "daily",
      lastRefreshedAt: "2026-07-07T09:00:00Z",
      nextRefreshAt: "2026-07-08T09:00:00Z",
      history: [
        { id: "r1", at: "2026-07-07T09:00:00Z", trigger: "scheduled", delta: 18, durationMs: 4200 },
        { id: "r2", at: "2026-07-06T09:00:00Z", trigger: "scheduled", delta: -4, durationMs: 3900 },
        { id: "r3", at: "2026-07-05T14:22:00Z", trigger: "manual", delta: 42, durationMs: 4600 },
        { id: "r4", at: "2026-07-05T09:00:00Z", trigger: "scheduled", delta: 11, durationMs: 4100 },
      ],
    },
    usedIn: [
      { module: "campaign", refId: "cp1", name: "June Product Launch", status: "completed" },
      { module: "campaign", refId: "cp4", name: "Weekly Nurture Digest", status: "running" },
      { module: "campaign", refId: "cp6", name: "Q3 Newsletter", status: "draft" },
      { module: "sequence", refId: "s1", name: "New Lead Welcome", status: "active" },
    ],
  },
  {
    id: "sg2",
    name: "VIP Retail Customers",
    description: "Hand-picked flagship retail accounts for premium offers.",
    type: "static",
    origin: "manual",
    memberCount: 89,
    weeklyChange: 3,
    staticMemberIds: ["c2", "c5", "c7"],
    owner: "Arjun Mehta",
    createdAt: "2026-02-14T12:00:00Z",
    updatedAt: "2026-06-20T15:30:00Z",
    refresh: { mode: "manual", history: [] },
    usedIn: [
      { module: "campaign", refId: "cp2", name: "Monsoon Offer — WhatsApp", status: "scheduled" },
      { module: "campaign", refId: "cp7", name: "Connect Summit Invite (Archived)", status: "completed" },
    ],
  },
  {
    id: "sg3",
    name: "Bangalore — not contacted 60d",
    description: "South-territory contacts going cold; feed for win-back campaigns.",
    type: "dynamic",
    origin: "manual",
    memberCount: 342,
    weeklyChange: -12,
    definition: {
      match: "all",
      groups: [
        {
          id: "g1",
          match: "all",
          conditions: [
            { id: "c1", field: "territory", operator: "equals", value: "South" },
            { id: "c2", field: "daysSinceContact", operator: "greater_than", value: "60" },
          ],
        },
      ],
    },
    owner: "Neha Reddy",
    createdAt: "2026-05-18T09:00:00Z",
    updatedAt: "2026-07-05T08:00:00Z",
    refresh: {
      mode: "scheduled",
      frequency: "hourly",
      lastRefreshedAt: "2026-07-07T11:00:00Z",
      nextRefreshAt: "2026-07-07T12:00:00Z",
      history: [
        { id: "r1", at: "2026-07-07T11:00:00Z", trigger: "scheduled", delta: -2, durationMs: 1800 },
        { id: "r2", at: "2026-07-07T10:00:00Z", trigger: "scheduled", delta: 0, durationMs: 1750 },
        { id: "r3", at: "2026-07-07T09:00:00Z", trigger: "scheduled", delta: 5, durationMs: 1900 },
      ],
    },
    usedIn: [
      { module: "campaign", refId: "cp3", name: "Re-engagement Win-back", status: "running" },
    ],
  },
  {
    id: "sg4",
    name: "Government accounts",
    description: "All accounts tagged government for compliance-friendly outreach.",
    type: "dynamic",
    origin: "manual",
    memberCount: 56,
    weeklyChange: 1,
    definition: {
      match: "all",
      groups: [
        {
          id: "g1",
          match: "any",
          conditions: [
            { id: "c1", field: "tags", operator: "has_tag", value: "government" },
            { id: "c2", field: "company", operator: "contains", value: "gov" },
          ],
        },
      ],
    },
    owner: "Karthik N",
    createdAt: "2026-03-08T10:00:00Z",
    updatedAt: "2026-06-22T10:00:00Z",
    refresh: {
      mode: "scheduled",
      frequency: "weekly",
      lastRefreshedAt: "2026-07-06T06:00:00Z",
      nextRefreshAt: "2026-07-13T06:00:00Z",
      history: [
        { id: "r1", at: "2026-07-06T06:00:00Z", trigger: "scheduled", delta: 1, durationMs: 950 },
        { id: "r2", at: "2026-06-29T06:00:00Z", trigger: "scheduled", delta: 0, durationMs: 900 },
      ],
    },
    usedIn: [
      { module: "campaign", refId: "cp5", name: "Government Accounts Outreach", status: "paused" },
      { module: "sequence", refId: "s2", name: "Outbound Sales Cadence", status: "active" },
    ],
  },
  {
    id: "sg5",
    name: "High-intent demo requesters",
    description: "Opened 3+ emails and submitted the demo form — sales-ready.",
    type: "dynamic",
    origin: "manual",
    memberCount: 214,
    weeklyChange: 26,
    definition: {
      match: "all",
      groups: [
        {
          id: "g1",
          match: "all",
          conditions: [
            { id: "c1", field: "emailsOpened", operator: "greater_than", value: "3" },
            { id: "c2", field: "leadScore", operator: "greater_than", value: "70" },
          ],
        },
        {
          id: "g2",
          match: "any",
          conditions: [
            { id: "c3", field: "source", operator: "equals", value: "Website" },
            { id: "c4", field: "tags", operator: "has_tag", value: "demo-request" },
          ],
        },
      ],
    },
    owner: "Priya Sharma",
    createdAt: "2026-06-01T11:00:00Z",
    updatedAt: "2026-07-07T08:00:00Z",
    refresh: {
      mode: "scheduled",
      frequency: "daily",
      lastRefreshedAt: "2026-07-07T09:00:00Z",
      nextRefreshAt: "2026-07-08T09:00:00Z",
      history: [
        { id: "r1", at: "2026-07-07T09:00:00Z", trigger: "scheduled", delta: 7, durationMs: 2100 },
        { id: "r2", at: "2026-07-06T09:00:00Z", trigger: "scheduled", delta: 4, durationMs: 2000 },
      ],
    },
    usedIn: [
      { module: "sequence", refId: "s1", name: "New Lead Welcome", status: "active" },
      { module: "sequence", refId: "s2", name: "Outbound Sales Cadence", status: "active" },
    ],
  },
  {
    id: "sg6",
    name: "Dormant 90-day win-back",
    description: "No touch in 90+ days but previously engaged — candidates for re-activation.",
    type: "dynamic",
    origin: "ai_suggested",
    memberCount: 468,
    weeklyChange: 15,
    definition: {
      match: "all",
      groups: [
        {
          id: "g1",
          match: "all",
          conditions: [
            { id: "c1", field: "daysSinceContact", operator: "greater_than", value: "90" },
            { id: "c2", field: "emailsOpened", operator: "greater_than", value: "1" },
          ],
        },
      ],
    },
    owner: "Neha Reddy",
    createdAt: "2026-06-25T10:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
    refresh: {
      mode: "scheduled",
      frequency: "daily",
      lastRefreshedAt: "2026-07-07T09:00:00Z",
      nextRefreshAt: "2026-07-08T09:00:00Z",
      history: [
        { id: "r1", at: "2026-07-07T09:00:00Z", trigger: "scheduled", delta: 3, durationMs: 3100 },
      ],
    },
    usedIn: [],
  },
  {
    id: "sg7",
    name: "Newsletter subscribers",
    description: "Everyone who opted in via the newsletter signup form.",
    type: "static",
    origin: "manual",
    memberCount: 1420,
    weeklyChange: 34,
    staticMemberIds: ["c1", "c3", "c4", "c6", "c8"],
    owner: "Arjun Mehta",
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-07-04T16:00:00Z",
    refresh: { mode: "manual", history: [] },
    usedIn: [],
  },
  {
    id: "sg8",
    name: "Diwali 2025 promo blast",
    description: "Snapshot list from last year's festive campaign.",
    type: "static",
    origin: "manual",
    archived: true,
    memberCount: 3180,
    weeklyChange: 0,
    staticMemberIds: ["c1", "c2", "c3"],
    owner: "Karthik N",
    createdAt: "2025-10-02T09:00:00Z",
    updatedAt: "2025-11-20T09:00:00Z",
    refresh: { mode: "manual", history: [] },
    usedIn: [],
  },
];

export const MOCK_SEGMENT_SUGGESTIONS: SegmentSuggestion[] = [
  {
    id: "ss1",
    name: "Hot leads gone quiet",
    rationale:
      "38 contacts opened 4+ emails in June but have had no touch in 21 days. Similar cohorts converted 2.3× better after a nudge campaign.",
    predictedCount: 214,
    confidence: 87,
    definition: {
      match: "all",
      groups: [
        {
          id: "g1",
          match: "all",
          conditions: [
            { id: "c1", field: "emailsOpened", operator: "greater_than", value: "4" },
            { id: "c2", field: "daysSinceContact", operator: "greater_than", value: "21" },
          ],
        },
      ],
    },
  },
  {
    id: "ss2",
    name: "WhatsApp-first responders",
    rationale:
      "Contacts with WhatsApp consent whose last three replies came via WhatsApp engage 4× faster there than on email.",
    predictedCount: 689,
    confidence: 79,
    definition: {
      match: "all",
      groups: [
        {
          id: "g1",
          match: "all",
          conditions: [
            { id: "c1", field: "consentWhatsapp", operator: "equals", value: "true" },
            { id: "c2", field: "source", operator: "equals", value: "WhatsApp" },
          ],
        },
      ],
    },
  },
  {
    id: "ss3",
    name: "Enterprise MQLs — South",
    rationale:
      "South-territory MQLs at enterprise companies show the highest demo-to-deal rate this quarter but are not targeted by any active campaign.",
    predictedCount: 122,
    confidence: 74,
    definition: {
      match: "all",
      groups: [
        {
          id: "g1",
          match: "all",
          conditions: [
            { id: "c1", field: "lifecycleStage", operator: "equals", value: "mql" },
            { id: "c2", field: "territory", operator: "equals", value: "South" },
            { id: "c3", field: "tags", operator: "has_tag", value: "enterprise" },
          ],
        },
      ],
    },
  },
];

export const MOCK_SEGMENT_GROWTH: SegmentGrowthPoint[] = [
  { segmentId: "sg1", date: "2026-05-18", count: 1980 },
  { segmentId: "sg1", date: "2026-05-25", count: 2085 },
  { segmentId: "sg1", date: "2026-06-01", count: 2140 },
  { segmentId: "sg1", date: "2026-06-08", count: 2262 },
  { segmentId: "sg1", date: "2026-06-15", count: 2290 },
  { segmentId: "sg1", date: "2026-06-22", count: 2310 },
  { segmentId: "sg1", date: "2026-06-29", count: 2322 },
  { segmentId: "sg1", date: "2026-07-06", count: 2450 },
  { segmentId: "sg3", date: "2026-06-08", count: 396 },
  { segmentId: "sg3", date: "2026-06-15", count: 381 },
  { segmentId: "sg3", date: "2026-06-22", count: 370 },
  { segmentId: "sg3", date: "2026-06-29", count: 354 },
  { segmentId: "sg3", date: "2026-07-06", count: 342 },
  { segmentId: "sg5", date: "2026-06-08", count: 118 },
  { segmentId: "sg5", date: "2026-06-15", count: 141 },
  { segmentId: "sg5", date: "2026-06-22", count: 166 },
  { segmentId: "sg5", date: "2026-06-29", count: 188 },
  { segmentId: "sg5", date: "2026-07-06", count: 214 },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "cp1",
    name: "June Product Launch",
    description: "Hero announcement for the June release, targeted at active Q2 leads.",
    type: "one-time",
    status: "completed",
    channel: "email",
    segmentId: "sg1",
    segmentName: "Active Leads Q2",
    templateId: "t1",
    templateName: "Product Launch Hero",
    owner: "Priya Sharma",
    goals: [
      { metric: "opens", target: 2000, current: 1890 },
      { metric: "clicks", target: 400, current: 420 },
      { metric: "conversions", target: 60, current: 74 },
    ],
    conversionTargets: [
      { id: "ct1", type: "form", name: "Demo Request", conversions: 52 },
      { id: "ct2", type: "landing_page", name: "Launch landing page", url: "https://connectnx.io/launch", conversions: 22 },
    ],
    utmEnabled: true,
    utm: { source: "connect-nx", medium: "email", campaign: "june-product-launch", content: "hero-cta" },
    abTest: {
      enabled: true,
      winnerCriteria: "open_rate",
      samplePercent: 20,
      variants: [
        { id: "v1", label: "Variant A", subject: "Introducing the next chapter", sent: 2100, opened: 1050, clicked: 240, winner: true },
        { id: "v2", label: "Variant B", subject: "The wait is over — see what's new", sent: 2100, opened: 840, clicked: 180 },
      ],
    },
    scheduledAt: "2026-06-10T09:00:00Z",
    lastRunAt: "2026-06-10T09:00:00Z",
    completedAt: "2026-06-10T14:30:00Z",
    createdAt: "2026-06-02T11:00:00Z",
    updatedAt: "2026-06-10T14:30:00Z",
    sent: 4200, delivered: 4150, opened: 1890, clicked: 420, bounced: 50, unsubscribed: 12, converted: 74,
  },
  {
    id: "cp2",
    name: "Monsoon Offer — WhatsApp",
    description: "Seasonal discount broadcast for VIP retail customers.",
    type: "one-time",
    status: "scheduled",
    channel: "whatsapp",
    segmentId: "sg2",
    segmentName: "VIP Retail Customers",
    templateId: "t3",
    templateName: "Re-engagement Offer",
    owner: "Arjun Mehta",
    goals: [
      { metric: "clicks", target: 30, current: 0 },
      { metric: "conversions", target: 10, current: 0 },
    ],
    conversionTargets: [
      { id: "ct3", type: "landing_page", name: "Monsoon offer page", url: "https://connectnx.io/monsoon", conversions: 0 },
    ],
    utmEnabled: true,
    utm: { source: "whatsapp", medium: "social", campaign: "monsoon-offer" },
    scheduledAt: "2026-07-25T10:00:00Z",
    createdAt: "2026-06-18T09:30:00Z",
    updatedAt: "2026-06-24T08:00:00Z",
    sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, converted: 0,
  },
  {
    id: "cp3",
    name: "Re-engagement Win-back",
    description: "Win back contacts with no touch in the last 90 days.",
    type: "one-time",
    status: "running",
    channel: "email",
    segmentId: "sg3",
    segmentName: "Bangalore — not contacted 60d",
    templateId: "t3",
    templateName: "Re-engagement Offer",
    owner: "Neha Reddy",
    goals: [
      { metric: "opens", target: 300, current: 210 },
      { metric: "clicks", target: 80, current: 45 },
    ],
    conversionTargets: [
      { id: "ct4", type: "form", name: "Newsletter Signup", conversions: 9 },
    ],
    utmEnabled: true,
    utm: { source: "connect-nx", medium: "email", campaign: "winback-q2" },
    scheduledAt: "2026-07-05T08:00:00Z",
    lastRunAt: "2026-07-06T08:00:00Z",
    createdAt: "2026-06-20T15:00:00Z",
    updatedAt: "2026-07-06T09:15:00Z",
    sent: 800, delivered: 790, opened: 210, clicked: 45, bounced: 10, unsubscribed: 3, converted: 9,
  },
  {
    id: "cp4",
    name: "Weekly Nurture Digest",
    description: "Recurring Monday-morning digest for all subscribed leads.",
    type: "recurring",
    status: "running",
    channel: "email",
    segmentId: "sg1",
    segmentName: "Active Leads Q2",
    templateId: "t2",
    templateName: "Welcome — Day 1",
    owner: "Priya Sharma",
    goals: [{ metric: "opens", target: 5000, current: 3420 }],
    conversionTargets: [],
    utmEnabled: true,
    utm: { source: "connect-nx", medium: "email", campaign: "weekly-digest" },
    recurrence: { frequency: "weekly", cron: "0 9 * * 1", startDate: "2026-05-04", endDate: "2026-09-28" },
    lastRunAt: "2026-07-06T09:00:00Z",
    createdAt: "2026-04-28T10:00:00Z",
    updatedAt: "2026-07-06T09:05:00Z",
    sent: 9120, delivered: 8990, opened: 3420, clicked: 780, bounced: 130, unsubscribed: 34, converted: 118,
  },
  {
    id: "cp5",
    name: "Government Accounts Outreach",
    description: "Monthly compliance-friendly update for government accounts.",
    type: "recurring",
    status: "paused",
    channel: "email",
    segmentId: "sg4",
    segmentName: "Government accounts",
    templateId: "t4",
    templateName: "Event Follow-up",
    owner: "Karthik N",
    goals: [{ metric: "form_submissions", target: 25, current: 11 }],
    conversionTargets: [
      { id: "ct5", type: "form", name: "Event Registration — Connect Summit", conversions: 11 },
    ],
    utmEnabled: false,
    recurrence: { frequency: "monthly", cron: "0 10 1 * *", startDate: "2026-03-01" },
    lastRunAt: "2026-06-01T10:00:00Z",
    createdAt: "2026-02-20T12:00:00Z",
    updatedAt: "2026-06-12T16:00:00Z",
    sent: 224, delivered: 219, opened: 96, clicked: 31, bounced: 5, unsubscribed: 1, converted: 11,
  },
  {
    id: "cp6",
    name: "Q3 Newsletter",
    description: "Quarterly product and customer-story newsletter.",
    type: "one-time",
    status: "draft",
    channel: "email",
    segmentId: "sg1",
    segmentName: "Active Leads Q2",
    owner: "Neha Reddy",
    goals: [{ metric: "opens", target: 1500, current: 0 }],
    conversionTargets: [],
    utmEnabled: false,
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-03T13:40:00Z",
    sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, converted: 0,
  },
  {
    id: "cp7",
    name: "Connect Summit Invite (Archived)",
    description: "Event invitation wave 1 — superseded by wave 2.",
    type: "one-time",
    status: "completed",
    archived: true,
    channel: "email",
    segmentId: "sg2",
    segmentName: "VIP Retail Customers",
    templateId: "t4",
    templateName: "Event Follow-up",
    owner: "Arjun Mehta",
    goals: [{ metric: "form_submissions", target: 40, current: 36 }],
    conversionTargets: [
      { id: "ct6", type: "form", name: "Event Registration — Connect Summit", conversions: 36 },
    ],
    utmEnabled: true,
    utm: { source: "connect-nx", medium: "email", campaign: "summit-invite-w1" },
    scheduledAt: "2026-05-12T09:00:00Z",
    lastRunAt: "2026-05-12T09:00:00Z",
    completedAt: "2026-05-12T11:20:00Z",
    createdAt: "2026-05-02T10:00:00Z",
    updatedAt: "2026-05-20T10:00:00Z",
    sent: 89, delivered: 88, opened: 61, clicked: 44, bounced: 1, unsubscribed: 0, converted: 36,
  },
];

const cp1Events = (
  events: [CampaignRecipient["status"], string, string?][]
): CampaignRecipient["events"] =>
  events.map(([type, at, detail], i) => ({ id: `ev${i}`, type, at, detail }));

export const MOCK_CAMPAIGN_RECIPIENTS: CampaignRecipient[] = [
  {
    id: "cr1", campaignId: "cp1", contactId: "c1", name: "Ananya Iyer", email: "ananya.iyer@techcorp.in",
    status: "converted", lastEventAt: "2026-06-10T11:42:00Z",
    events: cp1Events([
      ["queued", "2026-06-10T08:58:00Z"],
      ["sent", "2026-06-10T09:00:12Z", "Variant A subject"],
      ["delivered", "2026-06-10T09:00:41Z"],
      ["opened", "2026-06-10T09:24:05Z", "Opened on mobile"],
      ["clicked", "2026-06-10T09:25:10Z", "Clicked hero CTA → /launch"],
      ["converted", "2026-06-10T11:42:00Z", "Submitted Demo Request form"],
    ]),
  },
  {
    id: "cr2", campaignId: "cp1", contactId: "c2", name: "Rahul Verma", email: "rahul.verma@retailmax.in",
    status: "clicked", lastEventAt: "2026-06-10T10:02:00Z",
    events: cp1Events([
      ["queued", "2026-06-10T08:58:00Z"],
      ["sent", "2026-06-10T09:00:15Z", "Variant B subject"],
      ["delivered", "2026-06-10T09:00:52Z"],
      ["opened", "2026-06-10T09:58:30Z"],
      ["clicked", "2026-06-10T10:02:00Z", "Clicked pricing link"],
    ]),
  },
  {
    id: "cr3", campaignId: "cp1", contactId: "c3", name: "Sunita Patil", email: "sunita.patil@gov.in",
    status: "opened", lastEventAt: "2026-06-10T13:15:00Z",
    events: cp1Events([
      ["queued", "2026-06-10T08:58:00Z"],
      ["sent", "2026-06-10T09:00:20Z", "Variant A subject"],
      ["delivered", "2026-06-10T09:01:02Z"],
      ["opened", "2026-06-10T13:15:00Z"],
    ]),
  },
  {
    id: "cr4", campaignId: "cp1", contactId: "c4", name: "Vikram Singh", email: "vikram.singh@startup.io",
    status: "bounced", lastEventAt: "2026-06-10T09:00:45Z",
    events: cp1Events([
      ["queued", "2026-06-10T08:58:00Z"],
      ["sent", "2026-06-10T09:00:18Z", "Variant A subject"],
      ["bounced", "2026-06-10T09:00:45Z", "Hard bounce — mailbox not found"],
    ]),
  },
  {
    id: "cr5", campaignId: "cp1", contactId: "c5", name: "Meera Krishnan", email: "meera.k@finserv.co.in",
    status: "unsubscribed", lastEventAt: "2026-06-10T12:40:00Z",
    events: cp1Events([
      ["queued", "2026-06-10T08:58:00Z"],
      ["sent", "2026-06-10T09:00:22Z", "Variant B subject"],
      ["delivered", "2026-06-10T09:01:10Z"],
      ["opened", "2026-06-10T12:38:00Z"],
      ["unsubscribed", "2026-06-10T12:40:00Z", "Via footer link"],
    ]),
  },
  {
    id: "cr6", campaignId: "cp3", contactId: "c2", name: "Rahul Verma", email: "rahul.verma@retailmax.in",
    status: "opened", lastEventAt: "2026-07-06T10:12:00Z",
    events: cp1Events([
      ["queued", "2026-07-06T07:58:00Z"],
      ["sent", "2026-07-06T08:00:10Z"],
      ["delivered", "2026-07-06T08:00:38Z"],
      ["opened", "2026-07-06T10:12:00Z"],
    ]),
  },
  {
    id: "cr7", campaignId: "cp3", contactId: "c5", name: "Meera Krishnan", email: "meera.k@finserv.co.in",
    status: "delivered", lastEventAt: "2026-07-06T08:00:44Z",
    events: cp1Events([
      ["queued", "2026-07-06T07:58:00Z"],
      ["sent", "2026-07-06T08:00:12Z"],
      ["delivered", "2026-07-06T08:00:44Z"],
    ]),
  },
  {
    id: "cr8", campaignId: "cp4", contactId: "c1", name: "Ananya Iyer", email: "ananya.iyer@techcorp.in",
    status: "clicked", lastEventAt: "2026-07-06T09:31:00Z",
    events: cp1Events([
      ["sent", "2026-07-06T09:00:05Z", "Run of Jul 6"],
      ["delivered", "2026-07-06T09:00:30Z"],
      ["opened", "2026-07-06T09:28:00Z"],
      ["clicked", "2026-07-06T09:31:00Z", "Clicked digest story #2"],
    ]),
  },
];

export const MOCK_CAMPAIGN_DAILY_STATS: CampaignDailyStat[] = [
  { campaignId: "cp1", date: "2026-06-10", sent: 4200, opened: 1210, clicked: 260, converted: 41 },
  { campaignId: "cp1", date: "2026-06-11", sent: 0, opened: 420, clicked: 98, converted: 19 },
  { campaignId: "cp1", date: "2026-06-12", sent: 0, opened: 170, clicked: 40, converted: 9 },
  { campaignId: "cp1", date: "2026-06-13", sent: 0, opened: 90, clicked: 22, converted: 5 },
  { campaignId: "cp3", date: "2026-07-05", sent: 420, opened: 96, clicked: 18, converted: 4 },
  { campaignId: "cp3", date: "2026-07-06", sent: 380, opened: 114, clicked: 27, converted: 5 },
  { campaignId: "cp4", date: "2026-06-15", sent: 1140, opened: 430, clicked: 96, converted: 14 },
  { campaignId: "cp4", date: "2026-06-22", sent: 1150, opened: 415, clicked: 92, converted: 15 },
  { campaignId: "cp4", date: "2026-06-29", sent: 1145, opened: 442, clicked: 101, converted: 16 },
  { campaignId: "cp4", date: "2026-07-06", sent: 1152, opened: 438, clicked: 99, converted: 15 },
];

const DEFAULT_EXIT: SequenceExitConfig = {
  pauseOnReply: true,
  goalEnabled: false,
  unenrollOnSegmentExit: false,
  reEnrollment: "never",
  oneActivePerContact: true,
};

/** Verified marketing sending identities available for marketing-mode sequences. */
export const MOCK_SENDER_ADDRESSES = [
  { address: "marketing@connectnx.io", name: "Connect NX Marketing", verified: true },
  { address: "hello@connectnx.io", name: "Connect NX", verified: true },
  { address: "events@connectnx.io", name: "Connect NX Events", verified: true },
  { address: "noreply@connectnx.io", name: "Connect NX (no-reply)", verified: false },
];

const MARKETING_SENDER = {
  mode: "marketing_address" as const,
  fromName: "Connect NX Marketing",
  fromAddress: "marketing@connectnx.io",
  replyTo: "marketing@connectnx.io",
};
const REP_SENDER = { mode: "rep_inbox" as const };

export const MOCK_SEQUENCES: Sequence[] = [
  {
    id: "s1",
    sender: MARKETING_SENDER,
    name: "New Lead Welcome",
    description: "Five-step nurture that onboards new leads and hands warm ones to a rep.",
    type: "marketing",
    status: "active",
    channel: "multi",
    owner: "Priya Sharma",
    enrolled: 1240,
    activeCount: 214,
    completed: 890,
    exitedCount: 136,
    replied: 156,
    steps: 5,
    pauseOnReply: true,
    createdAt: "2026-04-10T09:00:00Z",
    updatedAt: "2026-07-06T10:00:00Z",
    triggers: [
      { id: "t1", type: "segment_joined", segmentId: "sg1" },
      { id: "t2", type: "form_submitted", formId: "f2" },
    ],
    exit: { ...DEFAULT_EXIT, goalEnabled: true, goalCondition: "lifecycleStage = mql" },
    flow: [
      {
        id: "st1", type: "email", label: "Welcome email", templateId: "t2",
        subject: "Welcome to Connect, {{firstName}}",
        stats: { reached: 1240, sent: 1240, opened: 778, clicked: 214, continued: 1180 },
      },
      { id: "st2", type: "wait", label: "Wait 2 days", waitMode: "duration", waitValue: 2, waitUnit: "days", businessDaysOnly: true },
      {
        id: "st3", type: "email", label: "Product overview", templateId: "t1",
        subject: "Here's what Connect can do for you",
        stats: { reached: 1180, sent: 1180, opened: 590, clicked: 168, continued: 980 },
      },
      { id: "st4", type: "wait", label: "Wait 3 days", waitMode: "duration", waitValue: 3, waitUnit: "days" },
      {
        id: "st5", type: "branch", label: "Engaged with either email?", branchKind: "if_else",
        branches: [
          {
            id: "b1", label: "Yes — engaged", condition: "opened_any_sequence_email = true",
            steps: [
              { id: "st6", type: "action", label: "Notify owner — hot lead", actionType: "notify_owner", actionSummary: "Email contact owner" },
              { id: "st7", type: "action", label: "Create follow-up task", actionType: "create_task", actionSummary: "Task: rep follow-up call" },
            ],
          },
          {
            id: "b2", label: "No — not engaged",
            steps: [
              { id: "st8", type: "wait", label: "Wait 5 days", waitMode: "duration", waitValue: 5, waitUnit: "days" },
              {
                id: "st9", type: "email", label: "Last-chance nudge", templateId: "t3",
                subject: "Still interested?",
                stats: { reached: 420, sent: 420, opened: 96, clicked: 22, continued: 420 },
              },
            ],
          },
        ],
      },
      { id: "st10", type: "goal", label: "Goal: became an MQL", goalCondition: "lifecycleStage = mql" },
    ],
  },
  {
    id: "s2",
    sender: REP_SENDER,
    name: "Outbound Sales Cadence",
    description: "Seven-touch sales cadence mixing email, WhatsApp, and manual rep tasks.",
    type: "sales",
    status: "active",
    channel: "multi",
    owner: "Arjun Mehta",
    enrolled: 320,
    activeCount: 68,
    completed: 180,
    exitedCount: 72,
    replied: 72,
    steps: 7,
    pauseOnReply: true,
    createdAt: "2026-05-02T09:00:00Z",
    updatedAt: "2026-07-05T14:00:00Z",
    triggers: [
      { id: "t3", type: "manual" },
      { id: "t4", type: "tag_added", tag: "sales-ready" },
    ],
    exit: { ...DEFAULT_EXIT, reEnrollment: "cooldown", reEnrollCooldownDays: 30 },
    flow: [
      { id: "s2st1", type: "email", label: "Introduction", templateId: "t2", subject: "Quick intro, {{firstName}}", stats: { reached: 320, sent: 320, opened: 198, clicked: 44, continued: 300 } },
      { id: "s2st2", type: "wait", label: "Wait 1 day", waitMode: "duration", waitValue: 1, waitUnit: "days" },
      { id: "s2st3", type: "whatsapp", label: "WhatsApp check-in", snippet: "Hi {{firstName}}, did my email reach you?" },
      { id: "s2st4", type: "wait", label: "Wait until replied (max 4 days)", waitMode: "until_condition", waitCondition: "replied = true", waitTimeoutDays: 4 },
      { id: "s2st5", type: "email", label: "Case study share", templateId: "t3", subject: "How RetailHub grew 3× with Connect", stats: { reached: 240, sent: 240, opened: 132, clicked: 51, continued: 220 } },
      { id: "s2st6", type: "wait", label: "Wait 2 days", waitMode: "duration", waitValue: 2, waitUnit: "days" },
      { id: "s2st7", type: "action", label: "Task: schedule demo", actionType: "create_task", actionSummary: "Assign demo booking to owner" },
    ],
  },
  {
    id: "s4",
    sender: MARKETING_SENDER,
    name: "90-Day Win-back",
    description: "Re-engages dormant contacts; exits anyone who re-engages or unsubscribes.",
    type: "marketing",
    status: "paused",
    channel: "email",
    owner: "Karthik N",
    enrolled: 468,
    activeCount: 0,
    completed: 312,
    exitedCount: 156,
    replied: 41,
    steps: 4,
    pauseOnReply: true,
    createdAt: "2026-06-01T09:00:00Z",
    updatedAt: "2026-06-30T09:00:00Z",
    triggers: [{ id: "t6", type: "segment_joined", segmentId: "sg6" }],
    exit: {
      pauseOnReply: true,
      goalEnabled: true,
      goalCondition: "daysSinceContact < 7",
      suppressionSegmentId: "sg7",
      unenrollOnSegmentExit: true,
      reEnrollment: "cooldown",
      reEnrollCooldownDays: 90,
      oneActivePerContact: true,
    },
    flow: [
      { id: "s4st1", type: "email", label: "We miss you", templateId: "t3", subject: "It's been a while, {{firstName}}", stats: { reached: 468, sent: 468, opened: 121, clicked: 28, continued: 440 } },
      { id: "s4st2", type: "wait", label: "Wait 4 days", waitMode: "duration", waitValue: 4, waitUnit: "days" },
      { id: "s4st3", type: "email", label: "Exclusive offer", templateId: "t3", subject: "A little something to bring you back", stats: { reached: 440, sent: 440, opened: 98, clicked: 31, continued: 420 } },
      { id: "s4st4", type: "goal", label: "Goal: re-engaged", goalCondition: "daysSinceContact < 7" },
    ],
  },
];

export const MOCK_SEQUENCE_ENROLLMENTS: SequenceEnrollment[] = [
  {
    id: "se1", sequenceId: "s1", contactId: "c1", contactName: "Ananya Iyer", email: "ananya.iyer@techcorp.in",
    state: "active", currentStepLabel: "Wait 3 days", source: "segment_joined",
    enrolledAt: "2026-07-04T09:00:00Z", updatedAt: "2026-07-06T09:24:00Z",
    events: [
      { id: "e1", stepLabel: "Enrolled", at: "2026-07-04T09:00:00Z", outcome: "enrolled", detail: "Joined segment “Active Leads Q2”" },
      { id: "e2", stepLabel: "Welcome email", at: "2026-07-04T09:00:12Z", outcome: "sent" },
      { id: "e3", stepLabel: "Welcome email", at: "2026-07-04T10:02:00Z", outcome: "opened" },
      { id: "e4", stepLabel: "Product overview", at: "2026-07-06T09:05:00Z", outcome: "sent" },
      { id: "e5", stepLabel: "Product overview", at: "2026-07-06T09:24:00Z", outcome: "clicked", detail: "Clicked pricing link" },
      { id: "e6", stepLabel: "Wait 3 days", at: "2026-07-06T09:24:00Z", outcome: "waiting" },
    ],
  },
  {
    id: "se2", sequenceId: "s1", contactId: "c4", contactName: "Vikram Singh", email: "vikram.singh@startup.io",
    state: "completed", currentStepLabel: undefined, source: "form_submitted",
    enrolledAt: "2026-06-20T09:00:00Z", updatedAt: "2026-06-29T11:00:00Z",
    events: [
      { id: "e1", stepLabel: "Enrolled", at: "2026-06-20T09:00:00Z", outcome: "enrolled", detail: "Submitted “Newsletter Signup”" },
      { id: "e2", stepLabel: "Welcome email", at: "2026-06-20T09:00:00Z", outcome: "clicked" },
      { id: "e3", stepLabel: "Product overview", at: "2026-06-22T09:00:00Z", outcome: "opened" },
      { id: "e4", stepLabel: "Engaged with either email?", at: "2026-06-22T09:05:00Z", outcome: "branched", detail: "Routed to “Yes — engaged”" },
      { id: "e5", stepLabel: "Goal: became an MQL", at: "2026-06-29T11:00:00Z", outcome: "completed", detail: "Reached goal — promoted to MQL" },
    ],
  },
  {
    id: "se3", sequenceId: "s1", contactId: "c5", contactName: "Meera Krishnan", email: "meera.k@finserv.co.in",
    state: "exited", exitReason: "replied", source: "segment_joined",
    enrolledAt: "2026-06-25T09:00:00Z", updatedAt: "2026-06-25T15:40:00Z",
    events: [
      { id: "e1", stepLabel: "Enrolled", at: "2026-06-25T09:00:00Z", outcome: "enrolled" },
      { id: "e2", stepLabel: "Welcome email", at: "2026-06-25T09:00:00Z", outcome: "sent" },
      { id: "e3", stepLabel: "Exited", at: "2026-06-25T15:40:00Z", outcome: "exited", detail: "Replied to email — paused on reply" },
    ],
  },
  {
    id: "se4", sequenceId: "s2", contactId: "c2", contactName: "Rahul Verma", email: "rahul.verma@retailmax.in",
    state: "active", currentStepLabel: "WhatsApp check-in", source: "manual",
    enrolledAt: "2026-07-05T09:00:00Z", updatedAt: "2026-07-06T09:00:00Z",
    events: [
      { id: "e1", stepLabel: "Enrolled", at: "2026-07-05T09:00:00Z", outcome: "enrolled", detail: "Manually enrolled by Arjun Mehta" },
      { id: "e2", stepLabel: "Introduction", at: "2026-07-05T09:00:00Z", outcome: "opened" },
      { id: "e3", stepLabel: "WhatsApp check-in", at: "2026-07-06T09:00:00Z", outcome: "sent" },
    ],
  },
  {
    id: "se5", sequenceId: "s2", contactId: "c3", contactName: "Sunita Patil", email: "sunita.patil@gov.in",
    state: "exited", exitReason: "goal_met", source: "tag_added",
    enrolledAt: "2026-06-28T09:00:00Z", updatedAt: "2026-07-01T12:00:00Z",
    events: [
      { id: "e1", stepLabel: "Enrolled", at: "2026-06-28T09:00:00Z", outcome: "enrolled" },
      { id: "e2", stepLabel: "Introduction", at: "2026-06-28T09:00:00Z", outcome: "clicked" },
      { id: "e3", stepLabel: "Exited", at: "2026-07-01T12:00:00Z", outcome: "exited", detail: "Booked a meeting — goal met" },
    ],
  },
  {
    id: "se6", sequenceId: "s4", contactId: "c1", contactName: "Ananya Iyer", email: "ananya.iyer@techcorp.in",
    state: "exited", exitReason: "suppressed", source: "segment_joined",
    enrolledAt: "2026-06-10T09:00:00Z", updatedAt: "2026-06-12T09:00:00Z",
    events: [
      { id: "e1", stepLabel: "Enrolled", at: "2026-06-10T09:00:00Z", outcome: "enrolled" },
      { id: "e2", stepLabel: "We miss you", at: "2026-06-10T09:00:00Z", outcome: "sent" },
      { id: "e3", stepLabel: "Exited", at: "2026-06-12T09:00:00Z", outcome: "exited", detail: "Added to suppression segment" },
    ],
  },
];

export const MOCK_SEQUENCE_TEMPLATES: SequenceTemplate[] = [
  {
    id: "tpl-welcome",
    sender: { mode: "marketing_address", fromName: "Connect NX", fromAddress: "hello@connectnx.io", replyTo: "hello@connectnx.io" },
    name: "New subscriber welcome",
    description: "Greet new subscribers, set expectations, and drive a first action over 3 emails.",
    type: "marketing",
    category: "welcome",
    channel: "email",
    triggers: [{ id: "tt1", type: "form_submitted", formId: "f2" }],
    exit: { ...DEFAULT_EXIT },
    flow: [
      { id: "w1", type: "email", label: "Welcome + what to expect", templateId: "t2", subject: "Welcome aboard, {{firstName}}" },
      { id: "w2", type: "wait", label: "Wait 2 days", waitMode: "duration", waitValue: 2, waitUnit: "days" },
      { id: "w3", type: "email", label: "Best-of content", templateId: "t1", subject: "The 3 things everyone starts with" },
      { id: "w4", type: "wait", label: "Wait 3 days", waitMode: "duration", waitValue: 3, waitUnit: "days" },
      { id: "w5", type: "email", label: "First-action nudge", templateId: "t1", subject: "Ready to try it?" },
    ],
  },
  {
    id: "tpl-reengage",
    sender: MARKETING_SENDER,
    name: "Dormant re-engagement",
    description: "Win back contacts who have gone quiet, with a goal exit when they re-engage.",
    type: "marketing",
    category: "re-engage",
    channel: "email",
    triggers: [{ id: "tt2", type: "segment_joined", segmentId: "sg6" }],
    exit: { ...DEFAULT_EXIT, goalEnabled: true, goalCondition: "daysSinceContact < 7" },
    flow: [
      { id: "r1", type: "email", label: "We miss you", templateId: "t3", subject: "It's been a while" },
      { id: "r2", type: "wait", label: "Wait 4 days", waitMode: "duration", waitValue: 4, waitUnit: "days" },
      { id: "r3", type: "branch", label: "Opened the email?", branchKind: "if_else", branches: [
        { id: "rb1", label: "Yes", condition: "opened_any_sequence_email = true", steps: [
          { id: "r4", type: "email", label: "Exclusive offer", templateId: "t3", subject: "A thank-you for coming back" },
        ] },
        { id: "rb2", label: "No", steps: [
          { id: "r5", type: "action", label: "Add tag: dormant-hard", actionType: "add_tag", actionSummary: "Tag dormant-hard" },
        ] },
      ] },
      { id: "r6", type: "goal", label: "Goal: re-engaged", goalCondition: "daysSinceContact < 7" },
    ],
  },
  {
    id: "tpl-sales",
    sender: REP_SENDER,
    name: "Outbound sales cadence",
    description: "Multi-touch rep cadence: email, WhatsApp, and manual call tasks with reply exit.",
    type: "sales",
    category: "sales",
    channel: "multi",
    triggers: [{ id: "tt4", type: "manual" }],
    exit: { ...DEFAULT_EXIT, reEnrollment: "cooldown", reEnrollCooldownDays: 30 },
    flow: [
      { id: "sl1", type: "email", label: "Intro email", templateId: "t2", subject: "Quick question, {{firstName}}" },
      { id: "sl2", type: "wait", label: "Wait 2 days", waitMode: "duration", waitValue: 2, waitUnit: "days" },
      { id: "sl3", type: "action", label: "Task: call the prospect", actionType: "create_task", actionSummary: "Manual call task for owner" },
      { id: "sl4", type: "wait", label: "Wait 2 days", waitMode: "duration", waitValue: 2, waitUnit: "days" },
      { id: "sl5", type: "whatsapp", label: "WhatsApp nudge", snippet: "Hi {{firstName}}, following up on my note." },
      { id: "sl6", type: "email", label: "Break-up email", templateId: "t3", subject: "Should I close your file?" },
    ],
  },
  {
    id: "tpl-handoff",
    sender: REP_SENDER,
    name: "Hot-lead handoff",
    description: "Event-triggered CRM automation: when a lead's score crosses 80, assign an owner, create a call task, and alert sales.",
    type: "sales",
    category: "sales",
    channel: "email",
    triggers: [{ id: "tt6", type: "property_changed", property: "leadScore", operator: "greater_than", value: "80" }],
    exit: { ...DEFAULT_EXIT, pauseOnReply: true },
    flow: [
      { id: "hl1", type: "action", label: "Assign to sales owner", actionType: "assign_owner", actionSummary: "Round-robin by territory" },
      { id: "hl2", type: "action", label: "Create call task", actionType: "create_task", actionSummary: "Call within 1 business day" },
      { id: "hl3", type: "action", label: "Notify sales owner", actionType: "notify_owner", actionSummary: "Hot lead — reach out today" },
      { id: "hl4", type: "goal", label: "Goal: qualified (SQL)", goalCondition: "lifecycleStage = sql" },
    ],
  },
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
  {
    id: "t1",
    name: "Product Launch Hero",
    subject: "Introducing the next chapter",
    preheader: "The all-new Connect NX is here — see what's changed.",
    category: "Campaign",
    type: "announcement",
    status: "published",
    fromName: "Connect NX",
    owner: "Priya Sharma",
    accent: "#2563eb",
    sent: 4200, openRate: 45.2, clickRate: 10.1, deliveredRate: 98.8, bounceRate: 1.2, unsubRate: 0.3,
    trackOpens: true, trackClicks: true, predictiveSendTime: false,
    createdAt: "2026-06-02T00:00:00Z", updatedAt: "2026-06-20T00:00:00Z",
    blocks: [
      { id: "b1", type: "image", src: "", alt: "Product hero", align: "center" },
      { id: "b2", type: "heading", level: 1, text: "The next chapter is here", align: "center" },
      { id: "b3", type: "text", text: "Hi {{firstName}}, we've rebuilt Connect from the ground up. Faster, smarter, and ready for your team.", align: "center" },
      { id: "b4", type: "button", text: "See what's new", url: "https://connectnx.io/launch", align: "center", buttonColor: "#2563eb" },
      { id: "b5", type: "divider" },
      { id: "b6", type: "text", text: "You're receiving this because you opted in. {{unsubscribeLink}}", align: "center" },
    ],
  },
  {
    id: "t2",
    name: "Welcome — Day 1",
    subject: "Welcome to Connect, {{firstName}}",
    preheader: "Here's how to get started in 3 quick steps.",
    category: "Sequence",
    type: "welcome",
    status: "published",
    fromName: "Connect NX",
    owner: "Priya Sharma",
    accent: "#16a34a",
    sent: 1240, openRate: 62.8, clickRate: 18.4, deliveredRate: 99.1, bounceRate: 0.9, unsubRate: 0.2,
    trackOpens: true, trackClicks: true, predictiveSendTime: true,
    createdAt: "2026-05-20T00:00:00Z", updatedAt: "2026-06-15T00:00:00Z",
    blocks: [
      { id: "b1", type: "heading", level: 1, text: "Welcome aboard, {{firstName}} 👋", align: "left" },
      { id: "b2", type: "text", text: "We're thrilled to have {{company}} on Connect. Let's get you set up.", align: "left" },
      { id: "b3", type: "columns", colText: ["1. Import your contacts", "2. Build your first segment", "3. Launch a campaign"] },
      { id: "b4", type: "button", text: "Open your dashboard", url: "https://connectnx.io/app", align: "left", buttonColor: "#16a34a" },
      { id: "b5", type: "spacer", height: 24 },
      { id: "b6", type: "text", text: "Questions? Just reply — a human reads every message. {{unsubscribeLink}}", align: "left" },
    ],
  },
  {
    id: "t3",
    name: "Re-engagement Offer",
    subject: "We miss you — exclusive offer inside",
    preheader: "A little something to welcome you back.",
    category: "Campaign",
    type: "promotional",
    status: "published",
    fromName: "Connect NX Marketing",
    owner: "Neha Reddy",
    accent: "#db2777",
    sent: 890, openRate: 23.6, clickRate: 5.2, deliveredRate: 97.5, bounceRate: 2.5, unsubRate: 0.8,
    trackOpens: true, trackClicks: true, predictiveSendTime: false,
    createdAt: "2026-05-25T00:00:00Z", updatedAt: "2026-06-10T00:00:00Z",
    blocks: [
      { id: "b1", type: "heading", level: 1, text: "It's been a while, {{firstName}}", align: "center" },
      { id: "b2", type: "text", text: "Come back and save 20% on your next plan.", align: "center" },
      { id: "b3", type: "dynamic", dynamicVariants: [
        { id: "dv1", label: "Default", text: "Here's 20% off to welcome you back." },
        { id: "dv2", label: "Enterprise", condition: "tag = enterprise", text: "As an enterprise account, enjoy a dedicated onboarding session on us." },
      ] },
      { id: "b4", type: "button", text: "Claim your offer", url: "https://connectnx.io/winback", align: "center", buttonColor: "#db2777" },
      { id: "b5", type: "social", socials: ["twitter", "linkedin", "instagram"], align: "center" },
      { id: "b6", type: "text", text: "{{unsubscribeLink}}", align: "center" },
    ],
  },
  {
    id: "t4",
    name: "Event Follow-up",
    subject: "Thanks for joining Connect Summit",
    preheader: "Your session recordings and resource pack are inside.",
    category: "Sequence",
    type: "event",
    status: "published",
    fromName: "Connect NX Events",
    owner: "Arjun Mehta",
    accent: "#7c3aed",
    sent: 340, openRate: 71.2, clickRate: 24.8, deliveredRate: 99.4, bounceRate: 0.6, unsubRate: 0.1,
    trackOpens: true, trackClicks: true, predictiveSendTime: false,
    createdAt: "2026-05-30T00:00:00Z", updatedAt: "2026-06-08T00:00:00Z",
    blocks: [
      { id: "b1", type: "heading", level: 1, text: "Thanks for coming, {{firstName}}!", align: "center" },
      { id: "b2", type: "text", text: "Here's everything from Connect Summit 2026.", align: "center" },
      { id: "b3", type: "button", text: "Watch the recordings", url: "https://connectnx.io/summit", align: "center", buttonColor: "#7c3aed" },
      { id: "b4", type: "divider" },
      { id: "b5", type: "text", text: "{{unsubscribeLink}}", align: "center" },
    ],
  },
  {
    id: "t5",
    name: "Monthly Newsletter (Draft)",
    subject: "Your Connect monthly — {{company}} edition",
    preheader: "Product news, tips, and a customer story.",
    category: "Newsletter",
    type: "newsletter",
    status: "draft",
    fromName: "Connect NX",
    owner: "Neha Reddy",
    accent: "#0891b2",
    sent: 0, openRate: 0, clickRate: 0,
    trackOpens: true, trackClicks: true, predictiveSendTime: false,
    createdAt: "2026-07-04T00:00:00Z", updatedAt: "2026-07-06T00:00:00Z",
    blocks: [
      { id: "b1", type: "heading", level: 1, text: "This month at Connect", align: "left" },
      { id: "b2", type: "text", text: "Hi {{firstName}}, here's what's new.", align: "left" },
      { id: "b3", type: "text", text: "" , align: "left" },
    ],
  },
  {
    id: "t6",
    name: "Black Friday 2025 (Archived)",
    subject: "48 hours only — 40% off everything",
    category: "Campaign",
    type: "promotional",
    status: "archived",
    accent: "#ca8a04",
    sent: 5600, openRate: 38.1, clickRate: 12.9, deliveredRate: 96.8, bounceRate: 3.2, unsubRate: 1.1,
    createdAt: "2025-11-20T00:00:00Z", updatedAt: "2025-11-30T00:00:00Z",
    blocks: [
      { id: "b1", type: "heading", level: 1, text: "40% off — 48 hours only", align: "center" },
      { id: "b2", type: "button", text: "Shop now", url: "https://connectnx.io/bf", align: "center" },
    ],
  },
];

export const PERSONALIZATION_TOKENS: PersonalizationToken[] = [
  { token: "{{firstName}}", label: "First name", sample: "Ananya" },
  { token: "{{lastName}}", label: "Last name", sample: "Iyer" },
  { token: "{{company}}", label: "Company", sample: "TechCorp India" },
  { token: "{{owner}}", label: "Contact owner", sample: "Priya Sharma" },
  { token: "{{email}}", label: "Email", sample: "ananya@techcorp.in" },
  { token: "{{meetingLink}}", label: "Meeting link", sample: "connectnx.io/meet/priya" },
  { token: "{{unsubscribeLink}}", label: "Unsubscribe link", sample: "Unsubscribe" },
];

/** Kept for backward compatibility with earlier code. */
export const TEMPLATE_PLACEHOLDERS = PERSONALIZATION_TOKENS.map((t) => t.token);

export const MOCK_EMAIL_STARTERS: EmailStarter[] = [
  {
    id: "st-blank",
    name: "Blank",
    description: "Start from an empty canvas.",
    type: "newsletter",
    accent: "#64748b",
    subject: "",
    blocks: [],
  },
  {
    id: "st-announcement",
    name: "Announcement",
    description: "Hero image, headline, and a single call to action.",
    type: "announcement",
    accent: "#2563eb",
    subject: "Big news from Connect",
    blocks: [
      { id: "a1", type: "image", src: "", alt: "Hero", align: "center" },
      { id: "a2", type: "heading", level: 1, text: "Something new is here", align: "center" },
      { id: "a3", type: "text", text: "Hi {{firstName}}, we've got news to share.", align: "center" },
      { id: "a4", type: "button", text: "Learn more", url: "", align: "center" },
      { id: "a5", type: "text", text: "{{unsubscribeLink}}", align: "center" },
    ],
  },
  {
    id: "st-newsletter",
    name: "Newsletter",
    description: "Multi-section digest with columns and a footer.",
    type: "newsletter",
    accent: "#0891b2",
    subject: "Your monthly digest",
    blocks: [
      { id: "n1", type: "heading", level: 1, text: "This month's highlights", align: "left" },
      { id: "n2", type: "text", text: "Hi {{firstName}}, here's what's new.", align: "left" },
      { id: "n3", type: "columns", colText: ["Story one", "Story two"] },
      { id: "n4", type: "divider" },
      { id: "n5", type: "social", socials: ["twitter", "linkedin"], align: "center" },
      { id: "n6", type: "text", text: "{{unsubscribeLink}}", align: "center" },
    ],
  },
  {
    id: "st-promo",
    name: "Promotion",
    description: "Bold offer with a countdown-friendly layout.",
    type: "promotional",
    accent: "#db2777",
    subject: "A special offer, just for you",
    blocks: [
      { id: "p1", type: "heading", level: 1, text: "20% off, this week only", align: "center" },
      { id: "p2", type: "text", text: "Hi {{firstName}}, treat yourself.", align: "center" },
      { id: "p3", type: "button", text: "Claim offer", url: "", align: "center", buttonColor: "#db2777" },
      { id: "p4", type: "text", text: "{{unsubscribeLink}}", align: "center" },
    ],
  },
  {
    id: "st-welcome",
    name: "Welcome",
    description: "Warm intro with getting-started steps.",
    type: "welcome",
    accent: "#16a34a",
    subject: "Welcome to Connect, {{firstName}}",
    blocks: [
      { id: "w1", type: "heading", level: 1, text: "Welcome aboard 👋", align: "left" },
      { id: "w2", type: "text", text: "We're glad you're here, {{firstName}}.", align: "left" },
      { id: "w3", type: "columns", colText: ["1. Set up", "2. Explore", "3. Launch"] },
      { id: "w4", type: "button", text: "Get started", url: "", align: "left", buttonColor: "#16a34a" },
      { id: "w5", type: "text", text: "{{unsubscribeLink}}", align: "left" },
    ],
  },
];

export const MOCK_UNSUBSCRIBE_TOPICS: UnsubscribeTopic[] = [
  { id: "ut1", label: "Product updates", description: "New features, releases, and changelog.", subscribers: 11840 },
  { id: "ut2", label: "Newsletter", description: "Monthly digest of tips and stories.", subscribers: 9420 },
  { id: "ut3", label: "Offers & promotions", description: "Discounts and limited-time deals.", subscribers: 6210 },
  { id: "ut4", label: "Events & webinars", description: "Invitations to live and virtual events.", subscribers: 4880 },
  { id: "ut5", label: "Transactional", description: "Receipts, security, and account notices.", subscribers: 12847, required: true },
];

export const MOCK_UNSUBSCRIBE_REASONS: UnsubscribeReasonStat[] = [
  { reason: "Too many emails", count: 142 },
  { reason: "No longer relevant", count: 98 },
  { reason: "Never signed up", count: 54 },
  { reason: "Content not useful", count: 41 },
  { reason: "Other", count: 33 },
];

export const MOCK_INBOX: InboxMessage[] = [
  { id: "i1", contactId: "c1", contactName: "Ananya Iyer", contactEmail: "ananya.iyer@techcorp.in", channel: "email", subject: "Re: Product brochure", preview: "Thanks for sending the brochure. Can we schedule a call next week?", body: "Thanks for sending the brochure. Can we schedule a call next week?", category: "lead", assignee: "Priya Sharma", unread: true, receivedAt: "2026-06-24T08:15:00Z" },
  { id: "i2", contactId: "c2", contactName: "Rahul Verma", contactEmail: "+91 99887 76655", channel: "whatsapp", subject: "Monsoon offer inquiry", preview: "Is the 15% discount applicable on bulk orders?", body: "Hi, is the 15% monsoon discount applicable on bulk orders too? We're looking at around 200 units.", category: "question", assignee: "Arjun Mehta", unread: false, receivedAt: "2026-06-23T16:40:00Z" },
  { id: "i3", contactId: "c4", contactName: "Vikram Singh", contactEmail: "vikram.singh@startup.io", channel: "email", subject: "Demo access details", preview: "I still haven't received demo credentials. Please resend.", body: "Hi team, I signed up two days ago but still haven't received my demo credentials. Could you please resend them? Admin is security@techcorp.in.", category: "request", assignee: "Neha Reddy", unread: true, receivedAt: "2026-06-23T11:20:00Z" },
  { id: "i5", contactId: "c3", contactName: "Sunita Patil", contactEmail: "+91 91234 56789", channel: "whatsapp", subject: "Water supply complaint", preview: "COMPLAINT — No water supply in Ward 12 for 48 hours. Please escalate urgently.", body: "COMPLAINT — No water supply in Ward 12 for 48 hours. Please escalate urgently.", category: "complaint", unread: true, receivedAt: "2026-06-24T08:00:00Z" },
  { id: "i6", contactId: "c5", contactName: "Meera Krishnan", contactEmail: "+91 99001 22334", channel: "whatsapp", subject: "NDA resend request", preview: "Can you resend the NDA on WhatsApp? Email went to spam.", body: "Can you resend the NDA on WhatsApp? The email went to spam and I couldn't open it.", category: "request", unread: true, receivedAt: "2026-06-24T07:45:00Z" },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "ce1", title: "Monsoon Offer — WhatsApp", type: "campaign", date: "2026-06-25", channel: "whatsapp" },
  { id: "ce2", title: "New Lead Welcome — Step 3", type: "sequence", date: "2026-06-26", channel: "email" },
  { id: "ce3", title: "Q3 Newsletter", type: "campaign", date: "2026-06-28", channel: "email" },
  { id: "ce4", title: "Outbound Sales — Day 5", type: "sequence", date: "2026-06-30", channel: "email" },
];

const AUTO_DEFAULT_SETTINGS = {
  reEnrollment: "never" as const,
  suppressionSegmentId: undefined,
  quietHours: true,
};

export const MOCK_AUTOMATIONS: Automation[] = [
  {
    id: "au1",
    name: "Form submit → Welcome sequence",
    description: "When a lead submits the demo form, tag them, enroll them in the welcome sequence, and notify the owner if high-intent.",
    status: "active",
    trigger: "Form submitted — Demo Request",
    category: "Lead nurture",
    owner: "Priya Sharma",
    actions: 5,
    enrolled: 284,
    activeCount: 46,
    completedCount: 238,
    goalMet: 61,
    lastRun: "2026-07-07T07:00:00Z",
    createdAt: "2026-05-10T09:00:00Z",
    updatedAt: "2026-07-06T09:00:00Z",
    triggers: [{ id: "at1", type: "form_submitted", formId: "f1" }],
    settings: { ...AUTO_DEFAULT_SETTINGS, goalCondition: "lifecycleStage = mql" },
    nodes: [
      { id: "n1", type: "action", label: "Tag as demo-request", actionType: "add_tag", actionSummary: "demo-request", reached: 284, completed: 284 },
      { id: "n2", type: "action", label: "Enroll in New Lead Welcome", actionType: "enroll_sequence", actionSummary: "New Lead Welcome", reached: 284, completed: 280 },
      { id: "n3", type: "delay", label: "Delay 1 day", delayMode: "duration", delayValue: 1, delayUnit: "days", reached: 280, completed: 274 },
      {
        id: "n4", type: "branch", label: "Lead score above 80?", branchKind: "if_else", reached: 274,
        branches: [
          { id: "n4-yes", label: "Yes", condition: "leadScore > 80", nodes: [
            { id: "n5", type: "action", label: "Rotate to sales owner", actionType: "rotate_owner", actionSummary: "Sales round-robin", reached: 92, completed: 92 },
            { id: "n6", type: "action", label: "Notify owner — hot lead", actionType: "notify_team", actionSummary: "Email + Slack owner", reached: 92, completed: 92 },
          ] },
          { id: "n4-no", label: "No", nodes: [
            { id: "n7", type: "action", label: "Set lifecycle = lead", actionType: "set_lifecycle", actionSummary: "lead", reached: 182, completed: 182 },
          ] },
        ],
      },
      { id: "n8", type: "goal", label: "Goal: became an MQL", goalCondition: "lifecycleStage = mql", reached: 61 },
    ],
    runLog: [
      { id: "l1", contactName: "Ananya Iyer", at: "2026-07-07T07:00:12Z", nodeLabel: "Enrolled", outcome: "enrolled", detail: "Submitted Demo Request" },
      { id: "l2", contactName: "Ananya Iyer", at: "2026-07-07T07:00:13Z", nodeLabel: "Tag as demo-request", outcome: "action" },
      { id: "l3", contactName: "Ananya Iyer", at: "2026-07-07T07:00:14Z", nodeLabel: "Enroll in New Lead Welcome", outcome: "action", detail: "Enrolled in sequence" },
      { id: "l4", contactName: "Rahul Verma", at: "2026-07-07T06:40:00Z", nodeLabel: "Lead score above 80?", outcome: "branched", detail: "→ Yes (score 88)" },
      { id: "l5", contactName: "Rahul Verma", at: "2026-07-07T06:40:01Z", nodeLabel: "Rotate to sales owner", outcome: "action", detail: "Assigned to Arjun Mehta" },
      { id: "l6", contactName: "Vikram Singh", at: "2026-07-06T18:20:00Z", nodeLabel: "Goal: became an MQL", outcome: "goal_met", detail: "Promoted to MQL" },
    ],
  },
  {
    id: "au2",
    name: "Lead score > 80 → Assign rep",
    description: "Route newly-hot leads to a sales rep and start a sales cadence.",
    status: "active",
    trigger: "Lead score changed",
    category: "Sales routing",
    owner: "Arjun Mehta",
    actions: 3,
    enrolled: 42,
    activeCount: 8,
    completedCount: 34,
    goalMet: 19,
    lastRun: "2026-07-06T14:30:00Z",
    createdAt: "2026-04-20T09:00:00Z",
    updatedAt: "2026-07-01T09:00:00Z",
    triggers: [{ id: "at2", type: "property_changed", property: "leadScore", operator: "greater_than", value: "80" }],
    settings: { ...AUTO_DEFAULT_SETTINGS, reEnrollment: "cooldown", reEnrollCooldownDays: 30 },
    nodes: [
      { id: "n1", type: "action", label: "Rotate to sales owner", actionType: "rotate_owner", actionSummary: "Sales round-robin", reached: 42, completed: 42 },
      { id: "n2", type: "action", label: "Create follow-up task", actionType: "create_task", actionSummary: "Call within 1 business day", reached: 42, completed: 42 },
      { id: "n3", type: "action", label: "Enroll in Outbound Sales Cadence", actionType: "enroll_sequence", actionSummary: "Outbound Sales Cadence", reached: 42, completed: 40 },
      { id: "n4", type: "goal", label: "Goal: meeting booked", goalCondition: "meetingBooked = true", reached: 19 },
    ],
    runLog: [
      { id: "l1", contactName: "Sunita Patil", at: "2026-07-06T14:30:00Z", nodeLabel: "Enrolled", outcome: "enrolled", detail: "Score crossed 80" },
      { id: "l2", contactName: "Sunita Patil", at: "2026-07-06T14:30:01Z", nodeLabel: "Rotate to sales owner", outcome: "action" },
    ],
  },
  {
    id: "au4",
    name: "90-day inactivity win-back",
    description: "Re-engage contacts who have gone quiet for 90 days; exit on re-engagement.",
    status: "draft",
    trigger: "Segment joined — Dormant 90-day win-back",
    category: "Retention",
    owner: "Karthik N",
    actions: 3,
    enrolled: 0,
    activeCount: 0,
    completedCount: 0,
    goalMet: 0,
    createdAt: "2026-07-03T09:00:00Z",
    updatedAt: "2026-07-04T09:00:00Z",
    triggers: [{ id: "at4", type: "segment_joined", segmentId: "sg6" }],
    settings: { ...AUTO_DEFAULT_SETTINGS, goalCondition: "daysSinceContact < 7" },
    nodes: [
      { id: "n1", type: "send_email", label: "We miss you", templateId: "t3", subject: "It's been a while" },
      { id: "n2", type: "delay", label: "Delay 4 days", delayMode: "duration", delayValue: 4, delayUnit: "days" },
      { id: "n3", type: "goal", label: "Goal: re-engaged", goalCondition: "daysSinceContact < 7" },
    ],
    runLog: [],
  },
];

export const MOCK_AUTOMATION_RECIPES: AutomationRecipe[] = [
  {
    id: "rec-lead",
    name: "New lead nurture",
    description: "Form submit → tag, enroll in the welcome sequence, and notify the owner when they engage.",
    category: "lead",
    triggers: [{ id: "rt1", type: "form_submitted", formId: "f1" }],
    settings: { reEnrollment: "never", quietHours: true, goalCondition: "lifecycleStage = mql" },
    nodes: [
      { id: "r1", type: "action", label: "Tag as new-lead", actionType: "add_tag", actionSummary: "new-lead" },
      { id: "r2", type: "action", label: "Enroll in welcome sequence", actionType: "enroll_sequence", actionSummary: "New Lead Welcome" },
      { id: "r3", type: "delay", label: "Delay 2 days", delayMode: "duration", delayValue: 2, delayUnit: "days" },
      { id: "r4", type: "branch", label: "Engaged?", branchKind: "if_else", branches: [
        { id: "r4-y", label: "Yes", condition: "opened_any_email = true", nodes: [
          { id: "r5", type: "action", label: "Notify owner", actionType: "notify_team", actionSummary: "Owner alert" },
        ] },
        { id: "r4-n", label: "No", nodes: [] },
      ] },
    ],
  },
  {
    id: "rec-routing",
    name: "Hot-lead handoff",
    description: "When lead score crosses 80, assign an owner, create a call task, and alert sales.",
    category: "sales",
    triggers: [{ id: "rt4", type: "property_changed", property: "leadScore", operator: "greater_than", value: "80" }],
    settings: { reEnrollment: "cooldown", reEnrollCooldownDays: 30, quietHours: true },
    nodes: [
      { id: "r1", type: "action", label: "Rotate to sales owner", actionType: "rotate_owner", actionSummary: "Sales round-robin" },
      { id: "r2", type: "action", label: "Create call task", actionType: "create_task", actionSummary: "Call within 1 business day" },
      { id: "r3", type: "action", label: "Notify sales", actionType: "notify_team", actionSummary: "Hot lead alert" },
    ],
  },
  {
    id: "rec-winback",
    name: "Dormant win-back",
    description: "Re-engage contacts inactive for 90 days, exiting on a goal when they come back.",
    category: "retention",
    triggers: [{ id: "rt2", type: "segment_joined", segmentId: "sg6" }],
    settings: { reEnrollment: "cooldown", reEnrollCooldownDays: 90, quietHours: true, goalCondition: "daysSinceContact < 7" },
    nodes: [
      { id: "r1", type: "send_email", label: "We miss you", templateId: "t3", subject: "It's been a while" },
      { id: "r2", type: "delay", label: "Delay 4 days", delayMode: "duration", delayValue: 4, delayUnit: "days" },
      { id: "r3", type: "send_email", label: "Exclusive offer", templateId: "t3", subject: "A little something to return" },
      { id: "r4", type: "goal", label: "Goal: re-engaged", goalCondition: "daysSinceContact < 7" },
    ],
  },
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

export {
  PORTAL_WHATSAPP_MESSAGES,
  WHATSAPP_BOT_FLOWS,
  WHATSAPP_BROADCASTS,
  WHATSAPP_CONFIG,
  WHATSAPP_STATS,
  WHATSAPP_TEMPLATES,
  WHATSAPP_THREADS,
  getRepWhatsAppStats,
  getWhatsAppTemplate,
  getWhatsAppThread,
  getWhatsAppThreadsForContact,
} from "./whatsapp";

export * from "./marketing-analytics";

export * from "./subscriptions";
