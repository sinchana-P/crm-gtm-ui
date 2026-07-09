"use client";

import { useMemo, useRef, useState } from "react";
import {
  Braces,
  CalendarClock,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Undo2,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { AiSavedDraftStatus, AiTone, ContactRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_EMAIL_STARTERS,
  AI_TONES,
  composeDraft,
  REPLY_REFINE_ACTIONS,
  rewriteText,
} from "@/lib/ai-email";
import { MOCK_CONTACTS, MOCK_SENDER_ADDRESSES, PERSONALIZATION_TOKENS } from "@/lib/mock-data";
import { createDraftId, useAiDraftStore } from "@/lib/stores/ai-draft-store";
import { useBrandVoiceStore } from "@/lib/stores/brand-voice-store";
import { cn } from "@/lib/utils";

type Status = "idle" | "generating" | "ready" | "error";
type Recipient = { id: string; email: string; name?: string };

const VERIFIED_SENDERS = MOCK_SENDER_ADDRESSES.filter((s) => s.verified);

function contactToRecipient(c: ContactRecord): Recipient {
  return { id: c.email.toLowerCase(), email: c.email, name: `${c.firstName} ${c.lastName}` };
}

export function AiComposeDrawer({
  open,
  onOpenChange,
  initialRecipient,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialRecipient?: ContactRecord;
}) {
  const brand = useBrandVoiceStore((s) => s.voice);
  const addDraft = useAiDraftStore((s) => s.addDraft);

  const [recipients, setRecipients] = useState<Recipient[]>(
    initialRecipient ? [contactToRecipient(initialRecipient)] : []
  );
  const [recipientInput, setRecipientInput] = useState("");
  const [fromAddress, setFromAddress] = useState(VERIFIED_SENDERS[1]?.address ?? VERIFIED_SENDERS[0]?.address ?? "");

  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState<AiTone>("friendly");
  const [keyPoints, setKeyPoints] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [undoBody, setUndoBody] = useState("");

  const variantRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const suggestions = useMemo(() => {
    const q = recipientInput.trim().toLowerCase();
    if (!q) return [];
    return MOCK_CONTACTS.filter(
      (c) =>
        !recipients.some((r) => r.id === c.email.toLowerCase()) &&
        `${c.firstName} ${c.lastName} ${c.email} ${c.company ?? ""}`.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [recipientInput, recipients]);

  const singleRecipient = recipients.length === 1 ? recipients[0] : null;

  function addEmail(raw: string) {
    const email = raw.trim().replace(/[,;]+$/, "").trim();
    if (!email) return;
    const id = email.toLowerCase();
    setRecipients((list) => (list.some((r) => r.id === id) ? list : [...list, { id, email }]));
    setRecipientInput("");
  }

  function addContact(c: ContactRecord) {
    const r = contactToRecipient(c);
    setRecipients((list) => (list.some((x) => x.id === r.id) ? list : [...list, r]));
    setRecipientInput("");
  }

  function removeRecipient(id: string) {
    setRecipients((list) => list.filter((r) => r.id !== id));
  }

  function onRecipientKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(recipientInput);
    } else if (e.key === "Backspace" && !recipientInput && recipients.length > 0) {
      setRecipients((list) => list.slice(0, -1));
    }
  }

  function reset() {
    setStatus("idle");
    setSubject("");
    setBody("");
    setUndoBody("");
    setGoal("");
    setKeyPoints("");
    setTone("friendly");
    variantRef.current = 0;
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function handleOpenChange(o: boolean) {
    if (!o) reset();
    onOpenChange(o);
  }

  function pickStarter(id: string) {
    const s = AI_EMAIL_STARTERS.find((x) => x.id === id);
    if (!s) return;
    setGoal(s.goal);
    setTone(s.tone);
  }

  function generate() {
    if (!goal.trim()) {
      toast.error("Add a goal so the AI knows what to write");
      return;
    }
    setStatus("generating");
    variantRef.current = 0;
    const t = setTimeout(() => {
      const draft = composeDraft({ goal, tone, keyPoints, recipientName: singleRecipient?.name }, 0);
      if (!draft.subject && !draft.body) {
        setStatus("error");
        return;
      }
      setSubject(draft.subject);
      setBody(draft.body);
      setUndoBody("");
      setStatus("ready");
    }, 750);
    timers.current.push(t);
  }

  function regenerate() {
    variantRef.current += 1;
    setUndoBody(body);
    const draft = composeDraft({ goal, tone, keyPoints, recipientName: singleRecipient?.name }, variantRef.current);
    setSubject(draft.subject);
    setBody(draft.body);
  }

  function refine(action: (typeof REPLY_REFINE_ACTIONS)[number]["value"]) {
    if (!body.trim()) return;
    setUndoBody(body);
    setBody(rewriteText(body, action, brand.signature));
  }

  function insertToken(token: string) {
    setBody((b) => (b ? `${b} ${token}` : token));
  }

  const canSend = recipients.length > 0 && Boolean(subject.trim() && body.trim());
  const recipientSummary =
    recipients.length === 0
      ? ""
      : recipients.length === 1
        ? recipients[0].name ?? recipients[0].email
        : `${recipients.length} recipients`;

  const footerHint = (() => {
    const count =
      recipients.length === 0
        ? "No recipients"
        : `${recipients.length} recipient${recipients.length > 1 ? "s" : ""}`;
    let next = "ready to send";
    if (recipients.length === 0) next = "add a recipient";
    else if (!subject.trim()) next = "add a subject";
    else if (!body.trim()) next = "add a message";
    return `${count} · ${next}`;
  })();

  function persist(state: AiSavedDraftStatus) {
    if (recipients.length === 0) return;
    addDraft({
      id: createDraftId(),
      subject,
      body,
      goal,
      tone,
      audience: singleRecipient ? singleRecipient.name ?? singleRecipient.email : `${recipients.length} contacts`,
      recipientName: recipientSummary,
      recipientEmail: recipients.map((r) => r.email).join(", "),
      source: "compose",
      status: state,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  function onSend() {
    if (!canSend) return;
    persist("sent");
    toast.success(
      recipients.length === 1
        ? `Email sent to ${recipientSummary} and logged to their timeline`
        : `Email sent to ${recipients.length} recipients and logged to their timelines`
    );
    handleOpenChange(false);
  }

  function onSaveDraft() {
    if (recipients.length === 0) {
      toast.error("Add at least one recipient before saving");
      return;
    }
    persist("draft");
    toast.message("Saved to Recent drafts");
    handleOpenChange(false);
  }

  function onSchedule() {
    if (!canSend) return;
    persist("scheduled");
    toast.success("Scheduled — it'll send at the chosen time");
    handleOpenChange(false);
  }

  const showAiToolbar = status === "ready" && Boolean(body);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-4xl">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" /> Compose email
          </SheetTitle>
          <SheetDescription>
            Start from a goal, let AI draft it, then refine before you send.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-5 px-6 py-5">
            {/* Recipients */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>To</Label>
                {recipients.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    Sent individually · use{" "}
                    <code className="rounded bg-muted px-1">{"{{firstName}}"}</code> to personalize
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-background p-1.5 focus-within:ring-1 focus-within:ring-ring">
                  {recipients.map((r) => (
                    <span
                      key={r.id}
                      className="flex items-center gap-1 rounded-md bg-violet-500/10 py-0.5 pl-2 pr-1 text-xs text-violet-700 dark:text-violet-300"
                      title={r.email}
                    >
                      {r.name ?? r.email}
                      <button
                        type="button"
                        onClick={() => removeRecipient(r.id)}
                        className="rounded p-0.5 hover:bg-violet-500/20"
                        aria-label={`Remove ${r.name ?? r.email}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyDown={onRecipientKeyDown}
                    onBlur={() => recipientInput.trim() && addEmail(recipientInput)}
                    placeholder={
                      recipients.length === 0
                        ? "Add recipients — type an email, press Enter"
                        : "Add more…"
                    }
                    className="h-7 min-w-[12rem] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
                    {suggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addContact(c);
                        }}
                        className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {c.firstName[0]}
                          {c.lastName[0]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {c.firstName} {c.lastName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {c.email}
                            {c.company ? ` · ${c.company}` : ""}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sender */}
            <div className="grid gap-2">
              <Label>From</Label>
              <Select value={fromAddress} onValueChange={(v) => setFromAddress(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VERIFIED_SENDERS.map((s) => (
                    <SelectItem key={s.address} value={s.address}>
                      {s.name} · {s.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI brief */}
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/[0.04] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-400">
                <Wand2 className="size-4" /> Draft with AI
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {AI_EMAIL_STARTERS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickStarter(s.id)}
                    className="rounded-full border bg-background px-2.5 py-1 text-xs transition-colors hover:border-violet-500/50 hover:bg-violet-500/5"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label className="text-xs">What should this email do?</Label>
                  <Input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Follow up after our demo and book next steps"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                  <div className="grid gap-2">
                    <Label className="text-xs">Key points (optional)</Label>
                    <Input
                      value={keyPoints}
                      onChange={(e) => setKeyPoints(e.target.value)}
                      placeholder="Anything specific to mention"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Tone</Label>
                    <Select value={tone} onValueChange={(v) => setTone((v as AiTone) ?? "friendly")}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_TONES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={generate} disabled={status === "generating"} className="w-fit">
                  <Sparkles className={cn("size-4", status === "generating" && "animate-pulse")} />
                  {status === "generating"
                    ? "Drafting…"
                    : status === "ready"
                      ? "Regenerate from brief"
                      : "Generate draft"}
                </Button>
              </div>
            </div>

            {/* Error state */}
            {status === "error" && (
              <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
                <span className="text-destructive">Couldn&rsquo;t generate a draft. Try again.</span>
                <Button variant="outline" size="sm" onClick={generate}>
                  <RefreshCw className="size-3.5" /> Retry
                </Button>
              </div>
            )}

            {/* Subject */}
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
              />
            </div>

            {/* Body */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Message</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 rounded-md bg-violet-500/10 text-violet-700 hover:bg-violet-500/15 dark:text-violet-300"
                      >
                        <Braces className="size-3.5" /> Personalize
                      </Button>
                    }
                  />
                  <PopoverContent align="end" className="w-56 p-1">
                    {PERSONALIZATION_TOKENS.map((t) => (
                      <button
                        key={t.token}
                        type="button"
                        onClick={() => insertToken(t.token)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                      >
                        <span>{t.label}</span>
                        <code className="text-xs text-muted-foreground">{t.token}</code>
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
              <Textarea
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message, or generate a draft with AI above…"
              />
              {showAiToolbar && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/[0.04] px-2.5 py-1.5">
                  <span className="flex items-center gap-1 text-xs font-medium text-violet-700 dark:text-violet-400">
                    <Wand2 className="size-3.5" /> Refine
                  </span>
                  {REPLY_REFINE_ACTIONS.map((a) => (
                    <Button key={a.value} variant="ghost" size="sm" className="h-7" onClick={() => refine(a.value)}>
                      {a.label}
                    </Button>
                  ))}
                  <Button variant="ghost" size="sm" className="h-7" onClick={regenerate}>
                    <RefreshCw className="size-3.5" /> Regenerate
                  </Button>
                  {undoBody && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7"
                      onClick={() => {
                        setBody(undoBody);
                        setUndoBody("");
                      }}
                    >
                      <Undo2 className="size-3.5" /> Undo
                    </Button>
                  )}
                  <span className="ml-auto text-[11px] text-muted-foreground">AI draft · review before sending</span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row items-center justify-between border-t">
          <span className="hidden text-xs text-muted-foreground sm:block">{footerHint}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onSaveDraft}>
              <Save className="size-4" /> Save draft
            </Button>
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" disabled={!canSend}>
                    <CalendarClock className="size-4" /> Schedule
                  </Button>
                }
              />
              <PopoverContent align="end" className="w-64 space-y-3">
                <p className="text-sm font-medium">Schedule send</p>
                <p className="text-xs text-muted-foreground">Pick when it&rsquo;ll go out.</p>
                <Input type="datetime-local" />
                <Button size="sm" className="w-full" onClick={onSchedule}>
                  Confirm schedule
                </Button>
              </PopoverContent>
            </Popover>
            <Button disabled={!canSend} onClick={onSend}>
              <Send className="size-4" /> Send
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
