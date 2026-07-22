"use client";

import "@xyflow/react/dist/style.css";

import { useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  Bell,
  GitBranch,
  Plus,
  Route,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { CM_AUTOMATIONS, CM_PROJECTS } from "@/lib/mock-data/case-manager";
import type {
  CmAutomation,
  CmAutomationAction,
  CmAutomationTrigger,
} from "@/lib/types/case-manager";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TRIGGER_LABEL: Record<CmAutomationTrigger, string> = {
  NEW_CASE_CREATED: "A new case is created",
  QUEUE_CHANGED: "A case changes queue",
  STATUS_CHANGED: "A case status changes",
  SLA_AT_RISK: "SLA is at risk",
  EMAIL_RECEIVED: "An email is received",
  INTAKE_RECEIVED: "New intake is received",
};

const ACTION_META: Record<
  CmAutomationAction["type"],
  { label: string; icon: typeof Bell }
> = {
  notify: { label: "Notify", icon: Bell },
  assign: { label: "Assign", icon: Route },
  route: { label: "Route to queue", icon: Route },
  escalate: { label: "Escalate", icon: Zap },
  comment: { label: "Add comment", icon: GitBranch },
  set_priority: { label: "Set priority", icon: Zap },
};

const ADDABLE: CmAutomationAction["type"][] = [
  "notify",
  "assign",
  "escalate",
  "comment",
  "set_priority",
];

const NODE_W = 300;

/* ---------- nodes ---------- */

function TriggerNode({ data }: NodeProps) {
  const d = data as { label: string };
  return (
    <div className="w-[300px] overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 to-background shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Zap className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">When</p>
          <p className="truncate text-sm font-semibold">{d.label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-2 !border-indigo-500 !bg-background" />
    </div>
  );
}

function ConditionNode({ data }: NodeProps) {
  const d = data as { text: string };
  return (
    <div className="flex w-[300px] items-center gap-3 rounded-lg border border-l-4 border-l-amber-500 bg-background p-3 shadow-sm">
      <Handle type="target" position={Position.Top} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
      <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
        <GitBranch className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">If</p>
        <p className="truncate text-sm font-medium">{d.text}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
    </div>
  );
}

interface ActionData {
  action: CmAutomationAction;
  index: number;
  selected: boolean;
  onSelect: (i: number) => void;
  [key: string]: unknown;
}

function ActionNode({ data }: NodeProps) {
  const { action, index, selected, onSelect } = data as unknown as ActionData;
  const meta = ACTION_META[action.type];
  return (
    <div
      onClick={() => onSelect(index)}
      className={cn(
        "flex w-[300px] cursor-pointer items-center gap-3 rounded-lg border border-l-4 border-l-emerald-500 bg-background p-3 shadow-sm transition-colors hover:bg-muted/40",
        selected && "ring-2 ring-primary"
      )}
    >
      <Handle type="target" position={Position.Top} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
        <meta.icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Then</p>
        <p className="truncate text-sm font-medium">
          {meta.label}
          {action.target ? `: ${action.target}` : action.value ? `: ${action.value}` : ""}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
    </div>
  );
}

interface AddData {
  onAdd: (type: CmAutomationAction["type"]) => void;
  [key: string]: unknown;
}

function AddNode({ data }: NodeProps) {
  const { onAdd } = data as unknown as AddData;
  return (
    <div className="flex w-[300px] justify-center">
      <Handle type="target" position={Position.Top} className="!size-2 !border-2 !border-muted-foreground/40 !bg-background" />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed bg-background/60 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <Plus className="size-4" /> Add action
            </button>
          }
        />
        <DropdownMenuContent align="center" className="w-48">
          {ADDABLE.map((type) => {
            const meta = ACTION_META[type];
            return (
              <DropdownMenuItem key={type} onClick={() => onAdd(type)}>
                <meta.icon className="size-3.5" /> {meta.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const nodeTypes = { trigger: TriggerNode, condition: ConditionNode, action: ActionNode, add: AddNode };

/* ---------- builder ---------- */

export function AutomationsBuilder({ projectId }: { projectId?: string }) {
  const scoped = useMemo(
    () =>
      CM_AUTOMATIONS.filter(
        (a) => !projectId || a.scope === projectId || a.scope === "global"
      ),
    [projectId]
  );
  const [automations, setAutomations] = useState<CmAutomation[]>(scoped);
  const [selectedId, setSelectedId] = useState(scoped[0]?.id ?? "");
  const [selectedAction, setSelectedAction] = useState<number | null>(null);

  const selected = automations.find((a) => a.id === selectedId);

  const patch = (id: string, fn: (a: CmAutomation) => CmAutomation) =>
    setAutomations((list) => list.map((a) => (a.id === id ? fn(a) : a)));

  const addAction = (type: CmAutomationAction["type"]) => {
    if (!selected) return;
    patch(selected.id, (a) => ({ ...a, actions: [...a.actions, { type }] }));
    setSelectedAction(selected.actions.length);
    toast.success(`Added ${ACTION_META[type].label} action`);
  };

  const removeAction = (index: number) => {
    if (!selected) return;
    patch(selected.id, (a) => ({ ...a, actions: a.actions.filter((_, i) => i !== index) }));
    setSelectedAction(null);
  };

  const updateAction = (index: number, changes: Partial<CmAutomationAction>) => {
    if (!selected) return;
    patch(selected.id, (a) => ({
      ...a,
      actions: a.actions.map((ac, i) => (i === index ? { ...ac, ...changes } : ac)),
    }));
  };

  const { nodes, edges } = useMemo(() => {
    if (!selected) return { nodes: [] as Node[], edges: [] as Edge[] };
    const n: Node[] = [];
    const e: Edge[] = [];
    let y = 0;
    const x = -NODE_W / 2;
    const push = (id: string, type: string, data: Record<string, unknown>, h: number) => {
      n.push({ id, type, position: { x, y }, data, draggable: false, selectable: false });
      y += h + 44;
    };
    push("trigger", "trigger", { label: TRIGGER_LABEL[selected.trigger] }, 96);
    selected.conditions.forEach((c, i) => {
      const id = `cond-${i}`;
      push(id, "condition", { text: `${c.field} ${c.operator.toLowerCase()} ${c.value}` }, 64);
    });
    selected.actions.forEach((a, i) => {
      const id = `act-${i}`;
      push(id, "action", {
        action: a,
        index: i,
        selected: selectedAction === i,
        onSelect: setSelectedAction,
      }, 64);
    });
    push("add", "add", { onAdd: addAction }, 48);

    for (let i = 1; i < n.length; i++) {
      e.push({ id: `e-${i}`, source: n[i - 1].id, target: n[i].id, type: "smoothstep" });
    }
    return { nodes: n, edges: e };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, selectedAction]);

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr_260px]">
      {/* Automation list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Automations</span>
          <Button variant="ghost" size="icon-sm" onClick={() => toast.message("New automation — coming soon")}>
            <Plus className="size-4" />
          </Button>
        </div>
        {automations.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setSelectedId(a.id);
              setSelectedAction(null);
            }}
            className={cn(
              "w-full rounded-lg border p-2.5 text-left transition-colors",
              selectedId === a.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{a.name}</span>
              <span className={cn("size-1.5 shrink-0 rounded-full", a.enabled ? "bg-emerald-500" : "bg-muted-foreground/40")} />
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {a.scope === "global" ? "All projects" : CM_PROJECTS.find((p) => p.id === a.scope)?.name} · {a.runs} runs
            </p>
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="relative h-[520px] overflow-hidden rounded-xl border bg-gradient-to-b from-muted/40 to-background">
        {selected ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
            minZoom={0.4}
            maxZoom={1.4}
            nodesDraggable={false}
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1.5 } }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.4} color="var(--border)" />
            <Controls showInteractive={false} className="!rounded-lg !border !border-border !shadow-sm [&>button]:!border-border" />
          </ReactFlow>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select an automation
          </div>
        )}
      </div>

      {/* Inspector */}
      <div className="space-y-3">
        {selected ? (
          <>
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{selected.name}</span>
                <Switch
                  checked={selected.enabled}
                  onCheckedChange={() => patch(selected.id, (a) => ({ ...a, enabled: !a.enabled }))}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected.enabled ? "Active" : "Paused"} · {selected.runs} runs
              </p>
            </div>

            {selectedAction !== null && selected.actions[selectedAction] ? (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Edit action</span>
                  <Button variant="ghost" size="icon-sm" onClick={() => removeAction(selectedAction)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={selected.actions[selectedAction].type}
                    onValueChange={(v) => updateAction(selectedAction, { type: v as CmAutomationAction["type"] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ADDABLE.map((t) => (
                        <SelectItem key={t} value={t}>{ACTION_META[t].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Target / value</Label>
                  <Input
                    value={selected.actions[selectedAction].target ?? selected.actions[selectedAction].value ?? ""}
                    onChange={(e) => updateAction(selectedAction, { target: e.target.value, value: undefined })}
                    placeholder="e.g. CASE_ASSIGNEE"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">Conditions</p>
                {selected.conditions.length ? (
                  selected.conditions.map((c, i) => (
                    <Badge key={i} variant="secondary" className="mr-1 mb-1 font-normal">
                      {c.field} {c.operator.toLowerCase()} {c.value}
                    </Badge>
                  ))
                ) : (
                  <p>No conditions — runs on every trigger.</p>
                )}
                <p className="mt-3">Click an action node to edit it, or add a new one on the canvas.</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
