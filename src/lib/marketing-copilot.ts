// Deterministic mock "AI" engine for the Marketing Copilot (UI-only, no backend).
//
// The Copilot understands these intents from a plain-language prompt:
//   1. create a campaign         → returns a campaign draft the user can create
//   2. ask about performance     → returns a campaign-performance answer with charts
//   3. create a segment          → returns a segment draft (rules + estimated size)
//   4. ask about segments        → returns a segment answer with a breakdown
//   5. create an automation      → returns a full workflow draft (trigger + steps)
//
// Everything here is pure and synchronous so the UI can render answers reliably
// for demos. No real model is called; intent + entities are keyword-matched.

import type {
  Campaign,
  CampaignDailyStat,
  CampaignGoalMetric,
  SegmentCondition,
  SegmentConditionGroup,
  SegmentDefinition,
  SegmentRecord,
  SequenceExitConfig,
  SequenceSender,
  SequenceStep,
  SequenceTrigger,
} from "@/lib/types";
import {
  CONTACT_BASE,
  estimateCount,
  fieldDef,
  matchContacts,
} from "@/lib/segment-eval";
import { MOCK_CONTACTS } from "@/lib/mock-data";

/* ------------------------------------------------------------------ intents */

export type CopilotIntent =
  | "create_campaign"
  | "campaign_insight"
  | "create_segment"
  | "segment_insight"
  | "create_workflow"
  | "unknown";

export type CopilotCapability =
  | "campaign_create"
  | "campaign_insight"
  | "segment_create"
  | "segment_insight"
  | "workflow_create";

export interface SuggestedPrompt {
  capability: CopilotCapability;
  label: string;
  prompt: string;
}

export const CAPABILITY_META: Record<
  CopilotCapability,
  { title: string; description: string; icon: string; accent: string }
> = {
  campaign_create: {
    title: "Create a campaign",
    description: "Describe a goal and audience — get a ready-to-launch draft.",
    icon: "Megaphone",
    accent: "violet",
  },
  campaign_insight: {
    title: "Ask about performance",
    description: "Question your campaign metrics in plain language.",
    icon: "LineChart",
    accent: "blue",
  },
  segment_create: {
    title: "Build a segment",
    description: "Turn a description of people into targeting rules.",
    icon: "Filter",
    accent: "emerald",
  },
  segment_insight: {
    title: "Ask about audiences",
    description: "Understand segment size, growth and overlap.",
    icon: "Users",
    accent: "amber",
  },
  workflow_create: {
    title: "Build an automation",
    description: "Describe a goal — get a ready-to-edit workflow.",
    icon: "Workflow",
    accent: "violet",
  },
};

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    capability: "campaign_create",
    label: "Win-back email for churned customers",
    prompt:
      "Create a win-back email campaign for churned customers to drive conversions",
  },
  {
    capability: "campaign_insight",
    label: "Which campaign performed best?",
    prompt: "Which campaign had the best open rate last quarter?",
  },
  {
    capability: "segment_create",
    label: "High-value engaged leads",
    prompt:
      "Build a segment of leads with a lead score above 70 who opened at least 3 emails",
  },
  {
    capability: "segment_insight",
    label: "Which segments are growing?",
    prompt: "Which of my segments are growing the fastest?",
  },
  {
    capability: "campaign_create",
    label: "WhatsApp promo for the South region",
    prompt: "Draft a WhatsApp promotion campaign for customers in the South territory",
  },
  {
    capability: "segment_insight",
    label: "What is my largest audience?",
    prompt: "What is my largest segment and how big is it?",
  },
  {
    capability: "workflow_create",
    label: "New Lead Welcome workflow",
    prompt: "Need an automation workflow for a New Lead Welcome",
  },
  {
    capability: "workflow_create",
    label: "Win-back automation",
    prompt: "Build a win-back automation for dormant customers",
  },
];

/* ------------------------------------------------------------ response types */

export interface CampaignDraft {
  name: string;
  description: string;
  channel: Campaign["channel"];
  goalMetric: CampaignGoalMetric;
  goalTarget: number;
  segmentId?: string;
  segmentName: string;
  audienceEstimate: number;
  subjectLines: string[];
  recommendedSendTime: string;
  /** Optional generated segment definition when no existing segment matched. */
  suggestedSegment?: SegmentDraft;
}

export interface SegmentDraft {
  name: string;
  description: string;
  definition: SegmentDefinition;
  estimatedCount: number;
  matchPct: number;
  confidence: number;
}

/**
 * A generated automation workflow — the pieces needed to both preview it
 * (diagram + step table) and materialize a real Sequence in the store.
 */
export interface WorkflowDraft {
  name: string;
  description: string;
  type: "marketing" | "sales";
  channel: "email" | "whatsapp" | "multi";
  trigger: SequenceTrigger;
  /** Human-readable one-liner for the trigger (matches the builder's summary). */
  triggerSummary: string;
  sender: SequenceSender;
  exit: SequenceExitConfig;
  flow: SequenceStep[];
  stepCount: number;
  emailCount: number;
}

export interface InsightMetric {
  label: string;
  value: string;
  hint?: string;
  positive?: boolean;
}

export interface InsightSeriesPoint {
  label: string;
  value: number;
  secondary?: number;
}

export interface CampaignInsight {
  headline: string;
  metrics: InsightMetric[];
  chart?: {
    type: "bar" | "line";
    title: string;
    valueLabel: string;
    secondaryLabel?: string;
    data: InsightSeriesPoint[];
  };
  bullets: string[];
  sources: string[];
}

