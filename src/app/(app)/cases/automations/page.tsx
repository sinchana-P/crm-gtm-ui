"use client";

import { useState } from "react";
import { ArrowRight, Bell, GitBranch, Plus, Route, Sparkles, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { CM_AUTOMATIONS, CM_PROJECTS } from "@/lib/mock-data/case-manager";
import type { CmAutomation } from "@/lib/types/case-manager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const triggerLabels: Record<CmAutomation["trigger"], string> = {
  NEW_CASE_CREATED: "New case created",
  QUEUE_CHANGED: "Queue changed",
  STATUS_CHANGED: "Status changed",
  SLA_AT_RISK: "SLA at risk",
  EMAIL_RECEIVED: "Email received",
  INTAKE_RECEIVED: "Intake received",
};

const actionIcon = {
  assign: Route,
  route: Route,
  notify: Bell,
  escalate: Zap,
  comment: GitBranch,
  set_priority: Zap,
} as const;

export default function CaseAutomationsPage() {
  const [rules, setRules] = useState(CM_AUTOMATIONS);
  const toggle = (id: string) =>
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automations & Routing"
        description="Rules that route intake to the right project and queue, escalate on SLA breach, and notify owners. Trigger → conditions → actions."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted">
            <Plus className="size-4" /> New automation
          </button>
        }
      />

      <Card className="border-indigo-500/20 bg-indigo-500/5">
        <CardContent className="flex items-center gap-3 py-3">
          <Sparkles className="size-5 text-indigo-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">Describe an automation in plain language</p>
            <p className="text-xs text-muted-foreground">
              e.g. &ldquo;When a billing case is urgent and unassigned for 1 hour, escalate to Tier 2 and notify the account owner.&rdquo;
            </p>
          </div>
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-600">AI</Badge>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {rules.map((r) => {
          const scope = r.scope === "global" ? "All projects" : CM_PROJECTS.find((p) => p.id === r.scope)?.name ?? r.scope;
          return (
            <Card key={r.id}>
              <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
                <div>
                  <CardTitle className="text-base">{r.name}</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {scope} · {r.runs} runs{r.lastRunAt ? ` · last run recently` : ""}
                  </p>
                </div>
                <Switch checked={r.enabled} onCheckedChange={() => toggle(r.id)} />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="secondary" className="gap-1"><Zap className="size-3" /> {triggerLabels[r.trigger]}</Badge>
                  {r.conditions.map((cnd, i) => (
                    <span key={i} className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                      {cnd.field} {cnd.operator.toLowerCase()} <span className="font-medium text-foreground">{cnd.value}</span>
                    </span>
                  ))}
                  <ArrowRight className="size-4 text-muted-foreground" />
                  {r.actions.map((a, i) => {
                    const Icon = actionIcon[a.type] ?? Zap;
                    return (
                      <Badge key={i} variant="outline" className="gap-1">
                        <Icon className="size-3" />
                        {a.type.replace("_", " ")}
                        {a.target ? `: ${a.target}` : a.value ? `: ${a.value}` : ""}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
