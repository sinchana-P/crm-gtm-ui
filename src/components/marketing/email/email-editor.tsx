"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Braces,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  GripVertical,
  Monitor,
  Plus,
  Save,
  Send,
  Smartphone,
  Sparkles,
  SquarePen,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { EmailBlock, EmailBlockType, EmailTemplate } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_EMAIL_STARTERS } from "@/lib/mock-data";
import {
  createBlockId,
  createTemplateId,
  useEmailTemplateStore,
} from "@/lib/stores/email-template-store";
import { cn } from "@/lib/utils";
import { EmailBlockConfig } from "@/components/marketing/email/email-block-config";
import { EmailBlockRender } from "@/components/marketing/email/email-block-render";
import {
  BLOCK_META,
  EmailStatusBadge,
  PERSONALIZATION_TOKENS,
} from "@/components/marketing/email/email-shared";
import { TestSendDialog } from "@/components/marketing/email/test-send-dialog";
import { AiAssistDrawer } from "@/components/marketing/ai-email/ai-assist-drawer";
import type { AiDraftSection } from "@/lib/types";

const PALETTE: EmailBlockType[] = [
  "heading",
  "text",
  "image",
  "button",
  "columns",
  "divider",
  "spacer",
  "social",
  "dynamic",
  "html",
];

function makeBlock(type: EmailBlockType): EmailBlock {
  const id = createBlockId();
  switch (type) {
    case "heading":
      return { id, type, text: "Your heading", level: 1, align: "left" };
    case "text":
      return { id, type, text: "Write your message here.", align: "left" };
    case "image":
      return { id, type, src: "", alt: "", align: "center" };
    case "button":
      return { id, type, text: "Click here", url: "", align: "center", buttonColor: "#2563eb" };
    case "spacer":
      return { id, type, height: 24 };
    case "social":
      return { id, type, socials: ["twitter", "linkedin"], align: "center" };
    case "columns":
      return { id, type, colText: ["Column one", "Column two"] };
    case "html":
      return { id, type, html: "" };
    case "dynamic":
      return { id, type, dynamicVariants: [{ id: `${id}-d1`, label: "Default", text: "Default content" }] };
    default:
      return { id, type };
  }
}

