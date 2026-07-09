"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  TrendingUp,
  User,
  UserPlus,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AiEntityDraft,
  AiEntityQuestion,
  EntityType,
  LifecycleStage,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ENTITY_TYPES,
  OWNERS,
  SOURCES,
  TERRITORIES,
  applyAnswer,
  buildQuestions,
  duplicateCheck,
  emptyDraft,
  enrichment,
  entityConfig,
  parseBlurb,
  predictScore,
  suggestTags,
} from "@/lib/ai-entity";
import { cn } from "@/lib/utils";

type Step = "describe" | "clarify" | "review";

const TYPE_ICON: Record<EntityType, typeof User> = {
  lead: UserPlus,
  contact: User,
  customer: Building2,
};

const LIFECYCLE_OPTIONS: LifecycleStage[] = ["subscriber", "lead", "mql", "sql", "customer", "churned"];

const EXAMPLES: Record<EntityType, string> = {
  lead: "Ananya Iyer, procurement head at TechCorp India. Met at the Bangalore SaaS summit, wants an enterprise demo. ananya.iyer@techcorp.in",
  contact: "Rahul Verma from RetailHub, marketing manager, referred by Priya. rahul.v@retailhub.com, +91 99887 76655",
  customer: "Meera Krishnan, VP Legal at Law Partners LLP. Existing account, renewed annual plan. meera.k@lawpartners.in",
};

