"use client";

import { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Archive,
  Clock,
  CornerUpLeft,
  Inbox as InboxIcon,
  Mail,
  MessageCircle,
  Paperclip,
  PenSquare,
  RefreshCw,
  Send,
  Smile,
  Sparkles,
  Star,
  Undo2,
  User,
  Wand2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AiComposeDrawer } from "@/components/marketing/ai-email/ai-compose-drawer";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { InboxCategory, InboxMessage } from "@/lib/types";
import { MOCK_INBOX, SNIPPETS } from "@/lib/mock-data";
import { draftReply, REPLY_REFINE_ACTIONS, rewriteText } from "@/lib/ai-email";
import { formatRelative } from "@/lib/format";
import { useViewScope } from "@/hooks/use-view-scope";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ChannelFilter = "all" | "email" | "whatsapp";

const CATEGORY_META: Record<InboxCategory, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  complaint: { label: "Complaint", className: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
  request: { label: "Request", className: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  question: { label: "Question", className: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  billing: { label: "Billing", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  support: { label: "Support", className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" },
};

function initials(name: string) {
  const [a = "", b = ""] = name.trim().split(/\s+/);
  return `${a[0] ?? ""}${b[0] ?? ""}`.toUpperCase();
}

function ChannelChip({ channel }: { channel: InboxMessage["channel"] }) {
  return channel === "email" ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
      <Mail className="size-3" /> Email
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
      <MessageCircle className="size-3" /> WhatsApp
    </span>
  );
}

function CategoryChip({ category }: { category?: InboxCategory }) {
  if (!category) return null;
  const meta = CATEGORY_META[category];
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium", meta.className)}>
      {meta.label}
    </span>
  );
}

export default function MarketingInboxPage() {
  const { filterInbox, isRep, title, rep } = useViewScope();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [reply, setReply] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiDrafted, setAiDrafted] = useState(false);
  const [undoText, setUndoText] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [starred, setStarred] = useState<string[]>([]);
  const aiVariant = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scopedInbox = useMemo(() => filterInbox(MOCK_INBOX), [filterInbox]);
  const counts = useMemo(
    () => ({
      all: scopedInbox.length,
      email: scopedInbox.filter((m) => m.channel === "email").length,
      whatsapp: scopedInbox.filter((m) => m.channel === "whatsapp").length,
    }),
    [scopedInbox]
  );

  const filtered = scopedInbox.filter((m) => channel === "all" || m.channel === channel);
  const active = filtered.find((m) => m.id === selectedId) ?? filtered[0];
  const unreadShown = filtered.filter((m) => m.unread).length;
  const firstName = active?.contactName.split(" ")[0] ?? "";
  const accent = active?.channel === "whatsapp" ? "bg-emerald-500" : "bg-blue-500";

  function selectMessage(id: string) {
    setSelectedId(id);
    setReply("");
    setAiDrafted(false);
    setAiBusy(false);
    setUndoText("");
    aiVariant.current = 0;
  }

  function draftWithAi() {
    if (!active || aiBusy) return;
    setAiBusy(true);
    aiVariant.current = 0;
    const t = setTimeout(() => {
      setReply(draftReply(active, 0));
      setAiDrafted(true);
      setAiBusy(false);
    }, 700);
    timers.current.push(t);
  }

  function regenerateReply() {
    if (!active) return;
    setUndoText(reply);
    aiVariant.current += 1;
    setReply(draftReply(active, aiVariant.current));
  }

  function refineReply(action: (typeof REPLY_REFINE_ACTIONS)[number]["value"]) {
    if (!reply.trim()) return;
    setUndoText(reply);
    setReply(rewriteText(reply, action));
  }

  const tabs: { value: ChannelFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "email", label: "Email", count: counts.email },
    { value: "whatsapp", label: "WhatsApp", count: counts.whatsapp },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={title("Inbox")}
        description={
          isRep
            ? `Messages assigned to ${rep.name} — reply, assign, and log to the timeline.`
            : "Unified email and WhatsApp — reply, assign, and log to the timeline."
        }
        actions={
          <>
            <ButtonLink href="/marketing/whatsapp" variant="outline">
              <MessageCircle className="size-4" />
              WhatsApp hub
            </ButtonLink>
            <Button onClick={() => setComposeOpen(true)}>
              <PenSquare className="size-4" />
              Compose
            </Button>
          </>
        }
      />

      <AiComposeDrawer open={composeOpen} onOpenChange={setComposeOpen} />

      {/* Channel filter pills */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setChannel(t.value)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                channel === t.value
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
                  channel === t.value ? "bg-background/20" : "bg-background"
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
        {unreadShown > 0 && (
          <span className="text-sm text-muted-foreground">{unreadShown} unread</span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(300px,360px)_1fr] lg:items-start">
        {/* Message list */}
        <Card className="overflow-hidden p-0 shadow-none">
          <ScrollArea className="h-[32rem]">
            {filtered.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
                <InboxIcon className="size-6" />
                No messages in this view
              </div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => selectMessage(msg.id)}
                  className={cn(
                    "flex w-full gap-3 border-b border-l-2 px-4 py-3 text-left transition-colors",
                    active?.id === msg.id
                      ? "border-l-primary bg-primary/5"
                      : "border-l-transparent hover:bg-muted/50"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                      msg.channel === "email" ? "bg-violet-500" : "bg-emerald-500"
                    )}
                  >
                    {initials(msg.contactName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{msg.contactName}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {format(new Date(msg.receivedAt), "h:mm a")}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      {msg.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                      <span className={cn("truncate text-sm", msg.unread ? "font-semibold" : "font-medium")}>
                        {msg.subject}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {msg.preview}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1">
                      <ChannelChip channel={msg.channel} />
                      <CategoryChip category={msg.category} />
                      {!msg.assignee && (
                        <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              ))
            )}
          </ScrollArea>
        </Card>

        {/* Conversation */}
        <Card className="flex min-h-[32rem] flex-col overflow-hidden p-0 shadow-none">
          {active ? (
            <>
              <div className={cn("h-1 w-full", accent)} />
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{active.subject}</h2>
                    <ChannelChip channel={active.channel} />
                    <CategoryChip category={active.category} />
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-[9px] font-semibold text-white",
                        active.channel === "email" ? "bg-violet-500" : "bg-emerald-500"
                      )}
                    >
                      {initials(active.contactName)}
                    </span>
                    {active.contactName} · {active.contactEmail}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Select defaultValue={active.assignee ?? "unassigned"} key={active.id}>
                    <SelectTrigger className="h-8 w-[150px] gap-1">
                      <User className="size-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Priya Sharma">Priya Sharma</SelectItem>
                      <SelectItem value="Arjun Mehta">Arjun Mehta</SelectItem>
                      <SelectItem value="Neha Reddy">Neha Reddy</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() =>
                      setStarred((s) =>
                        s.includes(active.id) ? s.filter((x) => x !== active.id) : [...s, active.id]
                      )
                    }
                    aria-label="Star"
                  >
                    <Star
                      className={cn(
                        "size-4",
                        starred.includes(active.id) && "fill-amber-400 text-amber-400"
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toast.message("Conversation archived")}
                    aria-label="Archive"
                  >
                    <Archive className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Thread */}
              <ScrollArea className="flex-1">
                <div className="space-y-4 px-5 py-6">
                  <div className="flex justify-center">
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                      {formatRelative(active.receivedAt)}
                    </span>
                  </div>
                  <div className="max-w-[85%]">
                    <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-3 text-sm shadow-sm">
                      {active.body ?? active.preview}
                    </div>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      {format(new Date(active.receivedAt), "EEE h:mm a")}
                    </p>
                  </div>
                </div>
              </ScrollArea>

              {/* Reply composer */}
              <div className="space-y-3 border-t px-5 py-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CornerUpLeft className="size-3.5" /> Reply to {firstName}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-violet-700 dark:text-violet-400"
                    onClick={draftWithAi}
                    disabled={aiBusy}
                  >
                    <Sparkles className={cn("size-3.5", aiBusy && "animate-pulse")} />
                    {aiBusy ? "Drafting…" : aiDrafted ? "Draft again" : "Draft with AI"}
                  </Button>
                </div>

                <Textarea
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply, or let AI draft one from their message…"
                />

                {aiDrafted && reply && (
                  <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/[0.04] px-2.5 py-1.5">
                    <span className="flex items-center gap-1 text-xs font-medium text-violet-700 dark:text-violet-400">
                      <Wand2 className="size-3.5" /> Refine
                    </span>
                    {REPLY_REFINE_ACTIONS.map((a) => (
                      <Button key={a.value} variant="ghost" size="sm" className="h-7" onClick={() => refineReply(a.value)}>
                        {a.label}
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm" className="h-7" onClick={regenerateReply}>
                      <RefreshCw className="size-3.5" /> Regenerate
                    </Button>
                    {undoText && (
                      <Button variant="ghost" size="sm" className="h-7" onClick={() => { setReply(undoText); setUndoText(""); }}>
                        <Undo2 className="size-3.5" /> Undo
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Suggested</span>
                  {SNIPPETS.map((s) => (
                    <Button
                      key={s.id}
                      variant="ghost"
                      size="sm"
                      className="h-7"
                      onClick={() => { setReply(s.body); setAiDrafted(false); }}
                    >
                      {s.name}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-2 border-t pt-3">
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Attach">
                    <Paperclip className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Emoji">
                    <Smile className="size-4" />
                  </Button>
                  <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
                    <kbd className="rounded border bg-muted px-1">⌘</kbd>
                    <kbd className="rounded border bg-muted px-1">↵</kbd>
                    to send
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" onClick={() => toast.message("Saved as draft")}>
                      Save draft
                    </Button>
                    <Button
                      disabled={!reply.trim()}
                      onClick={() => {
                        toast.success("Reply sent and logged to contact timeline");
                        setReply("");
                        setAiDrafted(false);
                      }}
                    >
                      <Send className="size-4" /> Send reply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
              <InboxIcon className="size-5" /> Select a message
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