export interface SegmentInsight {
  headline: string;
  metrics: InsightMetric[];
  chart?: {
    type: "bar";
    title: string;
    valueLabel: string;
    data: InsightSeriesPoint[];
  };
  bullets: string[];
  sources: string[];
}

export type CopilotResponse =
  | { kind: "campaign_draft"; intent: CopilotIntent; text: string; draft: CampaignDraft }
  | { kind: "campaign_insight"; intent: CopilotIntent; text: string; insight: CampaignInsight }
  | { kind: "segment_draft"; intent: CopilotIntent; text: string; draft: SegmentDraft }
  | { kind: "segment_insight"; intent: CopilotIntent; text: string; insight: SegmentInsight }
  | { kind: "workflow_draft"; intent: CopilotIntent; text: string; draft: WorkflowDraft }
  | { kind: "text"; intent: CopilotIntent; text: string; suggestions?: string[] };

export interface CopilotContext {
  campaigns: Campaign[];
  segments: SegmentRecord[];
  dailyStats?: CampaignDailyStat[];
}

/* --------------------------------------------------------------- utilities */

const CREATE_WORDS = /\b(create|build|make|draft|set up|design|new|generate|launch|start)\b/;
const CAMPAIGN_WORDS = /\b(campaigns?|email blasts?|blasts?|newsletters?|promos?|promotions?|broadcasts?|sends?|outreach)\b/;
const SEGMENT_WORDS = /\b(segments?|audiences?|lists?|groups?|cohorts?|people who|contacts who|customers who|leads who)\b/;
const WORKFLOW_WORDS = /\b(automations?|workflows?|drip|nurture|welcome series|onboarding flow|cadence|journey|sequence)\b/;
const QUESTION_WORDS = /\b(how|what|which|why|when|show|tell|compare|rate|best|worst|top|performance|performing|trend|growing|shrinking|largest|biggest|smallest|number of|count)\b/;

