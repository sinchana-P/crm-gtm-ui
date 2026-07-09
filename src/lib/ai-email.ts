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

/**
 * Draft a contextual reply to an inbound message (the real-world inbox use case).
 * Deterministic: intent is detected from the message, and `variant` cycles
 * alternate phrasings for "regenerate". UI-only.
 */
export function draftReply(
  incoming: { contactName: string; subject: string; preview: string },
  variant: number,
  signature = "Best,\nPriya"
): string {
  const q = `${incoming.subject} ${incoming.preview}`.toLowerCase();
  const first = incoming.contactName.split(" ")[0] || "there";

  const bodies: string[] = (() => {
    if (/(schedule|call|meeting|next week|book|catch up|hop on|time to talk)/.test(q))
      return [
        "Thanks for the note! I'd be glad to hop on a call. Does Tuesday or Wednesday next week between 11am and 2pm work for you? Share what suits and I'll send a calendar invite.",
        "Absolutely, let's set up a call. I have a few openings next week — would Tuesday 11:30am or Wednesday 3pm work? Happy to flex around your schedule.",
      ];
    if (/(discount|bulk|pricing|price|offer|quote|%|cost)/.test(q))
      return [
        "Great question — yes, the offer applies to bulk orders, and I can pull together a custom quote for your volume. Roughly how many units or seats are you considering?",
        "Happy to help with pricing. Bulk orders qualify for additional savings on top of the current offer — if you tell me your expected volume, I'll send exact numbers today.",
      ];
    if (/(demo|credential|access|login|sign in|password)/.test(q))
      return [
        "Apologies for the delay! I've just re-sent your demo credentials to this address — you should see them within a few minutes. If they don't arrive, reply here and I'll set you up manually.",
        "Sorry about that — your demo access is on its way now. Please check your inbox (and spam just in case). If anything's still off, I'll jump on a quick screen-share to get you in.",
      ];
    if (/(brochure|info|information|details|resource|deck|one.?pager)/.test(q))
      return [
        "Glad that was useful! I'd be happy to walk you through anything in more detail — would a quick 15-minute call this week help, or shall I send a tailored summary first?",
        "Thanks for taking a look! If it's helpful, I can put together a short summary focused on your use case, or we can jump on a quick call — whichever you prefer.",
      ];
    return [
      "Thanks for reaching out! Let me look into this and get back to you shortly. In the meantime, is there anything specific I can help clarify?",
      "Appreciate you getting in touch — I'm on it and will follow up soon. Anything else you'd like me to include when I do?",
    ];
  })();

  const body = bodies[variant % bodies.length];
  return `Hi ${first},\n\n${body}\n\n${signature}`;
}

export const REPLY_REFINE_ACTIONS: { value: AiRewriteAction; label: string }[] = [
  { value: "shorten", label: "Shorten" },
  { value: "formalize", label: "More formal" },
  { value: "casual", label: "Friendlier" },
];
