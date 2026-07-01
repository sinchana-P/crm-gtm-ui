"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PORTAL_SURVEYS } from "@/lib/mock-data/portal";
import { formatDate } from "@/lib/format";
import type { PortalSurvey } from "@/lib/types/portal";

export default function PortalSurveysPage() {
  const [active, setActive] = useState<PortalSurvey | null>(null);
  const pending = PORTAL_SURVEYS.filter((s) => s.status === "pending");
  const done = PORTAL_SURVEYS.filter((s) => s.status === "completed");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Surveys & feedback"
        description="Share feedback on support, onboarding, and your overall experience."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Pending</h2>
        {pending.map((survey) => (
          <Card key={survey.id} className="shadow-none">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{survey.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {survey.type} · {survey.questions} questions
                </p>
              </div>
              <Button onClick={() => setActive(survey)}>Take survey</Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Completed</h2>
        {done.map((survey) => (
          <Card key={survey.id} className="shadow-none">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{survey.name}</p>
                <p className="text-xs text-muted-foreground">
                  Completed {survey.completedAt ? formatDate(survey.completedAt) : "—"}
                </p>
              </div>
              <Badge variant="secondary">Done</Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <SurveyDialog survey={active} open={!!active} onOpenChange={(o) => !o && setActive(null)} />
    </div>
  );
}

function SurveyDialog({
  survey,
  open,
  onOpenChange,
}: {
  survey: PortalSurvey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [rating, setRating] = useState<number | null>(null);

  if (!survey) return null;

  const handleSubmit = () => {
    if (survey.type === "csat" && !rating) {
      toast.error("Please select a rating");
      return;
    }
    toast.success("Thank you — your feedback was recorded");
    onOpenChange(false);
    setRating(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{survey.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {survey.type === "nps" ? (
            <div className="grid gap-2">
              <Label>How likely are you to recommend us? (0–10)</Label>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 11 }, (_, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant={rating === i ? "default" : "outline"}
                    size="sm"
                    className="size-9 p-0"
                    onClick={() => setRating(i)}
                  >
                    {i}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Overall satisfaction</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={rating === n ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRating(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Additional comments (optional)</Label>
            <Textarea rows={3} placeholder="Tell us more..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