let conditionSeq = 0;
function newCondition(field: string, operator: string, value: string): SegmentCondition {
  conditionSeq += 1;
  return { id: `cp-cond-${conditionSeq}`, field, operator, value };
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pct(value: number, base: number) {
  if (!base) return 0;
  return Math.round((value / base) * 1000) / 10;
}

/* --------------------------------------------------------- intent detection */

export function detectIntent(text: string): CopilotIntent {
  const t = text.toLowerCase();
  const isCreate = CREATE_WORDS.test(t);
  const isQuestion = QUESTION_WORDS.test(t) || t.trim().endsWith("?");
  const mentionsSegment = SEGMENT_WORDS.test(t);
  const mentionsCampaign = CAMPAIGN_WORDS.test(t);
  const mentionsWorkflow = WORKFLOW_WORDS.test(t);

  // Workflow/automation building — "need an automation workflow for …" has no
  // explicit create verb, so match the workflow words directly (unless it's a
  // question about existing workflows).
  if (mentionsWorkflow && !isQuestion) return "create_workflow";
  if (isCreate && mentionsWorkflow) return "create_workflow";

  if (isCreate && mentionsCampaign) return "create_campaign";
  if (isCreate && mentionsSegment) return "create_segment";
  // Questions: prefer whichever entity is named.
  if (mentionsSegment && (isQuestion || !isCreate)) return "segment_insight";
  if (mentionsCampaign && (isQuestion || !isCreate)) return "campaign_insight";
  if (isCreate) return "create_campaign"; // "create ..." with no clear entity → campaign
  if (isQuestion) return "campaign_insight";
  return "unknown";
}

/* --------------------------------------------------- segment rule extraction */

interface RuleMatch {
  condition: SegmentCondition;
  phrase: string;
}

/** Extract targeting conditions from free text using the field catalog. */
export function extractSegmentRules(text: string): RuleMatch[] {
  const t = ` ${text.toLowerCase()} `;
  const out: RuleMatch[] = [];
  const add = (field: string, operator: string, value: string, phrase: string) => {
    // avoid duplicate field+operator pairs
    if (out.some((r) => r.condition.field === field && r.condition.operator === operator)) return;
    out.push({ condition: newCondition(field, operator, value), phrase });
  };

  // Lifecycle stage
  const stages: [RegExp, string, string][] = [
    [/\bchurn(ed)?\b|\blapsed\b|\blost\b/, "churned", "churned"],
    [/\bcustomers?\b|\bpaying\b|\bexisting clients?\b/, "customer", "customers"],
    [/\bmql\b|\bmarketing qualified\b/, "mql", "MQLs"],
    [/\bsql\b|\bsales qualified\b/, "sql", "SQLs"],
    [/\bleads?\b|\bprospects?\b/, "lead", "leads"],
    [/\bsubscribers?\b/, "subscriber", "subscribers"],
  ];
  for (const [re, value, phrase] of stages) {
    if (re.test(t)) {
      add("lifecycleStage", "equals", value, phrase);
      break; // one lifecycle stage only
    }
  }

  // Lead score with an explicit threshold, else "high/low value"
  const scoreNum = t.match(/(?:lead score|score)\s*(?:of\s*)?(?:above|over|greater than|>|at least|>=)\s*(\d{1,3})/);
  if (scoreNum) {
    add("leadScore", "greater_than", scoreNum[1], `lead score above ${scoreNum[1]}`);
  } else if (/\bhigh[- ]?value\b|\bhigh[- ]?scoring\b|\bhot\b|\bengaged\b|\bqualified\b/.test(t)) {
    add("leadScore", "greater_than", "70", "high lead score (70+)");
  } else if (/\blow[- ]?value\b|\blow[- ]?scoring\b|\bcold\b/.test(t)) {
    add("leadScore", "less_than", "40", "low lead score (<40)");
  }

  // Emails opened
  const opensNum = t.match(/opened?\s*(?:at least\s*)?(\d{1,3})\s*(?:or more\s*)?emails?/);
  if (opensNum) {
    add("emailsOpened", "greater_than", opensNum[1], `opened ${opensNum[1]}+ emails`);
  } else if (/\bopened (?:an? )?emails?\b|\bengaged with emails?\b|\bemail engaged\b/.test(t)) {
    add("emailsOpened", "greater_than", "3", "opened emails");
  }

  // Recency / inactivity
  const daysNum = t.match(/(?:no contact|not contacted|inactive|dormant|quiet|no activity)[^\d]*(\d{1,4})\s*days?/) ||
    t.match(/(\d{1,4})\s*days?[^.]*\b(?:no contact|inactive|since)\b/);
  if (daysNum) {
    add("daysSinceContact", "greater_than", daysNum[1], `no contact in ${daysNum[1]} days`);
  } else if (/\binactive\b|\bdormant\b|\bunengaged\b|\bgone quiet\b|\bstale\b/.test(t)) {
    add("daysSinceContact", "greater_than", "60", "inactive 60+ days");
  }

  // Territory
  for (const dir of ["north", "south", "east", "west"]) {
    if (new RegExp(`\\b${dir}(ern)?\\b`).test(t)) {
      add("territory", "equals", titleCase(dir), `${titleCase(dir)} territory`);
      break;
    }
  }

  // Source
  const sources: [RegExp, string][] = [
    [/\bwebsite\b|\bweb form\b|\binbound\b/, "Website"],
    [/\bwhatsapp\b/, "WhatsApp"],
    [/\breferrals?\b/, "Referral"],
    [/\btrade show\b|\bevent\b|\bconference\b/, "Trade Show"],
    [/\binstagram\b|\bsocial\b/, "Instagram"],
    [/\bcold call\b|\boutbound\b/, "Cold Call"],
  ];
  for (const [re, value] of sources) {
    if (re.test(t)) {
      add("source", "equals", value, `source is ${value}`);
      break;
    }
  }

  // Consent
  if (/\bopted in\b|\bsubscribed\b|\bemail consent\b|\bconsent to email\b/.test(t)) {
    add("consentEmail", "equals", "true", "email consent granted");
  }

  return out;
}

export function buildSegmentDraft(text: string): SegmentDraft {
  const rules = extractSegmentRules(text);
  const conditions = rules.map((r) => r.condition);

  const group: SegmentConditionGroup = {
    id: `cp-group-${conditionSeq}`,
    match: "all",
    conditions:
      conditions.length > 0
        ? conditions
        : [newCondition("lifecycleStage", "equals", "lead")],
  };
  const definition: SegmentDefinition = { match: "all", groups: [group] };

  const matched = matchContacts(MOCK_CONTACTS, definition);
  const estimatedCount = estimateCount(matched.length, MOCK_CONTACTS.length);
  const matchPct = MOCK_CONTACTS.length
    ? Math.round((matched.length / MOCK_CONTACTS.length) * 100)
    : 0;

  const phrases = rules.map((r) => r.phrase);
  const name =
    phrases.length > 0
      ? titleCase(phrases.slice(0, 2).join(" · "))
      : "New audience segment";
  const description =
    phrases.length > 0
      ? `Contacts where ${phrases.join(" and ")}.`
      : "Describe the people you want to reach and I'll refine these rules.";

  // Confidence: higher when we matched more specific rules and got a workable size.
  const confidence = Math.min(
    96,
    60 + rules.length * 8 + (estimatedCount > 0 && estimatedCount < CONTACT_BASE ? 6 : 0)
  );

  return { name, description, definition, estimatedCount, matchPct, confidence };
}

/* -------------------------------------------------------- campaign drafting */

function detectGoal(t: string): { metric: CampaignGoalMetric; label: string } {
  if (/\bconver(t|sion)|\bdemo\b|\bsign ?up|\bpurchase|\brevenue|\bwin[- ]?back|\bre-?engage|\bupgrade\b/.test(t))
    return { metric: "conversions", label: "conversions" };
  if (/\bform|\bregister|\brsvp|\bdownload|\blead capture\b/.test(t))
    return { metric: "form_submissions", label: "form submissions" };
  if (/\bclick|\btraffic|\bvisit|\bbrowse\b/.test(t))
    return { metric: "clicks", label: "clicks" };
  return { metric: "opens", label: "opens" };
}

export function buildCampaignDraft(text: string, segments: SegmentRecord[]): CampaignDraft {
  const t = text.toLowerCase();
  const channel: Campaign["channel"] = /\bwhatsapp\b/.test(t) ? "whatsapp" : "email";
  const goal = detectGoal(t);

  // Try to match an existing segment by keyword overlap; else generate one.
  const segMatch = matchSegmentByText(t, segments);
  const suggestedSegment = segMatch ? undefined : buildSegmentDraft(text);
  const audienceEstimate = segMatch
    ? segMatch.memberCount
    : suggestedSegment!.estimatedCount;
  const segmentName = segMatch ? segMatch.name : suggestedSegment!.name;

  const theme = campaignTheme(t);
  const name = `${theme.label} ${channel === "whatsapp" ? "WhatsApp" : "Email"} Campaign`;
  const description = `${titleCase(goal.label)}-focused ${channel} campaign for ${segmentName.toLowerCase()}.`;

  const goalTarget = Math.max(25, Math.round(audienceEstimate * goalRate(goal.metric)));

  return {
    name,
    description,
    channel,
    goalMetric: goal.metric,
    goalTarget,
    segmentId: segMatch?.id,
    segmentName,
    audienceEstimate,
    subjectLines: subjectSuggestions(theme, goal.metric),
    recommendedSendTime: channel === "whatsapp" ? "Weekday, 12:00–1:00 PM local" : "Tuesday, 10:00 AM local",
    suggestedSegment,
  };
}

function goalRate(metric: CampaignGoalMetric) {
  switch (metric) {
    case "opens":
      return 0.42;
    case "clicks":
      return 0.12;
    case "form_submissions":
      return 0.06;
    case "conversions":
      return 0.04;
  }
}

interface CampaignTheme {
  key: string;
  label: string;
}

function campaignTheme(t: string): CampaignTheme {
  if (/\bwin[- ]?back|\bchurn|\bwe miss you|\breactivat|\bre-?engage/.test(t))
    return { key: "winback", label: "Win-Back" };
  if (/\bwelcome|\bonboard/.test(t)) return { key: "welcome", label: "Welcome" };
  if (/\bpromo|\bdiscount|\bsale|\boffer|\bdeal/.test(t))
    return { key: "promo", label: "Promotion" };
  if (/\bnewsletter|\bdigest|\bupdate/.test(t)) return { key: "newsletter", label: "Newsletter" };
  if (/\bevent|\bwebinar|\brsvp|\bregister/.test(t)) return { key: "event", label: "Event" };
  if (/\bupsell|\bupgrade|\bcross-?sell/.test(t)) return { key: "upsell", label: "Upsell" };
  if (/\bnurtur|\bdrip/.test(t)) return { key: "nurture", label: "Nurture" };
  return { key: "outreach", label: "Outreach" };
}

function subjectSuggestions(theme: CampaignTheme, metric: CampaignGoalMetric): string[] {
  const byTheme: Record<string, string[]> = {
    winback: [
      "We've missed you — here's 20% to come back",
      "Your account is waiting (and so is a gift)",
      "It's been a while, {{firstName}} — let's reconnect",
    ],
    welcome: [
      "Welcome aboard, {{firstName}} 👋",
      "You're in — here's how to get started",
      "3 things to try first",
    ],
    promo: [
      "48 hours only: your exclusive offer inside",
      "{{firstName}}, this deal has your name on it",
      "Save big before it's gone",
    ],
    newsletter: [
      "This month at Connect: what's new",
      "Your {{month}} digest is here",
      "5 updates you don't want to miss",
    ],
    event: [
      "You're invited, {{firstName}}",
      "Save your seat — spots are limited",
      "Join us live next week",
    ],
    upsell: [
      "Ready for the next level, {{firstName}}?",
      "Unlock more with an upgrade",
      "You've outgrown your plan — here's what's next",
    ],
    nurture: [
      "A quick tip for {{firstName}}",
      "Getting more from Connect",
      "Here's something we thought you'd like",
    ],
    outreach: [
      "{{firstName}}, a quick note from us",
      "Something new we think you'll love",
      "Let's make this quarter count",
    ],
  };
  const base = byTheme[theme.key] ?? byTheme.outreach;
  if (metric === "clicks") return base.map((s) => s);
  return base;
}

// Generic words that shouldn't, on their own, pin a prompt to an existing
// segment — otherwise "churned customers" wrongly matches "VIP Retail Customers".
const SEGMENT_MATCH_STOPWORDS = new Set([
  "customer",
  "customers",
  "contact",
  "contacts",
  "lead",
  "leads",
  "people",
  "user",
  "users",
  "email",
  "emails",
  "whatsapp",
  "audience",
  "segment",
  "list",
]);

function matchSegmentByText(t: string, segments: SegmentRecord[]): SegmentRecord | undefined {
  let best: { seg: SegmentRecord; score: number } | undefined;
  for (const seg of segments) {
    if (seg.archived) continue;
    const words = seg.name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3 && !SEGMENT_MATCH_STOPWORDS.has(w));
    const score = words.reduce((acc, w) => (t.includes(w) ? acc + 1 : acc), 0);
    if (score > 0 && (!best || score > best.score)) best = { seg, score };
  }
  return best?.seg;
}

