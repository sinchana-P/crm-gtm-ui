import type {
  LandingAnalytics,
  LandingBlock,
  LandingPage,
  LandingPageFolder,
  LandingPageTemplate,
  LandingSection,
} from "@/lib/types";

// ── small builders to keep the mock data readable ────────────────────────
let n = 0;
const id = (p: string) => `${p}-${(n += 1)}`;

function section(partial: Partial<LandingSection> & { content: LandingBlock[][] }): LandingSection {
  return {
    id: id("sec"),
    columns: (partial.content.length as 1 | 2 | 3) || 1,
    background: { type: "none" },
    paddingY: "lg",
    width: "boxed",
    verticalAlign: "top",
    ...partial,
  };
}

const heading = (text: string, level: 1 | 2 | 3 | 4 = 1): LandingBlock => ({ id: id("blk"), type: "heading", text, level, align: "center" });
const text = (t: string): LandingBlock => ({ id: id("blk"), type: "text", text: t, align: "center" });
const button = (label: string): LandingBlock => ({ id: id("blk"), type: "button", text: label, url: "#form", align: "center", buttonStyle: "primary", buttonSize: "lg" });

const leadForm: LandingBlock = {
  id: id("blk"),
  type: "form",
  form: {
    submitLabel: "Get the guide",
    layout: "stacked",
    recaptcha: true,
    action: "message",
    thankYouMessage: "Check your inbox — the guide is on its way!",
    consentRequired: true,
    followUpSequenceId: "Welcome nurture",
    fields: [
      { id: id("fld"), type: "text", label: "Full name", mapTo: "name", required: true, width: "full" },
      { id: id("fld"), type: "email", label: "Work email", mapTo: "email", required: true, width: "full" },
      { id: id("fld"), type: "text", label: "Company", mapTo: "company", required: false, width: "full" },
      { id: id("fld"), type: "consent", label: "I agree to receive marketing communications.", required: true, width: "full" },
    ],
  },
};

// ── folders ───────────────────────────────────────────────────────────────
export const LANDING_PAGE_FOLDERS: LandingPageFolder[] = [
  { id: "fld-q3", name: "Q3 Campaigns" },
  { id: "fld-events", name: "Events & Webinars" },
  { id: "fld-content", name: "Content & Gated Assets" },
  { id: "fld-product", name: "Product Launches" },
];

// ── analytics generator ─────────────────────────────────────────────────
function analytics(views: number, rate: number): LandingAnalytics {
  const submissions = Math.round((views * rate) / 100);
  const days = ["Jul 6", "Jul 7", "Jul 8", "Jul 9", "Jul 10", "Jul 11", "Jul 12"];
  const weights = [0.11, 0.16, 0.14, 0.13, 0.18, 0.15, 0.13];
  return {
    views,
    uniqueVisitors: Math.round(views * 0.82),
    submissions,
    conversionRate: rate,
    bounceRate: Math.round(38 + Math.random() * 12),
    avgTimeSeconds: Math.round(45 + Math.random() * 90),
    daily: days.map((date, i) => ({
      date,
      views: Math.round(views * weights[i]),
      submissions: Math.round(submissions * weights[i]),
    })),
    sources: [
      { source: "Paid search", views: Math.round(views * 0.34), conversionRate: rate + 2.1 },
      { source: "Email", views: Math.round(views * 0.27), conversionRate: rate + 4.4 },
      { source: "Organic", views: Math.round(views * 0.21), conversionRate: rate - 1.2 },
      { source: "Social", views: Math.round(views * 0.11), conversionRate: rate - 2.6 },
      { source: "Direct", views: Math.round(views * 0.07), conversionRate: rate - 0.4 },
    ],
    devices: [
      { device: "desktop", share: 58 },
      { device: "mobile", share: 36 },
      { device: "tablet", share: 6 },
    ],
    submissionsList: [
      { id: id("sub"), name: "Amara Okafor", email: "amara@northwind.io", submittedAt: "2026-07-12T09:14:00Z", source: "Email", device: "desktop" },
      { id: id("sub"), name: "Diego Ramirez", email: "d.ramirez@globex.com", submittedAt: "2026-07-12T08:02:00Z", source: "Paid search", device: "mobile" },
      { id: id("sub"), name: "Sana Patel", email: "sana.p@initech.dev", submittedAt: "2026-07-11T17:41:00Z", source: "Organic", device: "desktop" },
      { id: id("sub"), name: "Lucas Meyer", email: "lucas@hooli.com", submittedAt: "2026-07-11T14:20:00Z", source: "Social", device: "mobile" },
      { id: id("sub"), name: "Wei Chen", email: "wei.chen@umbrella.co", submittedAt: "2026-07-11T11:05:00Z", source: "Email", device: "tablet" },
    ],
  };
}

