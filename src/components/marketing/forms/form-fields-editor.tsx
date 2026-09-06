"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { LandingFormField, LandingFormFieldType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { createLandingId } from "@/components/marketing/landing-pages/landing-shared";
import { collectableConsents } from "@/lib/mock-data/consent-policy";

export const FORM_FIELD_TYPES: LandingFormFieldType[] = [
  "text",
  "email",
  "phone",
  "textarea",
  "select",
  "checkbox",
  "consent",
  "date",
  "number",
  "hidden",
];

export const FORM_CRM_FIELDS = [
  "name",
  "firstName",
  "lastName",
  "email",
  "phone",
  "company",
  "jobTitle",
  "country",
  "custom",
];

/**
 * Shared editor for a form's field list — used by both the Landing Page form
 * block and the standalone Form builder. Owns the consent picker: a field of
 * type "consent" must pick which consent it records (can't be blank).
 */
export function FormFieldsEditor({
  fields,
  onChange,
  allowConsentField = true,
}: {
  fields: LandingFormField[];
  onChange: (fields: LandingFormField[]) => void;
  /** When false, "consent" is not offered as a field type (the form has a dedicated consent section). */
  allowConsentField?: boolean;
}) {
  const fieldTypes = allowConsentField
    ? FORM_FIELD_TYPES
    : FORM_FIELD_TYPES.filter((t) => t !== "consent");
  const patchField = (id: string, p: Partial<LandingFormField>) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...p } : f)));
  const addField = () =>
    onChange([
      ...fields,
      { id: createLandingId("fld"), type: "text", label: "New field", required: false, width: "full" },
    ]);
  const removeField = (id: string) => onChange(fields.filter((f) => f.id !== id));

  return (
    <div className="space-y-2">
      {fields.map((f) => (
        <div key={f.id} className="space-y-2 rounded-lg border p-2.5">
          <div className="flex items-center gap-2">
            <GripVertical className="size-4 shrink-0 text-muted-foreground" />
            <Input
              className="h-7 flex-1"
              value={f.label}
              onChange={(e) => patchField(f.id, { label: e.target.value })}
              placeholder="Field label"
            />
            <Button variant="ghost" size="icon-sm" onClick={() => removeField(f.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select value={f.type} onValueChange={(v) => patchField(f.id, { type: v as LandingFormFieldType })}>
              <SelectTrigger className="h-7 flex-1 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {fieldTypes.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={f.mapTo ?? "custom"} onValueChange={(v) => patchField(f.id, { mapTo: v ?? "custom" })}>
              <SelectTrigger className="h-7 flex-1 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FORM_CRM_FIELDS.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {f.type === "consent" && (
            <div className="space-y-1 rounded-md border border-dashed bg-muted/40 p-2">
              <p className="text-[11px] font-medium text-muted-foreground">
                Consent collected <span className="text-destructive">*</span>
              </p>
              <Select
                value={f.consentKey ?? ""}
                onValueChange={(v) => patchField(f.id, { consentKey: v ?? undefined, required: true })}
              >
                <SelectTrigger className={cn("h-7 w-full text-xs", !f.consentKey && "border-destructive text-destructive")}>
                  <SelectValue placeholder="Choose a consent — required" />
                </SelectTrigger>
                <SelectContent>
                  {collectableConsents().map((c) => (
                    <SelectItem key={c.key} value={c.key} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!f.consentKey && (
                <p className="text-[11px] text-destructive">
                  Pick which consent this checkbox records — it can&apos;t be blank.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5">
              <Switch checked={!!f.required} onCheckedChange={(v) => patchField(f.id, { required: v })} /> Required
            </label>
            <label className="flex items-center gap-1.5">
              <Switch checked={f.width === "half"} onCheckedChange={(v) => patchField(f.id, { width: v ? "half" : "full" })} /> Half width
            </label>
            <label className="flex items-center gap-1.5">
              <Switch checked={!!f.progressive} onCheckedChange={(v) => patchField(f.id, { progressive: v })} /> Progressive
            </label>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="h-7" onClick={addField}>
        <Plus className="size-3.5" /> Add field
      </Button>
    </div>
  );
}
