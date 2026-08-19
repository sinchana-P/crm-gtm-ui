"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  FileText,
  Monitor,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { AbTestVariant, EmailBlock, EmailBlockType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { EmailBlockConfig } from "@/components/marketing/email/email-block-config";
import { EmailBlockRender } from "@/components/marketing/email/email-block-render";
import {
  BLOCK_META,
  BLOCK_PALETTE,
  cloneBlocks,
  makeBlock,
} from "@/components/marketing/email/email-shared";

/**
 * Per-version email editor for an A/B test.
 *
 * Mirrors HubSpot: both versions are fully editable emails and you switch
 * between them with a dropdown. Content lives on the variant rather than on a
 * shared template, so editing one version can never alter the other — or any
 * template another campaign depends on.
 *
 * Reuses the template editor's own block renderer and block config panel, so
 * the blocks, personalisation tokens and preview behave identically to the
 * standalone email editor.
 */
export function AbVersionEditor({
  variants,
  activeId,
  onActiveIdChange,
  onPatchVariant,
  sourceTemplateName,
  readOnly = false,
}: {
  variants: AbTestVariant[];
  activeId: string;
  onActiveIdChange: (id: string) => void;
  onPatchVariant: (id: string, patch: Partial<AbTestVariant>) => void;
  /** The campaign email both versions were duplicated from. */
  sourceTemplateName?: string;
  readOnly?: boolean;
}) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [view, setView] = useState<"desktop" | "mobile">("desktop");

  const active = variants.find((v) => v.id === activeId) ?? variants[0];
  const other = variants.find((v) => v.id !== active?.id);
  if (!active) return null;

  const blocks = active.blocks ?? [];
  const selected = selectedBlockId ? blocks.find((b) => b.id === selectedBlockId) : null;

  function setBlocks(next: EmailBlock[]) {
    onPatchVariant(active.id, { blocks: next });
  }

  function addBlock(type: EmailBlockType) {
    const block = makeBlock(type);
    setBlocks([...blocks, block]);
    setSelectedBlockId(block.id);
  }

  function patchBlock(id: string, patch: Partial<EmailBlock>) {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function removeBlock(id: string) {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  }

  /** Start this version over from the other one's content. */
  function copyFromOther() {
    if (!other) return;
    onPatchVariant(active.id, {
      subject: other.subject,
      preheader: other.preheader,
      senderName: other.senderName,
      blocks: cloneBlocks(other.blocks ?? []),
    });
    setSelectedBlockId(null);
    toast.success(`Copied ${other.name || other.label} into ${active.name || active.label}`);
  }

  return (
    <div className="grid gap-4">
      {sourceTemplateName && (
        <div className="flex items-start gap-2 rounded-lg border border-dashed p-3">
          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Both versions were duplicated from your campaign email{" "}
            <span className="font-medium text-foreground">{sourceTemplateName}</span>, so they start
            with the same design. Editing them here does not change that template or any other
            campaign using it.
          </p>
        </div>
      )}

      {/* ── version switcher, as HubSpot puts it in the editor header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Editing</Label>
          <Select value={active.id} onValueChange={(v) => { onActiveIdChange(v ?? active.id); setSelectedBlockId(null); }}>
            <SelectTrigger className="h-8 w-56">
              <SelectValue>
                {(v) => {
                  const m = variants.find((x) => x.id === v);
                  return m ? `${m.label} — ${m.name || "untitled"}` : active.label;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {variants.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label} — {v.name || "untitled"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {active.isControl && (
            <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
              Original
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {other && !readOnly && (
            <Button variant="ghost" size="sm" onClick={copyFromOther}>
              <Copy className="size-4" />
              Copy from {other.label}
            </Button>
          )}
          <Button
            variant={view === "desktop" ? "secondary" : "ghost"}
            size="icon"
            className="size-8"
            onClick={() => setView("desktop")}
            aria-label="Desktop preview"
          >
            <Monitor className="size-4" />
          </Button>
          <Button
            variant={view === "mobile" ? "secondary" : "ghost"}
            size="icon"
            className="size-8"
            onClick={() => setView("mobile")}
            aria-label="Mobile preview"
          >
            <Smartphone className="size-4" />
          </Button>
        </div>
      </div>

      {/* ── header fields ──────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor={`ver-name-${active.id}`} className="text-xs">
            Version name
          </Label>
          <Input
            id={`ver-name-${active.id}`}
            value={active.name ?? ""}
            onChange={(e) => onPatchVariant(active.id, { name: e.target.value })}
            placeholder={active.label}
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor={`ver-subj-${active.id}`} className="text-xs">
            Subject line
          </Label>
          <Input
            id={`ver-subj-${active.id}`}
            value={active.subject ?? ""}
            onChange={(e) => onPatchVariant(active.id, { subject: e.target.value })}
            placeholder="What lands in their inbox"
            disabled={readOnly}
            maxLength={255}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`ver-pre-${active.id}`} className="text-xs">
            Preview text
          </Label>
          <Input
            id={`ver-pre-${active.id}`}
            value={active.preheader ?? ""}
            onChange={(e) => onPatchVariant(active.id, { preheader: e.target.value })}
            placeholder="Shown after the subject in most inboxes"
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`ver-from-${active.id}`} className="text-xs">
            Sender name
          </Label>
          <Input
            id={`ver-from-${active.id}`}
            value={active.senderName ?? ""}
            onChange={(e) => onPatchVariant(active.id, { senderName: e.target.value })}
            placeholder="Connect NX"
            disabled={readOnly}
          />
        </div>
      </div>

      <Separator />

      {/* ── body: canvas + block settings ──────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Email content</Label>
            <span className="text-xs text-muted-foreground">
              {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
            </span>
          </div>

          <div
            className={cn(
              "mx-auto w-full rounded-lg border bg-background p-4",
              view === "mobile" ? "max-w-[380px]" : "max-w-[640px]"
            )}
          >
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Eye className="size-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  This version has no content yet. Add a block below.
                </p>
              </div>
            ) : (
              <div className="grid gap-1">
                {blocks.map((block, i) => (
                  <div
                    key={block.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedBlockId(block.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedBlockId(block.id);
                    }}
                    className={cn(
                      "group relative cursor-pointer rounded-md p-2 outline-none transition-colors",
                      selectedBlockId === block.id
                        ? "ring-2 ring-primary"
                        : "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <EmailBlockRender block={block} />
                    {!readOnly && (
                      <div className="absolute right-1 top-1 hidden items-center gap-0.5 rounded-md border bg-background p-0.5 group-hover:flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={(e) => { e.stopPropagation(); move(i, -1); }}
                          disabled={i === 0}
                          aria-label="Move up"
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={(e) => { e.stopPropagation(); move(i, 1); }}
                          disabled={i === blocks.length - 1}
                          aria-label="Move down"
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground"
                          onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                          aria-label="Remove block"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!readOnly && (
            <div className="flex flex-wrap gap-1.5">
              {BLOCK_PALETTE.map((t) => {
                const Meta = BLOCK_META[t];
                return (
                  <Button key={t} variant="outline" size="sm" onClick={() => addBlock(t)}>
                    <Plus className="size-3.5" />
                    <Meta.icon className="size-3.5" />
                    {Meta.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* selected block settings */}
        <div className="rounded-lg border p-3">
          {selected ? (
            <EmailBlockConfig
              block={selected}
              onChange={(patch) => !readOnly && patchBlock(selected.id, patch)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a block in the email to edit it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