// ── reusable starter sections ─────────────────────────────────────────────
const heroLeadGen = section({
  content: [[
    heading("Turn more visitors into qualified leads", 1),
    text("Connect Reach helps growth teams launch high-converting landing pages in minutes — no code required."),
    button("Get started free"),
  ]],
  background: { type: "gradient", gradientFrom: "#eef2ff", gradientTo: "#ffffff" },
  paddingY: "xl",
});

const logoStrip = section({
  content: [[{ id: id("blk"), type: "logos", logos: ["Northwind", "Globex", "Initech", "Umbrella", "Hooli"] }]],
  paddingY: "md",
});

const statsSection = section({
  content: [[{
    id: id("blk"), type: "stats", stats: [
      { id: id("st"), value: "3.2x", label: "Avg conversion lift" },
      { id: id("st"), value: "12 min", label: "To first publish" },
      { id: id("st"), value: "18k+", label: "Pages launched" },
    ],
  }]],
});

const formSection = section({
  content: [
    [heading("See it in action", 2), text("Book a personalized walkthrough with our team."), { id: id("blk"), type: "list", items: ["No credit card required", "Full access for 14 days", "Cancel anytime"] }],
    [leadForm],
  ],
  columns: 2,
  background: { type: "color", color: "#f8fafc" },
});

