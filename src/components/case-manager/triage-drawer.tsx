"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CircleUser,
  Mail,
  Phone,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getContactById } from "@/lib/mock-data";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { formatDateTime } from "@/lib/format";
import type { IntakeItem } from "@/lib/types/case-manager";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  IntakeStatusBadge,
  PriorityBadge,
  SourceBadge,
} from "@/components/case-manager/cm-status-badges";

interface TriageDrawerProps {
  item: IntakeItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvert: (item: IntakeItem) => void;
}

export function TriageDrawer({ item, open, onOpenChange, onConvert }: TriageDrawerProps) {
  const markResponded = useCaseManagerStore((s) => s.markIntakeResponded);
  const dismiss = useCaseManagerStore((s) => s.dismissIntake);
  const [reply, setReply] = useState("");

  if (!item) return null;
  const contact = item.linkedContactId ? getContactById(item.linkedContactId) : undefined;
  const source = item.channel;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-2">
            <SourceBadge source={source} />
            <IntakeStatusBadge status={item.status} />
            <PriorityBadge priority={item.priority} />
          </div>
          <SheetTitle className="mt-2 text-left">{item.subject}</SheetTitle>
          <SheetDescription className="text-left">
            {item.sourceRef ? `${item.sourceRef} · ` : ""}
            {formatDateTime(item.receivedAt)}
            {item.formName ? ` · ${item.formName}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {item.duplicateOfId && (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>Possible duplicate of an earlier submission. Review before converting.</span>
            </div>
          )}

          {/* Submitter / matched contact */}
          <div className="rounded-lg border p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {contact ? "Matched CRM contact" : "Submitter (no CRM match)"}
            </p>
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="text-xs">
                  {item.submitterName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.submitterName}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <Mail className="size-3" /> {item.submitterEmail}
                </p>
              </div>
              {contact ? (
                <UserRound className="ml-auto size-4 text-emerald-600" />
              ) : (
                <CircleUser className="ml-auto size-4 text-muted-foreground" />
              )}
            </div>
            {contact ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="size-3" /> {contact.company}</span>
                {contact.phone && <span className="flex items-center gap-1"><Phone className="size-3" /> {contact.phone}</span>}
                <span>Owner: {contact.owner}</span>
                {contact.openCases ? <span>{contact.openCases} open case(s)</span> : null}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Converting will create and link a new Connect CRM contact.
              </p>
            )}
          </div>

          {/* Message body */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</p>
            <p className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">{item.body}</p>
          </div>

          {/* Quick reply */}
          {item.status !== "Converted" && item.status !== "Closed" && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Quick reply</p>
              <Textarea
                rows={3}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Acknowledge or ask for more info before converting…"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={!reply.trim()}
                onClick={() => {
                  markResponded(item.id);
                  setReply("");
                  toast.success("Reply sent", { description: "Intake marked as responded." });
                }}
              >
                <Send className="size-3.5" /> Send &amp; mark responded
              </Button>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row gap-2 border-t">
          {item.status === "Converted" ? (
            <p className="w-full text-center text-sm text-muted-foreground">
              Converted to a case. See the linked case for progress.
            </p>
          ) : (
            <>
              <SheetClose
                render={
                  <Button variant="ghost" size="sm" onClick={() => dismiss(item.id)}>
                    <X className="size-4" /> Dismiss
                  </Button>
                }
              />
              <Button size="sm" className="ml-auto" onClick={() => onConvert(item)}>
                Convert to case <ArrowRight className="size-4" />
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