/* --------------------------------------------------- campaign insight (Q&A) */

const activeStatuses = new Set(["running", "completed", "paused"]);

export function answerCampaignQuery(
  text: string,
  campaigns: Campaign[],
  dailyStats: CampaignDailyStat[] = []
): CampaignInsight {
  const t = text.toLowerCase();
  const sent = campaigns.filter((c) => !c.archived && activeStatuses.has(c.status) && c.sent > 0);

  // Specific campaign named?
  const named = campaigns.find((c) => !c.archived && c.name.length > 4 && t.includes(c.name.toLowerCase()));
  if (named) return singleCampaignInsight(named, dailyStats);

  const totals = sent.reduce(
    (a, c) => ({
      sent: a.sent + c.sent,
      delivered: a.delivered + c.delivered,
      opened: a.opened + c.opened,
      clicked: a.clicked + c.clicked,
      converted: a.converted + c.converted,
      unsub: a.unsub + c.unsubscribed,
    }),
    { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsub: 0 }
  );

  const withOpenRate = sent
    .map((c) => ({ c, openRate: pct(c.opened, c.sent), clickRate: pct(c.clicked, c.sent), convRate: pct(c.converted, c.sent) }))
    .sort((a, b) => b.openRate - a.openRate);

  const asksBest = /\bbest|\btop|\bhighest|\bwinner|\bmost\b/.test(t);
  const asksWorst = /\bworst|\blowest|\bunderperform|\bweak/.test(t);
  const asksClick = /\bclick/.test(t);
  const asksConversion = /\bconver/.test(t);

  if (asksBest || asksWorst) {
    const ranked = asksClick
      ? [...withOpenRate].sort((a, b) => b.clickRate - a.clickRate)
      : asksConversion
      ? [...withOpenRate].sort((a, b) => b.convRate - a.convRate)
      : withOpenRate;
    const list = asksWorst ? [...ranked].reverse() : ranked;
    const top = list[0];
    const metricLabel = asksClick ? "click rate" : asksConversion ? "conversion rate" : "open rate";
    const metricVal = asksClick ? top.clickRate : asksConversion ? top.convRate : top.openRate;
    return {
      headline: `${asksWorst ? "Lowest" : "Best"} ${metricLabel}: ${top.c.name} at ${metricVal}%`,
      metrics: [
        { label: "Open rate", value: `${top.openRate}%`, positive: top.openRate >= 25 },
        { label: "Click rate", value: `${top.clickRate}%`, positive: top.clickRate >= 3 },
        { label: "Conversion", value: `${top.convRate}%`, positive: top.convRate >= 2 },
        { label: "Recipients", value: top.c.sent.toLocaleString() },
      ],
      chart: {
        type: "bar",
        title: `${titleCase(metricLabel)} by campaign`,
        valueLabel: titleCase(metricLabel),
        data: ranked.slice(0, 6).map((r) => ({
          label: shortName(r.c.name),
          value: asksClick ? r.clickRate : asksConversion ? r.convRate : r.openRate,
        })),
      },
      bullets: [
        `${top.c.name} leads on ${metricLabel} across ${sent.length} sent campaigns.`,
        `It reached ${top.c.sent.toLocaleString()} recipients on the "${top.c.segmentName}" audience.`,
        asksWorst
          ? "Consider refreshing the subject line or narrowing the audience before the next send."
          : "Reuse this subject-line style and send window for similar audiences.",
      ],
      sources: [`${sent.length} campaigns with delivery data`],
    };
  }

  if (asksClick || asksConversion) {
    const rate = asksClick ? pct(totals.clicked, totals.sent) : pct(totals.converted, totals.sent);
    const label = asksClick ? "click rate" : "conversion rate";
    return {
      headline: `Overall ${label} is ${rate}% across ${sent.length} campaigns`,
      metrics: overallMetrics(totals),
      chart: {
        type: "bar",
        title: `${titleCase(label)} by campaign`,
        valueLabel: titleCase(label),
        data: withOpenRate.slice(0, 6).map((r) => ({
          label: shortName(r.c.name),
          value: asksClick ? r.clickRate : r.convRate,
        })),
      },
      bullets: benchmarkBullets(totals),
      sources: [`${sent.length} campaigns with delivery data`],
    };
  }

  // Default: portfolio overview
  return {
    headline: `Across ${sent.length} campaigns you reached ${totals.sent.toLocaleString()} people`,
    metrics: overallMetrics(totals),
    chart: {
      type: "bar",
      title: "Open rate by campaign",
      valueLabel: "Open rate",
      data: withOpenRate.slice(0, 6).map((r) => ({ label: shortName(r.c.name), value: r.openRate })),
    },
    bullets: benchmarkBullets(totals),
    sources: [`${sent.length} campaigns with delivery data`],
  };
}

