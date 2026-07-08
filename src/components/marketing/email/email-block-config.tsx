"use client";

import { AlignCenter, AlignLeft, AlignRight, Braces, Plus, Trash2 } from "lucide-react";
import type { EmailBlock, EmailDynamicVariant } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BLOCK_META, PERSONALIZATION_TOKENS } from "@/components/marketing/email/email-shared";

const SOCIAL_OPTIONS = ["twitter", "linkedin", "instagram", "facebook", "youtube"];

function TokenInsert({ onInsert }: { onInsert: (token: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-7">
            <Braces className="size-3.5" />
            Token
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
        {PERSONALIZATION_TOKENS.map((t) => (
          <DropdownMenuItem key={t.token} onClick={() => onInsert(t.token)}>
            <span className="flex-1">{t.label}</span>
            <span className="font-mono text-xs text-muted-foreground">{t.token}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AlignButtons({
  value,
  onChange,
}: {
  value?: EmailBlock["align"];
  onChange: (a: EmailBlock["align"]) => void;
}) {
  const opts: { v: EmailBlock["align"]; icon: typeof AlignLeft }[] = [
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
          className={cn(
            "flex size-7 items-center justify-center rounded-md",
            (value ?? "left") === o.v ? "bg-secondary text-foreground" : "text-muted-foreground"
          )}
        >
          <o.icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

export function EmailBlockConfig({
  block,
  onChange,
}: {
  block: EmailBlock;
  onChange: (patch: Partial<EmailBlock>) => void;
}) {
  const meta = BLOCK_META[block.type];
  const appendToken = (field: "text", token: string) =>
    onChange({ [field]: `${block[field] ?? ""}${block[field] ? " " : ""}${token}` } as Partial<EmailBlock>);

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
          <Field label="Text">
            <Textarea rows={2} value={block.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <div className="flex items-center justify-between gap-3">
            <Field label="Level" className="flex-1">
              <Select value={String(block.level ?? 1)} onValueChange={(v) => onChange({ level: Number(v ?? 1) as 1 | 2 | 3 })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1 — Large</SelectItem>
                  <SelectItem value="2">H2 — Medium</SelectItem>
                  <SelectItem value="3">H3 — Small</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
          </div>
        </>
      )}

      {block.type === "text" && (
        <>
          <Field label="Text" action={<TokenInsert onInsert={(t) => appendToken("text", t)} />}>
            <Textarea rows={5} value={block.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} placeholder="Write your copy… use tokens like {{firstName}}" />
          </Field>
          <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
        </>
      )}

      {block.type === "image" && (
        <>
          <Field label="Image URL">
            <Input value={block.src ?? ""} onChange={(e) => onChange({ src: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Alt text">
            <Input value={block.alt ?? ""} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Describe the image" />
          </Field>
          <Field label="Links to (optional)">
            <Input value={block.url ?? ""} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
        </>
      )}

      {block.type === "button" && (
        <>
          <Field label="Label"><Input value={block.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></Field>
          <Field label="Links to"><Input value={block.url ?? ""} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://…" /></Field>
          <div className="flex items-center justify-between gap-3">
            <Field label="Button color" className="flex-1">
              <div className="flex items-center gap-2">
                <input type="color" value={block.buttonColor ?? "#2563eb"} onChange={(e) => onChange({ buttonColor: e.target.value })} className="size-8 cursor-pointer rounded border" />
                <Input value={block.buttonColor ?? "#2563eb"} onChange={(e) => onChange({ buttonColor: e.target.value })} className="w-28" />
              </div>
            </Field>
            <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
          </div>
        </>
      )}

      {block.type === "spacer" && (
        <Field label={`Height — ${block.height ?? 24}px`}>
          <Input type="number" min={4} max={120} value={block.height ?? 24} onChange={(e) => onChange({ height: Number(e.target.value) || 24 })} />
        </Field>
      )}

      {block.type === "divider" && (
        <p className="text-sm text-muted-foreground">A horizontal divider line. No options.</p>
      )}

      {block.type === "social" && (
        <>
          <Field label="Networks">
            <div className="flex flex-wrap gap-1.5">
              {SOCIAL_OPTIONS.map((s) => {
                const on = (block.socials ?? []).includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      onChange({ socials: on ? (block.socials ?? []).filter((x) => x !== s) : [...(block.socials ?? []), s] })
                    }
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs capitalize",
                      on ? "border-primary bg-primary/5 text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Align"><AlignButtons value={block.align} onChange={(a) => onChange({ align: a })} /></Field>
        </>
      )}

      {block.type === "columns" && (
        <>
          <Field label="Columns">
            <Select
              value={String((block.colText ?? ["", ""]).length)}
              onValueChange={(v) => {
                const n = Number(v ?? 2);
                const cur = block.colText ?? ["", ""];
                const next = Array.from({ length: n }, (_, i) => cur[i] ?? `Column ${i + 1}`);
                onChange({ colText: next });
              }}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 columns</SelectItem>
                <SelectItem value="3">3 columns</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {(block.colText ?? ["", ""]).map((c, i) => (
            <Field key={i} label={`Column ${i + 1}`}>
              <Textarea
                rows={2}
                value={c}
                onChange={(e) => {
                  const next = [...(block.colText ?? [])];
                  next[i] = e.target.value;
                  onChange({ colText: next });
                }}
              />
            </Field>
          ))}
        </>
      )}

      {block.type === "html" && (
        <Field label="Custom HTML">
          <Textarea rows={8} className="font-mono text-xs" value={block.html ?? ""} onChange={(e) => onChange({ html: e.target.value })} placeholder="<div>…</div>" />
        </Field>
      )}

      {block.type === "dynamic" && (
        <DynamicVariantsEditor block={block} onChange={onChange} />
      )}
    </div>
  );
}

function DynamicVariantsEditor({
  block,
  onChange,
}: {
  block: EmailBlock;
  onChange: (patch: Partial<EmailBlock>) => void;
}) {
  const variants = block.dynamicVariants ?? [{ id: "dv1", label: "Default", text: "" }];
  const patch = (id: string, p: Partial<EmailDynamicVariant>) =>
    onChange({ dynamicVariants: variants.map((v) => (v.id === id ? { ...v, ...p } : v)) });
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        The first variant is the default. Add rule-based variants for specific contacts.
      </p>
      {variants.map((v, i) => (
        <div key={v.id} className="space-y-2 rounded-lg border p-2.5">
          <div className="flex items-center gap-2">
            <Input className="h-7 flex-1" value={v.label} onChange={(e) => patch(v.id, { label: e.target.value })} placeholder="Variant name" />
            {i > 0 && (
              <Button variant="ghost" size="icon-sm" onClick={() => onChange({ dynamicVariants: variants.filter((x) => x.id !== v.id) })}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          {i > 0 && (
            <Input className="h-7" value={v.condition ?? ""} onChange={(e) => patch(v.id, { condition: e.target.value })} placeholder="Show if… e.g. tag = enterprise" />
          )}
          <Textarea rows={2} value={v.text} onChange={(e) => patch(v.id, { text: e.target.value })} placeholder="Content for this variant" />
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          onChange({
            dynamicVariants: [...variants, { id: `dv-${variants.length}-${variants.reduce((n, v) => n + v.id.length, 2)}`, label: `Variant ${variants.length}`, condition: "", text: "" }],
          })
        }
      >
        <Plus className="size-4" /> Add variant
      </Button>
    </div>
  );
}

function Field({
  label,
  action,
  className,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
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
