"use client";

import { useState } from "react";
import { MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { PORTAL_CUSTOMER } from "@/lib/mock-data/portal";
import { PORTAL_WHATSAPP_MESSAGES, WHATSAPP_CONFIG } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function PortalMessagesPage() {
  const [messages, setMessages] = useState(PORTAL_WHATSAPP_MESSAGES);
  const [draft, setDraft] = useState("");

  const unread = messages.filter((m) => m.direction === "outbound" && !m.read).length;

  function handleSend() {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `pm-${Date.now()}`,
        direction: "inbound",
        body: draft.trim(),
        sentAt: new Date().toISOString(),
        senderName: "You",
        read: true,
      },
    ]);
    setDraft("");
    toast.success("Message sent via WhatsApp", {
      description: `${PORTAL_CUSTOMER.accountOwner} will be notified.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Chat with your account team on WhatsApp. Replies sync with your representative's CRM inbox."
        actions={
          unread > 0 ? (
            <Badge variant="destructive">{unread} unread</Badge>
          ) : null
        }
      />

      <Card className="shadow-none">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <p className="font-medium">{PORTAL_CUSTOMER.accountOwner}</p>
              <p className="text-sm text-muted-foreground">Your account representative</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4" />
            {WHATSAPP_CONFIG.phoneNumber}
          </div>
        </CardContent>
      </Card>

      <Card className="flex min-h-[28rem] flex-col overflow-hidden shadow-none">
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
              Messages are end-to-end encrypted. Business account: {WHATSAPP_CONFIG.displayName}
            </div>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.direction === "inbound" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    msg.direction === "inbound"
                      ? "bg-foreground text-background"
                      : "bg-muted"
                  )}
                >
                  {msg.direction === "outbound" ? (
                    <p className="mb-1 text-[10px] font-medium opacity-80">{msg.senderName}</p>
                  ) : null}
                  <p>{msg.body}</p>
                  <p className="mt-1 text-right text-[10px] opacity-70">
                    {formatRelative(msg.sentAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <Textarea
            rows={2}
            placeholder="Type a message to your account team..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              You opted in to WhatsApp on your profile. Reply STOP to opt out.
            </p>
            <Button onClick={handleSend} disabled={!draft.trim()}>
              <Send className="size-4" />
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
