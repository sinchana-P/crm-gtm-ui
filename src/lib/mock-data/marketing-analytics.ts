// Mock data for Marketing analytics UI (UI-only, no backend).
// Covers UTM lead attribution and unsubscribe-rate analytics.

/* ----------------------------- UTM ANALYTICS ----------------------------- */

export interface UtmSourceStat {
  source: string;
  medium: string;
  leads: number;
  sessions: number;
  customers: number;
  cvr: number; // lead → customer conversion %
  deltaPct: number; // vs previous period
}

export interface UtmChannelStat {
  key: string;
  label: string;
  leads: number;
  share: number; // % of total leads
  deltaPct: number;
}

export interface UtmCampaignRow {
  id: string;
  campaign: string;
  source: string;
  medium: string;
  content?: string;
  term?: string;
  leads: number;
  sessions: number;
  customers: number;
  cvr: number;
  lastSeen: string;
}

export interface UtmTrendPoint {
  date: string;
  label: string;
  google: number;
  linkedin: number;
  newsletter: number;
  event: number;
  referral: number;
}

export const UTM_KPIS = {
  totalLeads: 1284,
  totalLeadsDeltaPct: 18.4,
  taggedSessions: 24710,
  taggedSessionsDeltaPct: 12.1,
  topSource: "google / cpc",
  topSourceLeads: 486,
  cvr: 9.7,
  cvrDeltaPct: 1.3,
};

// Leads by UTM source (primary breakdown)
export const UTM_BY_SOURCE: UtmSourceStat[] = [
  { source: "google", medium: "cpc", leads: 486, sessions: 9120, customers: 58, cvr: 11.9, deltaPct: 22.5 },
  { source: "linkedin", medium: "paid-social", leads: 271, sessions: 5340, customers: 24, cvr: 8.9, deltaPct: 14.2 },
  { source: "newsletter", medium: "email", leads: 198, sessions: 3110, customers: 31, cvr: 15.7, deltaPct: 9.8 },
  { source: "tag-event", medium: "event", leads: 142, sessions: 1620, customers: 22, cvr: 15.5, deltaPct: 41.0 },
  { source: "partner-referral", medium: "referral", leads: 96, sessions: 1180, customers: 14, cvr: 14.6, deltaPct: -4.3 },
  { source: "twitter", medium: "social", leads: 54, sessions: 1890, customers: 3, cvr: 5.6, deltaPct: -11.2 },
  { source: "google", medium: "organic", leads: 37, sessions: 2450, customers: 5, cvr: 13.5, deltaPct: 6.1 },
];

// Leads by UTM medium (channel grouping)
export const UTM_BY_MEDIUM: UtmChannelStat[] = [
  { key: "cpc", label: "Paid search", leads: 523, share: 40.7, deltaPct: 20.1 },
  { key: "email", label: "Email", leads: 198, share: 15.4, deltaPct: 9.8 },
  { key: "paid-social", label: "Paid social", leads: 271, share: 21.1, deltaPct: 14.2 },
  { key: "event", label: "Event", leads: 142, share: 11.1, deltaPct: 41.0 },
  { key: "referral", label: "Referral", leads: 96, share: 7.5, deltaPct: -4.3 },
  { key: "organic", label: "Organic", leads: 54, share: 4.2, deltaPct: 6.1 },
];

// Leads-over-time by source
export const UTM_TREND: UtmTrendPoint[] = [
  { date: "2026-06-01", label: "Jun 1", google: 38, linkedin: 18, newsletter: 12, event: 4, referral: 6 },
  { date: "2026-06-05", label: "Jun 5", google: 44, linkedin: 22, newsletter: 15, event: 6, referral: 7 },
  { date: "2026-06-09", label: "Jun 9", google: 51, linkedin: 26, newsletter: 18, event: 9, referral: 8 },
  { date: "2026-06-13", label: "Jun 13", google: 63, linkedin: 31, newsletter: 22, event: 14, referral: 9 },
  { date: "2026-06-17", label: "Jun 17", google: 72, linkedin: 38, newsletter: 26, event: 22, referral: 11 },
  { date: "2026-06-21", label: "Jun 21", google: 84, linkedin: 44, newsletter: 31, event: 34, referral: 12 },
  { date: "2026-06-25", label: "Jun 25", google: 96, linkedin: 51, newsletter: 38, event: 42, referral: 14 },
];