// ── templates gallery ─────────────────────────────────────────────────────
export const LANDING_PAGE_TEMPLATES: LandingPageTemplate[] = [
  {
    id: "tpl-leadgen",
    name: "Lead-gen classic",
    description: "Hero, social proof, and a two-column capture form. The dependable workhorse.",
    category: "lead-gen",
    accent: "#6366f1",
    sections: [heroLeadGen, logoStrip, statsSection, formSection],
  },
  {
    id: "tpl-webinar",
    name: "Webinar registration",
    description: "Countdown, speaker bios, and a registration form for live or on-demand sessions.",
    category: "webinar",
    accent: "#0ea5e9",
    sections: [
      section({ content: [[heading("Live webinar: Scaling GTM in 2026", 1), text("Thursday, July 24 · 11:00 AM ET · 45 minutes"), { id: id("blk"), type: "countdown", countdownTo: "", align: "center" }, button("Save my seat")]], background: { type: "gradient", gradientFrom: "#e0f2fe", gradientTo: "#ffffff" }, paddingY: "xl" }),
      formSection,
    ],
  },
  {
    id: "tpl-ebook",
    name: "Gated eBook",
    description: "Cover image, benefit checklist, and a download gate. Great for content offers.",
    category: "ebook",
    accent: "#f59e0b",
    sections: [
      section({ content: [[heading("The 2026 Playbook for Modern CRMs", 1), text("42 pages of tactics from teams growing 3x year over year.")]], paddingY: "lg" }),
      formSection,
    ],
  },
  {
    id: "tpl-event",
    name: "Event landing",
    description: "Agenda, venue, and RSVP form for in-person or hybrid events.",
    category: "event",
    accent: "#ec4899",
    sections: [heroLeadGen, formSection],
  },
  {
    id: "tpl-product",
    name: "Product launch",
    description: "Feature grid, pricing table, and testimonials to drive sign-ups.",
    category: "product",
    accent: "#10b981",
    sections: [
      heroLeadGen,
      section({ content: [[{ id: id("blk"), type: "pricing", pricing: [
        { id: id("t"), name: "Starter", price: "$0", period: "/mo", features: ["1 seat", "Basic reports"], ctaLabel: "Start free" },
        { id: id("t"), name: "Growth", price: "$49", period: "/mo", features: ["5 seats", "Automations", "Priority support"], ctaLabel: "Choose Growth", highlighted: true },
        { id: id("t"), name: "Scale", price: "$149", period: "/mo", features: ["Unlimited seats", "SSO", "Dedicated CSM"], ctaLabel: "Contact sales" },
      ] }]] }),
    ],
  },
  {
    id: "tpl-comingsoon",
    name: "Coming soon",
    description: "Minimal teaser with an email-capture waitlist and countdown.",
    category: "coming-soon",
    accent: "#8b5cf6",
    sections: [
      section({ content: [[heading("Something big is coming", 1), text("Join the waitlist and be the first to know."), { id: id("blk"), type: "countdown", countdownTo: "", align: "center" }, leadForm]], background: { type: "gradient", gradientFrom: "#f5f3ff", gradientTo: "#ffffff" }, paddingY: "xl" }),
    ],
  },
  {
    id: "tpl-thankyou",
    name: "Thank you",
    description: "Confirmation page with next steps and social share.",
    category: "thank-you",
    accent: "#64748b",
    sections: [
      section({ content: [[heading("You're all set! 🎉", 1), text("We've emailed your confirmation. While you wait, follow us for updates."), { id: id("blk"), type: "socialIcons", socials: ["twitter", "linkedin", "instagram"], align: "center" }]], paddingY: "xl" }),
    ],
  },
  {
    id: "tpl-blank",
    name: "Blank page",
    description: "Start from an empty canvas and build exactly what you need.",
    category: "product",
    accent: "#94a3b8",
    sections: [],
  },
];

// ── live pages ──────────────────────────────────────────────────────────
function page(partial: Partial<LandingPage> & Pick<LandingPage, "name" | "status" | "type" | "slug" | "sections" | "analytics">): LandingPage {
  return {
    id: id("page"),
    domain: "go.connect-nx.com",
    owner: "Priya Sharma",
    accent: "#6366f1",
    theme: { primaryColor: "#6366f1", fontFamily: "sans", buttonRadius: "md", contentWidth: "normal" },
    seo: { slug: partial.slug, title: partial.name, metaDescription: "", language: "en" },
    tracking: { cookieBanner: true },
    revisions: [
      { id: id("rev"), label: "Current draft", author: "Priya Sharma", createdAt: "2026-07-12T08:00:00Z", current: true },
      { id: id("rev"), label: "Copy tweaks", author: "Marco Diaz", createdAt: "2026-07-10T15:30:00Z" },
      { id: id("rev"), label: "Initial version", author: "Priya Sharma", createdAt: "2026-07-08T09:00:00Z" },
    ],
    createdAt: "2026-07-08T09:00:00Z",
    updatedAt: "2026-07-12T08:00:00Z",
    ...partial,
  };
}

