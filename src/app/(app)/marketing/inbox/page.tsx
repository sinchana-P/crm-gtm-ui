"use client";

import { useMemo, useRef, useState } from "react";
import { Inbox, Mail, MessageCircle, RefreshCw, Send, Sparkles, Undo2, Wand2 } from "lucide-react";
import { WhatsAppThreadView } from "@/components/whatsapp/whatsapp-thread-view";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_INBOX, SNIPPETS, WHATSAPP_THREADS } from "@/lib/mock-data";
import { draftReply, REPLY_REFINE_ACTIONS, rewriteText } from "@/lib/ai-email";
import { formatRelative } from "@/lib/format";
import { useViewScope } from "@/hooks/use-view-scope";
import { filterWhatsAppThreadsByView } from "@/lib/view-scope";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MarketingInboxPage() {
  const { filterInbox, isRep, title, rep, level } = useViewScope();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [channel, setChannel] = useState<"all" | "email" | "whatsapp">("all");
  const [reply, setReply] = useState("");
  const [view, setView] = useState<"list" | "wa-threads">("list");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiDrafted, setAiDrafted] = useState(false);
  const [undoText, setUndoText] = useState("");
  const aiVariant = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function selectMessage(id: string) {
    setSelectedId(id);
    setReply("");
    setAiDrafted(false);
    setAiBusy(false);
    setUndoText("");
    aiVariant.current = 0;
  }

  const scopedInbox = useMemo(() => filterInbox(MOCK_INBOX), [filterInbox]);
  const waThreads = useMemo(
    () => filterWhatsAppThreadsByView(WHATSAPP_THREADS, level),
    [level]
  );

  const filtered = scopedInbox.filter(
    (m) => channel === "all" || m.channel === channel
  );
  const active = filtered.find((m) => m.id === selectedId) ?? filtered[0];

  const waUnread = waThreads.filter((t) => t.unread).length;

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={title("Inbox")}
        description={
          isRep
            ? `Messages assigned to ${rep.name}. Reply and log to contact timeline.`
            : "Unified email and WhatsApp replies. Assign, respond, and log to contact timeline."
        }
        actions={
          <ButtonLink href="/marketing/whatsapp" variant="outline">
            <MessageCircle className="size-4" />
            WhatsApp hub
          </ButtonLink>
        }
      />

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList>
          <TabsTrigger value="list">Message list</TabsTrigger>
          <TabsTrigger value="wa-threads">
            WhatsApp threads
            {waUnread > 0 ? (
              <Badge variant="destructive" className="ml-2">
                {waUnread}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wa-threads" className="mt-6">
          <WhatsAppThreadView threads={waThreads} />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(280px,320px)_1fr] lg:items-start">
            <Card className="flex flex-col shadow-none">
              <CardHeader className="space-y-3 pb-3">
                <CardTitle className="text-base">Messages</CardTitle>
                <Select
                  value={channel}
                  onValueChange={(v) => setChannel(v as typeof channel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All channels</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-80 max-h-[50vh]">
                  {filtered.map((msg) => (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => selectMessage(msg.id)}
                      className={cn(
                        "flex w-full flex-col gap-1 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
                        active?.id === msg.id && "bg-muted"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {msg.contactName}
                        </span>
                        {msg.unread && (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="truncate text-xs font-medium text-foreground">
                        {msg.subject}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {msg.preview}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        {msg.channel === "email" ? (
                          <Mail className="size-3 text-muted-foreground" />
                        ) : (
                          <MessageCircle className="size-3 text-muted-foreground" />
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelative(msg.receivedAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="flex min-h-[28rem] flex-col shadow-none">
              {active ? (
                <>
                  <CardHeader className="border-b pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{active.subject}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {active.contactName} · {active.contactEmail}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {active.channel}
                        </Badge>
                        <Select defaultValue={active.assignee ?? "unassigned"}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Assign to" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Priya Sharma">Priya Sharma</SelectItem>
                            <SelectItem value="Arjun Mehta">Arjun Mehta</SelectItem>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4 pt-4">
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                      {active.preview}
                    </div>

                    {active.channel === "whatsapp" ? (
                      <ButtonLink
                        href="/marketing/whatsapp"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                      >
                        Open full WhatsApp thread
                      </ButtonLink>
                    ) : null}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Reply</Label>
                        {active.channel === "email" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 border-violet-500/40 text-violet-700 dark:text-violet-400"
                            onClick={draftWithAi}
                            disabled={aiBusy}
                          >
                            <Sparkles className={cn("size-3.5", aiBusy && "animate-pulse")} />
                            {aiBusy ? "Drafting…" : aiDrafted ? "Draft again" : "Draft with AI"}
                          </Button>
                        )}
                      </div>
                      <Textarea
                        rows={5}
                        value={reply}
                        onChange={(e) => { setReply(e.target.value); }}
                        placeholder="Type your reply, or let AI draft one from their message…"
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
                          <span className="ml-auto text-[11px] text-muted-foreground">AI draft · review before sending</span>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {SNIPPETS.map((s) => (
                          <Button
                            key={s.id}
                            variant="outline"
                            size="sm"
                            onClick={() => { setReply(s.body); setAiDrafted(false); }}
                          >
                            {s.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => toast.message("Saved as draft")}
                      >
                        Save draft
                      </Button>
                      <Button
                        onClick={() => {
                          toast.success("Reply sent and logged to contact timeline");
                          setReply("");
                        }}
                      >
                        <Send className="mr-2 size-4" />
                        Send reply
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
                  <Inbox className="mr-2 size-5" />
                  Select a message
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
