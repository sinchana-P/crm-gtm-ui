"use client";

import { useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import type { LandingPage, LandingSection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LANDING_PAGE_TEMPLATES } from "@/lib/mock-data/landing-pages";
import { LANDING_TYPE_LABELS } from "@/components/marketing/landing-pages/landing-shared";

const EXAMPLES = [
  "A registration page for our Q3 product webinar with a countdown and speaker bios",
  "A gated landing page offering a free 2026 GTM benchmark report",
  "A free-trial signup page with social proof and a 3-field form",
];

/**
 * AI page-generation dialog. UI-only: it "thinks", then seeds the new page
 * with sections from the closest matching template for the chosen goal.
 */
export function LandingAiGenerateDialog({
  open,
  onOpenChange,
  onGenerate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onGenerate: (result: { name: string; type: LandingPage["type"]; sections: LandingSection[] }) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<LandingPage["type"]>("lead-gen");
  const [loading, setLoading] = useState(false);

  function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const tpl = LANDING_PAGE_TEMPLATES.find((t) => t.category === type) ?? LANDING_PAGE_TEMPLATES[0];
      const name = prompt.trim().slice(0, 48).replace(/\s+\S*$/, "") || "AI landing page";
      // Deep-clone sections so edits don't mutate the shared template.
      const sections = JSON.parse(JSON.stringify(tpl.sections)) as LandingSection[];
      onGenerate({ name, type, sections });
      setLoading(false);
      setPrompt("");
      onOpenChange(false);
    }, 1400);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" /> Generate a page with AI
          </DialogTitle>
          <DialogDescription>
            Describe what you need and we&apos;ll draft a full, editable landing page — copy, layout, and form included.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-1.5">
            <Label className="text-xs">Page goal</Label>
            <Select value={type} onValueChange={(v) => setType(v as LandingPage["type"])}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(LANDING_TYPE_LABELS) as LandingPage["type"][]).map((t) => (
                  <SelectItem key={t} value={t}>{LANDING_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Describe your page</Label>
            <Textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A registration page for our July webinar on scaling GTM, with a countdown and a short form…"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="rounded-full border px-2.5 py-1 text-left text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {ex.length > 42 ? `${ex.slice(0, 42)}…` : ex}
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={generate} disabled={!prompt.trim() || loading}>
            {loading ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : <><Wand2 className="size-4" /> Generate page</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
