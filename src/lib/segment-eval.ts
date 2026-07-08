import type {
  ContactRecord,
  SegmentCondition,
  SegmentDefinition,
  SegmentFieldCategory,
} from "@/lib/types";

export interface SegmentFieldDef {
  value: string;
  label: string;
  category: SegmentFieldCategory;
  input: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  operators: { value: string; label: string }[];
}

const EQUALITY_OPS = [
  { value: "equals", label: "is" },
  { value: "not_equals", label: "is not" },
];

const TEXT_OPS = [
  ...EQUALITY_OPS,
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
];

const NUMBER_OPS = [
  { value: "equals", label: "equals" },
  { value: "greater_than", label: "is greater than" },
  { value: "less_than", label: "is less than" },
];

/**
 * Catalog of segmentation criteria, grouped the way leading CRMs do:
 * CRM properties (HubSpot-style), behavioral criteria (ActiveCampaign-style
 * engagement rules), and custom fields.
 */
export const SEGMENT_FIELD_CATALOG: SegmentFieldDef[] = [
  // — CRM properties —
  {
    value: "lifecycleStage",
    label: "Lifecycle stage",
    category: "crm",
    input: "select",
    options: ["subscriber", "lead", "mql", "sql", "customer", "churned"].map((v) => ({
      value: v,
      label: v.toUpperCase() === v ? v : v.charAt(0).toUpperCase() + v.slice(1),
    })),
    operators: EQUALITY_OPS,
  },
  { value: "leadScore", label: "Lead score", category: "crm", input: "number", operators: NUMBER_OPS },
  { value: "healthScore", label: "Health score", category: "crm", input: "number", operators: NUMBER_OPS },
  {
    value: "owner",
    label: "Contact owner",
    category: "crm",
    input: "select",
    options: ["Priya Sharma", "Arjun Mehta", "Neha Reddy", "Karthik N"].map((v) => ({
      value: v,
      label: v,
    })),
    operators: EQUALITY_OPS,
  },
  {
    value: "source",
    label: "Original source",
    category: "crm",
    input: "select",
    options: ["Website", "WhatsApp", "Referral", "Trade Show", "Instagram", "Cold Call"].map(
      (v) => ({ value: v, label: v })
    ),
    operators: EQUALITY_OPS,
  },
  {
    value: "territory",
    label: "Territory",
    category: "crm",
    input: "select",
    options: ["North", "South", "East", "West"].map((v) => ({ value: v, label: v })),
    operators: EQUALITY_OPS,
  },
  { value: "company", label: "Company name", category: "crm", input: "text", operators: TEXT_OPS },
  {
    value: "type",
    label: "Record type",
    category: "crm",
    input: "select",
    options: [
      { value: "lead", label: "Lead" },
      { value: "contact", label: "Contact" },
      { value: "customer", label: "Customer" },
    ],
    operators: EQUALITY_OPS,
  },
  // — Behavioral criteria —
  { value: "tags", label: "Tag", category: "behavioral", input: "text", operators: [
    { value: "has_tag", label: "includes" },
    { value: "not_has_tag", label: "does not include" },
  ] },
  {
    value: "daysSinceContact",
    label: "Days since last contact",
    category: "behavioral",
    input: "number",
    operators: NUMBER_OPS,
  },
  {
    value: "emailsOpened",
    label: "Emails opened (total)",
    category: "behavioral",
    input: "number",
    operators: NUMBER_OPS,
  },
  {
    value: "emailsSent",
    label: "Emails received (total)",
    category: "behavioral",
    input: "number",
    operators: NUMBER_OPS,
  },
  {
    value: "consentEmail",
    label: "Email consent",
    category: "behavioral",
    input: "select",
    options: [
      { value: "true", label: "Granted" },
      { value: "false", label: "Not granted" },
    ],
    operators: [{ value: "equals", label: "is" }],
  },
  {
    value: "consentWhatsapp",
    label: "WhatsApp consent",
    category: "behavioral",
    input: "select",
    options: [
      { value: "true", label: "Granted" },
      { value: "false", label: "Not granted" },
    ],
    operators: [{ value: "equals", label: "is" }],
  },
  // — Custom fields —
  { value: "pincode", label: "Pincode (custom)", category: "custom", input: "text", operators: TEXT_OPS },
  { value: "title", label: "Job title (custom)", category: "custom", input: "text", operators: TEXT_OPS },
];