export const UTM_CAMPAIGNS: UtmCampaignRow[] = [
  { id: "u1", campaign: "top40-nominations-2026", source: "google", medium: "cpc", content: "hero-cta", term: "innovation awards georgia", leads: 214, sessions: 3980, customers: 29, cvr: 13.6, lastSeen: "2026-06-25T09:12:00Z" },
  { id: "u2", campaign: "membership-q2", source: "linkedin", medium: "paid-social", content: "carousel-a", leads: 168, sessions: 3110, customers: 15, cvr: 8.9, lastSeen: "2026-06-25T08:40:00Z" },
  { id: "u3", campaign: "june-newsletter", source: "newsletter", medium: "email", content: "cta-footer", leads: 132, sessions: 2010, customers: 21, cvr: 15.9, lastSeen: "2026-06-24T18:22:00Z" },
  { id: "u4", campaign: "ga-tech-summit", source: "tag-event", medium: "event", content: "booth-qr", leads: 118, sessions: 1290, customers: 19, cvr: 16.1, lastSeen: "2026-06-24T16:05:00Z" },
  { id: "u5", campaign: "top40-nominations-2026", source: "google", medium: "cpc", content: "search-ad-b", term: "top 40 innovative companies", leads: 96, sessions: 1740, customers: 11, cvr: 11.5, lastSeen: "2026-06-25T07:55:00Z" },
  { id: "u6", campaign: "partner-webinar", source: "partner-referral", medium: "referral", content: "email-invite", leads: 74, sessions: 910, customers: 12, cvr: 16.2, lastSeen: "2026-06-23T14:30:00Z" },
  { id: "u7", campaign: "retarget-warm", source: "linkedin", medium: "paid-social", content: "single-image", leads: 61, sessions: 1420, customers: 6, cvr: 9.8, lastSeen: "2026-06-25T06:18:00Z" },
  { id: "u8", campaign: "brand-awareness", source: "twitter", medium: "social", content: "thread-cta", leads: 42, sessions: 1560, customers: 2, cvr: 4.8, lastSeen: "2026-06-22T11:44:00Z" },
];

/* --------------------- PER-FORM UTM ANALYTICS (dashboard) --------------------- */

export interface FormUtmSourceRow {
  key: string;
  source: string;
  medium: string;
  leads: number;
  pct: number;
  direct?: boolean; // true = arrived on the bare URL with no UTM params
}

export interface FormUtmSubmission {
  id: string;
  email: string;
  name: string;
  source: string | null; // null = direct / no UTM
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  landingUrl: string;
  referrer: string;
  submittedAt: string;
}

export interface FormUtmTrendPoint {
  label: string;
  utm: number;
  direct: number;
}

export const FORM_UTM_SUMMARY = {
  formName: "Connect with TAG",
  views: 117,
  submissions: 24,
  submissionRate: 20.5,
  totalLeads: 24,
  withUtm: 17,
  withoutUtm: 7, // direct / bare URL
  topSource: "google / cpc",
  topSourceLeads: 6,
  lowestSource: "partner-referral / referral",
  lowestSourceLeads: 1,
};

export const FORM_UTM_BY_SOURCE: FormUtmSourceRow[] = [
  { key: "google-cpc", source: "google", medium: "cpc", leads: 6, pct: 25.0 },
  { key: "linkedin-paid", source: "linkedin", medium: "paid-social", leads: 4, pct: 16.7 },
  { key: "newsletter-email", source: "newsletter", medium: "email", leads: 3, pct: 12.5 },
  { key: "tag-event", source: "tag-event", medium: "event", leads: 2, pct: 8.3 },
  { key: "partner-referral", source: "partner-referral", medium: "referral", leads: 1, pct: 4.2 },
  { key: "twitter-social", source: "twitter", medium: "social", leads: 1, pct: 4.2 },
  { key: "direct", source: "Direct / none", medium: "no UTM", leads: 7, pct: 29.2, direct: true },
];

export const FORM_UTM_TREND: FormUtmTrendPoint[] = [
  { label: "Jun 1", utm: 1, direct: 1 },
  { label: "Jun 5", utm: 2, direct: 0 },
  { label: "Jun 9", utm: 3, direct: 1 },
  { label: "Jun 13", utm: 2, direct: 2 },
  { label: "Jun 17", utm: 4, direct: 1 },
  { label: "Jun 21", utm: 3, direct: 1 },
  { label: "Jun 25", utm: 2, direct: 1 },
];

