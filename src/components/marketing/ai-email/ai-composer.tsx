"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  RefreshCw,
  Sparkles,
  Undo2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AiDraftContext,
  AiDraftSection,
  AiRewriteAction,
  AiSubjectOption,
  AiTone,
  EmailBlock,
  EmailTemplate,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AI_EMAIL_STARTERS,
  AI_TONES,
  REWRITE_ACTIONS,
  assembleDraft,
  generateSections,
  generateSubjects,
  regenerateSection,
  rewriteText,
} from "@/lib/ai-email";
import { createDraftId, useAiDraftStore } from "@/lib/stores/ai-draft-store";
import { useBrandVoiceStore } from "@/lib/stores/brand-voice-store";
import { createBlockId, createTemplateId, useEmailTemplateStore } from "@/lib/stores/email-template-store";
import { cn } from "@/lib/utils";

const DEFAULT_CONTEXT: AiDraftContext = {
  goal: "",
  audience: "",
  tone: "friendly",
  keyMessage: "",
  length: "medium",
  cta: "",
  applyBrandVoice: true,
};

export function AiComposer({
  onApply,
  compact,
}: {
  /** When provided (editor integration), shows "Apply to email" instead of creating a new template. */
  onApply?: (subject: string, bodyText: string, sections: AiDraftSection[]) => void;
  /** Stacked single-column layout for narrow containers like the editor drawer. */
  compact?: boolean;
}) {
  const router = useRouter();
  const brand = useBrandVoiceStore((s) => s.voice);
  const addTemplate = useEmailTemplateStore((s) => s.addTemplate);
  const addDraft = useAiDraftStore((s) => s.addDraft);

  const [ctx, setCtx] = useState<AiDraftContext>(DEFAULT_CONTEXT);
  const [generating, setGenerating] = useState(false);
  const [subjects, setSubjects] = useState<AiSubjectOption[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [sections, setSections] = useState<AiDraftSection[]>([]);
  const [undo, setUndo] = useState<Record<string, string>>({});
  const variantRef = useRef<Record<string, number>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const patch = (p: Partial<AiDraftContext>) => setCtx((c) => ({ ...c, ...p }));

  function generate() {
    if (!ctx.goal.trim() && !ctx.keyMessage.trim()) {
      toast.error("Add a goal or key message so the AI has something to work with");
      return;
    }
    setGenerating(true);
    const t = setTimeout(() => {
      const subs = generateSubjects(ctx);
      const secs = generateSections(ctx);
      setSubjects(subs);
      setSelectedSubject(subs[0]?.id ?? "");
      setSections(secs);
      setUndo({});
      variantRef.current = {};
      setGenerating(false);
      const now = new Date().toISOString();
      addDraft({
        id: createDraftId(),
        subject: subs[0]?.text ?? (ctx.goal || ctx.keyMessage).slice(0, 60),
        body: assembleDraft(secs),
        goal: ctx.goal || ctx.keyMessage,
        tone: ctx.tone,
        audience: ctx.audience,
        source: "studio",
        status: "draft",
        createdAt: now,
        updatedAt: now,
      });
    }, 750);
    timers.current.push(t);
  }

  function pickStarter(id: string) {
    const s = AI_EMAIL_STARTERS.find((x) => x.id === id);
    if (!s) return;
    patch({ goal: s.goal, tone: s.tone, cta: s.cta });
  }

  function regenSubjects() {
    const subs = generateSubjects(ctx).map((s, i) => ({ ...s, id: `${s.id}-${(variantRef.current.__subj ?? 0) + 1}-${i}` }));
    variantRef.current.__subj = (variantRef.current.__subj ?? 0) + 1;
    // rotate so it feels fresh
    const rotated = [...subs.slice(1), subs[0]];
    setSubjects(rotated);
    setSelectedSubject(rotated[0]?.id ?? "");
  }

  function regenSection(section: AiDraftSection) {
    const next = (variantRef.current[section.id] ?? 0) + 1;
    variantRef.current[section.id] = next;
    setUndo((u) => ({ ...u, [section.id]: section.text }));
    setSections((secs) => secs.map((s) => (s.id === section.id ? regenerateSection(s, ctx, next) : s)));
  }

  function improve(section: AiDraftSection, action: AiRewriteAction) {
    setUndo((u) => ({ ...u, [section.id]: section.text }));
    setSections((secs) =>
      secs.map((s) => (s.id === section.id ? { ...s, text: rewriteText(s.text, action, brand.signature) } : s))
    );
    toast.success(`${REWRITE_ACTIONS.find((a) => a.value === action)?.label ?? "Rewritten"}`);
  }

  function undoSection(section: AiDraftSection) {
    const prev = undo[section.id];
    if (prev === undefined) return;
    setSections((secs) => secs.map((s) => (s.id === section.id ? { ...s, text: prev } : s)));
    setUndo((u) => {
      const n = { ...u };
      delete n[section.id];
      return n;
    });
  }

  function editSection(id: string, text: string) {
    setSections((secs) => secs.map((s) => (s.id === id ? { ...s, text } : s)));
  }

  const chosen = subjects.find((s) => s.id === selectedSubject);

  function useDraft() {
    if (!chosen || sections.length === 0) return;
    const bodyText = assembleDraft(sections);
    if (onApply) {
      onApply(chosen.text, bodyText, sections);
      return;
    }
    // Standalone: create a new email template from the draft.
    const blocks: EmailBlock[] = sections.map((s) =>
      s.kind === "cta"
        ? { id: createBlockId(), type: "button", text: s.text.replace(/[→\s]+$/, ""), url: "", align: "left", buttonColor: "#2563eb" }
        : s.kind === "greeting"
          ? { id: createBlockId(), type: "heading", level: 2, text: s.text, align: "left" }
          : { id: createBlockId(), type: "text", text: s.text, align: "left" }
    );
    const now = new Date().toISOString();
    const template: EmailTemplate = {
      id: createTemplateId(),
      name: (ctx.goal || ctx.keyMessage || "AI draft").slice(0, 48),
      subject: chosen.text,
      preheader: chosen.preheader,
      category: "AI draft",
      type: "newsletter",
      status: "draft",
      fromName: "Connect NX",
      owner: "Priya Sharma",
      accent: "#7c3aed",
      blocks,
      sent: 0, openRate: 0, clickRate: 0,
      trackOpens: true, trackClicks: true,
      createdAt: now, updatedAt: now,
    };
    addTemplate(template);
    toast.success("Draft saved as a new email");
    router.push(`/marketing/templates/${template.id}/edit`);
  }

  return (
    <div className={cn(compact ? "space-y-6" : "grid gap-6 lg:grid-cols-5")}>
      {/* Context inputs */}
      <Card className={cn("shadow-none", !compact && "lg:col-span-2 lg:sticky lg:top-6 lg:self-start")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-violet-500" /> What should this email do?
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Start from a template</Label>
            <div className="flex flex-wrap gap-1.5">
              {AI_EMAIL_STARTERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pickStarter(s.id)}
                  title={s.description}
                  className="rounded-full border bg-background px-2.5 py-1 text-xs transition-colors hover:border-violet-500/50 hover:bg-violet-500/5"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Goal / objective</Label>
            <Input value={ctx.goal} onChange={(e) => patch({ goal: e.target.value })} placeholder="e.g. Get trial users to book an onboarding call" />
          </div>
          <div className="grid gap-2">
            <Label>Target audience</Label>
            <Input value={ctx.audience} onChange={(e) => patch({ audience: e.target.value })} placeholder="e.g. Marketing leaders at mid-market SaaS" />
          </div>
          <div className="grid gap-2">
            <Label>Key message</Label>
            <Textarea rows={3} value={ctx.keyMessage} onChange={(e) => patch({ keyMessage: e.target.value })} placeholder="The one thing they should take away" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Tone</Label>
              <Select value={ctx.tone} onValueChange={(v) => patch({ tone: (v as AiTone) ?? "friendly" })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AI_TONES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Length</Label>
              <Select value={ctx.length} onValueChange={(v) => patch({ length: (v as AiDraftContext["length"]) ?? "medium" })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Call to action</Label>
            <Input value={ctx.cta} onChange={(e) => patch({ cta: e.target.value })} placeholder="e.g. Book a demo" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Apply brand voice</p>
              <p className="text-xs text-muted-foreground">{brand.attributes.join(" · ")}</p>
            </div>
            <Switch checked={ctx.applyBrandVoice} onCheckedChange={(v) => patch({ applyBrandVoice: v })} />
          </div>
          <Button onClick={generate} disabled={generating}>
            <Wand2 className="size-4" />
            {generating ? "Generating…" : subjects.length ? "Regenerate draft" : "Generate draft"}
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      <div className={cn("space-y-4", !compact && "lg:col-span-3")}>
        {generating ? (
          <GeneratingState />
        ) : subjects.length === 0 ? (
          <Card className="shadow-none">
            <CardContent className="flex flex-col items-center gap-2 py-20 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                <Sparkles className="size-6" />
              </div>
              <p className="text-sm font-medium">Describe your email and let AI draft it</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Fill in the goal and key message, then generate subject lines and a full body you can refine section by section.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Subject options */}
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Subject lines</CardTitle>
                <Button variant="outline" size="sm" onClick={regenSubjects}><RefreshCw className="size-3.5" /> More options</Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSubject(s.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      selectedSubject === s.id ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                    )}
                  >
                    <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border", selectedSubject === s.id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40")}>
                      {selectedSubject === s.id && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{s.text}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{s.rationale}</span>
                    </span>
                  </button>
                ))}
                {chosen && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    <span className="font-medium">Preview text:</span> {chosen.preheader}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Body sections */}
            <Card className="shadow-none">
              <CardHeader><CardTitle className="text-base">Body</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {sections.map((s) => (
                  <div key={s.id} className="group rounded-lg border p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase">{s.label}</span>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {undo[s.id] !== undefined && (
                          <Button variant="ghost" size="sm" className="h-7" onClick={() => undoSection(s)}><Undo2 className="size-3.5" /> Undo</Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7" onClick={() => regenSection(s)}><RefreshCw className="size-3.5" /> Regenerate</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="h-7"><Wand2 className="size-3.5" /> Improve</Button>} />
                          <DropdownMenuContent align="end">
                            {REWRITE_ACTIONS.map((a) => (
                              <DropdownMenuItem key={a.value} onClick={() => improve(s, a.value)}>
                                <span className="flex-1">{a.label}</span>
                                <span className="text-xs text-muted-foreground">{a.hint}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <Textarea
                      value={s.text}
                      onChange={(e) => editSection(s.id, e.target.value)}
                      rows={s.kind === "paragraph" ? 3 : 2}
                      className="resize-none border-0 p-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={() => { navigator.clipboard?.writeText(`${chosen?.text ?? ""}\n\n${assembleDraft(sections)}`); toast.success("Draft copied"); }}>
                <Copy className="size-4" /> Copy
              </Button>
              <Button onClick={useDraft}>
                <Check className="size-4" /> {onApply ? "Apply to email" : "Use in a new email"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GeneratingState() {
  return (
    <Card className="shadow-none">
      <CardContent className="space-y-4 py-8">
        <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
          <Sparkles className="size-4 animate-pulse" /> Drafting your email…
        </div>
        <div className="space-y-2">
          {[90, 70, 80, 60].map((w, i) => (
            <div key={i} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="space-y-2 pt-2">
          {[100, 95, 88].map((w, i) => (
            <div key={i} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
