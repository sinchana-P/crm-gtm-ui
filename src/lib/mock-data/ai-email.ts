import type { AiAgentRun, AiNextAction, AiSavedDraft, BrandVoice } from "@/lib/types";

export const DEFAULT_BRAND_VOICE: BrandVoice = {
  attributes: ["Warm", "Confident", "Jargon-free"],
  readingLevel: "standard",
  emoji: "sparingly",
  doList: [
    "Lead with the customer's outcome",
    "Use short sentences and active voice",
    "Sound like a helpful human, not a brochure",
  ],
  dontList: [
    "Overpromise or use hype words (\"revolutionary\", \"game-changer\")",
    "Use jargon or internal acronyms",
    "Write walls of text",
  ],
  sample:
    "Hi Ananya — we rebuilt onboarding so your team is live in a day, not a month. Want a quick look? It takes 15 minutes and there's zero setup on your side.",
  signature: "Warmly,\nThe Connect NX team",
};

export const BRAND_ATTRIBUTE_OPTIONS = [
  "Warm", "Confident", "Playful", "Professional", "Bold", "Empathetic",
  "Concise", "Witty", "Jargon-free", "Data-driven", "Inspiring", "Direct",
];

export const MOCK_AI_NEXT_ACTIONS: AiNextAction[] = [
  {
    id: "na1",
    type: "campaign",
    title: "Send a follow-up to non-openers of “June Product Launch”",
    rationale: "2,260 recipients never opened it. A resend with a fresh subject line typically recovers 8–12% of opens.",
    impact: "~250 additional opens",
    confidence: 86,
  },
  {
    id: "na2",
    type: "sequence",
    title: "Add a WhatsApp step to “Outbound Sales Cadence”",
    rationale: "Reply rate stalls after step 3. Contacts who got a WhatsApp nudge replied 4× faster in similar cadences.",
    impact: "+18% reply rate (est.)",
    confidence: 74,
  },
  {
    id: "na3",
    type: "send_time",
    title: "Shift “Weekly Nurture Digest” to Tuesday 9:30am",
    rationale: "Your audience's opens peak Tue–Wed mornings; the current Monday 9am slot underperforms by ~6%.",
    impact: "+6% open rate",
    confidence: 81,
  },
  {
    id: "na4",
    type: "segment",
    title: "Build a lookalike of “High-intent demo requesters”",
    rationale: "That segment converts 2.3× better than average and is growing +26/week — a lookalike would expand reach.",
    impact: "~500 net-new prospects",
    confidence: 69,
  },
];

export const MOCK_AI_DRAFTS: AiSavedDraft[] = [
  {
    id: "draft-1",
    subject: "Ananya, your onboarding call is one click away",
    body: "Hi Ananya,\n\nThanks again for the great demo conversation. To get your team live quickly, I'd love to set up a short onboarding call.\n\nDoes Tuesday or Wednesday next week work? I'll tailor it to your rollout plan.\n\nWarmly,\nPriya",
    goal: "Follow up after a product demo and propose clear next steps",
    tone: "professional",
    audience: "Procurement lead evaluating the platform",
    recipientName: "Ananya Iyer",
    recipientEmail: "ananya.iyer@techcorp.in",
    source: "compose",
    status: "sent",
    createdAt: "2026-07-07T09:24:00Z",
    updatedAt: "2026-07-07T09:31:00Z",
  },
  {
    id: "draft-2",
    subject: "A little something for you 🎁",
    body: "Hi Rahul,\n\nWe've been thinking about how to help RetailHub scale for the festive season. For a limited time, bulk orders qualify for 15% off.\n\nWant me to put together a quick quote for your volume?\n\nCheers,\nPriya",
    goal: "Share a limited-time discount and create urgency to act now",
    tone: "persuasive",
    audience: "Existing customer, price-sensitive",
    recipientName: "Rahul Verma",
    recipientEmail: "rahul.v@retailhub.com",
    source: "compose",
    status: "scheduled",
    createdAt: "2026-07-08T14:02:00Z",
    updatedAt: "2026-07-08T14:10:00Z",
  },
  {
    id: "draft-3",
    subject: "We saved you a seat at the June product webinar",
    body: "Hi {{firstName}},\n\nWe're hosting a live walkthrough of everything new this quarter — and we'd love for you to join.\n\nIt's 30 minutes, no fluff, with time for your questions.\n\nSave my seat →\n\nWarmly,\nThe Connect NX team",
    goal: "Invite the contact to an upcoming webinar and get them to register",
    tone: "friendly",
    audience: "Engaged newsletter subscribers",
    source: "studio",
    status: "draft",
    createdAt: "2026-07-09T08:15:00Z",
    updatedAt: "2026-07-09T08:15:00Z",
  },
];

export const MOCK_AI_AGENT_RUN: AiAgentRun = {
  id: "run1",
  goal: "Win back contacts who've gone quiet in the last 90 days",
  status: "awaiting_approval",
  steps: [
    { id: "st1", title: "Build the audience", detail: "Create a dynamic segment: no activity in 90 days, previously engaged. ~468 contacts.", requiresApproval: false, status: "done" },
    { id: "st2", title: "Draft the emails", detail: "Generate a 2-email win-back sequence in your brand voice with a 20% offer.", requiresApproval: false, status: "done" },
    { id: "st3", title: "Set up the sequence", detail: "Create a 4-step sequence with a goal exit on re-engagement and pause-on-reply.", requiresApproval: true, status: "awaiting_approval" },
    { id: "st4", title: "Launch to 468 contacts", detail: "Enroll the segment and start sending on the approved schedule.", requiresApproval: true, status: "pending" },
    { id: "st5", title: "Monitor & report", detail: "Track re-engagement daily and summarize results after 7 days.", requiresApproval: false, status: "pending" },
  ],
};
