// Mock data for the Consent Management console (UI-only, no backend).
// Models the full org consent catalog — communication, data & AI, and
// recording/tracking consents — plus the capture-source + proof registry,
// the document→OCR→AI escalation ladder, and duration / refresh policies.
//
// This is the governance home for consent. Email topic-level subscriptions
// and the suppression list live in the Subscriptions module
// (/marketing/subscriptions); this console covers the broader catalog and
// cross-links there rather than duplicating it.

export type ConsentCategory = "communication" | "data-ai" | "recording";

export type ConsentState = "opt-in" | "neutral" | "opt-out";

export type LegalBasis =
  | "consent"
  | "explicit-consent"
  | "legitimate-interest"
  | "contract"
  | "express-written";

export const LEGAL_BASIS_LABEL: Record<LegalBasis, string> = {
  consent: "Consent",
  "explicit-consent": "Explicit consent",
  "legitimate-interest": "Legitimate interest",
  contract: "Contract",
  "express-written": "Express written",
};

export const CONSENT_STATE_LABEL: Record<ConsentState, string> = {
  "opt-in": "Opt-in",
  neutral: "Neutral",
  "opt-out": "Opt-out",
};

/** How consent for this definition can be collected. References CaptureSource ids. */
export interface ConsentDefinition {
  key: string;
  name: string;
  description: string;
  category: ConsentCategory;
  basis: LegalBasis;
  /** Default state applied to new contacts unless overridden at capture. */
  defaultState: ConsentState;
  /**
   * When false, this is a lawful-basis/processing entry that is tracked but not
   * a toggleable consent (e.g. transactional email under legitimate interest).
   */
  toggleable: boolean;
  channel?: string;
  /** Duration policy key (see DURATION_POLICIES). */
  durationKey: string;
  captureVia: string[];
}

export const CONSENT_CATEGORIES: {
  id: ConsentCategory;
  label: string;
  blurb: string;
}[] = [
  {
    id: "communication",
    label: "Communication",
    blurb: "Channel × purpose — which messages a contact will accept, and how.",
  },
  {
    id: "data-ai",
    label: "Data & AI",
    blurb: "Permission to read, extract, and run AI over the records they submit.",
  },
  {
    id: "recording",
    label: "Recording & tracking",
    blurb: "Call recording, session capture, and interaction tracking.",
  },
];

export const CONSENT_CATALOG: ConsentDefinition[] = [
  // ---- Communication (channel × purpose) ----
  {
    key: "comm.email.marketing",
    name: "Email — marketing",
    description: "Product updates and campaigns.",
    category: "communication",
    basis: "consent",
    defaultState: "neutral",
    toggleable: true,
    channel: "Email",
    durationKey: "refresh-24m",
    captureVia: ["portal", "email-doi", "form", "esign"],
  },
  {
    key: "comm.email.service",
    name: "Email — service / transactional",
    description: "Receipts, case updates, and OTP. Tracked, not consent-gated.",
    category: "communication",
    basis: "legitimate-interest",
    defaultState: "opt-in",
    toggleable: false,
    channel: "Email",
    durationKey: "none",
    captureVia: [],
  },
  {
    key: "comm.sms.marketing",
    name: "SMS / text — marketing",
    description: "Short-code promotional alerts.",
    category: "communication",
    basis: "express-written",
    defaultState: "neutral",
    toggleable: true,
    channel: "SMS",
    durationKey: "refresh-24m",
    captureVia: ["sms-keyword", "portal", "form"],
  },
  {
    key: "comm.chat.marketing",
    name: "WhatsApp / chat messaging",
    description: "Promotional and broadcast messages on chat channels.",
    category: "communication",
    basis: "consent",
    defaultState: "neutral",
    toggleable: true,
    channel: "WhatsApp",
    durationKey: "refresh-24m",
    captureVia: ["portal", "form", "sms-keyword"],
  },

  // ---- Data & AI ----
  {
    key: "data.process",
    name: "Store & process personal data",
    description: "Base permission to hold the contact's record. Contract-based.",
    category: "data-ai",
    basis: "contract",
    defaultState: "opt-in",
    toggleable: false,
    durationKey: "none",
    captureVia: ["portal", "form"],
  },
  {
    key: "data.ai.docprocessing",
    name: "AI document processing",
    description:
      "Read, extract (OCR) and process your uploaded documents using AI — to summarize, classify, draft replies, and route. Uploading a document is not consent to process it with AI; this is that permission.",
    category: "data-ai",
    basis: "consent",
    defaultState: "neutral",
    toggleable: true,
    durationKey: "review-12m",
    captureVia: ["upload", "portal", "esign", "form"],
  },

  // ---- Recording & tracking ----
  {
    key: "rec.call",
    name: "Call recording",
    description: "Record voice calls. All-party consent — capture at call start.",
    category: "recording",
    basis: "consent",
    defaultState: "neutral",
    toggleable: true,
    durationKey: "none",
    captureVia: ["phone-confirm", "ivr"],
  },
];

// ---- Capture sources + proof registry ----

export type ProofStrength = "strong" | "confirm-required" | "risky";