function overallMetrics(totals: {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsub: number;
}): InsightMetric[] {
  return [
    { label: "Delivered", value: `${pct(totals.delivered, totals.sent)}%`, hint: totals.delivered.toLocaleString(), positive: pct(totals.delivered, totals.sent) >= 97 },
    { label: "Open rate", value: `${pct(totals.opened, totals.sent)}%`, hint: totals.opened.toLocaleString(), positive: pct(totals.opened, totals.sent) >= 25 },
    { label: "Click rate", value: `${pct(totals.clicked, totals.sent)}%`, hint: totals.clicked.toLocaleString(), positive: pct(totals.clicked, totals.sent) >= 3 },
    { label: "Conversion", value: `${pct(totals.converted, totals.sent)}%`, hint: totals.converted.toLocaleString(), positive: pct(totals.converted, totals.sent) >= 2 },
  ];
}

function benchmarkBullets(totals: { sent: number; opened: number; clicked: number; converted: number; unsub: number }) {
  const open = pct(totals.opened, totals.sent);
  const click = pct(totals.clicked, totals.sent);
  const unsub = pct(totals.unsub, totals.sent);
  return [
    `Open rate is ${open}% — ${open >= 25 ? "above" : "below"} the 21–25% B2B email benchmark.`,
    `Click rate is ${click}% (industry median ~2.5%). Click-to-open is ${pct(totals.clicked, totals.opened)}%.`,
    `Unsubscribe rate is ${unsub}% — ${unsub <= 0.5 ? "healthy" : "worth watching"}.`,
  ];
}

function singleCampaignInsight(c: Campaign, dailyStats: CampaignDailyStat[]): CampaignInsight {
  const daily = dailyStats.filter((d) => d.campaignId === c.id);
  return {
    headline: `${c.name}: ${pct(c.opened, c.sent)}% open · ${pct(c.clicked, c.sent)}% click`,
    metrics: [
      { label: "Sent", value: c.sent.toLocaleString() },
      { label: "Open rate", value: `${pct(c.opened, c.sent)}%`, positive: pct(c.opened, c.sent) >= 25 },
      { label: "Click rate", value: `${pct(c.clicked, c.sent)}%`, positive: pct(c.clicked, c.sent) >= 3 },
      { label: "Converted", value: c.converted.toLocaleString(), hint: `${pct(c.converted, c.sent)}%` },
    ],
    chart:
      daily.length > 0
        ? {
            type: "line",
            title: "Engagement over time",
            valueLabel: "Opened",
            secondaryLabel: "Clicked",
            data: daily.map((d) => ({ label: d.date.slice(5), value: d.opened, secondary: d.clicked })),
          }
        : undefined,
    bullets: [
      `Audience: ${c.segmentName}. Channel: ${c.channel}.`,
      `Delivered ${pct(c.delivered, c.sent)}% of ${c.sent.toLocaleString()} sent; ${c.bounced} bounced.`,
      `${c.unsubscribed} unsubscribed (${pct(c.unsubscribed, c.sent)}%).`,
    ],
    sources: [`Campaign "${c.name}"`, daily.length ? `${daily.length} days of daily stats` : "summary metrics"],
  };
}