export const MOCK_LANDING_PAGES: LandingPage[] = [
  page({
    name: "2026 CRM Playbook — eBook",
    status: "published",
    type: "ebook",
    slug: "crm-playbook-2026",
    folderId: "fld-content",
    campaignId: "camp-content",
    accent: "#f59e0b",
    theme: { primaryColor: "#f59e0b", fontFamily: "sans", buttonRadius: "md", contentWidth: "normal" },
    publishedAt: "2026-07-09T12:00:00Z",
    sections: [heroLeadGen, logoStrip, formSection],
    seo: { slug: "crm-playbook-2026", title: "Download the 2026 CRM Playbook", metaDescription: "42 pages of GTM tactics from high-growth teams.", ogImageUrl: "", language: "en" },
    tracking: { gaMeasurementId: "G-XXXX1234", metaPixelId: "1029384756", cookieBanner: true },
    analytics: analytics(8420, 21.4),
  }),
  page({
    name: "Scaling GTM Webinar — July",
    status: "published",
    type: "webinar",
    slug: "gtm-webinar-july",
    folderId: "fld-events",
    accent: "#0ea5e9",
    theme: { primaryColor: "#0ea5e9", fontFamily: "sans", buttonRadius: "full", contentWidth: "normal" },
    publishedAt: "2026-07-05T10:00:00Z",
    sections: [
      section({ content: [[heading("Live webinar: Scaling GTM in 2026", 1), text("Thursday, July 24 · 11:00 AM ET"), { id: id("blk"), type: "countdown", countdownTo: "2026-07-24T15:00", align: "center" }, button("Save my seat")]], background: { type: "gradient", gradientFrom: "#e0f2fe", gradientTo: "#ffffff" }, paddingY: "xl" }),
      formSection,
    ],
    abTest: {
      enabled: true,
      goal: "form_submit",
      status: "running",
      variants: [
        { id: "var-a", label: "A — Control", weight: 50, isControl: true, views: 2110, conversions: 412, sections: [] },
        { id: "var-b", label: "B — Urgency headline", weight: 50, views: 2043, conversions: 486, sections: [] },
      ],
    },
    analytics: analytics(4210, 19.6),
  }),
  page({
    name: "Product Launch — Connect Reach",
    status: "scheduled",
    type: "product",
    slug: "connect-reach-launch",
    folderId: "fld-product",
    accent: "#10b981",
    theme: { primaryColor: "#10b981", fontFamily: "sans", buttonRadius: "md", contentWidth: "wide" },
    scheduledFor: "2026-07-18T13:00:00Z",
    sections: [heroLeadGen, statsSection],
    analytics: analytics(0, 0),
  }),
  page({
    name: "Free Trial Signup",
    status: "published",
    type: "lead-gen",
    slug: "free-trial",
    folderId: "fld-q3",
    publishedAt: "2026-06-20T09:00:00Z",
    sections: [heroLeadGen, logoStrip, formSection],
    analytics: analytics(15230, 28.9),
  }),
  page({
    name: "Coming Soon — AI Studio",
    status: "draft",
    type: "coming-soon",
    slug: "ai-studio-teaser",
    folderId: "fld-product",
    accent: "#8b5cf6",
    theme: { primaryColor: "#8b5cf6", fontFamily: "sans", buttonRadius: "full", contentWidth: "narrow" },
    sections: [
      section({ content: [[heading("Something big is coming", 1), text("Join the waitlist."), leadForm]], background: { type: "gradient", gradientFrom: "#f5f3ff", gradientTo: "#ffffff" }, paddingY: "xl" }),
    ],
    analytics: analytics(0, 0),
  }),
  page({
    name: "Spring Event 2026 (archived)",
    status: "archived",
    type: "event",
    slug: "spring-event-2026",
    folderId: "fld-events",
    accent: "#ec4899",
    sections: [heroLeadGen],
    analytics: analytics(6100, 16.2),
  }),
];

/** Leadmeter-style optimization checklist evaluated live in the builder. */
export interface OptimizationCheck {
  id: string;
  label: string;
  category: "Structure" | "CTA" | "Readability" | "Conversion";
}

export const OPTIMIZATION_CHECKS: OptimizationCheck[] = [
  { id: "headline", label: "Page has a clear H1 headline", category: "Structure" },
  { id: "cta", label: "At least one call-to-action button", category: "CTA" },
  { id: "form", label: "A lead-capture form is present", category: "Conversion" },
  { id: "proof", label: "Includes social proof (logos, stats, or testimonials)", category: "Conversion" },
  { id: "media", label: "Contains a supporting image or video", category: "Readability" },
  { id: "length", label: "Body copy is concise and scannable", category: "Readability" },
  { id: "seo", label: "SEO title and meta description are set", category: "Structure" },
  { id: "ogimage", label: "Social share image is configured", category: "Structure" },
];
