"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Save, SlidersHorizontal, Workflow, Zap } from "lucide-react";
import { toast } from "sonner";
import type {
  Automation,
  AutomationNode,
  AutomationNodeType,
  AutomationSettings,
  AutomationTrigger,
} from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_AUTOMATION_RECIPES } from "@/lib/mock-data";
import {
  appendToContainer,
  countNodes,
  createNodeId,
  findNode,
  insertAfter,
  makeNode,
  removeNode,
  updateNode,
  validateWorkflow,
} from "@/lib/automation-flow";
import {
  createAutomationId,
  useAutomationStore,
} from "@/lib/stores/automation-store";
import { useSegmentStore } from "@/lib/stores/segment-store";
import { cn } from "@/lib/utils";
import { AutomationCanvas } from "@/components/marketing/automations/automation-canvas";
import { AutomationNodeConfig } from "@/components/marketing/automations/automation-node-config";
import { AutomationTriggerConfig } from "@/components/marketing/automations/automation-trigger-config";
import { triggerSummary } from "@/components/marketing/automations/automation-shared";

const DEFAULT_SETTINGS: AutomationSettings = {
  reEnrollment: "never",
  quietHours: true,
};

export function AutomationBuilder({
  automationId,
  recipeId,
}: {
  automationId?: string;
  recipeId?: string;
}) {
  const router = useRouter();
  const existing = useAutomationStore((s) =>
    automationId ? s.automations.find((a) => a.id === automationId) : undefined
  );
  const recipe = recipeId ? MOCK_AUTOMATION_RECIPES.find((r) => r.id === recipeId) : undefined;
  const addAutomation = useAutomationStore((s) => s.addAutomation);
  const updateAutomation = useAutomationStore((s) => s.updateAutomation);
  const segments = useSegmentStore((s) => s.segments);

  const editMode = !!automationId;
  const [name, setName] = useState(existing?.name ?? recipe?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? recipe?.description ?? "");
  const [triggers, setTriggers] = useState<AutomationTrigger[]>(existing?.triggers ?? recipe?.triggers ?? []);
  const [nodes, setNodes] = useState<AutomationNode[]>(existing?.nodes ?? recipe?.nodes ?? []);
  const [settings, setSettings] = useState<AutomationSettings>(existing?.settings ?? recipe?.settings ?? DEFAULT_SETTINGS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [tab, setTab] = useState<"canvas" | "settings">("canvas");

  const editingNode = (editingId ? findNode(nodes, editingId) : null) ?? null;
  const nodeCount = countNodes(nodes);
  const issues = validateWorkflow(triggers, nodes);

  function handleAdd(type: AutomationNodeType, containerId: string, afterId?: string) {
    const node = makeNode(type, createNodeId());
    setNodes((n) => (afterId ? insertAfter(n, afterId, node) : appendToContainer(n, containerId, node)));
    setEditingId(node.id);
  }
  function handlePatch(patch: Partial<AutomationNode>) {
    if (!editingId) return;
    setNodes((n) => updateNode(n, editingId, patch));
  }
  function handleDelete(id: string) {
    setNodes((n) => removeNode(n, id));
    if (editingId === id) setEditingId(null);
  }

  function save(activate: boolean) {
    if (!name.trim()) return toast.error("Give the automation a name first");
    if (triggers.length === 0) return toast.error("Add at least one enrollment trigger");
    if (nodes.length === 0) return toast.error("Add at least one action");
    if (activate && issues.length > 0) return toast.error(issues[0]);
    const now = new Date().toISOString();
    const shared = {
      name: name.trim(),
      description: description.trim() || undefined,
      triggers,
      nodes,
      settings,
      actions: nodeCount,
      trigger: triggers[0] ? triggerSummary(triggers[0]) : "—",
    };
    if (editMode && existing) {
      updateAutomation(existing.id, { ...shared, status: activate ? "active" : existing.status });
      toast.success(activate ? "Automation activated" : "Automation saved");
      router.push(`/marketing/automations/${existing.id}`);
      return;
    }
    const automation: Automation = {
      id: createAutomationId(),
      ...shared,
      status: activate ? "active" : "draft",
      owner: "Priya Sharma",
      enrolled: 0,
      activeCount: 0,
      completedCount: 0,
      goalMet: 0,
      createdAt: now,
      updatedAt: now,
      runLog: [],
    };
    addAutomation(automation);
    toast.success(activate ? "Automation created & activated" : "Automation saved as draft");
    router.push(`/marketing/automations/${automation.id}`);
  }

  if (editMode && !existing) {
    return (
      <EmptyState
        title="Automation not found"
        description="This automation may have been deleted."
        action={
          <Button variant="outline" onClick={() => router.push("/marketing/automations")}>
            <ArrowLeft className="size-4" /> Back to automations
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={() => router.push("/marketing/automations")}>
            <ArrowLeft className="size-4" /> Automations
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{editMode ? `Edit ${existing?.name}` : "Build automation"}</h1>
          <p className="text-sm text-muted-foreground">
            A visual workflow — triggers, delays, branches, and CRM actions on one canvas.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => save(false)}>
            <Save className="size-4" /> Save draft
          </Button>
          <Button onClick={() => save(true)}>
            <Zap className="size-4" /> {editMode ? "Save & activate" : "Activate"}
          </Button>
        </div>
      </div>

      {editMode && existing?.status === "active" && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          This automation is live. Changes apply to contacts enrolled after you save.
        </p>
      )}

      <div className="flex gap-1 border-b">
        <button type="button" onClick={() => setTab("canvas")} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === "canvas" ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>
          Canvas
        </button>
        <button type="button" onClick={() => setTab("settings")} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === "settings" ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>
          Settings
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {tab === "canvas" ? (
            <>
              <Card className="shadow-none">
                <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="au-name">Automation name</Label>
                    <Input id="au-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Form submit → welcome" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="au-desc">Description (optional)</Label>
                    <Textarea id="au-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this workflow do?" />
                  </div>
                </CardContent>
              </Card>

              <AutomationCanvas
                triggers={triggers}
                nodes={nodes}
                editable
                onAdd={handleAdd}
                onEdit={setEditingId}
                onDelete={handleDelete}
                onEditTrigger={() => setTriggerOpen(true)}
              />
            </>
          ) : (
            <SettingsPanel settings={settings} setSettings={setSettings} segments={segments} />
          )}
        </div>

        <div className="space-y-4">
          <Card className="shadow-none lg:sticky lg:top-6">
            <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Row icon={Zap} label="Enrollment triggers"><span className="font-medium tabular-nums">{triggers.length}</span></Row>
              <Row icon={Workflow} label="Steps"><span className="font-medium tabular-nums">{nodeCount}</span></Row>
              <Row icon={SlidersHorizontal} label="Re-enrollment"><Badge variant="outline" className="capitalize">{settings.reEnrollment}</Badge></Row>
              <div className="border-t pt-3">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase">Options</p>
                <div className="flex flex-wrap gap-1.5">
                  {settings.goalCondition && <Badge variant="outline">Goal exit</Badge>}
                  {settings.suppressionSegmentId && <Badge variant="outline">Suppression</Badge>}
                  {settings.quietHours && <Badge variant="outline">Quiet hours</Badge>}
                </div>
              </div>
              {issues.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-3.5" />
                    {issues.length} issue{issues.length > 1 ? "s" : ""} before activation
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-amber-700/90 dark:text-amber-400/90">
                    {issues.slice(0, 4).map((iss) => (<li key={iss}>• {iss}</li>))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={triggerOpen} onOpenChange={setTriggerOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Enrollment triggers</SheetTitle>
            <SheetDescription>Contacts enter when they match any of these.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto px-4 pb-8">
            <AutomationTriggerConfig triggers={triggers} onChange={setTriggers} />
          </div>
        </SheetContent>
      </Sheet>

      <AutomationNodeConfig node={editingNode} onPatch={handlePatch} onClose={() => setEditingId(null)} />
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: typeof Zap; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="size-4" />{label}</span>
      {children}
    </div>
  );
}

function SettingsPanel({
  settings,
  setSettings,
  segments,
}: {
  settings: AutomationSettings;
  setSettings: (s: AutomationSettings) => void;
  segments: { id: string; name: string; archived?: boolean }[];
}) {
  const patch = (p: Partial<AutomationSettings>) => setSettings({ ...settings, ...p });
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Enrollment & exit settings</CardTitle>
        <p className="text-sm text-muted-foreground">How contacts re-enter, exit, and are protected.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-3">
          <Label className="text-sm">Re-enrollment</Label>
          <p className="mb-2 text-xs text-muted-foreground">Whether a contact who finished can enter again.</p>
          <Select value={settings.reEnrollment} onValueChange={(v) => patch({ reEnrollment: (v as AutomationSettings["reEnrollment"]) ?? "never" })}>
            <SelectTrigger className="w-full sm:w-60"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never re-enroll</SelectItem>
              <SelectItem value="cooldown">After a cooldown</SelectItem>
              <SelectItem value="always">Every time they qualify</SelectItem>
            </SelectContent>
          </Select>
          {settings.reEnrollment === "cooldown" && (
            <div className="mt-3 flex items-center gap-2">
              <Input type="number" min={1} className="w-24" value={settings.reEnrollCooldownDays ?? 30} onChange={(e) => patch({ reEnrollCooldownDays: Number(e.target.value) || 30 })} />
              <span className="text-sm text-muted-foreground">days between enrollments</span>
            </div>
          )}
        </div>

        <div className="rounded-lg border p-3">
          <Label className="text-sm">Goal condition</Label>
          <p className="mb-2 text-xs text-muted-foreground">Contacts who meet this exit early as goal met.</p>
          <Input value={settings.goalCondition ?? ""} onChange={(e) => patch({ goalCondition: e.target.value || undefined })} placeholder="e.g. lifecycleStage = mql" />
        </div>

        <div className="rounded-lg border p-3">
          <Label className="text-sm">Suppression segment</Label>
          <p className="mb-2 text-xs text-muted-foreground">Contacts in this segment never enroll.</p>
          <Select
            items={{ none: "None", ...Object.fromEntries(segments.filter((s) => !s.archived).map((s) => [s.id, s.name])) }}
            value={settings.suppressionSegmentId ?? "none"}
            onValueChange={(v) => patch({ suppressionSegmentId: v === "none" ? undefined : (v ?? undefined) })}
          >
            <SelectTrigger className="w-full sm:w-80"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {segments.filter((s) => !s.archived).map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Respect quiet hours</p>
            <p className="text-xs text-muted-foreground">Hold sends until working hours in the contact&rsquo;s timezone.</p>
          </div>
          <Switch checked={!!settings.quietHours} onCheckedChange={(v) => patch({ quietHours: v })} />
        </div>
      </CardContent>
    </Card>
  );
}
