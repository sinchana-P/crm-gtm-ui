"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import type { SegmentRecord, SegmentSuggestion } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SEGMENT_SUGGESTIONS } from "@/lib/mock-data";
import { definitionSummary } from "@/lib/segment-eval";
import { createSegmentId, useSegmentStore } from "@/lib/stores/segment-store";

export function AiSuggestionsPanel() {
  const router = useRouter();
  const addSegment = useSegmentStore((s) => s.addSegment);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const suggestions = MOCK_SEGMENT_SUGGESTIONS.filter((s) => !dismissed.includes(s.id));
  if (suggestions.length === 0) return null;

  function accept(suggestion: SegmentSuggestion) {
    const now = new Date().toISOString();
    const segment: SegmentRecord = {
      id: createSegmentId(),
      name: suggestion.name,
      description: suggestion.rationale,
      type: "dynamic",
      origin: "ai_suggested",
      memberCount: suggestion.predictedCount,
      weeklyChange: 0,
      definition: suggestion.definition,
      owner: "Priya Sharma",
      createdAt: now,
      updatedAt: now,
      refresh: { mode: "scheduled", frequency: "daily", lastRefreshedAt: now, history: [] },
      usedIn: [],
    };
    addSegment(segment);
    setDismissed((d) => [...d, suggestion.id]);
    toast.success("AI segment created — review its rules before using it");
    router.push(`/marketing/segments/${segment.id}/edit`);
  }

  return (
    <Card className="border-violet-500/30 bg-violet-500/[0.03] shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-violet-500" />
          AI-suggested segments
          <Badge variant="outline" className="border-0 bg-violet-500/10 text-violet-700 dark:text-violet-400">
            Phase 2
          </Badge>
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </Button>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-3">
            {suggestions.map((s) => (
              <div key={s.id} className="flex flex-col rounded-lg border bg-background p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{s.name}</p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="-mt-1 -mr-1"
                    onClick={() => setDismissed((d) => [...d, s.id])}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {s.rationale}
                </p>
                <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">
                  {definitionSummary(s.definition)}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    ~<span className="font-semibold text-foreground">{s.predictedCount.toLocaleString()}</span>{" "}
                    contacts · {s.confidence}% confidence
                  </div>
                  <Button size="sm" onClick={() => accept(s)}>
                    <Sparkles className="size-3.5" />
                    Create
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
