"use client";

import { useMemo, useState } from "react";
import { Clock, MessageCircle, Send, User } from "lucide-react";
import { toast } from "sonner";
import { SNIPPETS, WHATSAPP_TEMPLATES } from "@/lib/mock-data";
import type { WhatsAppThread } from "@/lib/types/whatsapp";
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
import { Textarea } from "@/components/ui/textarea";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

interface WhatsAppThreadViewProps {
  threads: WhatsAppThread[];
  initialThreadId?: string;
  showAssignee?: boolean;
  compact?: boolean;
}

export function WhatsAppThreadView({
  threads,
  initialThreadId,
  showAssignee = true,
  compact,
}: WhatsAppThreadViewProps) {
  const [selectedId, setSelectedId] = useState(
    initialThreadId ?? threads[0]?.id
  );
  const [reply, setReply] = useState("");
  const [sendMode, setSendMode] = useState<"free" | "template">("free");

  const active = useMemo(
    () => threads.find((t) => t.id === selectedId) ?? threads[0],
    [threads, selectedId]
  );

  if (threads.length === 0) {
    return (
      <Card className="shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <MessageCircle className="mb-2 size-8" />
          <p className="text-sm">No WhatsApp conversations</p>
        </CardContent>
      </Card>
    );
  }

  const approvedTemplates = WHATSAPP_TEMPLATES.filter((t) => t.status === "approved");

  return (
    <div
      className={cn(
        "grid gap-4",
        compact ? "grid-cols-1" : "lg:grid-cols-[minmax(260px,300px)_1fr]"
      )}
    >
      {!compact ? (
        <Card className="flex flex-col shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[32rem] max-h-[60vh]">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedId(thread.id)}
                  className={cn(
                    "flex w-full flex-col gap-1 border-b px-4 py-3 text-left hover:bg-muted/50",
                    active?.id === thread.id && "bg-muted"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{thread.contactName}</span>
                    {thread.unread ? (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{thread.phone}</p>
                  <p className="line-clamp-1 text-xs">
                    {thread.messages[thread.messages.length - 1]?.body}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {thread.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelative(thread.lastMessageAt)}
                    </span>
                  </div>
                </button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      ) : null}

      {active ? (
        <Card className="flex min-h-[28rem] flex-col shadow-none">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{active.contactName}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{active.phone}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SessionBadge
                  sessionOpen={active.sessionOpen}
                  expiresAt={active.sessionExpiresAt}
                />
                {showAssignee ? (
                  <Select defaultValue={active.assignee}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Priya Sharma">Priya Sharma</SelectItem>
                      <SelectItem value="Arjun Mehta">Arjun Mehta</SelectItem>
                      <SelectItem value="Neha Reddy">Neha Reddy</SelectItem>
                    </SelectContent>
                  </Select>
                ) : null}
                <ButtonLink
                  href={`/contacts/${active.contactId}`}
                  variant="outline"
                  size="sm"
                >
                  <User className="size-4" />
                  Record
                </ButtonLink>
              </div>
            </div>
            {active.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {active.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-3">
                {active.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.direction === "outbound" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                        msg.direction === "outbound"
                          ? "bg-foreground text-background"
                          : "bg-muted"
                      )}
                    >
                      {msg.templateName ? (
                        <p className="mb-1 text-[10px] opacity-70">
                          Template: {msg.templateName}
                        </p>
                      ) : null}
                      <p>{msg.body}</p>
                      <div className="mt-1 flex items-center justify-end gap-2 text-[10px] opacity-70">
                        {msg.actor ? <span>{msg.actor}</span> : null}
                        <span>{formatRelative(msg.sentAt)}</span>
                        {msg.status ? <span className="capitalize">{msg.status}</span> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              {!active.sessionOpen ? (
                <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  24-hour session closed — only approved templates can be sent.
                </p>
              ) : null}

              <div className="mb-2 flex gap-2">
                <Button
                  size="sm"
                  variant={sendMode === "free" ? "default" : "outline"}
                  onClick={() => setSendMode("free")}
                  disabled={!active.sessionOpen}
                >
                  Free reply
                </Button>
                <Button
                  size="sm"
                  variant={sendMode === "template" ? "default" : "outline"}
                  onClick={() => setSendMode("template")}
                >
                  Template
                </Button>
              </div>

              {sendMode === "template" ? (
                <div className="mb-2 space-y-2">
                  <Label>Approved template</Label>
                  <Select
                    onValueChange={(v) => {
                      const tpl = approvedTemplates.find((t) => t.id === v);
                      if (tpl) setReply(tpl.body);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} ({t.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <Textarea
                rows={3}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={
                  active.sessionOpen
                    ? "Type a WhatsApp message..."
                    : "Select a template to send..."
                }
                disabled={!active.sessionOpen && sendMode === "free"}
              />

              <div className="mt-2 flex flex-wrap gap-2">
                {SNIPPETS.filter((s) => s.name.toLowerCase().includes("whatsapp")).map(
                  (s) => (
                    <Button
                      key={s.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setReply(s.body)}
                    >
                      {s.name}
                    </Button>
                  )
                )}
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <Button variant="outline" onClick={() => toast.message("Note saved")}>
                  Internal note
                </Button>
                <Button
                  onClick={() => {
                    toast.success("WhatsApp message sent", {
                      description: "Logged to contact timeline.",
                    });
                    setReply("");
                  }}
                  disabled={!reply.trim()}
                >
                  <Send className="size-4" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function SessionBadge({
  sessionOpen,
  expiresAt,
}: {
  sessionOpen: boolean;
  expiresAt?: string;
}) {
  if (sessionOpen) {
    return (
      <Badge variant="outline" className="gap-1 border-emerald-300 text-emerald-700">
        <Clock className="size-3" />
        Session open
        {expiresAt ? (
          <span className="text-[10px]">· until {formatRelative(expiresAt)}</span>
        ) : null}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Clock className="size-3" />
      Template only
    </Badge>
  );
}
