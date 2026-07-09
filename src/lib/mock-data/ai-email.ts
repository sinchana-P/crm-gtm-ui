import type { AiAgentRun, AiNextAction, BrandVoice } from "@/lib/types";

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
