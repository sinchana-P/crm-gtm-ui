"use client";

import { useRef, useState } from "react";
import { RefreshCw, Send, Sparkles } from "lucide-react";
import type { ChatbotIntent, ChatbotWidget } from "@/lib/types";

type PlaygroundMsg = {
  id: string;
  role: "bot" | "visitor" | "system";
  text: string;
  lead?: boolean;
};

type Reply = { text: string; kind?: "lead" | "handoff" };

/** Deterministic, UI-only response engine grounded in the bot's intents + a small demo KB. */
function botReply(text: string, intents: ChatbotIntent[]): Reply {
  const q = text.toLowerCase();
  if (/(price|pricing|cost|how much|\bplan)/.test(q))
    return { text: "Our Pro plan is ₹4,999/month billed annually — segmentation, sequences, and automations included. Want me to set up a quick demo?" };
  if (/(demo|book|schedule|sales|talk to sales)/.test(q))
    return { text: "Happy to set that up! What's the best email to send the invite to?", kind: "lead" };
  if (/(integrat|\bapi\b|webhook|slack|zapier)/.test(q))
    return { text: "Yes — Connect NX has native integrations (Slack, Zapier, webhooks) and a full REST API. Guide: connectnx.io/docs/integrations." };
  if (/(discount|coupon|cheaper|startup)/.test(q))
    return { text: "Startups under 2 years old get 30% off the first year. Want me to check your eligibility?" };
  if (/(secur|gdpr|soc\s?2|compliance|privacy)/.test(q))
    return { text: "Connect NX is SOC 2 Type II certified and GDPR-compliant. Details at connectnx.io/security." };
  if (/(broken|bug|not working|error|issue|help me|support)/.test(q))
    return { text: "I'm sorry you're running into that — let me connect you with a specialist right away.", kind: "handoff" };
  if (/(human|\bagent\b|real person|representative|someone)/.test(q))
    return { text: "Of course — connecting you with the team now.", kind: "handoff" };

  for (const intent of intents) {
    const hit = intent.examples.some((e) => {
      const first = e?.toLowerCase().split(" ")[0];
      return first && q.includes(first);
    }) || q.includes(intent.name.toLowerCase());
    if (hit) {
      if (intent.action === "capture_lead")
        return { text: `Great — I can help with ${intent.name.toLowerCase()}. What's your email so I can follow up?`, kind: "lead" };
      if (intent.action === "handoff")
        return { text: `Let me route you to ${intent.target ?? "our team"} — one moment.`, kind: "handoff" };
      if (intent.action === "link")
        return { text: `Here's a resource that should help: ${intent.target ?? "connectnx.io/docs"}` };
      return { text: `Here's what I found about ${intent.name}. Anything else I can help with?` };
    }
  }
  return { text: "I'm not certain about that one yet — want me to connect you with the team, or you could rephrase?" };
}

export function ChatbotPlayground({
  widget,
  intents,
}: {
  widget: ChatbotWidget;
  intents: ChatbotIntent[];
}) {
  const color = widget.themeColor || "#2563eb";
  const idRef = useRef(0);
  const nextId = () => `pm${(idRef.current += 1)}`;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const initial = (): PlaygroundMsg[] => [
    { id: "welcome", role: "bot", text: widget.welcomeMessage || "Hi! How can I help?" },
  ];
  const [messages, setMessages] = useState<PlaygroundMsg[]>(initial);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  function send(raw: string) {
    const text = raw.trim();
    if (!text || typing) return;
    setInput("");
    setMessages((m) => [...m, { id: nextId(), role: "visitor", text }]);
    setTyping(true);
    const reply = botReply(text, intents);
    const t = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId(), role: "bot", text: reply.text, lead: reply.kind === "lead" }]);
      if (reply.kind === "handoff") {
        const t2 = setTimeout(() => {
          setMessages((m) => [
            ...m,
            { id: nextId(), role: "system", text: "Handed off to a human agent · added to the marketing inbox" },
            { id: nextId(), role: "bot", text: "A specialist will jump in here shortly. Anything else meanwhile?" },
          ]);
        }, 700);
        timers.current.push(t2);
      }
    }, 650);
    timers.current.push(t);
  }

  function reset() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    idRef.current = 0;
    setTyping(false);
    setInput("");
    setMessages(initial());
  }

  return (
    <div className="rounded-xl border bg-gradient-to-b from-muted/30 to-muted/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5" /> Live preview — try it
        </span>
        <button type="button" onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <RefreshCw className="size-3" /> Reset
        </button>
      </div>

      <div className="mx-auto flex h-[440px] w-full max-w-[340px] flex-col overflow-hidden rounded-2xl border bg-white shadow-xl">
        {/* header */}
        <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ backgroundColor: color }}>
          <span className="flex size-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
            {widget.avatarInitials || "AI"}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{widget.botName || "Assistant"}</p>
            <p className="text-[11px] text-white/80">{widget.headerSubtitle || "Online"}</p>
          </div>
        </div>

        {/* messages */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 px-3 py-4">
          {messages.map((m) =>
            m.role === "system" ? (
              <p key={m.id} className="text-center text-[11px] text-neutral-400">— {m.text} —</p>
            ) : m.role === "visitor" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-3 py-2 text-xs text-white" style={{ backgroundColor: color }}>
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="space-y-2">
                <div className="flex gap-2">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: color }}>
                    {widget.avatarInitials || "AI"}
                  </span>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-xs text-neutral-700 shadow-sm">
                    {m.text}
                  </div>
                </div>
                {m.lead && (
                  <div className="ml-8 w-[85%] space-y-2 rounded-2xl bg-white px-3 py-2.5 shadow-sm">
                    <input disabled placeholder="you@company.com" className="w-full rounded-md border px-2.5 py-1.5 text-[11px] text-neutral-500 outline-none" />
                    <div className="rounded-md px-2.5 py-1.5 text-center text-[11px] font-medium text-white" style={{ backgroundColor: color }}>
                      Send
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* suggested prompts (only before the visitor speaks) */}
          {messages.length === 1 && widget.suggestedPrompts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pl-8">
              {widget.suggestedPrompts.slice(0, 4).map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => send(p)}
                  className="rounded-full border bg-white px-2.5 py-1 text-[11px] text-neutral-700 shadow-sm transition-colors hover:border-neutral-400"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {typing && (
            <div className="flex items-center gap-1.5 pl-8">
              <span className="flex gap-1 rounded-2xl bg-white px-3 py-2 shadow-sm">
                <span className="size-1.5 animate-pulse rounded-full bg-neutral-300" />
                <span className="size-1.5 animate-pulse rounded-full bg-neutral-300 [animation-delay:150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-neutral-300 [animation-delay:300ms]" />
              </span>
            </div>
          )}
        </div>

        {/* input */}
        <form
          className="flex items-center gap-2 border-t bg-white px-3 py-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="flex-1 bg-transparent text-xs text-neutral-700 outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="flex size-7 items-center justify-center rounded-full text-white disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            <Send className="size-3.5" />
          </button>
        </form>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Simulated responses for preview — grounded in this bot&rsquo;s intents &amp; knowledge.
      </p>
    </div>
  );
}