export function AiCreateEntityDrawer({
  open,
  onOpenChange,
  entityType = "lead",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  entityType?: EntityType;
}) {
  const [type, setType] = useState<EntityType>(entityType);
  const [step, setStep] = useState<Step>("describe");
  const [blurb, setBlurb] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [draft, setDraft] = useState<AiEntityDraft>(() => emptyDraft(entityType));
  const [questions, setQuestions] = useState<AiEntityQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);
  const [creating, setCreating] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cfg = entityConfig(type);
  const fullName = `${draft.firstName} ${draft.lastName}`.trim();
  const dup = useMemo(() => (step === "review" ? duplicateCheck(draft) : undefined), [step, draft]);
  const score = predictScore(draft);
  const scoreBand = score >= 75 ? "Hot" : score >= 50 ? "Warm" : "Cold";
  const scoreColor = score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-slate-400";
  const tagSuggestions = useMemo(() => (step === "review" ? suggestTags(draft) : []), [step, draft]);
  const enrich = useMemo(() => (step === "review" ? enrichment(draft) : []), [step, draft]);

  function resetAll(nextType: EntityType = type) {
    setStep("describe");
    setBlurb("");
    setAnalyzing(false);
    setDraft(emptyDraft(nextType));
    setQuestions([]);
    setQIndex(0);
    setTagInput("");
    setIgnoreDuplicate(false);
    setCreating(false);
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function handleOpenChange(o: boolean) {
    if (!o) resetAll(entityType);
    onOpenChange(o);
  }

  function changeType(t: EntityType) {
    setType(t);
    setDraft((d) => ({ ...d, lifecycleStage: entityConfig(t).defaultLifecycle }));
  }

  function analyze() {
    setAnalyzing(true);
    const t = setTimeout(() => {
      const parsed = parseBlurb(blurb, type);
      const qs = buildQuestions(parsed, type);
      setDraft(parsed);
      setQuestions(qs);
      setQIndex(0);
      setAnalyzing(false);
      setStep(qs.length ? "clarify" : "review");
    }, 750);
    timers.current.push(t);
  }

  function fillManually() {
    setDraft(emptyDraft(type));
    setQuestions([]);
    setStep("review");
  }

  const current = questions[qIndex];

  function setField(field: keyof AiEntityDraft, value: string | string[]) {
    setDraft((d) => applyAnswer(d, field, value));
  }

  function nextQuestion() {
    if (qIndex < questions.length - 1) setQIndex((i) => i + 1);
    else setStep("review");
  }

  function currentAnswerEmpty() {
    if (!current) return false;
    if (current.field === "consent") return false; // optional multi-select
    const v = draft[current.field];
    return typeof v === "string" ? !v.trim() : false;
  }

  function addTag(raw: string) {
    const t = raw.trim().replace(/,$/, "").trim();
    if (!t) return;
    setDraft((d) => (d.tags.includes(t) ? d : { ...d, tags: [...d.tags, t] }));
    setTagInput("");
  }

  const canCreate = Boolean(draft.firstName.trim() && (draft.email.trim() || draft.phone.trim()));

  function create(another: boolean) {
    if (!canCreate) return;
    setCreating(true);
    const t = setTimeout(() => {
      setCreating(false);
      toast.success(`${cfg.label} ${fullName || "record"} created and assigned to ${draft.owner || "you"}`);
      if (another) resetAll(type);
      else handleOpenChange(false);
    }, 700);
    timers.current.push(t);
  }

  const consentChannels: { key: "email" | "whatsapp" | "sms"; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "sms", label: "SMS" },
  ];

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:w-[45vw] data-[side=right]:sm:max-w-none data-[side=right]:sm:min-w-[30rem]">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" /> Create with AI
          </SheetTitle>
          <SheetDescription>
            Describe who you&rsquo;re adding — AI asks a few questions, then drafts the record for your review.
          </SheetDescription>
        </SheetHeader>

        {/* Entity type + step indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
            {ENTITY_TYPES.map((e) => {
              const Icon = TYPE_ICON[e.type];
              return (
                <button
                  key={e.type}
                  type="button"
                  disabled={step !== "describe"}
                  onClick={() => changeType(e.type)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60",
                    type === e.type ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" /> {e.label}
                </button>
              );
            })}
          </div>
          <Stepper step={step} />
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-5 px-6 py-5">
            {step === "describe" && (
              <>
                <div className="grid gap-2">
                  <Label>Describe the {cfg.label.toLowerCase()}</Label>
                  <Textarea
                    rows={5}
                    value={blurb}
                    onChange={(e) => setBlurb(e.target.value)}
                    placeholder={`e.g. ${EXAMPLES[type]}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a business card, an email signature, or just type what you know — AI pulls out the fields.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBlurb(EXAMPLES[type])}
                    className="rounded-full border bg-background px-2.5 py-1 text-xs transition-colors hover:border-violet-500/50 hover:bg-violet-500/5"
                  >
                    Use an example
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlurb("")}
                    className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}

            {step === "clarify" && current && (
              <div className="space-y-5">
                <ExtractedSummary draft={draft} />
                <div className="rounded-lg border border-violet-500/30 bg-violet-500/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-400">
                      <Wand2 className="size-4" /> AI needs a bit more
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Question {qIndex + 1} of {questions.length}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{current.prompt}</p>
                  {current.helper && <p className="mt-0.5 text-xs text-muted-foreground">{current.helper}</p>}

                  <div className="mt-3">
                    <QuestionControl
                      question={current}
                      draft={draft}
                      onChange={setField}
                      consentChannels={consentChannels}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => (qIndex > 0 ? setQIndex((i) => i - 1) : setStep("describe"))}
                  >
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <div className="flex items-center gap-2">
                    {current.optional && (
                      <Button variant="ghost" onClick={nextQuestion}>
                        Skip
                      </Button>
                    )}
                    <Button onClick={nextQuestion} disabled={!current.optional && currentAnswerEmpty()}>
                      {qIndex < questions.length - 1 ? "Next" : "Review"}
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-5">
                {dup && !ignoreDuplicate && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 size-4 text-amber-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Possible duplicate found</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {dup.firstName} {dup.lastName} · {dup.email}
                          {dup.company ? ` · ${dup.company}` : ""} already exists.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => toast.message(`Opening ${dup.firstName}'s record`)}>
                            View existing
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toast.message("Merge flow opened")}>
                            Merge instead
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setIgnoreDuplicate(true)}>
                            Create anyway
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Editable fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldInput label="First name" field="firstName" draft={draft} onChange={setField} required />
                  <FieldInput label="Last name" field="lastName" draft={draft} onChange={setField} />
                  <FieldInput label="Email" field="email" draft={draft} onChange={setField} type="email" />
                  <FieldInput label="Phone" field="phone" draft={draft} onChange={setField} type="tel" />
                  <FieldInput label="Company" field="company" draft={draft} onChange={setField} />
                  <FieldInput label="Job title" field="title" draft={draft} onChange={setField} />
                  <FieldSelect label="Owner" field="owner" draft={draft} onChange={setField} options={OWNERS} placeholder="Assign owner" />
                  <FieldSelect label="Source" field="source" draft={draft} onChange={setField} options={SOURCES} placeholder="Select source" />
                  <FieldSelect
                    label="Lifecycle stage"
                    field="lifecycleStage"
                    draft={draft}
                    onChange={setField}
                    options={LIFECYCLE_OPTIONS}
                    placeholder="Stage"
                  />
                  <FieldSelect label="Territory" field="territory" draft={draft} onChange={setField} options={TERRITORIES} placeholder="Territory" />
                </div>

                {/* Tags */}
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1.5">
                    Tags
                    {draft.aiFilled.includes("tags") && <AiTag />}
                  </Label>
                  <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border p-1.5">
                    {draft.tags.map((t) => (
                      <span key={t} className="flex items-center gap-1 rounded-md bg-muted py-0.5 pl-2 pr-1 text-xs">
                        {t}
                        <button type="button" onClick={() => setDraft((d) => ({ ...d, tags: d.tags.filter((x) => x !== t) }))} aria-label={`Remove ${t}`}>
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      placeholder="Add a tag…"
                      className="h-7 min-w-[8rem] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  {tagSuggestions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Suggested:</span>
                      {tagSuggestions.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => addTag(t)}
                          className="flex items-center gap-1 rounded-full border border-violet-500/40 px-2 py-0.5 text-xs text-violet-700 transition-colors hover:bg-violet-500/10 dark:text-violet-300"
                        >
                          <Plus className="size-3" /> {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Consent */}
                <div className="grid gap-2">
                  <Label>Marketing consent</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {consentChannels.map((c) => {
                      const on = draft.consent[c.key];
                      return (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, consent: { ...d.consent, [c.key]: !d.consent[c.key] } }))}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                            on ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "hover:bg-muted"
                          )}
                        >
                          {on && <Check className="size-3" />} {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI enrichment + score */}
                <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Sparkles className="size-3.5 text-violet-500" /> AI enrichment
                    </p>
                    {enrich.length ? (
                      <dl className="space-y-1 text-sm">
                        {enrich.map((e) => (
                          <div key={e.label} className="flex justify-between gap-2">
                            <dt className="text-muted-foreground">{e.label}</dt>
                            <dd className="text-right font-medium">{e.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-sm text-muted-foreground">Add a company to see firmographics.</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <TrendingUp className="size-3.5 text-violet-500" /> Predicted fit score
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold">{score}</span>
                      <Badge variant="outline" className="border-0 bg-muted">{scoreBand}</Badge>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", scoreColor)} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="flex-row items-center justify-between border-t">
          {step === "describe" && (
            <>
              <Button variant="ghost" onClick={fillManually}>
                <Pencil className="size-4" /> Fill manually instead
              </Button>
              <Button onClick={analyze} disabled={!blurb.trim() || analyzing}>
                {analyzing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {analyzing ? "Analyzing…" : "Analyze with AI"}
              </Button>
            </>
          )}

          {step === "clarify" && (
            <>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Answers are used only to fill the record.
              </span>
              <Button variant="outline" onClick={() => setStep("review")}>
                Skip to review <ArrowRight className="size-4" />
              </Button>
            </>
          )}

          {step === "review" && (
            <>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => setStep(questions.length ? "clarify" : "describe")}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                {!canCreate && (
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    Add a name and email or phone to create.
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={!canCreate || creating} onClick={() => create(true)}>
                  Create &amp; add another
                </Button>
                <Button disabled={!canCreate || creating} onClick={() => create(false)}>
                  {creating ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Create {cfg.label.toLowerCase()}
                </Button>
              </div>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "describe", label: "Describe" },
    { key: "clarify", label: "Clarify" },
    { key: "review", label: "Review" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-full text-[11px] font-medium",
              i < activeIndex && "bg-primary text-primary-foreground",
              i === activeIndex && "bg-primary/15 text-primary ring-1 ring-primary",
              i > activeIndex && "bg-muted text-muted-foreground"
            )}
          >
            {i < activeIndex ? <Check className="size-3" /> : i + 1}
          </span>
          <span className={cn("text-xs", i === activeIndex ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
          {i < steps.length - 1 && <span className="mx-1 h-px w-4 bg-border" />}
        </div>
      ))}
    </div>
  );
}

function AiTag() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded bg-violet-500/10 px-1 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
      <Sparkles className="size-2.5" /> AI
    </span>
  );
}

function ExtractedSummary({ draft }: { draft: AiEntityDraft }) {
  const rows: [string, string][] = [
    ["Name", `${draft.firstName} ${draft.lastName}`.trim()],
    ["Email", draft.email],
    ["Phone", draft.phone],
    ["Company", draft.company],
    ["Title", draft.title],
    ["Source", draft.source],
  ].filter(([, v]) => Boolean(v)) as [string, string][];
  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Couldn&rsquo;t pull much from the description — a few quick questions will sort it out.
      </p>
    );
  }
  return (
    <div>
      <p className="mb-2 text-sm font-medium">Here&rsquo;s what I picked up</p>
      <div className="flex flex-wrap gap-1.5">
        {rows.map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 text-xs">
            <span className="text-muted-foreground">{k}:</span> <span className="font-medium">{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function QuestionControl({
  question,
  draft,
  onChange,
  consentChannels,
}: {
  question: AiEntityQuestion;
  draft: AiEntityDraft;
  onChange: (field: keyof AiEntityDraft, value: string | string[]) => void;
  consentChannels: { key: "email" | "whatsapp" | "sms"; label: string }[];
}) {
  if (question.kind === "consent") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {consentChannels.map((c) => {
          const on = draft.consent[c.key];
          return (
            <button
              key={c.key}
              type="button"
              onClick={() =>
                onChange(
                  "consent",
                  consentChannels.filter((x) => (x.key === c.key ? !on : draft.consent[x.key])).map((x) => x.key)
                )
              }
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                on ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "hover:bg-muted"
              )}
            >
              {on && <Check className="size-3.5" />} {c.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.kind === "select") {
    const value = (draft[question.field] as string) || "";
    return (
      <div className="space-y-2">
        <Select value={value} onValueChange={(v) => onChange(question.field, v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose…" />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {question.suggestions && question.suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Suggested:</span>
            {question.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange(question.field, s)}
                className="rounded-full border border-violet-500/40 px-2 py-0.5 text-xs text-violet-700 transition-colors hover:bg-violet-500/10 dark:text-violet-300"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Input
      autoFocus
      type={question.kind === "email" ? "email" : question.kind === "tel" ? "tel" : "text"}
      value={(draft[question.field] as string) || ""}
      onChange={(e) => onChange(question.field, e.target.value)}
      placeholder="Type your answer…"
    />
  );
}

function FieldInput({
  label,
  field,
  draft,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  field: keyof AiEntityDraft;
  draft: AiEntityDraft;
  onChange: (field: keyof AiEntityDraft, value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="flex items-center gap-1.5">
        {label}
        {required && <span className="text-destructive">*</span>}
        {draft.aiFilled.includes(field) && <AiTag />}
      </Label>
      <Input type={type} value={(draft[field] as string) || ""} onChange={(e) => onChange(field, e.target.value)} />
    </div>
  );
}

function FieldSelect({
  label,
  field,
  draft,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  field: keyof AiEntityDraft;
  draft: AiEntityDraft;
  onChange: (field: keyof AiEntityDraft, value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="flex items-center gap-1.5">
        {label}
        {draft.aiFilled.includes(field) && <AiTag />}
      </Label>
      <Select value={(draft[field] as string) || ""} onValueChange={(v) => onChange(field, v ?? "")}>
        <SelectTrigger className="w-full capitalize">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o} className="capitalize">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