function shortName(name: string) {
  return name.length > 18 ? `${name.slice(0, 17)}…` : name;
}

/* ---------------------------------------------------- segment insight (Q&A) */

export function answerSegmentQuery(text: string, segments: SegmentRecord[]): SegmentInsight {
  const t = text.toLowerCase();
  const active = segments.filter((s) => !s.archived);

  const named = active.find((s) => s.name.length > 4 && t.includes(s.name.toLowerCase()));
  if (named) {
    return {
      headline: `${named.name}: ${named.memberCount.toLocaleString()} contacts`,
      metrics: [
        { label: "Members", value: named.memberCount.toLocaleString() },
        { label: "7-day change", value: `${named.weeklyChange >= 0 ? "+" : ""}${named.weeklyChange}`, positive: named.weeklyChange >= 0 },
        { label: "Type", value: titleCase(named.type) },
        { label: "Used in", value: `${named.usedIn.length}` },
      ],
      bullets: [
        named.description || "No description set.",
        `Origin: ${named.origin.replace("_", " ")}. Refresh: ${named.refresh.mode}${named.refresh.frequency ? ` (${named.refresh.frequency})` : ""}.`,
        named.usedIn.length
          ? `Referenced by ${named.usedIn.map((u) => u.name).join(", ")}.`
          : "Not yet used in any campaign or sequence.",
      ],
      sources: [`Segment "${named.name}"`],
    };
  }

  const totalMembers = active.reduce((a, s) => a + s.memberCount, 0);
  const asksGrowing = /\bgrow|\bfast|\btrend|\brising|\bincreas/.test(t);
  const asksShrinking = /\bshrink|\bdeclin|\bfalling|\blosing|\bdecreas/.test(t);
  const asksLargest = /\blargest|\bbiggest|\bmost\b/.test(t);
  const asksSmallest = /\bsmallest|\bleast\b/.test(t);

  if (asksGrowing || asksShrinking) {
    const ranked = [...active].sort((a, b) =>
      asksShrinking ? a.weeklyChange - b.weeklyChange : b.weeklyChange - a.weeklyChange
    );
    const top = ranked[0];
    return {
      headline: `${asksShrinking ? "Fastest shrinking" : "Fastest growing"}: ${top.name} (${top.weeklyChange >= 0 ? "+" : ""}${top.weeklyChange}/wk)`,
      metrics: [
        { label: "Segments", value: `${active.length}` },
        { label: "Total contacts", value: totalMembers.toLocaleString() },
        { label: `${top.name}`, value: `${top.weeklyChange >= 0 ? "+" : ""}${top.weeklyChange}`, positive: top.weeklyChange >= 0 },
      ],
      chart: {
        type: "bar",
        title: "Weekly change by segment",
        valueLabel: "Net change (7d)",
        data: ranked.slice(0, 6).map((s) => ({ label: shortName(s.name), value: s.weeklyChange })),
      },
      bullets: [
        `${top.name} changed by ${top.weeklyChange >= 0 ? "+" : ""}${top.weeklyChange} contacts in the last 7 days.`,
        `${active.filter((s) => s.weeklyChange > 0).length} segments are growing; ${active.filter((s) => s.weeklyChange < 0).length} are shrinking.`,
        asksShrinking
          ? "Shrinking dynamic segments often signal churn or tightening rules — review the definition."
          : "Growing segments are good candidates for a nurture campaign while intent is high.",
      ],
      sources: [`${active.length} active segments`],
    };
  }

  // Largest/smallest or default overview → rank by size
  const bySize = [...active].sort((a, b) =>
    asksSmallest ? a.memberCount - b.memberCount : b.memberCount - a.memberCount
  );
  const top = bySize[0];
  return {
    headline: asksSmallest || asksLargest
      ? `${asksSmallest ? "Smallest" : "Largest"} segment: ${top.name} (${top.memberCount.toLocaleString()})`
      : `You have ${active.length} segments covering ${totalMembers.toLocaleString()} contacts`,
    metrics: [
      { label: "Segments", value: `${active.length}` },
      { label: "Total contacts", value: totalMembers.toLocaleString() },
      { label: "Dynamic", value: `${active.filter((s) => s.type === "dynamic").length}` },
      { label: "AI-built", value: `${active.filter((s) => s.origin === "ai_suggested" || s.origin === "lookalike").length}` },
    ],
    chart: {
      type: "bar",
      title: "Segment size",
      valueLabel: "Members",
      data: bySize.slice(0, 6).map((s) => ({ label: shortName(s.name), value: s.memberCount })),
    },
    bullets: [
      `${top.name} is the ${asksSmallest ? "smallest" : "largest"} at ${top.memberCount.toLocaleString()} contacts.`,
      `${active.filter((s) => s.type === "dynamic").length} are dynamic (auto-refreshing); ${active.filter((s) => s.type === "static").length} are static snapshots.`,
      `${active.filter((s) => s.usedIn.length > 0).length} segments are actively used in campaigns or sequences.`,
    ],
    sources: [`${active.length} active segments`],
  };
}

