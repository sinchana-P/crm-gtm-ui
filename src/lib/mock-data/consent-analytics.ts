// Org-wide consent analytics (UI-only, no backend).
//
// The real contact seed is tiny, so this generates a realistic synthetic
// audience (~160 leads/customers) with a consent state per collectable consent,
// then aggregates it — powering the "who consented to what" overview (e.g.
// "80 of 152 leads opted in to email"). Deterministic: same audience every load.

import {
  collectableConsents,
  captureSourceById,
} from "@/lib/mock-data/consent-policy";
import type { DisplayConsentState } from "@/components/settings/consent-state-badge";

export type AudienceType = "lead" | "customer";

export interface ConsentAudienceRow {
  id: string;
  name: string;
  type: AudienceType;
  company: string;
  consents: Record<string, DisplayConsentState>;
  sources: Record<string, string | undefined>;
  capturedAt: Record<string, string | undefined>;
}

const FIRST = [
  "Ananya", "Rahul", "Priya", "Arjun", "Meera", "Vikram", "Sana", "Karthik", "Divya", "Rohan",
  "Neha", "Aditya", "Isha", "Manish", "Pooja", "Sameer", "Tara", "Nikhil", "Anjali", "Farhan",
  "Kavya", "Dev", "Riya", "Aman", "Sneha", "Varun", "Lekha", "Imran", "Gauri", "Yash",
];
const LAST = [
  "Iyer", "Verma", "Nair", "Sharma", "Krishnan", "Reddy", "Bose", "Menon", "Kapoor", "Rao",
  "Joshi", "Pillai", "Desai", "Sinha", "Gupta", "Mehta", "Shetty", "Ahuja", "Banerjee", "Chopra",
];
const COMPANIES = [
  "TechCorp India", "Northwind Logistics", "RetailHub", "Law Partners LLP", "BluePeak Finance",
  "Sunrise Health", "Orbit Media", "GreenLeaf Foods", "Quanta Labs", "Metro Realty",
  "Vertex Systems", "Coastal Bank",
];

function seed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff; // 0..1
}

// Per-consent target distributions (opt-in / neutral / opt-out / provisional).
const DISTRIBUTION: Record<string, [number, number, number, number]> = {
  "comm.email.marketing": [0.52, 0.3, 0.18, 0],
  "comm.sms.marketing": [0.34, 0.46, 0.2, 0],
  "comm.chat.marketing": [0.6, 0.28, 0.12, 0],
  "data.ai.docprocessing": [0.4, 0.45, 0.15, 0],
  "rec.call": [0.3, 0.4, 0.22, 0.08],
};

function pickState(key: string, r: number): DisplayConsentState {
  const [inP, neuP, outP] = DISTRIBUTION[key] ?? [0.4, 0.4, 0.2, 0];
  if (r < inP) return "opt-in";
  if (r < inP + neuP) return "neutral";
  if (r < inP + neuP + outP) return "opt-out";
  return "provisional";
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const SIZE = 164;

export const CONSENT_AUDIENCE: ConsentAudienceRow[] = Array.from({ length: SIZE }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 7 + 3) % LAST.length];
  const company = COMPANIES[(i * 5 + 1) % COMPANIES.length];
  const type: AudienceType = seed(`type-${i}`) < 0.72 ? "lead" : "customer";
  const consents: Record<string, DisplayConsentState> = {};
  const sources: Record<string, string | undefined> = {};
  const capturedAt: Record<string, string | undefined> = {};

  for (const def of collectableConsents()) {
    const r = seed(`${i}:${def.key}`);
    const state = pickState(def.key, r);
    consents[def.key] = state;
    const collected = state !== "neutral";
    if (collected) {
      const via = def.captureVia.length ? def.captureVia : ["portal"];
      const sourceId = via[Math.floor(seed(`src-${i}-${def.key}`) * via.length)];
      sources[def.key] = captureSourceById(sourceId)?.name ?? sourceId;
      capturedAt[def.key] = daysAgoIso(5 + Math.floor(seed(`cap-${i}-${def.key}`) * 500));
    } else {
      sources[def.key] = undefined;
      capturedAt[def.key] = undefined;
    }
  }

  return {
    id: `aud_${1000 + i}`,
    name: `${first} ${last}`,
    type,
    company,
    consents,
    sources,
    capturedAt,
  };
});

export interface ConsentBreakdown {
  key: string;
  optIn: number;
  neutral: number;
  optOut: number;
  provisional: number;
  total: number;
  optInPct: number;
}

export function consentBreakdown(key: string, rows: ConsentAudienceRow[] = CONSENT_AUDIENCE): ConsentBreakdown {
  let optIn = 0, neutral = 0, optOut = 0, provisional = 0;
  for (const row of rows) {
    switch (row.consents[key]) {
      case "opt-in": optIn++; break;
      case "opt-out": optOut++; break;
      case "provisional": provisional++; break;
      default: neutral++; break;
    }
  }
  const total = rows.length;
  return {
    key,
    optIn,
    neutral,
    optOut,
    provisional,
    total,
    optInPct: total ? Math.round((optIn / total) * 100) : 0,
  };
}

export function audienceByType(type: AudienceType | "all"): ConsentAudienceRow[] {
  return type === "all" ? CONSENT_AUDIENCE : CONSENT_AUDIENCE.filter((r) => r.type === type);
}
