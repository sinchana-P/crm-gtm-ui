"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, Save, ShieldCheck } from "lucide-react";
import type { FormConsentItem, LandingFormField, MarketingForm } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormFieldsEditor } from "@/components/marketing/forms/form-fields-editor";
import { ConsentSectionEditor } from "@/components/marketing/forms/consent-section-editor";
import { FormPreviewBody } from "@/components/marketing/forms/form-preview";

export function FormBuilder({ form }: { form: MarketingForm }) {
  const [fields, setFields] = useState<LandingFormField[]>(
    (form.fields ?? []).filter((f) => f.type !== "consent"),
  );
  const [consents, setConsents] = useState<FormConsentItem[]>(form.consents ?? []);
  const [submitLabel, setSubmitLabel] = useState(form.submitLabel ?? "Submit");
  const [previewOpen, setPreviewOpen] = useState(false);

  function save() {
    if (consents.length === 0) {
      toast.error("Add at least one consent to the consent section before publishing.");
      return;
    }
    toast.success("Form saved");
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        {/* editor */}
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fields</CardTitle>
              <CardDescription>Add fields and map them to CRM properties.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormFieldsEditor fields={fields} onChange={setFields} allowConsentField={false} />
            </CardContent>
          </Card>

          <Card className="border-emerald-500/30 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                Consent section
              </CardTitle>
              <CardDescription>
                Turn on every consent this form should collect — the visitor answers each one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsentSectionEditor consents={consents} onChange={setConsents} />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Submit button</CardTitle>
            </CardHeader>
            <CardContent>
              <Input value={submitLabel} onChange={(e) => setSubmitLabel(e.target.value)} className="max-w-xs" />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="size-4" /> Preview
            </Button>
            <Button onClick={save}><Save className="size-4" /> Save form</Button>
          </div>
        </div>

        {/* side live preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Live preview</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setPreviewOpen(true)}>
                  <Eye className="size-3.5" /> Full preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <FormPreviewBody
                fields={fields}
                consents={consents}
                submitLabel={submitLabel}
                recaptcha={form.recaptchaEnabled}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* full-screen preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">Preview</Badge>
              {form.name}
            </DialogTitle>
            <DialogDescription>The published form exactly as visitors see it.</DialogDescription>
          </DialogHeader>
          <FormPreviewBody
            fields={fields}
            consents={consents}
            submitLabel={submitLabel}
            recaptcha={form.recaptchaEnabled}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
