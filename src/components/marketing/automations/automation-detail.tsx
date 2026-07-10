"use client";

import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Pause,
  Pencil,
  Play,
  Target,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { AutomationRunLogEntry } from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, formatRelative } from "@/lib/format";
import { useAutomationStore } from "@/lib/stores/automation-store";
import { cn } from "@/lib/utils";
import { AutomationFlowCanvas } from "@/components/marketing/automations/automation-flow-canvas";
import {
  AutomationStatusBadge,
  TRIGGER_META,
  triggerSummary,
} from "@/components/marketing/automations/automation-shared";

const OUTCOME_STYLES: Record<AutomationRunLogEntry["outcome"], string> = {
  enrolled: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  action: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  email_sent: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  branched: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  waiting: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  goal_met: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  exited: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  error: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function AutomationDetail({ id }: { id: string }) {
  const router = useRouter();
  const automation = useAutomationStore((s) => s.automations.find((a) => a.id === id));
  const setStatus = useAutomationStore((s) => s.setStatus);
  const setArchived = useAutomationStore((s) => s.setArchived);
  const duplicateAutomation = useAutomationStore((s) => s.duplicateAutomation);

  if (!automation) {
    return (
      <EmptyState
        title="Automation not found"
        description="This automation may have been deleted."
        action={<Button variant="outline" onClick={() => router.push("/marketing/automations")}><ArrowLeft className="size-4" /> Back to automations</Button>}
      />
    );
  }

  const active = automation.activeCount ?? 0;
  const completed = automation.completedCount ?? 0;
  const goal = automation.goalMet ?? 0;
  const runLog = automation.runLog ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-border pb-6">
        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={() => router.push("/marketing/automations")}>
          <ArrowLeft className="size-4" /> Automations
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted"><Zap className="size-4 text-muted-foreground" /></span>
              <h1 className="text-2xl font-semibold tracking-tight">{automation.name}</h1>
              <AutomationStatusBadge status={automation.status} />
              {automation.archived && <span className="text-xs font-medium text-muted-foreground">(Archived)</span>}
            </div>
            {automation.description && <p className="max-w-3xl text-sm text-muted-foreground">{automation.description}</p>}
            <p className="text-xs text-muted-foreground">
              Owner: {automation.owner ?? "—"} · {automation.actions} steps
              {automation.updatedAt ? ` · updated ${formatRelative(automation.updatedAt)}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {automation.status === "active" ? (
              <Button variant="outline" onClick={() => { setStatus(id, "paused"); toast.success("Automation paused"); }}><Pause className="size-4" /> Pause</Button>
            ) : (
              <Button onClick={() => { setStatus(id, "active"); toast.success("Automation activated"); }}><Play className="size-4" /> {automation.status === "draft" ? "Activate" : "Resume"}</Button>
            )}
            <Button variant="outline" onClick={() => router.push(`/marketing/automations/${id}/edit`)}><Pencil className="size-4" /> Edit</Button>
            <Button variant="outline" onClick={() => { duplicateAutomation(id); toast.success("Automation duplicated"); }}><Copy className="size-4" /> Duplicate</Button>
            <Button variant="ghost" onClick={() => { setArchived(id, !automation.archived); toast.success(automation.archived ? "Automation restored" : "Automation archived"); }}>
              {automation.archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />} {automation.archived ? "Restore" : "Archive"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="activity">Activity ({runLog.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Mini icon={UserPlus} label="Enrolled" value={automation.enrolled.toLocaleString()} />
            <Mini icon={Users} label="Active now" value={active.toLocaleString()} />
            <Mini icon={CheckCircle2} label="Completed" value={completed.toLocaleString()} />
            <Mini icon={Target} label="Goals met" value={goal.toLocaleString()} />
          </div>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Workflow performance</CardTitle>
              <p className="text-sm text-muted-foreground">Reached and continued counts per step.</p>
            </CardHeader>
            <CardContent>
              <AutomationFlowCanvas triggers={automation.triggers ?? []} nodes={automation.nodes ?? []} height={520} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canvas" className="mt-6">
          <AutomationFlowCanvas triggers={automation.triggers ?? []} nodes={automation.nodes ?? []} height={620} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          {runLog.length === 0 ? (
            <EmptyState icon={Zap} title="No activity yet" description="Once contacts enroll, each step they hit is logged here for auditing." />
          ) : (
            <Card className="shadow-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Step</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runLog.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.contactName}</TableCell>
                        <TableCell>
                          <p className="text-sm">{e.nodeLabel}</p>
                          {e.detail && <p className="text-xs text-muted-foreground">{e.detail}</p>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border-0 capitalize", OUTCOME_STYLES[e.outcome])}>
                            {e.outcome.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDateTime(e.at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-6">
          <Card className="shadow-none">
            <CardHeader><CardTitle className="text-base">Enrollment triggers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(automation.triggers ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No triggers configured.</p>
              ) : (
                (automation.triggers ?? []).map((t) => {
                  const Meta = TRIGGER_META[t.type];
                  return (
                    <div key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted"><Meta.icon className="size-4 text-muted-foreground" /></div>
                      <div>
                        <p className="text-sm font-medium">{Meta.label}</p>
                        <p className="text-xs text-muted-foreground">{triggerSummary(t)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader><CardTitle className="text-base">Enrollment & exit settings</CardTitle></CardHeader>
            <CardContent>
              {automation.settings ? (
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <Item label="Re-enrollment" value={automation.settings.reEnrollment === "cooldown" ? `After ${automation.settings.reEnrollCooldownDays ?? 30} days` : automation.settings.reEnrollment === "always" ? "Every time" : "Never"} />
                  <Item label="Goal condition" value={automation.settings.goalCondition ?? "None"} />
                  <Item label="Suppression segment" value={automation.settings.suppressionSegmentId ? "Configured" : "None"} />
                  <Item label="Quiet hours" value={automation.settings.quietHours ? "On" : "Off"} />
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">Default settings.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Mini({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className="size-3.5 text-muted-foreground" />
        </div>
        <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
