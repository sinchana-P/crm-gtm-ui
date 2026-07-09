import type {
  AiEntityDraft,
  AiEntityQuestion,
  ContactRecord,
  EntityType,
  LifecycleStage,
} from "@/lib/types";
import { MOCK_CONTACTS } from "@/lib/mock-data";

/**
 * Deterministic, UI-only "AI" for guided entity creation. Given the same input
 * it always extracts the same fields and asks the same questions — no network,
 * no randomness — so the mock is predictable and swaps cleanly for a real model.
 */

export const OWNERS = ["Priya Sharma", "Arjun Mehta", "Neha Reddy", "Karthik N"];

export const SOURCES = [
  "Website",
  "Event",
  "Referral",
  "LinkedIn",
  "Webinar",
  "Cold outreach",
  "Partner",
  "Inbound call",
];

export const TERRITORIES = ["North", "South", "East", "West"];

export const ENTITY_TYPES: {
  type: EntityType;
  label: string;
  description: string;
  icon: string;
  defaultLifecycle: LifecycleStage;
}[] = [
  { type: "lead", label: "Lead", description: "A new, unqualified prospect", icon: "UserPlus", defaultLifecycle: "lead" },
  { type: "contact", label: "Contact", description: "A qualified person you're working", icon: "User", defaultLifecycle: "mql" },
  { type: "customer", label: "Customer", description: "An existing paying account", icon: "Building2", defaultLifecycle: "customer" },
];

const TITLE_KEYWORDS = [
  "ceo", "cto", "cfo", "coo", "vp", "vice president", "director", "head",
  "manager", "lead", "founder", "owner", "procurement", "marketing",
  "sales", "engineer", "analyst", "consultant", "president", "partner",
];

const CITY_TAGS = ["bangalore", "mumbai", "delhi", "chennai", "hyderabad", "pune", "kolkata"];

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function entityConfig(type: EntityType) {
  return ENTITY_TYPES.find((e) => e.type === type) ?? ENTITY_TYPES[0];
}

export function emptyDraft(type: EntityType): AiEntityDraft {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    owner: "",
    source: "",
    lifecycleStage: entityConfig(type).defaultLifecycle,
    territory: "",
    tags: [],
    consent: { email: false, whatsapp: false, sms: false, topics: [] },
    aiFilled: [],
  };
}

