"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, DoorOpen, Sparkles, Workflow, Zap } from "lucide-react";
import { toast } from "sonner";
import type { Sequence, SequenceStep } from "@/lib/types";
import type { WorkflowDraft } from "@/lib/marketing-copilot";
import { waitSeconds } from "@/lib/marketing-copilot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STEP_META,
  countSteps,
  senderShortLabel,
  stepSummary,
} from "@/components/marketing/sequences/sequence-shared";
import { createSequenceId, useSequenceStore } from "@/lib/stores/sequence-store";
import { cn } from "@/lib/utils";
import { ACCENTS } from "@/components/marketing/copilot/copilot-shared";

interface Row {
  step: string;
  detail: string;
  sub?: string;
}

function detailRows(draft: WorkflowDraft): Row[] {
  const rows: Row[] = [
    { step: "Trigger", detail: draft.triggerSummary },
  ];
  for (const s of draft.flow) {
    rows.push(rowForStep(s));
  }
  return rows;
}

function rowForStep(s: SequenceStep): Row {
  switch (s.type) {
    case "email":
    case "whatsapp":
      return {
        step: s.label,
        detail: s.subject || s.snippet || "Draft",
        sub: "Draft — ready for you to write content",
      };
    case "wait":
      return {
        step: s.label,
        detail: `${s.waitValue ?? 0} ${s.waitUnit ?? "days"} (${waitSeconds(s).toLocaleString()} seconds)`,
      };
    case "goal":
      return { step: s.label, detail: s.goalCondition ?? "Goal reached", sub: "Contact exits when met" };
    case "action":
      return { step: s.label, detail: s.actionSummary || stepSummary(s) };
    case "task":
      return { step: s.label, detail: s.config || "Task for the owner" };
    default:
      return { step: s.label, detail: stepSummary(s) };
  }
}

export function WorkflowDraftCard({ draft }: { draft: WorkflowDraft }) {
  const router = useRouter();
  const addSequence = useSequenceStore((s) => s.addSequence);
  const [created, setCreated] = useState(false);
  const accent = ACCENTS.violet;
  const rows = detailRows(draft);

  function handleCreate(openBuilder: boolean) {
    const now = new Date().toISOString();
    const seq: Sequence = {
      id: createSequenceId(),
      name: draft.name,
      type: draft.type,
      status: "draft",
      enrolled: 0,
      completed: 0,
      replied: 0,
      steps: countSteps(draft.flow),
      pauseOnReply: draft.exit.pauseOnReply,
      description: draft.description,
      owner: "Priya Sharma",
      channel: draft.channel,
      createdAt: now,
      updatedAt: now,
      activeCount: 0,
      exitedCount: 0,
      sender: draft.sender,
      triggers: [draft.trigger],
      exit: draft.exit,
      flow: draft.flow,
    };
    addSequence(seq);
    setCreated(true);
    toast.success("Workflow created as a draft — add your email content before activating");
    if (openBuilder) router.push(`/marketing/sequences/${seq.id}/edit`);
  }

  return (
    <Card className={cn("shadow-none", accent.border, accent.ring)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <div className={cn("flex size-8 items-center justify-center rounded-lg", accent.bg, accent.text)}>
            <Workflow className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">{draft.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{draft.description}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("border-0", accent.bg, accent.text)}>
          <Sparkles className="size-3" /> AI draft
        </Badge>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-500">
          <CheckCircle2 className="size-4" />
          Workflow ready
        </div>

        {/* Flow diagram */}
        <div className="flex flex-col items-center rounded-lg border bg-background p-4">
          <FlowNode
            icon={<Zap className="size-4" />}
            tint="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            title="Trigger"
            subtitle={draft.triggerSummary}
            pill
          />
          {draft.flow.map((s) => {
            const meta = STEP_META[s.type];
            return (
              <div key={s.id} className="flex w-full flex-col items-center">
                <Connector />
                <FlowNode
                  icon={<meta.icon className="size-4" />}
                  tint={meta.tint}
                  title={s.label}
                />
              </div>
            );
          })}
          <Connector />
          <FlowNode
            icon={<DoorOpen className="size-4" />}
            tint="bg-slate-500/10 text-slate-600 dark:text-slate-400"
            title="Exit"
            pill
          />
        </div>

        {/* Step details table */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-2 font-medium">Step</th>
                <th className="px-3 py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0 align-top">
                  <td className="px-3 py-2 font-medium">{r.step}</td>
                  <td className="px-3 py-2">
                    <span className={i === 0 ? "font-mono text-xs" : ""}>{r.detail}</span>
                    {r.sub ? <span className="block text-xs text-muted-foreground">{r.sub}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Next steps */}
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <p className="mb-1 font-medium">Next steps</p>
          <p className="text-muted-foreground">
            The {draft.emailCount} email{draft.emailCount === 1 ? "" : "s"} are in draft — open the workflow to write
            each subject and body, confirm the trigger and sender ({senderShortLabel(draft.sender)}), then activate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => handleCreate(true)} disabled={created}>
            <Workflow className="size-4" />
            {created ? "Created" : "Create & open workflow"}
            {!created && <ArrowRight className="size-4" />}
          </Button>
          <Button variant="outline" onClick={() => handleCreate(false)} disabled={created}>
            Create draft only
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Connector() {
  return <div className="h-4 w-px bg-border" />;
}

function FlowNode({
  icon,
  tint,
  title,
  subtitle,
  pill,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  subtitle?: string;
  pill?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border bg-card px-3 py-2 text-sm",
        pill ? "rounded-full" : "w-full max-w-xs rounded-lg"
      )}
    >
      <span className={cn("flex size-6 items-center justify-center rounded-md", tint)}>{icon}</span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{title}</span>
        {subtitle ? <span className="block truncate text-xs text-muted-foreground">{subtitle}</span> : null}
      </span>
    </div>
  );
}
