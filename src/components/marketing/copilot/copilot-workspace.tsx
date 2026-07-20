"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getNavIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { useSegmentStore } from "@/lib/stores/segment-store";
import { MOCK_CAMPAIGN_DAILY_STATS } from "@/lib/mock-data";
import {
  CAPABILITY_META,
  SUGGESTED_PROMPTS,
  respond,
  type CopilotResponse,
} from "@/lib/marketing-copilot";
import {
  AiAvatar,
  ACCENTS,
  ThinkingBubble,
} from "@/components/marketing/copilot/copilot-shared";
import {
  CampaignDraftCard,
  CampaignInsightCard,
  SegmentDraftCard,
  SegmentInsightCard,
} from "@/components/marketing/copilot/copilot-cards";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: CopilotResponse;
}

export function CopilotWorkspace() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const segments = useSegmentStore((s) => s.segments);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    // Simulate the model thinking so answers feel considered (UI-only).
    timerRef.current = setTimeout(() => {
      const response = respond(trimmed, {
        campaigns,
        segments,
        dailyStats: MOCK_CAMPAIGN_DAILY_STATS,
      });
      setMessages((m) => [
        ...m,
        { id: `a${Date.now()}`, role: "assistant", text: response.text, response },
      ]);
      setThinking(false);
    }, 650);
  }

  const started = messages.length > 0;

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100vh-13rem)] lg:flex-row">
      {/* Chat column */}
      <Card className="flex min-h-[60vh] flex-1 flex-col overflow-hidden shadow-none lg:min-h-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div className="flex items-center gap-2">
            <AiAvatar className="size-6" />
            <span className="text-sm font-medium">Marketing Copilot</span>
          </div>
          {started ? (
            <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
              <RotateCcw className="size-3.5" /> New chat
            </Button>
          ) : null}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          {!started ? <WelcomeState onPick={send} /> : null}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <AiAvatar />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-2.5 text-sm">
                    {m.text}
                  </div>
                  {m.response ? <ResponseBody response={m.response} onPick={send} /> : null}
                </div>
              </div>
            )
          )}

          {thinking ? (
            <div className="flex gap-3">
              <AiAvatar />
              <ThinkingBubble />
            </div>
          ) : null}

          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="border-t p-3">
          <div className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about performance, or describe a campaign or segment to create…"
              className="max-h-32 min-h-9 resize-none border-0 bg-transparent px-1.5 py-1.5 shadow-none focus-visible:ring-0"
              rows={1}
            />
            <Button size="icon" onClick={() => send(input)} disabled={!input.trim() || thinking}>
              <ArrowUp className="size-4" />
            </Button>
          </div>
          <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
            Copilot drafts and analyzes — it never sends or changes anything without your confirmation.
          </p>
        </div>
      </Card>

      {/* Capability rail */}
      <aside className="w-full shrink-0 space-y-3 lg:w-72 lg:overflow-y-auto">
        <p className="px-1 text-xs font-medium text-muted-foreground">What I can do</p>
        {Object.entries(CAPABILITY_META).map(([key, meta]) => {
          const Icon = getNavIcon(meta.icon);
          const accent = ACCENTS[meta.accent];
          const example = SUGGESTED_PROMPTS.find((p) => p.capability === key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => example && send(example.prompt)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                accent.border
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn("flex size-7 items-center justify-center rounded-md", accent.bg, accent.text)}>
                  <Icon className="size-4" />
                </div>
                <span className="text-sm font-medium">{meta.title}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{meta.description}</p>
            </button>
          );
        })}
      </aside>
    </div>
  );
}

function ResponseBody({
  response,
  onPick,
}: {
  response: CopilotResponse;
  onPick: (t: string) => void;
}) {
  switch (response.kind) {
    case "campaign_draft":
      return <CampaignDraftCard draft={response.draft} />;
    case "segment_draft":
      return <SegmentDraftCard draft={response.draft} />;
    case "campaign_insight":
      return <CampaignInsightCard insight={response.insight} />;
    case "segment_insight":
      return <SegmentInsightCard insight={response.insight} />;
    case "text":
      return response.suggestions ? (
        <div className="flex flex-wrap gap-2">
          {response.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-accent"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null;
  }
}

function WelcomeState({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6 text-center">
      <div className="space-y-2">
        <AiAvatar className="mx-auto size-10" />
        <h2 className="text-lg font-semibold">How can I help with marketing today?</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Describe a campaign or audience to create it, or ask a question about how your
          campaigns and segments are performing.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((p) => {
          const meta = CAPABILITY_META[p.capability];
          const accent = ACCENTS[meta.accent];
          const Icon = getNavIcon(meta.icon);
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onPick(p.prompt)}
              className="flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
            >
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", accent.bg, accent.text)}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{p.label}</p>
                <p className="truncate text-xs text-muted-foreground">{p.prompt}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
