"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Clock, Filter, Mail, Sparkles, TrendingUp, Users, X } from "lucide-react";
import { toast } from "sonner";
import type { AiNextActionType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_AI_NEXT_ACTIONS } from "@/lib/mock-data/ai-email";

const TYPE_META: Record<AiNextActionType, { icon: typeof Mail; label: string; href: string }> = {
  campaign: { icon: Mail, label: "Campaign", href: "/marketing/campaigns" },
  sequence: { icon: TrendingUp, label: "Sequence", href: "/marketing/sequences" },
  segment: { icon: Users, label: "Segment", href: "/marketing/segments" },
  send_time: { icon: Clock, label: "Send time", href: "/marketing/campaigns" },
  content: { icon: Filter, label: "Content", href: "/marketing/templates" },
};

export function NextActionsPanel() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const actions = MOCK_AI_NEXT_ACTIONS.filter((a) => !dismissed.includes(a.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/[0.04] px-4 py-3 text-sm">
        <Sparkles className="size-4 text-violet-500" />
        <span>AI reviews your campaign and sequence performance and recommends the highest-impact next moves.</span>
        <Badge variant="outline" className="ml-auto border-0 bg-violet-500/10 text-violet-700 dark:text-violet-400">Phase 2</Badge>
      </div>

      {actions.length === 0 ? (
        <EmptyState icon={Sparkles} title="You're all caught up" description="No new AI recommendations right now — check back after your next sends." />
      ) : (
        <div className="grid gap-4">
          {actions.map((a) => {
            const Meta = TYPE_META[a.type];
            return (
              <Card key={a.id} className="shadow-none">
                <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-start">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><Meta.icon className="size-4 text-muted-foreground" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{a.title}</p>
                      <Badge variant="outline">{Meta.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.rationale}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400"><TrendingUp className="size-3.5" /> {a.impact}</span>
                      <span className="text-muted-foreground">{a.confidence}% confidence</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setDismissed((d) => [...d, a.id])}><X className="size-4" /> Dismiss</Button>
                    <Button size="sm" onClick={() => { toast.success("Opening — set it up in one click"); router.push(Meta.href); }}>
                      <Check className="size-4" /> Do it <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
