import type { FormConsentItem, LandingFormField } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function PreviewField({ field }: { field: LandingFormField }) {
  if (field.type === "hidden" || field.type === "consent") return null;
  return (
    <div className={cn("space-y-1", field.width === "half" ? "sm:col-span-1" : "sm:col-span-2")}>
      <Label className="text-xs">
        {field.label}
        {field.required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {field.type === "textarea" ? (
        <textarea disabled rows={2} placeholder={field.placeholder} className="w-full rounded-md border bg-muted/40 px-3 py-2 text-sm" />
      ) : field.type === "select" ? (
        <select disabled className="w-full rounded-md border bg-muted/40 px-3 py-2 text-sm"><option>Select…</option></select>
      ) : field.type === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled /> {field.label}</label>
      ) : (
        <Input disabled placeholder={field.placeholder ?? field.label} className="bg-muted/40" />
      )}
    </div>
  );
}

/** The rendered form exactly as a visitor sees it — used in the side panel and the full preview modal. */
export function FormPreviewBody({
  fields,
  consents,
  submitLabel,
  recaptcha,
}: {
  fields: LandingFormField[];
  consents: FormConsentItem[];
  submitLabel: string;
  recaptcha?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <PreviewField key={f.id} field={f} />
        ))}
      </div>

      {consents.length > 0 ? (
        <div className="mt-5 space-y-3 border-t pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Consent</p>
          {consents.map((c) => (
            <div key={c.key} className="space-y-1">
              <Label className="text-xs">
                {c.label}
                <span className="text-destructive"> *</span>
                <span className="ml-1 font-mono text-[10px] text-muted-foreground">({c.key})</span>
              </Label>
              <select disabled className="w-full rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <option>Choose an answer…</option>
                <option>{c.yesLabel || "Yes"}</option>
                <option>No</option>
              </select>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">
          No consent section yet — add consents in the builder.
        </p>
      )}

      <Button className="mt-5 w-full" disabled>{submitLabel}</Button>
      {recaptcha ? (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">Protected by reCAPTCHA</p>
      ) : null}
    </div>
  );
}
