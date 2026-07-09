"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { RefreshCw, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MOCK_CAMPAIGNS, MOCK_CONTACTS } from "@/lib/mock-data";
import { contactName } from "@/lib/format";
import { cn } from "@/lib/utils";

type CopilotMsg = { id: string; role: "ai" | "user"; text: string };

type Context = {
  label: string;
  prompts: string[];
};

/** Derive the copilot's working context from the current route. */
function useCopilotContext(pathname: string): Context {
  return useMemo(() => {
    if (/^\/(leads|contacts|customers)\/[^/]+$/.test(pathname))
      return {
        label: "this contact",
        prompts: ["Summarize this contact", "Draft a follow-up email", "What's the next best action?"],
      };
    if (pathname.startsWith("/marketing/campaigns"))
      return {
        label: "campaigns",
        prompts: ["Which campaign performed best?", "Summarize campaign performance", "Suggest a subject line"],
      };
    if (pathname.startsWith("/marketing/segments"))
      return {
        label: "segments",
        prompts: ["Which segment is growing fastest?", "Suggest a new segment", "How big is my best segment?"],
      };
    if (pathname.startsWith("/marketing"))
      return {
        label: "marketing",
        prompts: ["How are my emails performing?", "Draft a campaign", "Find contacts to re-engage"],
      };
    return {
      label: "your CRM",
      prompts: ["Find my hottest leads", "What needs my attention today?", "Summarize this week"],
    };
  }, [pathname]);
}

/** Deterministic, UI-only copilot responses grounded in mock CRM data. */
function copilotReply(text: string, ctx: Context): string {
  const q = text.toLowerCase();
  const topLeads = [...MOCK_CONTACTS].sort((a, b) => b.leadScore - a.leadScore).slice(0, 3);
  const topContact = topLeads[0];

  if (/(hot|top|best).*lead|find.*lead|lead/.test(q))
    return `Your 3 hottest leads right now:\n\n${topLeads
      .map((c, i) => `${i + 1}. ${contactName(c.firstName, c.lastName)} — score ${c.leadScore}, ${c.company ?? "—"}`)
      .join("\n")}\n\nWant me to draft an intro email to the top one?`;

  if (/summar/.test(q) && ctx.label === "this contact")
    return `${contactName(topContact.firstName, topContact.lastName)} is a ${topContact.lifecycleStage.toUpperCase()} at ${topContact.company ?? "—"} (lead score ${topContact.leadScore}). Last activity: ${topContact.lastActivity}. They've opened ${topContact.engagement.emailsOpened} of ${topContact.engagement.emailsSent} emails. Suggested next step: send a personalized follow-up and offer a demo.`;

  if (/(draft|write|compose).*email|follow.?up/.test(q))
    return `Here's a draft:\n\nSubject: Quick follow-up, ${topContact.firstName}\n\nHi ${topContact.firstName}, thanks for your interest in Connect NX. Based on what ${topContact.company ?? "your team"} is working on, I'd love to show you how our segmentation and sequences fit. Do you have 15 minutes this week?\n\n— Priya\n\nWant me to tweak the tone or add a meeting link?`;

  if (/campaign/.test(q)) {
    const best = [...MOCK_CAMPAIGNS].filter((c) => c.sent > 0).sort((a, b) => b.opened / b.sent - a.opened / a.sent)[0];
    return best
      ? `“${best.name}” is your top performer — ${((best.opened / best.sent) * 100).toFixed(1)}% open rate across ${best.sent.toLocaleString()} sends, ${best.converted} conversions. Its segment was "${best.segmentName}". Want to clone it for a new send?`
      : "You don't have any sent campaigns yet — want me to help you draft one?";
  }

  if (/segment/.test(q))
    return `Your fastest-growing segment is "Active Leads Q2" (+128 this week, 2,450 members). "High-intent demo requesters" is also up 26. Want me to build a lookalike of your best one?`;

  if (/(attention|today|overdue|task|next)/.test(q))
    return `Today's focus: 3 overdue follow-ups, 2 hot leads that just crossed score 80, and 1 SLA-risk case. Start with ${contactName(topContact.firstName, topContact.lastName)} — highest score and went quiet 2 days ago.`;

  if (/(week|performance|how.*doing|summar)/.test(q))
    return `This week: 186 new contacts, health average up 2 pts to 74, and your Weekly Nurture Digest drove 118 conversions. Email open rate is holding at ~45%. One watch-item: the win-back sequence's reply rate dropped to 8.8%.`;

  return `I can help with ${ctx.label} — try asking me to find leads, summarize a record, draft an email, or analyze campaign performance. (This is a preview copilot with simulated answers.)`;
}

export function CrmCopilot() {
  const pathname = usePathname();
  const ctx = useCopilotContext(pathname);
  const [open, setOpen] = useState(false);
  const idRef = useRef(0);
  const nextId = () => `c${(idRef.current += 1)}`;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const greeting = (): CopilotMsg[] => [
    { id: "greet", role: "ai", text: "Hi Priya 👋 I'm your Connect AI copilot. Ask me about your contacts, campaigns, or what needs attention." },
  ];
  const [messages, setMessages] = useState<CopilotMsg[]>(greeting);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function send(raw: string) {
    const text = raw.trim();
    if (!text || thinking) return;
    setInput("");
    setMessages((m) => [...m, { id: nextId(), role: "user", text }]);
    setThinking(true);
    const reply = copilotReply(text, ctx);
    const t = setTimeout(() => {
      setThinking(false);
      setMessages((m) => [...m, { id: nextId(), role: "ai", text: reply }]);
    }, 600);
    timers.current.push(t);
  }

  function reset() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    idRef.current = 0;
    setThinking(false);
    setInput("");
    setMessages(greeting());
  }

  return (
    <>
      {/* Global launcher */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105"
        data-testid="copilot-launcher"
      >
        <Sparkles className="size-4" />
        Ask AI
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div className="flex-1">
                <SheetTitle className="text-sm">Connect AI</SheetTitle>
                <SheetDescription className="text-xs">Context: {ctx.label}</SheetDescription>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={reset} title="New chat">
                <RefreshCw className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                    m.role === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted text-foreground"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <span className="flex gap-1 rounded-2xl bg-muted px-3 py-2.5">
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/50" />
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </span>
              </div>
            )}

            {messages.length === 1 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Suggested</p>
                {ctx.prompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    className="block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t px-3 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${ctx.label}…`}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="icon-sm" disabled={!input.trim() || thinking}>
              <Send className="size-4" />
            </Button>
          </form>
          <p className="px-4 pb-3 text-center text-[11px] text-muted-foreground">
            Preview copilot · simulated answers grounded in your CRM data
          </p>
        </SheetContent>
      </Sheet>
    </>
  );
}