export const PROOF_STRENGTH_LABEL: Record<ProofStrength, string> = {
  strong: "Strong",
  "confirm-required": "Confirm-required",
  risky: "Provenance needed",
};

export interface CaptureSource {
  id: string;
  name: string;
  /** lucide icon name, mapped to a component in the presentational layer. */
  icon: string;
  how: string;
  proof: string;
  strength: ProofStrength;
}

export const CAPTURE_SOURCES: CaptureSource[] = [
  {
    id: "portal",
    name: "Customer portal",
    icon: "monitor",
    how: "Authenticated preference toggle.",
    proof: "Logged-in identity + audit log of the change.",
    strength: "strong",
  },
  {
    id: "email-doi",
    name: "Email — double opt-in",
    icon: "mail",
    how: "Confirmation email with a unique link.",
    proof: "Click event: token, timestamp, IP.",
    strength: "strong",
  },
  {
    id: "form",
    name: "Web form / upload page",
    icon: "square-check-big",
    how: "Un-pre-ticked checkbox on submit.",
    proof: "Server record: timestamp, IP, wording + policy version.",
    strength: "strong",
  },
  {
    id: "sms-keyword",
    name: "SMS keyword",
    icon: "message-square",
    how: 'Reply "YES" / "JOIN" to a short code.',
    proof: "Inbound message log — the reply is the proof.",
    strength: "strong",
  },
  {
    id: "esign",
    name: "E-signature form",
    icon: "pen-line",
    how: "Sign a consent / authorization document.",
    proof: "Signed PDF + audit certificate; supports versioned re-consent.",
    strength: "strong",
  },
  {
    id: "upload",
    name: "Document upload",
    icon: "upload",
    how: "Consent checkbox shown at the point of upload.",
    proof: "Server record tied to the uploaded document + policy version.",
    strength: "strong",
  },
  {
    id: "ivr",
    name: "IVR keypress",
    icon: "phone-call",
    how: '"Press 1 to consent" during a call.',
    proof: "Machine-captured keypress + call ID.",
    strength: "strong",
  },
  {
    id: "cookie",
    name: "Cookie banner",
    icon: "cookie",
    how: "Accept / reject per category.",
    proof: "Consent string stored client-side + server log.",
    strength: "strong",
  },
  {
    id: "phone-confirm",
    name: "Phone → send-to-confirm",
    icon: "phone",
    how: "Rep captures verbal consent, then a confirm link is sent.",
    proof: "Verbal alone is provisional; confirmed when the customer clicks.",
    strength: "confirm-required",
  },
  {
    id: "import",
    name: "API / partner / import",
    icon: "database",
    how: "Consent passed in with the imported record.",
    proof: "Must carry provenance of the original consent. Imports are risky.",
    strength: "risky",
  },
];

// ---- Document → AI escalation ladder ----

export interface LadderStep {
  key: string | null; // null = the received documents (not a consent)
  title: string;
  description: string;
}

export const AI_LADDER: LadderStep[] = [
  {
    key: null,
    title: "Documents submitted",
    description: "Customer uploaded personal records through the portal.",
  },
  {
    key: "data.ai.docprocessing",
    title: "AI document processing",
    description: "Read, extract (OCR) and process the document with AI — summarize, classify, draft, route.",
  },
];

// ---- Duration / refresh policies ----

export interface DurationPolicy {
  key: string;
  label: string;
  /** Months until the consent should be refreshed / re-confirmed. 0 = no expiry. */
  refreshMonths: number;
  expires: boolean;
  note: string;
}

export const DURATION_POLICIES: DurationPolicy[] = [
  {
    key: "none",
    label: "No expiry",
    refreshMonths: 0,
    expires: false,
    note: "Valid until the contact changes it.",
  },
  {
    key: "refresh-24m",
    label: "Refresh every 24 months",
    refreshMonths: 24,
    expires: false,
    note: "ICO guidance — refresh consent every ~2 years if in doubt.",
  },
  {
    key: "review-12m",
    label: "Review at 12 months",
    refreshMonths: 12,
    expires: false,
    note: "Sensitive processing — re-confirm within a year.",
  },
];

export const DURATION_BY_KEY: Record<string, DurationPolicy> = Object.fromEntries(
  DURATION_POLICIES.map((p) => [p.key, p]),
);

export function definitionsByCategory(category: ConsentCategory): ConsentDefinition[] {
  return CONSENT_CATALOG.filter((d) => d.category === category);
}

/**
 * Consents you actively ASK for (opt-in) — the ones offered in a form's consent
 * section and measured in consent analytics. Excludes tracked-only lawful-basis
 * entries (contract / legitimate interest) that are recorded, never asked.
 */
export function collectableConsents(): ConsentDefinition[] {
  return CONSENT_CATALOG.filter((d) => d.toggleable);
}

export function definitionByKey(key: string): ConsentDefinition | undefined {
  return CONSENT_CATALOG.find((d) => d.key === key);
}

export function captureSourceById(id: string): CaptureSource | undefined {
  return CAPTURE_SOURCES.find((s) => s.id === id);
}