/* ------------------------------------------------- automation workflow build */

let wfStepSeq = 0;
function wfStep(step: Omit<SequenceStep, "id">): SequenceStep {
  wfStepSeq += 1;
  return { id: `wf-${Date.now()}-${wfStepSeq}`, ...step };
}

function emailStep(label: string, subject: string): SequenceStep {
  return wfStep({ type: "email", label, subject });
}
function waitStep(value: number, unit: "minutes" | "hours" | "days"): SequenceStep {
  return wfStep({ type: "wait", label: `Wait ${value} ${unit}`, waitMode: "duration", waitValue: value, waitUnit: unit });
}
function actionStep(label: string, actionType: SequenceStep["actionType"], summary: string): SequenceStep {
  return wfStep({ type: "action", label, actionType, actionSummary: summary });
}
function goalStep(label: string, condition: string): SequenceStep {
  return wfStep({ type: "goal", label, goalCondition: condition });
}

const MARKETING_SENDER: SequenceSender = {
  mode: "marketing_address",
  fromName: "Connect Team",
  fromAddress: "hello@connectnx.io",
  replyTo: "hello@connectnx.io",
};
const REP_SENDER: SequenceSender = { mode: "rep_inbox" };

const WF_EXIT: SequenceExitConfig = {
  pauseOnReply: true,
  goalEnabled: false,
  unenrollOnSegmentExit: true,
  reEnrollment: "never",
  oneActivePerContact: true,
};

interface WorkflowRecipe {
  match: RegExp;
  build: () => Omit<WorkflowDraft, "stepCount" | "emailCount" | "triggerSummary">;
}

const WORKFLOW_RECIPES: WorkflowRecipe[] = [
  {
    // New Lead Welcome — mirrors the reference: trigger → welcome → wait → follow-up
    match: /welcome|new lead|new-lead|lead welcome|sign ?up|new subscriber/,
    build: () => ({
      name: "New Lead Welcome",
      description: "Greets every new lead and follows up a couple of days later.",
      type: "marketing",
      channel: "email",
      trigger: { id: "wf-trg", type: "custom_event", eventName: "lead_created" },
      sender: MARKETING_SENDER,
      exit: { ...WF_EXIT },
      flow: [
        emailStep("Welcome Email", "Welcome to Connect 👋"),
        waitStep(2, "days"),
        emailStep("Follow-up Email", "Getting started with Connect"),
      ],
    }),
  },
  {
    match: /win[- ]?back|re-?engage|dormant|lapsed|inactive|churn/,
    build: () => ({
      name: "Win-Back Automation",
      description: "Re-engages dormant contacts with an incentive, then a last-chance nudge.",
      type: "marketing",
      channel: "email",
      trigger: { id: "wf-trg", type: "segment_joined" },
      sender: MARKETING_SENDER,
      exit: { ...WF_EXIT, goalEnabled: true, goalCondition: "daysSinceContact < 7" },
      flow: [
        emailStep("We miss you", "It's been a while, {{firstName}}"),
        waitStep(3, "days"),
        emailStep("Here's 20% off", "A little something to welcome you back"),
        waitStep(4, "days"),
        emailStep("Last chance", "Your offer expires tonight"),
        goalStep("Reactivated", "daysSinceContact < 7"),
      ],
    }),
  },
  {
    match: /onboard|activation|getting started|adopt/,
    build: () => ({
      name: "Customer Onboarding",
      description: "Walks new customers through setup over their first week.",
      type: "marketing",
      channel: "email",
      trigger: { id: "wf-trg", type: "custom_event", eventName: "account_created" },
      sender: MARKETING_SENDER,
      exit: { ...WF_EXIT },
      flow: [
        emailStep("Welcome & first steps", "Welcome to Connect — let's get you set up"),
        waitStep(1, "days"),
        emailStep("Set up your workspace", "Set up your workspace in 5 minutes"),
        waitStep(3, "days"),
        emailStep("Tips & best practices", "3 tips to get more from Connect"),
        waitStep(3, "days"),
        actionStep("Notify owner to check in", "notify_owner", "Ping the account owner to check in with the new customer"),
      ],
    }),
  },
  {
    match: /nurtur|drip|educat|lead journey/,
    build: () => ({
      name: "Lead Nurture Drip",
      description: "Educates leads over a few weeks and hands off when they qualify.",
      type: "marketing",
      channel: "email",
      trigger: { id: "wf-trg", type: "segment_joined" },
      sender: MARKETING_SENDER,
      exit: { ...WF_EXIT, goalEnabled: true, goalCondition: "lifecycleStage = mql" },
      flow: [
        emailStep("Intro & value", "Here's how teams like yours use Connect"),
        waitStep(4, "days"),
        emailStep("Educational content", "A quick guide to {{topic}}"),
        waitStep(4, "days"),
        emailStep("Social proof", "How {{customer}} grew with Connect"),
        waitStep(4, "days"),
        emailStep("Soft CTA", "Want to see it in action?"),
        goalStep("Became an MQL", "lifecycleStage = mql"),
      ],
    }),
  },
  {
    match: /event|webinar|register|rsvp|conference/,
    build: () => ({
      name: "Event Reminder Series",
      description: "Confirms registration and reminds attendees as the event approaches.",
      type: "marketing",
      channel: "email",
      trigger: { id: "wf-trg", type: "form_submitted" },
      sender: MARKETING_SENDER,
      exit: { ...WF_EXIT },
      flow: [
        emailStep("You're registered", "You're in! Here are the details"),
        waitStep(3, "days"),
        emailStep("2 days to go", "Only 2 days until we go live"),
        waitStep(2, "days"),
        emailStep("Starts tomorrow", "See you tomorrow, {{firstName}}"),
      ],
    }),
  },
  {
    match: /sales|outbound|prospect|cadence|cold/,
    build: () => ({
      name: "Sales Follow-up Cadence",
      description: "A rep-sent 1:1 cadence with a task to call after a few touches.",
      type: "sales",
      channel: "email",
      trigger: { id: "wf-trg", type: "manual" },
      sender: REP_SENDER,
      exit: { ...WF_EXIT, pauseOnReply: true },
      flow: [
        emailStep("Intro", "Quick question, {{firstName}}"),
        waitStep(2, "days"),
        emailStep("Bump", "Following up on my note"),
        waitStep(3, "days"),
        wfStep({ type: "task", label: "Call the prospect", config: "Give them a call if still no reply" }),
        waitStep(2, "days"),
        emailStep("Breakup", "Should I close your file?"),
      ],
    }),
  },
];

