"use client";

import { Minus, Paperclip, Send, Sparkles } from "lucide-react";
import type { ChatbotWidget } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A realistic preview of the embeddable chat widget — the launcher plus the
 * expanded chat window, rendered with the bot's live theme. UI-only.
 */
export function ChatbotWidgetPreview({
  widget,
  showLeadCard,
}: {
  widget: ChatbotWidget;
  showLeadCard?: boolean;
}) {
  const color = widget.themeColor || "#2563eb";
  return (
    <div className="rounded-xl border bg-gradient-to-b from-muted/30 to-muted/60 p-6">
      {/* faux website chrome */}
      <div className="mb-4 flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 text-xs text-muted-foreground">connectnx.io</span>
      </div>

      <div
        className={cn(
          "relative min-h-[420px]",
          widget.launcher === "bottom-left" ? "flex justify-start" : "flex justify-end"
        )}
      >
        {/* chat window */}
        <div className="flex w-[320px] flex-col overflow-hidden rounded-2xl border bg-white shadow-xl">
          {/* header */}
          <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ backgroundColor: color }}>
            <span className="flex size-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
              {widget.avatarInitials || "AI"}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{widget.botName || "Assistant"}</p>
              <p className="text-[11px] text-white/80">{widget.headerSubtitle || "Online"}</p>
            </div>
            <Minus className="size-4 opacity-80" />
          </div>

          {/* messages */}
          <div className="flex-1 space-y-3 bg-neutral-50 px-3 py-4">
            <div className="flex gap-2">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: color }}>
                {widget.avatarInitials || "AI"}
              </span>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-xs text-neutral-700 shadow-sm">
                {widget.welcomeMessage || "Hi! How can I help?"}
              </div>
            </div>

            {widget.suggestedPrompts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pl-8">
                {widget.suggestedPrompts.slice(0, 4).map((p, i) => (
                  <span key={i} className="rounded-full border bg-white px-2.5 py-1 text-[11px] text-neutral-700 shadow-sm">
                    {p}
                  </span>
                ))}
              </div>
            )}

            {showLeadCard ? (
              <>
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-3 py-2 text-xs text-white" style={{ backgroundColor: color }}>
                    Yes, book me a demo
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: color }}>
                    {widget.avatarInitials || "AI"}
                  </span>
                  <div className="w-[85%] space-y-2 rounded-2xl rounded-tl-sm bg-white px-3 py-2.5 shadow-sm">
                    <p className="text-xs text-neutral-700">Great! Just need a couple of details:</p>
                    <div className="rounded-md border px-2.5 py-1.5 text-[11px] text-neutral-400">Work email</div>
                    <div className="rounded-md border px-2.5 py-1.5 text-[11px] text-neutral-400">Full name</div>
                    <div className="rounded-md px-2.5 py-1.5 text-center text-[11px] font-medium text-white" style={{ backgroundColor: color }}>
                      Continue
                    </div>
                  </div>
                </div>
              </>
            ) : (
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
          <div className="flex items-center gap-2 border-t bg-white px-3 py-2.5">
            <Paperclip className="size-4 text-neutral-300" />
            <span className="flex-1 text-xs text-neutral-400">Type your message…</span>
            <span className="flex size-7 items-center justify-center rounded-full text-white" style={{ backgroundColor: color }}>
              <Send className="size-3.5" />
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-white pb-2 text-[10px] text-neutral-300">
            <Sparkles className="size-2.5" /> Powered by Connect NX
          </div>
        </div>
      </div>

      {/* launcher bubble */}
      <div className={cn("mt-3 flex", widget.launcher === "bottom-left" ? "justify-start" : "justify-end")}>
        <span className="flex size-12 items-center justify-center rounded-full text-white shadow-lg" style={{ backgroundColor: color }}>
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
