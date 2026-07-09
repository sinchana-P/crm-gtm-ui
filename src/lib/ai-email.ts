import type {
  AiDraftContext,
  AiDraftSection,
  AiRewriteAction,
  AiSubjectOption,
  AiTone,
} from "@/lib/types";

/**
 * Deterministic, UI-only "AI" email generation. No network, no randomness —
 * given the same inputs it always returns the same believable output, so the
 * mock behaves predictably and swaps cleanly for a real model later.
 */

export const AI_TONES: { value: AiTone; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "playful", label: "Playful" },
  { value: "concise", label: "Concise" },
  { value: "persuasive", label: "Persuasive" },
  { value: "empathetic", label: "Empathetic" },
];

export const REWRITE_ACTIONS: { value: AiRewriteAction; label: string; hint: string }[] = [
  { value: "shorten", label: "Shorten", hint: "Tighten to the essentials" },
  { value: "expand", label: "Expand", hint: "Add more detail" },
  { value: "formalize", label: "More formal", hint: "Professional register" },
  { value: "casual", label: "More casual", hint: "Warmer, conversational" },
  { value: "strengthen_cta", label: "Strengthen CTA", hint: "Punchier call to action" },
  { value: "brand_voice", label: "Apply brand voice", hint: "Match your org's tone" },
];