export const FORM_UTM_SUBMISSIONS: FormUtmSubmission[] = [
  { id: "s1", email: "brandon.fields@buckheadcloud.com", name: "Brandon Fields", source: "google", medium: "cpc", campaign: "top40-nominations-2026", content: "hero-cta", term: "innovation awards", landingUrl: "/tag?utm_source=google&utm_medium=cpc&utm_campaign=top40-nominations-2026", referrer: "google.com", submittedAt: "2026-06-25T09:12:00Z" },
  { id: "s2", email: "rachel.kim@sandyspringsdev.com", name: "Rachel Kim", source: "linkedin", medium: "paid-social", campaign: "membership-q2", content: "carousel-a", term: null, landingUrl: "/tag?utm_source=linkedin&utm_medium=paid-social&utm_campaign=membership-q2", referrer: "linkedin.com", submittedAt: "2026-06-24T16:40:00Z" },
  { id: "s3", email: "alicia.barnes@alpharettarobotics.com", name: "Alicia Barnes", source: null, medium: null, campaign: null, content: null, term: null, landingUrl: "/tag", referrer: "(direct)", submittedAt: "2026-06-24T14:05:00Z" },
  { id: "s4", email: "caleb.monroe@maconsoftworks.com", name: "Caleb Monroe", source: "newsletter", medium: "email", campaign: "june-newsletter", content: "cta-footer", term: null, landingUrl: "/tag?utm_source=newsletter&utm_medium=email&utm_campaign=june-newsletter", referrer: "(email client)", submittedAt: "2026-06-24T11:22:00Z" },
  { id: "s5", email: "marcus.steele@savannahsecure.com", name: "Marcus Steele", source: "google", medium: "cpc", campaign: "top40-nominations-2026", content: "search-ad-b", term: "top 40 companies", landingUrl: "/tag?utm_source=google&utm_medium=cpc&utm_campaign=top40-nominations-2026", referrer: "google.com", submittedAt: "2026-06-23T18:33:00Z" },
  { id: "s6", email: "vanessa.okafor@decaturhealthai.com", name: "Vanessa Okafor", source: null, medium: null, campaign: null, content: null, term: null, landingUrl: "/tag", referrer: "(direct)", submittedAt: "2026-06-23T10:15:00Z" },
  { id: "s7", email: "isaiah.coleman@albanyiot.com", name: "Isaiah Coleman", source: "tag-event", medium: "event", campaign: "ga-tech-summit", content: "booth-qr", term: null, landingUrl: "/tag?utm_source=tag-event&utm_medium=event&utm_campaign=ga-tech-summit", referrer: "(qr scan)", submittedAt: "2026-06-22T15:48:00Z" },
  { id: "s8", email: "hannah.delgado@augustabiotech.com", name: "Hannah Delgado", source: "linkedin", medium: "paid-social", campaign: "retarget-warm", content: "single-image", term: null, landingUrl: "/tag?utm_source=linkedin&utm_medium=paid-social&utm_campaign=retarget-warm", referrer: "linkedin.com", submittedAt: "2026-06-22T09:04:00Z" },
  { id: "s9", email: "nathan.reyes@roswelldata.com", name: "Nathan Reyes", source: "google", medium: "cpc", campaign: "top40-nominations-2026", content: "hero-cta", term: "georgia tech awards", landingUrl: "/tag?utm_source=google&utm_medium=cpc&utm_campaign=top40-nominations-2026", referrer: "google.com", submittedAt: "2026-06-21T13:20:00Z" },
  { id: "s10", email: "grace.whitfield@columbusfintech.com", name: "Grace Whitfield", source: null, medium: null, campaign: null, content: null, term: null, landingUrl: "/tag", referrer: "bing.com", submittedAt: "2026-06-21T08:55:00Z" },
  { id: "s11", email: "priya.raman@northgatehealth.com", name: "Priya Raman", source: "newsletter", medium: "email", campaign: "june-newsletter", content: "cta-footer", term: null, landingUrl: "/tag?utm_source=newsletter&utm_medium=email&utm_campaign=june-newsletter", referrer: "(email client)", submittedAt: "2026-06-20T17:30:00Z" },
  { id: "s12", email: "andre.washington@summitcyber.com", name: "Andre Washington", source: "twitter", medium: "social", campaign: "brand-awareness", content: "thread-cta", term: null, landingUrl: "/tag?utm_source=twitter&utm_medium=social&utm_campaign=brand-awareness", referrer: "t.co", submittedAt: "2026-06-20T12:11:00Z" },
  { id: "s13", email: "devin.clarke@midtownai.com", name: "Devin Clarke", source: "partner-referral", medium: "referral", campaign: "partner-webinar", content: "email-invite", term: null, landingUrl: "/tag?utm_source=partner-referral&utm_medium=referral&utm_campaign=partner-webinar", referrer: "partner.io", submittedAt: "2026-06-19T14:42:00Z" },
  { id: "s14", email: "olivia.martinez@gwinnettsoft.com", name: "Olivia Martinez", source: null, medium: null, campaign: null, content: null, term: null, landingUrl: "/tag", referrer: "(direct)", submittedAt: "2026-06-19T09:08:00Z" },
];