export const SEGMENT_CATEGORY_LABELS: Record<SegmentFieldCategory, string> = {
  crm: "CRM properties",
  behavioral: "Behavioral",
  custom: "Custom fields",
};

export function fieldDef(field: string) {
  return SEGMENT_FIELD_CATALOG.find((f) => f.value === field);
}

/** Total contact base the live estimate extrapolates to (matches dashboard stats). */
export const CONTACT_BASE = 12847;

function contactValue(contact: ContactRecord, field: string): string | number | string[] {
  switch (field) {
    case "daysSinceContact":
      return contact.engagement.daysSinceContact;
    case "emailsOpened":
      return contact.engagement.emailsOpened;
    case "emailsSent":
      return contact.engagement.emailsSent;
    case "consentEmail":
      return String(contact.consent.email);
    case "consentWhatsapp":
      return String(contact.consent.whatsapp);
    case "tags":
      return contact.tags;
    default: {
      const raw = contact[field as keyof ContactRecord];
      if (typeof raw === "string" || typeof raw === "number") return raw;
      return String(raw ?? "");
    }
  }
}

export function evaluateCondition(contact: ContactRecord, condition: SegmentCondition): boolean {
  const raw = contactValue(contact, condition.field);
  const target = condition.value.trim().toLowerCase();
  if (!target) return true; // incomplete rows don't filter anything out

  if (Array.isArray(raw)) {
    const has = raw.some((t) => t.toLowerCase() === target);
    return condition.operator === "not_has_tag" ? !has : has;
  }

  const val = String(raw).toLowerCase();
  switch (condition.operator) {
    case "equals":
      return val === target;
    case "not_equals":
      return val !== target;
    case "contains":
      return val.includes(target);
    case "not_contains":
      return !val.includes(target);
    case "greater_than":
      return Number(raw) > Number(condition.value);
    case "less_than":
      return Number(raw) < Number(condition.value);
    case "has_tag":
      return val === target;
    case "not_has_tag":
      return val !== target;
    default:
      return false;
  }
}

export function evaluateDefinition(contact: ContactRecord, definition: SegmentDefinition): boolean {
  const groups = definition.groups.filter((g) => g.conditions.length > 0);
  if (groups.length === 0) return true;
  const groupResults = groups.map((g) =>
    g.match === "all"
      ? g.conditions.every((c) => evaluateCondition(contact, c))
      : g.conditions.some((c) => evaluateCondition(contact, c))
  );
  return definition.match === "all"
    ? groupResults.every(Boolean)
    : groupResults.some(Boolean);
}

export function matchContacts(contacts: ContactRecord[], definition: SegmentDefinition) {
  return contacts.filter((c) => evaluateDefinition(c, definition));
}

/** Extrapolate the sample match ratio to the full contact base. */
export function estimateCount(matched: number, sampleSize: number) {
  if (sampleSize === 0) return 0;
  return Math.round((matched / sampleSize) * CONTACT_BASE);
}

export function conditionLabel(condition: SegmentCondition) {
  const def = fieldDef(condition.field);
  const op = def?.operators.find((o) => o.value === condition.operator);
  const value =
    def?.input === "select"
      ? (def.options?.find((o) => o.value === condition.value)?.label ?? condition.value)
      : condition.value;
  return `${def?.label ?? condition.field} ${op?.label ?? condition.operator} ${value || "…"}`;
}

/** One-line human summary of a definition, e.g. for table cells. */
export function definitionSummary(definition?: SegmentDefinition) {
  if (!definition || definition.groups.length === 0) return "No criteria";
  const parts = definition.groups
    .filter((g) => g.conditions.length > 0)
    .map((g) => g.conditions.map(conditionLabel).join(g.match === "all" ? " AND " : " OR "));
  return parts.join(definition.match === "all" ? " AND " : " OR ");
}
