"use client";

import { useState } from "react";
import { Calendar, Check, Copy, FlaskConical, Globe, Rocket } from "lucide-react";
import { toast } from "sonner";
import type { LandingAbTest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Confirm publish now vs. schedule, with the live URL and a preview link. */
export function LandingPublishDialog({
  open,
  onOpenChange,
  pageName,
  url,
  onPublish,
  onSchedule,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pageName: string;
  url: string;
  onPublish: () => void;
  onSchedule: (when: string) => void;
}) {
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [when, setWhen] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Rocket className="size-4" /> Publish “{pageName}”</DialogTitle>
          <DialogDescription>Choose when this page goes live. You can unpublish or edit at any time.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <Globe className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-xs">{url}</span>
            <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={() => { navigator.clipboard?.writeText(url); toast.success("URL copied"); }}>
              <Copy className="size-3.5" />
            </Button>
          </div>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "now" | "schedule")} className="gap-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
              <RadioGroupItem value="now" />
              <div><p className="font-medium">Publish now</p><p className="text-xs text-muted-foreground">The page goes live immediately.</p></div>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
              <RadioGroupItem value="schedule" />
              <div className="flex-1"><p className="font-medium">Schedule</p><p className="text-xs text-muted-foreground">Publish at a future date and time.</p></div>
              <Calendar className="size-4 text-muted-foreground" />
            </label>
          </RadioGroup>
          {mode === "schedule" && (
            <div className="grid gap-1.5">
              <Label className="text-xs">Publish date & time</Label>
              <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { toast.success("Preview link copied — share it with reviewers"); }}>Copy preview link</Button>
          {mode === "now" ? (
            <Button onClick={() => { onPublish(); onOpenChange(false); }}><Rocket className="size-4" /> Publish now</Button>
          ) : (
            <Button disabled={!when} onClick={() => { onSchedule(when); onOpenChange(false); }}><Calendar className="size-4" /> Schedule</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const GOAL_LABELS: Record<LandingAbTest["goal"], string> = {
  form_submit: "Form submission",
  button_click: "Button click",
  page_view: "Page view (time on page)",
};

/** Start an A/B test — pick a goal and traffic split. */
export function LandingAbTestDialog({
  open,
  onOpenChange,
  hasTest,
  onStart,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  hasTest: boolean;
  onStart: (goal: LandingAbTest["goal"]) => void;
}) {
  const [goal, setGoal] = useState<LandingAbTest["goal"]>("form_submit");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FlaskConical className="size-4 text-violet-500" /> Create an A/B test</DialogTitle>
          <DialogDescription>
            {hasTest ? "This page already has a running test. Starting a new one replaces it." : "We'll clone this page into Variant B. Edit each variant, then let traffic decide the winner."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-1.5">
            <Label className="text-xs">Goal metric</Label>
            <Select value={goal} onValueChange={(v) => setGoal(v as LandingAbTest["goal"])}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(GOAL_LABELS) as LandingAbTest["goal"][]).map((g) => (
                  <SelectItem key={g} value={g}>{GOAL_LABELS[g]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["A — Control", "B — Variant"].map((v, i) => (
              <div key={v} className="rounded-lg border p-3 text-center">
                <p className="text-sm font-medium">{v}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">50%</p>
                <p className="text-xs text-muted-foreground">of traffic</p>
                {i === 1 && <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-violet-600"><Check className="size-3" /> cloned from control</p>}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onStart(goal); onOpenChange(false); toast.success("A/B test started — edit Variant B"); }}>
            <FlaskConical className="size-4" /> Start test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
