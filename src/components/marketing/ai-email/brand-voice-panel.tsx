"use client";

import { useState } from "react";
import { Check, Plus, RotateCcw, Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { toast } from "sonner";
import type { BrandVoice } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BRAND_ATTRIBUTE_OPTIONS } from "@/lib/mock-data/ai-email";
import { useBrandVoiceStore } from "@/lib/stores/brand-voice-store";
import { cn } from "@/lib/utils";

export function BrandVoicePanel() {
  const stored = useBrandVoiceStore((s) => s.voice);
  const setVoice = useBrandVoiceStore((s) => s.setVoice);
  const reset = useBrandVoiceStore((s) => s.reset);
  const [draft, setDraft] = useState<BrandVoice>(stored);

  const patch = (p: Partial<BrandVoice>) => setDraft((d) => ({ ...d, ...p }));
  const toggleAttr = (a: string) =>
    patch({
      attributes: draft.attributes.includes(a)
        ? draft.attributes.filter((x) => x !== a)
        : draft.attributes.length < 5
          ? [...draft.attributes, a]
          : draft.attributes,
    });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Voice attributes</CardTitle>
            <p className="text-sm text-muted-foreground">Pick up to 5 — the AI applies these to every draft.</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {BRAND_ATTRIBUTE_OPTIONS.map((a) => {
                const on = draft.attributes.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAttr(a)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      on ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {on && <Check className="mr-1 inline size-3.5" />}
                    {a}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ThumbsUp className="size-4 text-emerald-500" /> Do</CardTitle></CardHeader>
            <CardContent><EditableList items={draft.doList} onChange={(doList) => patch({ doList })} placeholder="Add a do…" /></CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ThumbsDown className="size-4 text-red-500" /> Don&apos;t</CardTitle></CardHeader>
            <CardContent><EditableList items={draft.dontList} onChange={(dontList) => patch({ dontList })} placeholder="Add a don't…" /></CardContent>
          </Card>
        </div>

        <Card className="shadow-none">
          <CardHeader><CardTitle className="text-base">Reference sample & signature</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Sample of on-brand writing</Label>
              <Textarea rows={4} value={draft.sample} onChange={(e) => patch({ sample: e.target.value })} />
              <p className="text-xs text-muted-foreground">The AI mirrors the rhythm and word choice of this sample.</p>
            </div>
            <div className="grid gap-2">
              <Label>Default sign-off</Label>
              <Textarea rows={2} value={draft.signature} onChange={(e) => patch({ signature: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => { reset(); setDraft(useBrandVoiceStore.getState().voice); toast.success("Reset to default"); }}>
            <RotateCcw className="size-4" /> Reset
          </Button>
          <Button onClick={() => { setVoice(draft); toast.success("Brand voice saved"); }}>
            <Check className="size-4" /> Save brand voice
          </Button>
        </div>
      </div>

      {/* Live sample */}
      <Card className="shadow-none lg:sticky lg:top-6 lg:self-start">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-violet-500" /> How AI will sound</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {draft.attributes.map((a) => (<span key={a} className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs text-violet-700 dark:text-violet-400">{a}</span>))}
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">{draft.sample}</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border p-2"><span className="text-muted-foreground">Reading level</span><p className="font-medium capitalize">{draft.readingLevel}</p></div>
            <div className="rounded-md border p-2"><span className="text-muted-foreground">Emoji</span><p className="font-medium capitalize">{draft.emoji}</p></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">Reading level</Label>
              <Select value={draft.readingLevel} onValueChange={(v) => patch({ readingLevel: (v as BrandVoice["readingLevel"]) ?? "standard" })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Emoji use</Label>
              <Select value={draft.emoji} onValueChange={(v) => patch({ emoji: (v as BrandVoice["emoji"]) ?? "sparingly" })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sparingly">Sparingly</SelectItem>
                  <SelectItem value="liberal">Liberal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditableList({ items, placeholder, onChange }: { items: string[]; placeholder: string; onChange: (v: string[]) => void }) {
  const [val, setVal] = useState("");
  const add = () => { const v = val.trim(); if (v) { onChange([...items, v]); setVal(""); } };
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-sm">
          <span className="flex-1">{it}</span>
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="mt-0.5 text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder} className="h-8" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button variant="outline" size="sm" onClick={add}><Plus className="size-4" /></Button>
      </div>
    </div>
  );
}
