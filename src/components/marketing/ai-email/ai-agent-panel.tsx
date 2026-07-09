"use client";

import { useState } from "react";
import { Bot, Check, CircleCheck, CircleDot, Loader2, ShieldCheck, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import type { AiAgentRun, AiAgentStep, AiAgentStepStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MOCK_AI_AGENT_RUN } from "@/lib/mock-data/ai-email";
import { cn } from "@/lib/utils";

const STEP_ICON: Record<AiAgentStepStatus, typeof CircleDot> = {
  pending: CircleDot,
  awaiting_approval: ShieldCheck,
  approved: CircleCheck,
  done: CircleCheck,
  rejected: X,
};

export function AiAgentPanel() {
  const [run, setRun] = useState<AiAgentRun>(MOCK_AI_AGENT_RUN);

  function decide(step: AiAgentStep, approve: boolean) {
    setRun((r) => {
      const idx = r.steps.findIndex((s) => s.id === step.id);
      const steps = r.steps.map((s, i) => {
        if (s.id === step.id) return { ...s, status: (approve ? "done" : "rejected") as AiAgentStepStatus };
        // when approving, unlock the next step for approval/execution
        if (approve && i === idx + 1)
          return { ...s, status: (s.requiresApproval ? "awaiting_approval" : "done") as AiAgentStepStatus };
        return s;
      });
      const allResolved = steps.every((s) => s.status === "done" || s.status === "rejected");
      return { ...r, steps, status: allResolved ? "completed" : approve ? "running" : "awaiting_approval" };
    });
    toast[approve ? "success" : "info"](approve ? "Step approved — agent continuing" : "Step rejected — agent paused");
  }

  const doneCount = run.steps.filter((s) => s.status === "done").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/[0.04] px-4 py-3 text-sm">
        <Bot className="size-4 text-blue-500" />
        <span>Give the agent a goal and it plans and executes the steps — pausing for your approval before anything sends.</span>
        <Badge variant="outline" className="ml-auto border-0 bg-blue-500/10 text-blue-700 dark:text-blue-400">Phase 3</Badge>
      </div>

      <Card className="shadow-none">
        <CardContent className="pt-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input defaultValue={run.goal} className="flex-1" placeholder="Describe a marketing goal for the agent…" />
            <Button onClick={() => toast.info("Agent re-planning… (preview)")}><Sparkles className="size-4" /> Plan</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Plan</CardTitle>
            <p className="text-sm text-muted-foreground">{run.goal}</p>
          </div>
          <Badge variant="outline" className="capitalize">
            {run.status === "completed" ? "Completed" : `${doneCount}/${run.steps.length} done`}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-0 pl-2">
            <div className="absolute top-2 bottom-2 left-[15px] w-px bg-border" />
            {run.steps.map((s) => {
              const Icon = s.status === "awaiting_approval" ? ShieldCheck : STEP_ICON[s.status];
              const running = s.status === "awaiting_approval";
              return (
                <div key={s.id} className="relative flex gap-3 pb-5 last:pb-0">
                  <span
                    className={cn(
                      "z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-background",
                      s.status === "done" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : s.status === "rejected" ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : running ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {running ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1 rounded-lg border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{s.title}</p>
                      {s.requiresApproval && (
                        <Badge variant="outline" className="border-0 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          <ShieldCheck className="size-3" /> Approval gate
                        </Badge>
                      )}
                      {s.status === "done" && <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ done</span>}
                      {s.status === "rejected" && <span className="text-xs text-red-600 dark:text-red-400">rejected</span>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
                    {s.status === "awaiting_approval" && (
                      <div className="mt-3 flex items-center gap-2">
                        <Button size="sm" onClick={() => decide(s, true)}><Check className="size-4" /> Approve</Button>
                        <Button variant="outline" size="sm" onClick={() => decide(s, false)}><X className="size-4" /> Reject</Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {run.status === "completed" && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400">
              <CircleCheck className="size-4" /> Agent finished its plan. Review the created assets before they go live.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
