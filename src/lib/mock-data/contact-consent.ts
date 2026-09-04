// Per-contact consent state (UI-only, no backend).
//
// Consent is collected and stored PER individual (lead / contact / customer),
// not in general. The org catalog + defaults live in consent-policy.ts; this
// module derives each contact's own consent record — state, where it was
// collected, the proof, when, and when it needs refreshing — plus a per-contact
// audit trail. It stays consistent with the contact's existing consent booleans
// (email / whatsapp / sms) so the two views never disagree.

import type { ContactRecord } from "@/lib/types";
import {
  CONSENT_CATALOG,
  DURATION_BY_KEY,
  captureSourceById,
  type ConsentDefinition,
} from "@/lib/mock-data/consent-policy";
import type { DisplayConsentState } from "@/components/settings/consent-state-badge";

export interface ContactConsentEntry {
  key: string;
  state: DisplayConsentState;
  /** Capture source id, or null when never collected. */
  sourceId: string | null;
  capturedAt: string | null;
  expiresAt: string | null;
}

export interface ContactConsentAuditEvent {
  id: string;
  text: string;
  sourceLabel: string;
  when: string; // ISO
  system?: boolean;
}

export interface ContactConsentRecord {
  entries: Record<string, ContactConsentEntry>;
  audit: ContactConsentAuditEvent[];
}

// Small deterministic seed from a contact id + consent key, so the same contact
// always shows the same (illustrative) history across renders.
function seed(id: string, key: string): number {
  let h = 0;
  const s = `${id}:${key}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function addMonthsIso(fromIso: string, months: number): string {
  const d = new Date(fromIso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

// Choose a capture source consistent with the definition's allowed sources.
function pickSource(def: ConsentDefinition, s: number): string {
  const options = def.captureVia.length ? def.captureVia : ["portal"];
  return options[s % options.length];
}

function baseStateFor(def: ConsentDefinition, contact: ContactRecord, s: number): DisplayConsentState {
  // Non-toggleable lawful-basis entries are always active.
  if (!def.toggleable) return "opt-in";

  // Keep the three real channels in sync with the contact's existing booleans.
  if (def.key === "comm.email.marketing") return contact.consent.email ? "opt-in" : "opt-out";
  if (def.key === "comm.chat.marketing") return contact.consent.whatsapp ? "opt-in" : "opt-out";
  if (def.key === "comm.sms.marketing") return contact.consent.sms ? "opt-in" : "neutral";

  // Phone outreach frequently sits provisional (verbal, awaiting confirm).
  if (def.key === "comm.phone.outreach") {
    return s % 3 === 0 ? "provisional" : s % 3 === 1 ? "opt-in" : "neutral";
  }

  // Everything else: mostly opt-in when previously engaged, else neutral.
  const r = s % 4;
  return r === 0 ? "neutral" : r === 3 ? "opt-out" : "opt-in";
}

export function buildContactConsent(contact: ContactRecord): ContactConsentRecord {
  const entries: Record<string, ContactConsentEntry> = {};
  const auditSeeds: { entry: ContactConsentEntry; def: ConsentDefinition }[] = [];

  for (const def of CONSENT_CATALOG) {
    const s = seed(contact.id, def.key);
    const state = baseStateFor(def, contact, s);
    const collected = state === "opt-in" || state === "opt-out" || state === "provisional";
    const sourceId = collected ? pickSource(def, s) : null;
    const capturedAt = collected ? daysAgoIso(5 + (s % 400)) : null;
    const duration = DURATION_BY_KEY[def.durationKey];
    const expiresAt =
      capturedAt && (duration.expires || duration.refreshMonths > 0)
        ? addMonthsIso(capturedAt, duration.refreshMonths)
        : null;

    const entry: ContactConsentEntry = { key: def.key, state, sourceId, capturedAt, expiresAt };
    entries[def.key] = entry;
    if (collected && capturedAt) auditSeeds.push({ entry, def });
  }

  // Build an audit trail from the collected entries, newest first.
  const audit: ContactConsentAuditEvent[] = auditSeeds
    .sort((a, b) => (a.entry.capturedAt! < b.entry.capturedAt! ? 1 : -1))
    .slice(0, 8)
    .map(({ entry, def }, i) => {
      const source = entry.sourceId ? captureSourceById(entry.sourceId) : undefined;
      const verb =
        entry.state === "opt-in"
          ? "opted in"
          : entry.state === "opt-out"
            ? "opted out"
            : "logged as provisional (awaiting confirmation)";
      return {
        id: `${contact.id}-ce-${i}`,
        text: `${def.name} — ${verb}`,
        sourceLabel: source?.name ?? "Manual",
        when: entry.capturedAt!,
        system: false,
      };
    });

  return { entries, audit };
}
