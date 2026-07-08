"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { SegmentRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
import { createSegmentId, useSegmentStore } from "@/lib/stores/segment-store";
import { cn } from "@/lib/utils";

const BREADTH_OPTIONS = [
  {
    value: "narrow",
    label: "Narrow",
    description: "95% similarity — closest matches only",
    multiplier: 0.8,
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "90% similarity — recommended",
    multiplier: 1.6,
  },
  {
    value: "broad",
    label: "Broad",
    description: "80% similarity — maximum reach",
    multiplier: 3.2,
  },
] as const;

export function LookalikeDialog({
  open,
  onOpenChange,
  defaultSourceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSourceId?: string;
}) {
  const router = useRouter();
  const segments = useSegmentStore((s) => s.segments);
  const addSegment = useSegmentStore((s) => s.addSegment);
  const [sourceId, setSourceId] = useState(defaultSourceId ?? "");
  const [breadth, setBreadth] = useState<(typeof BREADTH_OPTIONS)[number]["value"]>("balanced");

  const candidates = useMemo(
    () => segments.filter((s) => !s.archived && s.memberCount > 0),
    [segments]
  );
  const source = candidates.find((s) => s.id === (sourceId || defaultSourceId));
  const option = BREADTH_OPTIONS.find((o) => o.value === breadth)!;
  const predicted = source ? Math.round(source.memberCount * option.multiplier) : 0;

  function generate() {
    if (!source) return;
    const now = new Date().toISOString();
    const segment: SegmentRecord = {
      id: createSegmentId(),
      name: `Lookalike of ${source.name}`,
      description: `AI-identified contacts sharing attributes with “${source.name}” (${option.label.toLowerCase()} match).`,
      type: "dynamic",
      origin: "lookalike",
      memberCount: predicted,
      weeklyChange: 0,
      definition: source.definition,
      owner: source.owner,
      createdAt: now,
      updatedAt: now,
      refresh: { mode: "scheduled", frequency: "daily", lastRefreshedAt: now, history: [] },
      usedIn: [],
    };
    addSegment(segment);
    onOpenChange(false);
    toast.success("Lookalike segment generated");
    router.push(`/marketing/segments/${segment.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="size-4" />
            Generate lookalike segment
            <Badge variant="outline" className="border-0 bg-blue-500/10 text-blue-700 dark:text-blue-400">
              Phase 3
            </Badge>
          </DialogTitle>
          <DialogDescription>
            AI analyzes a high-performing segment and finds new contacts that share its attributes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Source segment</Label>
            <Select value={sourceId || defaultSourceId || ""} onValueChange={(v) => setSourceId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick a high-performing segment" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.memberCount.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Audience breadth</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {BREADTH_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setBreadth(o.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    breadth === o.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <p className="text-sm font-medium">{o.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{o.description}</p>
                </button>
              ))}
            </div>
          </div>
          {source && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="text-xs text-muted-foreground">Predicted audience</p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums">
                ~{predicted.toLocaleString()}
                <span className="ml-1.5 text-sm font-normal text-muted-foreground">contacts</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on {source.memberCount.toLocaleString()} members of “{source.name}”.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!source} onClick={generate}>
            <Sparkles className="size-4" />
            Generate lookalike
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