/** Extract as much as possible from a free-text description. */
export function parseBlurb(text: string, type: EntityType): AiEntityDraft {
  const draft = emptyDraft(type);
  const filled = new Set<string>();
  const raw = text.trim();
  if (!raw) return draft;
  const lower = raw.toLowerCase();

  // Email
  const email = raw.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
  if (email) {
    draft.email = email;
    filled.add("email");
  }

  // Phone
  const phone = raw.match(/(\+?\d[\d\s-]{7,}\d)/)?.[0];
  if (phone) {
    draft.phone = phone.trim();
    filled.add("phone");
  }

  // Name — first two capitalized words before a comma / "at" / "from"
  const head = raw.split(/,| at | from | works | who /i)[0].trim();
  const nameWords = head
    .replace(/[^\p{L}\s.'-]/gu, " ")
    .split(/\s+/)
    .filter((w) => /^[A-Z][a-z'.-]+$/.test(w));
  if (nameWords[0]) {
    draft.firstName = nameWords[0];
    filled.add("firstName");
  }
  if (nameWords[1]) {
    draft.lastName = nameWords[1];
    filled.add("lastName");
  }

  // Company — after "at" / "from" / "@"
  const companyMatch = raw.match(/(?:\bat\b|\bfrom\b|works at|@)\s+([A-Z][\w&.\- ]{1,40})/);
  if (companyMatch) {
    draft.company = companyMatch[1].split(/[,.;]| who | and /i)[0].trim();
    filled.add("company");
  }

  // Title — first matching keyword phrase
  const titleHit = TITLE_KEYWORDS.find((k) => lower.includes(k));
  if (titleHit) {
    // Grab a short phrase around the keyword for a nicer title
    const m = raw.match(new RegExp(`([\\w ]*${titleHit}[\\w ]*)`, "i"));
    draft.title = cap((m?.[1] ?? titleHit).trim()).slice(0, 40);
    filled.add("title");
  }

  // Source
  const sourceMap: [RegExp, string][] = [
    [/summit|event|conference|expo|booth/i, "Event"],
    [/referr|introduced|referred/i, "Referral"],
    [/linkedin/i, "LinkedIn"],
    [/webinar/i, "Webinar"],
    [/website|signed up|form|demo request/i, "Website"],
    [/partner/i, "Partner"],
    [/cold|outbound/i, "Cold outreach"],
    [/called|phone call|inbound call/i, "Inbound call"],
  ];
  for (const [re, val] of sourceMap) {
    if (re.test(raw)) {
      draft.source = val;
      filled.add("source");
      break;
    }
  }

  // Tags
  const tags = new Set<string>();
  if (/enterprise/i.test(raw)) tags.add("enterprise");
  if (/\bsmb\b|small business/i.test(raw)) tags.add("smb");
  if (/urgent|asap|priority/i.test(raw)) tags.add("priority");
  if (/demo/i.test(raw)) tags.add("demo");
  CITY_TAGS.forEach((c) => lower.includes(c) && tags.add(c));
  if (tags.size) {
    draft.tags = [...tags];
    filled.add("tags");
  }

  draft.aiFilled = [...filled];
  return draft;
}

/** Which important fields still need confirming → the questions to ask. */
export function buildQuestions(draft: AiEntityDraft, type: EntityType): AiEntityQuestion[] {
  const qs: AiEntityQuestion[] = [];

  if (!draft.email) {
    qs.push({
      id: "q-email",
      field: "email",
      prompt: "What's the best email address for them?",
      helper: "Used for de-duplication and all email outreach.",
      kind: "email",
    });
  }

  if (!draft.company && type !== "lead") {
    qs.push({
      id: "q-company",
      field: "company",
      prompt: "Which company are they with?",
      kind: "text",
    });
  }

  if (!draft.source) {
    qs.push({
      id: "q-source",
      field: "source",
      prompt: "Where did this lead come from?",
      helper: "Drives attribution and routing.",
      kind: "select",
      options: SOURCES.map((s) => ({ value: s, label: s })),
    });
  }

  qs.push({
    id: "q-owner",
    field: "owner",
    prompt: "Who should own this record?",
    helper: `AI suggests ${suggestOwner(draft)} based on round-robin and territory.`,
    kind: "select",
    options: OWNERS.map((o) => ({ value: o, label: o })),
    suggestions: [suggestOwner(draft)],
  });

  qs.push({
    id: "q-consent",
    field: "consent",
    prompt: "Do we have consent to contact them?",
    helper: "Required before any marketing send (DPDP / GDPR).",
    kind: "consent",
    optional: true,
  });

  return qs;
}

/** Apply a single answer immutably; user answers are never marked AI-filled. */
export function applyAnswer(
  draft: AiEntityDraft,
  field: keyof AiEntityDraft,
  value: string | string[]
): AiEntityDraft {
  const next: AiEntityDraft = { ...draft, aiFilled: draft.aiFilled.filter((f) => f !== field) };
  if (field === "consent" && Array.isArray(value)) {
    next.consent = {
      ...draft.consent,
      email: value.includes("email"),
      whatsapp: value.includes("whatsapp"),
      sms: value.includes("sms"),
    };
  } else if (field === "tags") {
    next.tags = Array.isArray(value) ? value : value.split(",").map((t) => t.trim()).filter(Boolean);
  } else if (typeof value === "string") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (next as any)[field] = value;
  }
  return next;
}

/** Find an existing record that looks like a duplicate of the draft. */
export function duplicateCheck(draft: AiEntityDraft): ContactRecord | undefined {
  const email = draft.email.trim().toLowerCase();
  const name = `${draft.firstName} ${draft.lastName}`.trim().toLowerCase();
  return MOCK_CONTACTS.find((c) => {
    if (email && c.email.toLowerCase() === email) return true;
    return (
      Boolean(name) &&
      `${c.firstName} ${c.lastName}`.toLowerCase() === name &&
      (!draft.company || (c.company ?? "").toLowerCase() === draft.company.toLowerCase())
    );
  });
}

/** Deterministic 0–100 fit/lead score preview from the signals present. */
export function predictScore(draft: AiEntityDraft): number {
  let s = 30;
  if (draft.title) s += 20;
  if (draft.company) s += 15;
  if (["Event", "Referral", "Webinar", "Inbound call", "Partner"].includes(draft.source)) s += 15;
  if (draft.email) s += 10;
  if (draft.phone) s += 10;
  if (draft.tags.includes("enterprise")) s += 10;
  return Math.min(100, s);
}

export function suggestOwner(draft: AiEntityDraft): string {
  const seed = (draft.firstName || draft.company || "x").length + (draft.territory ? 1 : 0);
  return OWNERS[seed % OWNERS.length];
}

/** Tags the AI recommends adding, excluding ones already on the draft. */
export function suggestTags(draft: AiEntityDraft): string[] {
  const out = new Set<string>();
  const title = draft.title.toLowerCase();
  if (/head|director|vp|chief|founder|owner|president/.test(title)) out.add("decision-maker");
  if (draft.source === "Event") out.add("event-lead");
  if (draft.source === "Referral") out.add("warm");
  if (predictScore(draft) >= 75) out.add("high-intent");
  return [...out].filter((t) => !draft.tags.includes(t));
}

/** Canned firmographic enrichment for the company. */
export function enrichment(draft: AiEntityDraft): { label: string; value: string }[] {
  if (!draft.company) return [];
  const industries = ["SaaS", "Retail", "Manufacturing", "Financial services", "Healthcare"];
  const sizes = ["1–50", "51–200", "201–1,000", "1,000+"];
  const regions = ["Bengaluru, IN", "Mumbai, IN", "Delhi NCR, IN", "Remote"];
  const h = draft.company.length;
  return [
    { label: "Industry", value: industries[h % industries.length] },
    { label: "Company size", value: `${sizes[h % sizes.length]} employees` },
    { label: "HQ", value: regions[h % regions.length] },
  ];
}