function cap(s: string) {
  const t = s.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

function subjectVariantsFor(ctx: AiDraftContext): { text: string; rationale: string }[] {
  const km = cap(ctx.keyMessage || ctx.goal || "your update");
  const aud = ctx.audience || "you";
  const short = (ctx.keyMessage || ctx.goal || "a quick update").toLowerCase();
  switch (ctx.tone) {
    case "playful":
      return [
        { text: `👀 ${km} (you'll want to see this)`, rationale: "Curiosity + emoji lifts open rates on playful sends." },
        { text: `Psst… ${short} inside`, rationale: "Conversational hook feels personal." },
        { text: `${km} — no boring bits, promise`, rationale: "Sets an informal, low-friction tone." },
        { text: `Your ${aud.split(" ")[0]} fix is here`, rationale: "Benefit-led and light." },
      ];
    case "professional":
      return [
        { text: km, rationale: "Clear and direct — professional audiences skim." },
        { text: `${km}: what it means for ${aud}`, rationale: "Signals relevance to the segment." },
        { text: `A quick note on ${short}`, rationale: "Low-pressure, respectful of time." },
        { text: `${km} — details inside`, rationale: "Straightforward value promise." },
      ];
    case "persuasive":
      return [
        { text: `Don't miss out: ${short}`, rationale: "Loss-aversion framing drives urgency." },
        { text: `${km} — before it's gone`, rationale: "Scarcity nudge." },
        { text: `The one email about ${short} you should open`, rationale: "Confident, high-intent framing." },
        { text: `${cap(aud)}, here's why ${short} matters`, rationale: "Personalized + reason-why." },
      ];
    case "concise":
      return [
        { text: km, rationale: "Minimal — nothing to parse." },
        { text: short, rationale: "Ultra-short lowercase reads as personal." },
        { text: `${km} ↓`, rationale: "Arrow implies quick scan." },
        { text: `re: ${short}`, rationale: "Reply-style subjects feel 1:1." },
      ];
    case "empathetic":
      return [
        { text: `We've been thinking about ${short}`, rationale: "Warm, human opener." },
        { text: `Here to help with ${short}`, rationale: "Supportive framing." },
        { text: `${cap(aud)} — a little something for you`, rationale: "Personal and caring." },
        { text: `No pressure: ${short} whenever you're ready`, rationale: "Reduces anxiety, invites at own pace." },
      ];
    default: // friendly
      return [
        { text: `${km} 🎉`, rationale: "Upbeat with a single tasteful emoji." },
        { text: `Hey — ${short}`, rationale: "Casual greeting reads 1:1." },
        { text: `Good news about ${short}`, rationale: "Positive framing lifts opens." },
        { text: `${cap(aud)}, ${short} is here`, rationale: "Personalized to the audience." },
      ];
  }
}

export function generateSubjects(ctx: AiDraftContext): AiSubjectOption[] {
  const variants = subjectVariantsFor(ctx);
  const km = (ctx.keyMessage || ctx.goal || "the update").toLowerCase();
  return variants.map((v, i) => ({
    id: `subj-${i}`,
    text: v.text,
    preheader: i === 0 ? `${cap(km)} — here's everything you need in 30 seconds.` : `Open for the details on ${km}.`,
    rationale: v.rationale,
  }));
}

export function generateSections(ctx: AiDraftContext): AiDraftSection[] {
  const km = ctx.keyMessage || ctx.goal || "our latest update";
  const aud = ctx.audience || "there";
  const cta = ctx.cta || "Learn more";
  const bodyDepth = ctx.length === "short" ? 1 : ctx.length === "long" ? 3 : 2;

  const paragraphs: string[] = [
    `We wanted to reach out because ${km.toLowerCase()} — and given what ${aud.toLowerCase()} care about, we thought you'd want to be the first to know.`,
    `Here's the short version: it's designed to save you time and get you results faster, with none of the busywork. Everything you need is a click away.`,
    `Teams like yours have already seen a real difference — and we've made it effortless to get started, so there's nothing standing between you and the outcome.`,
  ].slice(0, bodyDepth);

  const sections: AiDraftSection[] = [
    { id: "sec-greeting", kind: "greeting", label: "Greeting", text: "Hi {{firstName}}," },
    ...paragraphs.map((p, i) => ({
      id: `sec-para-${i}`,
      kind: "paragraph" as const,
      label: `Body ${i + 1}`,
      text: p,
    })),
    { id: "sec-cta", kind: "cta", label: "Call to action", text: `${cta} →` },
    { id: "sec-signoff", kind: "signoff", label: "Sign-off", text: "Warmly,\nThe Connect NX team" },
  ];
  return sections;
}

/** Regenerate one section into an alternate phrasing (variant cycles). */
export function regenerateSection(section: AiDraftSection, ctx: AiDraftContext, variant: number): AiDraftSection {
  const km = (ctx.keyMessage || ctx.goal || "this").toLowerCase();
  const cta = ctx.cta || "Get started";
  const pools: Record<string, string[]> = {
    greeting: ["Hi {{firstName}},", "Hey {{firstName}} 👋", "Hello {{firstName}},", "{{firstName}}, quick one —"],
    paragraph: [
      `A quick heads-up: ${km} is here, and it's built for exactly what you're working on.`,
      `We've been busy — ${km} just landed, and it's the upgrade you've been waiting for.`,
      `Big news worth 20 seconds of your day: ${km}. Here's why it matters to you.`,
      `Straight to it — ${km}. No fluff, just the part that helps you move faster.`,
    ],
    cta: [`${cta} →`, `👉 ${cta}`, `${cta} — it takes 2 minutes`, `Ready? ${cta}`],
    signoff: ["Warmly,\nThe Connect NX team", "Cheers,\nTeam Connect NX", "Talk soon,\nConnect NX", "Best,\nThe Connect NX crew"],
  };
  const pool = pools[section.kind] ?? pools.paragraph;
  return { ...section, text: pool[variant % pool.length] };
}

export function rewriteText(text: string, action: AiRewriteAction, brandSignature?: string): string {
  const clean = text.trim();
  switch (action) {
    case "shorten": {
      const first = clean.split(/(?<=[.!?])\s/)[0] ?? clean;
      return first.length < clean.length ? first : clean.slice(0, Math.max(40, Math.floor(clean.length * 0.6))).trim() + "…";
    }
    case "expand":
      return `${clean} And because it's built into your workflow, there's nothing new to learn — you'll be up and running in minutes, not days.`;
    case "formalize":
      return clean
        .replace(/\bhey\b/gi, "Hello")
        .replace(/\bwanna\b/gi, "would like to")
        .replace(/\bthanks\b/gi, "Thank you")
        .replace(/\bgot\b/gi, "have")
        .replace(/!+/g, ".")
        .replace(/👋|🎉|👀|👉/g, "")
        .trim();
    case "casual":
      return `${clean.replace(/\.$/, "")} — and honestly, it's a bit of a game-changer 🙌`;
    case "strengthen_cta":
      return `${clean.replace(/[→.\s]+$/, "")} today — limited spots, don't wait →`;
    case "brand_voice":
      return `${clean}${brandSignature ? `\n\n${brandSignature}` : ""}`;
    default:
      return clean;
  }
}

/** Plain-text assembly of a draft, for "copy" / preview. */
export function assembleDraft(sections: AiDraftSection[]): string {
  return sections.map((s) => s.text).join("\n\n");
}
