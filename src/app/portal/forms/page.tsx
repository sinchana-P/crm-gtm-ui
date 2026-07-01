"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileInput } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PORTAL_FORMS } from "@/lib/mock-data/portal";
import { formatDate } from "@/lib/format";
import type { PortalFormAssignment } from "@/lib/types/portal";

export default function PortalFormsPage() {
  const [activeForm, setActiveForm] = useState<PortalFormAssignment | null>(null);

  const pending = PORTAL_FORMS.filter((f) => f.status !== "submitted");
  const submitted = PORTAL_FORMS.filter((f) => f.status === "submitted");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Forms"
        description="Complete assigned questionnaires and review past submissions."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">To complete</h2>
        {pending.map((form) => (
          <Card key={form.id} className="shadow-none">
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{form.name}</p>
                  <Badge variant="outline" className="capitalize">{form.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{form.description}</p>
                {form.progress !== undefined ? (
                  <div className="mt-2 max-w-xs space-y-1">
                    <Progress value={form.progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">{form.progress}% complete</p>
                  </div>
                ) : null}
              </div>
              <Button onClick={() => setActiveForm(form)}>
                {form.status === "draft" ? "Continue" : "Start"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Submitted</h2>
        {submitted.map((form) => (
          <Card key={form.id} className="shadow-none">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{form.name}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted {form.submittedAt ? formatDate(form.submittedAt) : "—"}
                </p>
              </div>
              <Badge variant="secondary">Submitted</Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <FormFillDialog form={activeForm} open={!!activeForm} onOpenChange={(o) => !o && setActiveForm(null)} />
    </div>
  );
}

function FormFillDialog({
  form,
  open,
  onOpenChange,
}: {
  form: PortalFormAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{form.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{form.description}</p>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Company legal name</Label>
            <Input defaultValue="TechCorp India Pvt Ltd" />
          </div>
          <div className="grid gap-2">
            <Label>Billing contact email</Label>
            <Input defaultValue="billing@techcorp.in" />
          </div>
          <div className="grid gap-2">
            <Label>Technical requirements</Label>
            <Textarea rows={3} placeholder="Describe integration needs..." />
          </div>
          <div className="grid gap-2">
            <Label>Supporting document</Label>
            <Button variant="outline" type="button" className="justify-start">
              <FileInput className="mr-2 size-4" />
              Attach file or photo
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { toast.message("Draft saved"); onOpenChange(false); }}>Save draft</Button>
          <Button onClick={() => { toast.success("Form submitted"); onOpenChange(false); }}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