function fallbackWorkflow(text: string): Omit<WorkflowDraft, "stepCount" | "emailCount" | "triggerSummary"> {
  // Derive a name from the prompt after "for"/"about" if present.
  const m = text.match(/(?:for|about|called)\s+(?:an?\s+)?["']?([\w\s&-]{3,40})/i);
  const raw = m ? m[1].trim().replace(/\b(workflow|automation|sequence|campaign)\b/gi, "").trim() : "";
  const name = raw ? `${titleCase(raw)} Automation` : "New Automation";
  return {
    name,
    description: "A starting workflow — refine the trigger and add your email content.",
    type: "marketing",
    channel: "email",
    trigger: { id: "wf-trg", type: "manual" },
    sender: MARKETING_SENDER,
    exit: { ...WF_EXIT },
    flow: [
      emailStep("First email", "Your subject line"),
      waitStep(2, "days"),
      emailStep("Follow-up email", "Your follow-up subject line"),
    ],
  };
}

export function buildWorkflowDraft(text: string): WorkflowDraft {
  const t = text.toLowerCase();
  const recipe = WORKFLOW_RECIPES.find((r) => r.match.test(t));
  const base = recipe ? recipe.build() : fallbackWorkflow(text);

  const emailCount = base.flow.filter((s) => s.type === "email").length;
  return {
    ...base,
    triggerSummary: workflowTriggerSummary(base.trigger),
    stepCount: base.flow.length,
    emailCount,
  };
}

/** Trigger one-liner — kept in sync with the sequence builder's triggerSummary. */
export function workflowTriggerSummary(trigger: SequenceTrigger): string {
  switch (trigger.type) {
    case "custom_event":
      return `${trigger.eventName ?? "custom"} event`;
    case "segment_joined":
      return "Contact joins a segment";
    case "list_membership":
      return "Contact added to a list";
    case "form_submitted":
      return "Contact submits a form";
    case "tag_added":
      return `Tag "${trigger.tag ?? "…"}" added`;
    case "manual":
      return "Manually enrolled by a rep";
    case "property_changed":
      return `${trigger.property ?? "Property"} changes`;
    case "deal_stage":
      return "Deal stage changes";
    case "email_engagement":
      return "Email engagement";
    case "date_based":
      return "A date is reached";
    default:
      return "Enrollment trigger";
  }
}

/** Seconds represented by a duration wait step (for the details table). */
export function waitSeconds(step: SequenceStep): number {
  const v = step.waitValue ?? 0;
  const unit = step.waitUnit ?? "days";
  const per = unit === "minutes" ? 60 : unit === "hours" ? 3600 : 86400;
  return v * per;
}

/* ------------------------------------------------------------- main dispatch */

export function respond(text: string, ctx: CopilotContext): CopilotResponse {
  const intent = detectIntent(text);

  switch (intent) {
    case "create_campaign": {
      const draft = buildCampaignDraft(text, ctx.segments);
      return {
        kind: "campaign_draft",
        intent,
        text: `Here's a campaign draft based on your goal. Review the audience, goal and subject lines, then create it.`,
        draft,
      };
    }
    case "create_segment": {
      const draft = buildSegmentDraft(text);
      return {
        kind: "segment_draft",
        intent,
        text:
          draft.definition.groups[0].conditions.length > 0
            ? `I translated your description into ${draft.definition.groups[0].conditions.length} targeting rule(s). Here's the segment.`
            : `I couldn't find specific rules — here's a starting point you can refine.`,
        draft,
      };
    }
    case "campaign_insight": {
      const insight = answerCampaignQuery(text, ctx.campaigns, ctx.dailyStats);
      return { kind: "campaign_insight", intent, text: insight.headline, insight };
    }
    case "segment_insight": {
      const insight = answerSegmentQuery(text, ctx.segments);
      return { kind: "segment_insight", intent, text: insight.headline, insight };
    }
    case "create_workflow": {
      const draft = buildWorkflowDraft(text);
      return {
        kind: "workflow_draft",
        intent,
        text: `Your ${draft.name} automation is all set. Here's what I built — review the flow, then create it to add your email content.`,
        draft,
      };
    }
    default:
      return {
        kind: "text",
        intent,
        text: "I can help you create campaigns and automation workflows, build audience segments, and answer questions about performance and audiences. Try one of these:",
        suggestions: [
          SUGGESTED_PROMPTS[0].prompt,
          SUGGESTED_PROMPTS.find((p) => p.capability === "workflow_create")!.prompt,
          SUGGESTED_PROMPTS.find((p) => p.capability === "segment_create")!.prompt,
          SUGGESTED_PROMPTS.find((p) => p.capability === "campaign_insight")!.prompt,
        ],
      };
  }
}
