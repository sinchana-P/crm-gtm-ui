"use client";

import { AlignCenter, AlignLeft, AlignRight, GripVertical, Plus, Trash2 } from "lucide-react";
import type {
  LandingBlock,
  LandingFaqItem,
  LandingFormField,
  LandingFormFieldType,
  LandingPricingTier,
  LandingStatItem,
  LandingTestimonialItem,
} from "@/lib/types";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LANDING_BLOCK_META, createLandingId } from "@/components/marketing/landing-pages/landing-shared";

const SOCIAL_OPTIONS = ["twitter", "linkedin", "instagram", "facebook", "youtube", "github"];
const CRM_FIELDS = ["name", "firstName", "lastName", "email", "phone", "company", "jobTitle", "country", "custom"];
const FIELD_TYPES: LandingFormFieldType[] = ["text", "email", "phone", "textarea", "select", "checkbox", "consent", "date", "number", "hidden"];

function Field({ label, action, className, children }: { label: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {action}
      </div>
      {children}
    </div>
  );
}

function AlignButtons({ value, onChange }: { value?: LandingBlock["align"]; onChange: (a: LandingBlock["align"]) => void }) {
  const opts: { v: LandingBlock["align"]; icon: typeof AlignLeft }[] = [
    { v: "left", icon: AlignLeft },
    { v: "center", icon: AlignCenter },
    { v: "right", icon: AlignRight },
  ];
  return (
    <div className="flex items-center rounded-lg border p-0.5">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn("flex size-7 items-center justify-center rounded-md", (value ?? "left") === o.v ? "bg-secondary text-foreground" : "text-muted-foreground")}
        >
          <o.icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

function ColorField({ label, value, fallback, onChange }: { label: string; value?: string; fallback: string; onChange: (v: string) => void }) {
  return (
    <Field label={label} className="flex-1">
      <div className="flex items-center gap-2">
        <input type="color" value={value ?? fallback} onChange={(e) => onChange(e.target.value)} className="size-8 cursor-pointer rounded border" />
        <Input value={value ?? fallback} onChange={(e) => onChange(e.target.value)} className="w-28" />
      </div>
    </Field>
  );
}

export function LandingBlockConfig({ block, onChange }: { block: LandingBlock; onChange: (patch: Partial<LandingBlock>) => void }) {
  const meta = LANDING_BLOCK_META[block.type];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-muted">
          <meta.icon className="size-4 text-muted-foreground" />
        </span>
        <div>
          <p className="text-sm font-medium">{meta.label}</p>
          <p className="text-xs text-muted-foreground">{meta.hint}</p>
        </div>
      </div>

      {block.type === "heading" && (
        <>
          <Field label="Text"><Textarea rows={2} value={block.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></Field>
          <div className="flex items-center justify-between gap-3">
            <Field label="Size" className="flex-1">
              <Select value={String(block.level ?? 1)} onValueChange={(v) => onChange({ level: Number(v) as 1 | 2 | 3 | 4 })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1 — Hero</SelectItem>
                  <SelectItem value="2">H2 — Section</SelectItem>
                  <SelectItem value="3">H3 — Sub</SelectItem>
                  <SelectItem value="4">H4 — Small</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
          </div>
          <ColorField label="Text color" value={block.textColor} fallback="#111827" onChange={(v) => onChange({ textColor: v })} />
        </>
      )}

      {block.type === "text" && (
        <>
          <Field label="Text"><Textarea rows={5} value={block.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></Field>
          <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
        </>
      )}

      {block.type === "list" && <ListEditor items={block.items ?? []} onChange={(items) => onChange({ items })} />}

      {block.type === "image" && (
        <>
          <Field label="Image URL"><Input value={block.src ?? ""} onChange={(e) => onChange({ src: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Alt text"><Input value={block.alt ?? ""} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Describe the image" /></Field>
          <Field label="Links to (optional)"><Input value={block.url ?? ""} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
        </>
      )}

      {block.type === "video" && (
        <>
          <Field label="Video URL"><Input value={block.videoUrl ?? ""} onChange={(e) => onChange({ videoUrl: e.target.value })} placeholder="YouTube / Vimeo / MP4 URL" /></Field>
          <Field label="Poster image"><Input value={block.posterUrl ?? ""} onChange={(e) => onChange({ posterUrl: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
        </>
      )}

      {block.type === "logos" && (
        <Field label="Logos (one per line)">
          <Textarea rows={5} value={(block.logos ?? []).join("\n")} onChange={(e) => onChange({ logos: e.target.value.split("\n").filter(Boolean) })} />
        </Field>
      )}

      {block.type === "button" && (
        <>
          <Field label="Label"><Input value={block.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></Field>
          <Field label="Links to"><Input value={block.url ?? ""} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://… or #section" /></Field>
          <div className="flex items-center justify-between gap-3">
            <Field label="Style" className="flex-1">
              <Select value={block.buttonStyle ?? "primary"} onValueChange={(v) => onChange({ buttonStyle: v as LandingBlock["buttonStyle"] })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Size" className="flex-1">
              <Select value={block.buttonSize ?? "md"} onValueChange={(v) => onChange({ buttonSize: v as LandingBlock["buttonSize"] })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
        </>
      )}

      {block.type === "form" && block.form && <FormEditor block={block} onChange={onChange} />}

      {block.type === "countdown" && (
        <>
          <Field label="Counts down to"><Input type="datetime-local" value={block.countdownTo ?? ""} onChange={(e) => onChange({ countdownTo: e.target.value })} /></Field>
          <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
        </>
      )}

      {block.type === "pricing" && <PricingEditor tiers={block.pricing ?? []} onChange={(pricing) => onChange({ pricing })} />}

      {block.type === "testimonial" && <TestimonialEditor items={block.testimonials ?? []} onChange={(testimonials) => onChange({ testimonials })} />}

      {block.type === "stats" && <StatsEditor items={block.stats ?? []} onChange={(stats) => onChange({ stats })} />}

      {block.type === "faq" && <FaqEditor items={block.faqs ?? []} onChange={(faqs) => onChange({ faqs })} />}

      {(block.type === "socialIcons" || block.type === "footer") && (
        <>
          {block.type === "footer" && <Field label="Footer text"><Input value={block.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></Field>}
          <Field label="Networks">
            <div className="flex flex-wrap gap-1.5">
              {SOCIAL_OPTIONS.map((s) => {
                const on = (block.socials ?? []).includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ socials: on ? (block.socials ?? []).filter((x) => x !== s) : [...(block.socials ?? []), s] })}
                    className={cn("rounded-md border px-2.5 py-1 text-xs capitalize", on ? "border-primary bg-primary/5 text-foreground" : "text-muted-foreground")}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Field>
          {block.type === "socialIcons" && <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>}
        </>
      )}

      {block.type === "navbar" && (
        <>
          <Field label="Brand name"><Input value={block.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></Field>
          <NavLinksEditor links={block.navLinks ?? []} onChange={(navLinks) => onChange({ navLinks })} />
        </>
      )}

      {block.type === "spacer" && (
        <Field label={`Height — ${block.height ?? 32}px`}>
          <Input type="number" min={8} max={200} value={block.height ?? 32} onChange={(e) => onChange({ height: Number(e.target.value) || 32 })} />
        </Field>
      )}

      {block.type === "divider" && <p className="text-sm text-muted-foreground">A horizontal divider line. No options.</p>}

      {block.type === "html" && (
        <Field label="Custom HTML / embed">
          <Textarea rows={8} className="font-mono text-xs" value={block.html ?? ""} onChange={(e) => onChange({ html: e.target.value })} placeholder="<div>…</div>" />
        </Field>
      )}
    </div>
  );
}

function ListEditor({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  return (
    <Field label="Items" action={<Button variant="outline" size="sm" className="h-7" onClick={() => onChange([...items, "New benefit"])}><Plus className="size-3.5" /> Add</Button>}>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={it} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <Button variant="ghost" size="icon-sm" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </div>
    </Field>
  );
}

function NavLinksEditor({ links, onChange }: { links: NonNullable<LandingBlock["navLinks"]>; onChange: (l: NonNullable<LandingBlock["navLinks"]>) => void }) {
  return (
    <Field label="Links" action={<Button variant="outline" size="sm" className="h-7" onClick={() => onChange([...links, { id: createLandingId("nav"), label: "Link", url: "#" }])}><Plus className="size-3.5" /> Add</Button>}>
      <div className="space-y-2">
        {links.map((l) => (
          <div key={l.id} className="flex items-center gap-2">
            <Input className="flex-1" value={l.label} onChange={(e) => onChange(links.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)))} placeholder="Label" />
            <Input className="flex-1" value={l.url} onChange={(e) => onChange(links.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)))} placeholder="#anchor" />
            <Button variant="ghost" size="icon-sm" onClick={() => onChange(links.filter((x) => x.id !== l.id))}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </div>
    </Field>
  );
}

function StatsEditor({ items, onChange }: { items: LandingStatItem[]; onChange: (i: LandingStatItem[]) => void }) {
  return (
    <Field label="Metrics" action={<Button variant="outline" size="sm" className="h-7" onClick={() => onChange([...items, { id: createLandingId("st"), value: "0", label: "Metric" }])}><Plus className="size-3.5" /> Add</Button>}>
      <div className="space-y-2">
        {items.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <Input className="w-24" value={s.value} onChange={(e) => onChange(items.map((x) => (x.id === s.id ? { ...x, value: e.target.value } : x)))} placeholder="12k+" />
            <Input className="flex-1" value={s.label} onChange={(e) => onChange(items.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))} placeholder="Label" />
            <Button variant="ghost" size="icon-sm" onClick={() => onChange(items.filter((x) => x.id !== s.id))}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </div>
    </Field>
  );
}

function FaqEditor({ items, onChange }: { items: LandingFaqItem[]; onChange: (i: LandingFaqItem[]) => void }) {
  return (
    <Field label="Questions" action={<Button variant="outline" size="sm" className="h-7" onClick={() => onChange([...items, { id: createLandingId("faq"), question: "Question?", answer: "Answer." }])}><Plus className="size-3.5" /> Add</Button>}>
      <div className="space-y-2">
        {items.map((f) => (
          <div key={f.id} className="space-y-2 rounded-lg border p-2.5">
            <div className="flex items-center gap-2">
              <Input className="h-7 flex-1" value={f.question} onChange={(e) => onChange(items.map((x) => (x.id === f.id ? { ...x, question: e.target.value } : x)))} placeholder="Question" />
              <Button variant="ghost" size="icon-sm" onClick={() => onChange(items.filter((x) => x.id !== f.id))}><Trash2 className="size-4" /></Button>
            </div>
            <Textarea rows={2} value={f.answer} onChange={(e) => onChange(items.map((x) => (x.id === f.id ? { ...x, answer: e.target.value } : x)))} placeholder="Answer" />
          </div>
        ))}
      </div>
    </Field>
  );
}

function TestimonialEditor({ items, onChange }: { items: LandingTestimonialItem[]; onChange: (i: LandingTestimonialItem[]) => void }) {
  return (
    <Field label="Testimonials" action={<Button variant="outline" size="sm" className="h-7" onClick={() => onChange([...items, { id: createLandingId("tst"), quote: "Great product!", author: "Name", role: "Title" }])}><Plus className="size-3.5" /> Add</Button>}>
      <div className="space-y-2">
        {items.map((t) => (
          <div key={t.id} className="space-y-2 rounded-lg border p-2.5">
            <div className="flex items-center gap-2">
              <Input className="h-7 flex-1" value={t.author} onChange={(e) => onChange(items.map((x) => (x.id === t.id ? { ...x, author: e.target.value } : x)))} placeholder="Author" />
              <Button variant="ghost" size="icon-sm" onClick={() => onChange(items.filter((x) => x.id !== t.id))}><Trash2 className="size-4" /></Button>
            </div>
            <Input className="h-7" value={t.role ?? ""} onChange={(e) => onChange(items.map((x) => (x.id === t.id ? { ...x, role: e.target.value } : x)))} placeholder="Role, Company" />
            <Textarea rows={2} value={t.quote} onChange={(e) => onChange(items.map((x) => (x.id === t.id ? { ...x, quote: e.target.value } : x)))} placeholder="Quote" />
          </div>
        ))}
      </div>
    </Field>
  );
}

function PricingEditor({ tiers, onChange }: { tiers: LandingPricingTier[]; onChange: (t: LandingPricingTier[]) => void }) {
  const patch = (id: string, p: Partial<LandingPricingTier>) => onChange(tiers.map((t) => (t.id === id ? { ...t, ...p } : t)));
  return (
    <Field label="Plans" action={<Button variant="outline" size="sm" className="h-7" onClick={() => onChange([...tiers, { id: createLandingId("tier"), name: "Plan", price: "$0", period: "/mo", features: ["Feature"] }])}><Plus className="size-3.5" /> Add</Button>}>
      <div className="space-y-2">
        {tiers.map((t) => (
          <div key={t.id} className="space-y-2 rounded-lg border p-2.5">
            <div className="flex items-center gap-2">
              <Input className="h-7 flex-1" value={t.name} onChange={(e) => patch(t.id, { name: e.target.value })} placeholder="Plan name" />
              <Button variant="ghost" size="icon-sm" onClick={() => onChange(tiers.filter((x) => x.id !== t.id))}><Trash2 className="size-4" /></Button>
            </div>
            <div className="flex items-center gap-2">
              <Input className="h-7 w-24" value={t.price} onChange={(e) => patch(t.id, { price: e.target.value })} placeholder="$49" />
              <Input className="h-7 w-20" value={t.period ?? ""} onChange={(e) => patch(t.id, { period: e.target.value })} placeholder="/mo" />
              <Input className="h-7 flex-1" value={t.ctaLabel ?? ""} onChange={(e) => patch(t.id, { ctaLabel: e.target.value })} placeholder="CTA label" />
            </div>
            <Textarea rows={2} value={t.features.join("\n")} onChange={(e) => patch(t.id, { features: e.target.value.split("\n").filter(Boolean) })} placeholder="One feature per line" />
            <label className="flex items-center justify-between text-xs">
              <span>Highlight as recommended</span>
              <Switch checked={!!t.highlighted} onCheckedChange={(v) => patch(t.id, { highlighted: v })} />
            </label>
          </div>
        ))}
      </div>
    </Field>
  );
}

function FormEditor({ block, onChange }: { block: LandingBlock; onChange: (patch: Partial<LandingBlock>) => void }) {
  const form = block.form!;
  const setForm = (p: Partial<NonNullable<LandingBlock["form"]>>) => onChange({ form: { ...form, ...p } });
  const patchField = (id: string, p: Partial<LandingFormField>) => setForm({ fields: form.fields.map((f) => (f.id === id ? { ...f, ...p } : f)) });
  const addField = () => setForm({ fields: [...form.fields, { id: createLandingId("fld"), type: "text", label: "New field", required: false, width: "full" }] });

  return (
    <div className="space-y-4">
      <Field label="Fields" action={<Button variant="outline" size="sm" className="h-7" onClick={addField}><Plus className="size-3.5" /> Add field</Button>}>
        <div className="space-y-2">
          {form.fields.map((f) => (
            <div key={f.id} className="space-y-2 rounded-lg border p-2.5">
              <div className="flex items-center gap-2">
                <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                <Input className="h-7 flex-1" value={f.label} onChange={(e) => patchField(f.id, { label: e.target.value })} placeholder="Field label" />
                <Button variant="ghost" size="icon-sm" onClick={() => setForm({ fields: form.fields.filter((x) => x.id !== f.id) })}><Trash2 className="size-4" /></Button>
              </div>
              <div className="flex items-center gap-2">
                <Select value={f.type} onValueChange={(v) => patchField(f.id, { type: v as LandingFormFieldType })}>
                  <SelectTrigger className="h-7 flex-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{FIELD_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize text-xs">{t}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={f.mapTo ?? "custom"} onValueChange={(v) => patchField(f.id, { mapTo: v ?? "custom" })}>
                  <SelectTrigger className="h-7 flex-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{CRM_FIELDS.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5"><Switch checked={!!f.required} onCheckedChange={(v) => patchField(f.id, { required: v })} /> Required</label>
                <label className="flex items-center gap-1.5"><Switch checked={f.width === "half"} onCheckedChange={(v) => patchField(f.id, { width: v ? "half" : "full" })} /> Half width</label>
                <label className="flex items-center gap-1.5"><Switch checked={!!f.progressive} onCheckedChange={(v) => patchField(f.id, { progressive: v })} /> Progressive</label>
              </div>
            </div>
          ))}
        </div>
      </Field>

      <div className="space-y-3 border-t pt-3">
        <Field label="Submit button label"><Input value={form.submitLabel} onChange={(e) => setForm({ submitLabel: e.target.value })} /></Field>
        <Field label="On submit">
          <Select value={form.action} onValueChange={(v) => setForm({ action: v as NonNullable<LandingBlock["form"]>["action"] })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="message">Show thank-you message</SelectItem>
              <SelectItem value="thankYouPage">Go to thank-you page</SelectItem>
              <SelectItem value="redirect">Redirect to URL</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {form.action === "message" && <Field label="Thank-you message"><Textarea rows={2} value={form.thankYouMessage ?? ""} onChange={(e) => setForm({ thankYouMessage: e.target.value })} /></Field>}
        {form.action === "redirect" && <Field label="Redirect URL"><Input value={form.redirectUrl ?? ""} onChange={(e) => setForm({ redirectUrl: e.target.value })} placeholder="https://…" /></Field>}
        <Field label="Enroll in sequence (optional)"><Input value={form.followUpSequenceId ?? ""} onChange={(e) => setForm({ followUpSequenceId: e.target.value })} placeholder="Sequence name or ID" /></Field>
        <Field label="Notify email (optional)"><Input value={form.notifyEmail ?? ""} onChange={(e) => setForm({ notifyEmail: e.target.value })} placeholder="team@company.com" /></Field>
        <label className="flex items-center justify-between text-sm"><span>Multi-step form</span><Switch checked={!!form.multiStep} onCheckedChange={(v) => setForm({ multiStep: v })} /></label>
        <label className="flex items-center justify-between text-sm"><span>Spam protection (reCAPTCHA)</span><Switch checked={!!form.recaptcha} onCheckedChange={(v) => setForm({ recaptcha: v })} /></label>
        <label className="flex items-center justify-between text-sm"><span>Require consent checkbox</span><Switch checked={!!form.consentRequired} onCheckedChange={(v) => setForm({ consentRequired: v })} /></label>
      </div>
    </div>
  );
}