export function EmailEditor({
  templateId,
  starterId,
}: {
  templateId?: string;
  starterId?: string;
}) {
  const router = useRouter();
  const existing = useEmailTemplateStore((s) =>
    templateId ? s.templates.find((t) => t.id === templateId) : undefined
  );
  const starter = starterId ? MOCK_EMAIL_STARTERS.find((s) => s.id === starterId) : undefined;
  const addTemplate = useEmailTemplateStore((s) => s.addTemplate);
  const updateTemplate = useEmailTemplateStore((s) => s.updateTemplate);

  const editMode = !!templateId;
  const [name, setName] = useState(existing?.name ?? starter?.name ?? "Untitled email");
  const [subject, setSubject] = useState(existing?.subject ?? starter?.subject ?? "");
  const [preheader, setPreheader] = useState(existing?.preheader ?? "");
  const [fromName, setFromName] = useState(existing?.fromName ?? "Connect NX");
  const [type, setType] = useState<NonNullable<EmailTemplate["type"]>>(existing?.type ?? starter?.type ?? "newsletter");
  const [blocks, setBlocks] = useState<EmailBlock[]>(existing?.blocks ?? starter?.blocks ?? []);
  const [htmlMode, setHtmlMode] = useState(!!existing?.htmlMode);
  const [rawHtml, setRawHtml] = useState(existing?.rawHtml ?? "");
  const [trackOpens, setTrackOpens] = useState(existing?.trackOpens ?? true);
  const [trackClicks, setTrackClicks] = useState(existing?.trackClicks ?? true);
  const [predictive, setPredictive] = useState(existing?.predictiveSendTime ?? false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"edit" | "desktop" | "mobile">("edit");
  const [testOpen, setTestOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  function applyAiDraft(subject: string, sections: AiDraftSection[]) {
    if (subject) setSubject(subject);
    const aiBlocks: EmailBlock[] = sections.map((s) =>
      s.kind === "cta"
        ? { id: createBlockId(), type: "button", text: s.text.replace(/[→\s]+$/, ""), url: "", align: "left", buttonColor: "#2563eb" }
        : s.kind === "greeting"
          ? { id: createBlockId(), type: "heading", level: 2, text: s.text, align: "left" }
          : { id: createBlockId(), type: "text", text: s.text, align: "left" }
    );
    setBlocks((bs) => [...bs, ...aiBlocks]);
    setHtmlMode(false);
    toast.success("AI draft added to your email");
  }
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const selected = selectedId ? blocks.find((b) => b.id === selectedId) : null;

  function addBlock(t: EmailBlockType, atIndex?: number) {
    const block = makeBlock(t);
    setBlocks((bs) => {
      if (atIndex === undefined) return [...bs, block];
      const next = [...bs];
      next.splice(atIndex, 0, block);
      return next;
    });
    setSelectedId(block.id);
  }
  function updateBlock(id: string, patch: Partial<EmailBlock>) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function removeBlock(id: string) {
    setBlocks((bs) => bs.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }
  function duplicateBlock(id: string) {
    setBlocks((bs) => {
      const idx = bs.findIndex((b) => b.id === id);
      if (idx === -1) return bs;
      const copy = { ...bs[idx], id: createBlockId() };
      const next = [...bs];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }
  function moveBlock(from: number, to: number) {
    setBlocks((bs) => {
      if (to < 0 || to >= bs.length) return bs;
      const next = [...bs];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function save(publish: boolean) {
    if (!name.trim()) return toast.error("Give the email a name");
    if (!subject.trim()) return toast.error("Add a subject line");
    const now = new Date().toISOString();
    const shared = {
      name: name.trim(),
      subject: subject.trim(),
      preheader: preheader.trim() || undefined,
      fromName,
      type,
      blocks,
      htmlMode,
      rawHtml,
      trackOpens,
      trackClicks,
      predictiveSendTime: predictive,
    };
    if (editMode && existing) {
      updateTemplate(existing.id, { ...shared, status: publish ? "published" : existing.status ?? "draft" });
      toast.success(publish ? "Email published" : "Draft saved");
      router.push(`/marketing/templates/${existing.id}`);
      return;
    }
    const template: EmailTemplate = {
      id: createTemplateId(),
      ...shared,
      category: type.charAt(0).toUpperCase() + type.slice(1),
      status: publish ? "published" : "draft",
      owner: "Priya Sharma",
      accent: starter?.accent ?? "#2563eb",
      sent: 0, openRate: 0, clickRate: 0,
      createdAt: now, updatedAt: now,
    };
    addTemplate(template);
    toast.success(publish ? "Email published" : "Draft saved");
    router.push(`/marketing/templates/${template.id}`);
  }

  if (editMode && !existing) {
    return (
      <EmptyState
        title="Email not found"
        description="This template may have been deleted."
        action={<Button variant="outline" onClick={() => router.push("/marketing/templates")}><ArrowLeft className="size-4" /> Back to templates</Button>}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/marketing/templates")}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 w-64 border-transparent px-1 text-base font-semibold shadow-none hover:border-border focus:border-border"
            />
            <div className="mt-0.5 flex items-center gap-2 px-1">
              <EmailStatusBadge status={existing?.status ?? "draft"} />
              <span className="text-xs text-muted-foreground capitalize">{type}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border p-0.5">
            <Button variant={view === "edit" ? "secondary" : "ghost"} size="sm" onClick={() => setView("edit")}><SquarePen className="size-4" /> Edit</Button>
            <Button variant={view === "desktop" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setView("desktop")}><Monitor className="size-4" /></Button>
            <Button variant={view === "mobile" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setView("mobile")}><Smartphone className="size-4" /></Button>
          </div>
          <Button variant="outline" onClick={() => setAiOpen(true)}><Sparkles className="size-4" /> AI Assist</Button>
          <Button variant="outline" onClick={() => setTestOpen(true)}><Send className="size-4" /> Send test</Button>
          <Button variant="outline" onClick={() => save(false)}><Save className="size-4" /> Save draft</Button>
          <Button onClick={() => save(true)}>Publish</Button>
        </div>
      </div>

      {view !== "edit" ? (
        <EmailPreview
          device={view}
          subject={subject}
          preheader={preheader}
          fromName={fromName}
          blocks={blocks}
          htmlMode={htmlMode}
          rawHtml={rawHtml}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Canvas */}
          <div className="space-y-4 lg:col-span-2">
            <Card className="shadow-none">
              <CardContent className="grid gap-3 pt-4">
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Subject line</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-7"><Braces className="size-3.5" /> Token</Button>} />
                      <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                        {PERSONALIZATION_TOKENS.map((t) => (
                          <DropdownMenuItem key={t.token} onClick={() => setSubject((s) => `${s}${s ? " " : ""}${t.token}`)}>
                            <span className="flex-1">{t.label}</span>
                            <span className="font-mono text-xs text-muted-foreground">{t.token}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your subject line" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Preview text (preheader)</Label>
                  <Input value={preheader} onChange={(e) => setPreheader(e.target.value)} placeholder="Shown after the subject in the inbox" />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Body</p>
              <div className="flex items-center gap-2 text-xs">
                <span className={cn(!htmlMode && "font-medium text-foreground", "text-muted-foreground")}>Design</span>
                <Switch checked={htmlMode} onCheckedChange={setHtmlMode} />
                <span className={cn(htmlMode && "font-medium text-foreground", "text-muted-foreground")}>HTML</span>
              </div>
            </div>

            {htmlMode ? (
              <Card className="shadow-none">
                <CardContent className="pt-4">
                  <Textarea
                    rows={16}
                    className="font-mono text-xs"
                    value={rawHtml}
                    onChange={(e) => setRawHtml(e.target.value)}
                    placeholder="<html>…</html> — paste or hand-write your HTML"
                  />
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Code2 className="size-3.5" /> HTML mode replaces the drag-and-drop body. Personalization tokens still resolve at send.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Palette */}
                <Card className="shadow-none">
                  <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Add a block</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {PALETTE.map((t) => {
                        const Meta = BLOCK_META[t];
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => addBlock(t)}
                            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors hover:border-primary hover:bg-primary/5"
                          >
                            <Meta.icon className="size-3.5 text-muted-foreground" />
                            {Meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Block canvas */}
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="mx-auto max-w-[600px] space-y-2 rounded-lg bg-white p-4 shadow-sm">
                    {blocks.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-neutral-400">
                        <Plus className="size-6" />
                        Add blocks above to start building your email.
                      </div>
                    ) : (
                      blocks.map((block, i) => (
                        <div key={block.id}>
                          <BlockRow
                            block={block}
                            index={i}
                            total={blocks.length}
                            selected={selectedId === block.id}
                            dragging={dragIndex === i}
                            onSelect={() => setSelectedId(block.id)}
                            onDelete={() => removeBlock(block.id)}
                            onDuplicate={() => duplicateBlock(block.id)}
                            onMove={(dir) => moveBlock(i, i + dir)}
                            onDragStart={() => setDragIndex(i)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (dragIndex !== null && dragIndex !== i) moveBlock(dragIndex, i);
                              setDragIndex(null);
                            }}
                            onDragEnd={() => setDragIndex(null)}
                          />
                          <InsertBetween onAdd={(t) => addBlock(t, i + 1)} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Inspector */}
          <div className="space-y-4">
            <Card className="shadow-none lg:sticky lg:top-6">
              <CardHeader className="pb-3"><CardTitle className="text-base">{selected ? "Block settings" : "Email settings"}</CardTitle></CardHeader>
              <CardContent>
                {selected ? (
                  <EmailBlockConfig block={selected} onChange={(p) => updateBlock(selected.id, p)} />
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label className="text-xs">Email type</Label>
                      <Select value={type} onValueChange={(v) => setType((v as NonNullable<EmailTemplate["type"]>) ?? "newsletter")}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["newsletter", "promotional", "announcement", "welcome", "event", "transactional"] as const).map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs">From name</Label>
                      <Input value={fromName} onChange={(e) => setFromName(e.target.value)} />
                    </div>
                    <div className="space-y-2 border-t pt-3">
                      <ToggleLine label="Track opens" checked={trackOpens} onChange={setTrackOpens} />
                      <ToggleLine label="Track clicks" checked={trackClicks} onChange={setTrackClicks} />
                      <ToggleLine label="Predictive send time" badge="Phase 3" checked={predictive} onChange={setPredictive} />
                    </div>
                    <p className="text-xs text-muted-foreground">Select a block to edit its content.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <TestSendDialog open={testOpen} onOpenChange={setTestOpen} templateName={name} />
      <AiAssistDrawer open={aiOpen} onOpenChange={setAiOpen} onApply={applyAiDraft} />
    </div>
  );
}

function ToggleLine({ label, badge, checked, onChange }: { label: string; badge?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm">
        {label}
        {badge && <Badge variant="outline" className="border-0 bg-blue-500/10 text-blue-700 dark:text-blue-400">{badge}</Badge>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function BlockRow({
  block,
  index,
  total,
  selected,
  dragging,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  block: EmailBlock;
  index: number;
  total: number;
  selected: boolean;
  dragging: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dir: number) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer rounded-lg border-2 p-3 transition-colors",
        selected ? "border-primary" : "border-transparent hover:border-primary/30",
        dragging && "opacity-40"
      )}
    >
      <div className="pointer-events-none">
        <EmailBlockRender block={block} />
      </div>
      {/* hover toolbar */}
      <div
        className="absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-md border bg-background p-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex size-6 cursor-grab items-center justify-center text-muted-foreground" title="Drag to reorder">
          <GripVertical className="size-3.5" />
        </span>
        <Button variant="ghost" size="icon-sm" className="size-6" disabled={index === 0} onClick={() => onMove(-1)}><ChevronUp className="size-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="size-6" disabled={index === total - 1} onClick={() => onMove(1)}><ChevronDown className="size-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="size-6" onClick={onDuplicate}><Copy className="size-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="size-6" onClick={onDelete}><Trash2 className="size-3.5" /></Button>
      </div>
    </div>
  );
}

function InsertBetween({ onAdd }: { onAdd: (t: EmailBlockType) => void }) {
  return (
    <div className="group/insert flex h-4 items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex size-5 items-center justify-center rounded-full border bg-background text-muted-foreground opacity-0 transition-opacity group-hover/insert:opacity-100 hover:border-primary hover:text-primary"
              aria-label="Insert block"
            >
              <Plus className="size-3" />
            </button>
          }
        />
        <DropdownMenuContent align="center" className="max-h-72 overflow-y-auto">
          {PALETTE.map((t) => {
            const Meta = BLOCK_META[t];
            return (
              <DropdownMenuItem key={t} onClick={() => onAdd(t)}>
                <Meta.icon className="size-4" /> {Meta.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function EmailPreview({
  device,
  subject,
  preheader,
  fromName,
  blocks,
  htmlMode,
  rawHtml,
}: {
  device: "desktop" | "mobile";
  subject: string;
  preheader?: string;
  fromName?: string;
  blocks: EmailBlock[];
  htmlMode?: boolean;
  rawHtml?: string;
}) {
  return (
    <div className="flex justify-center rounded-xl border bg-muted/30 p-6">
      <div className={cn("w-full", device === "mobile" ? "max-w-[375px]" : "max-w-[640px]")}>
        {/* inbox header */}
        <div className="rounded-t-lg border border-b-0 bg-background p-3">
          <p className="text-sm font-semibold">{subject || "(no subject)"}</p>
          <p className="text-xs text-muted-foreground">
            {fromName || "Connect NX"} · {preheader || "No preview text"}
          </p>
        </div>
        <div className="rounded-b-lg border bg-white p-5">
          {htmlMode ? (
            <div className="font-mono text-xs whitespace-pre-wrap text-neutral-500">
              {rawHtml?.trim() ? rawHtml : "<!-- HTML preview renders your raw markup at send -->"}
            </div>
          ) : blocks.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-400">This email has no content yet.</p>
          ) : (
            <div className="space-y-3">
              {blocks.map((b) => (
                <EmailBlockRender key={b.id} block={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
