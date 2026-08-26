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
import { ArrowLeft, ChevronRight, Plus, Search, Trash2, Waypoints, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ACTION_CATALOG,
  CATEGORY_ORDER,
  catalogItem,
  TRIGGER_CATALOG,
  type CatalogItem,
  type Workflow,
  type WfObject,
  type WfStep,
} from "@/lib/mock-data/automations";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NODE_W = 300;
const V_GAP = 40;
const H_GAP = 48;
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

/* ============================ tree helpers ============================ */
type AddTarget = { kind: "root" } | { kind: "lane"; branchId: string; laneIdx: number };

function makeStep(type: string): WfStep {
  const item = catalogItem(type);
  const step: WfStep = { id: uid("s"), type, summary: item?.label };
  if (item?.outputs) step.lanes = item.outputs.map((label) => ({ label, steps: [] }));
  return step;
}
function appendTo(steps: WfStep[], target: AddTarget, step: WfStep): WfStep[] {
  if (target.kind === "root") return [...steps, step];
  return steps.map((s) =>
    s.id === target.branchId && s.lanes
      ? { ...s, lanes: s.lanes.map((l, i) => (i === target.laneIdx ? { ...l, steps: [...l.steps, step] } : l)) }
      : s.lanes
        ? { ...s, lanes: s.lanes.map((l) => ({ ...l, steps: appendTo(l.steps, target, step) })) }
        : s,
  );
}
function removeFrom(steps: WfStep[], id: string): WfStep[] {
  return steps
    .filter((s) => s.id !== id)
    .map((s) => (s.lanes ? { ...s, lanes: s.lanes.map((l) => ({ ...l, steps: removeFrom(l.steps, id) })) } : s));
}
function updateIn(steps: WfStep[], id: string, changes: Partial<WfStep>): WfStep[] {
  return steps.map((s) =>
    s.id === id
      ? { ...s, ...changes }
      : s.lanes
        ? { ...s, lanes: s.lanes.map((l) => ({ ...l, steps: updateIn(l.steps, id, changes) })) }
        : s,
  );
}
function findStep(steps: WfStep[], id: string): WfStep | undefined {
  for (const s of steps) {
    if (s.id === id) return s;
    if (s.lanes) for (const l of s.lanes) { const f = findStep(l.steps, id); if (f) return f; }
  }
}

/* ============================ layout ============================ */
function chainWidth(steps: WfStep[]): number {
  const last = steps[steps.length - 1];
  if (last?.lanes) return branchWidth(last);
  return NODE_W;
}
function branchWidth(branch: WfStep): number {
  const lanes = branch.lanes ?? [];
  return lanes.reduce((sum, l) => sum + Math.max(NODE_W, chainWidth(l.steps)), 0) + H_GAP * Math.max(0, lanes.length - 1);
}

interface LayoutCtx {
  nodes: Node[];
  edges: Edge[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: (t: AddTarget) => void;
}
function layoutChain(
  steps: WfStep[],
  centerX: number,
  startY: number,
  prevId: string,
  edgeLabel: string | undefined,
  ctx: LayoutCtx,
) {
  let y = startY;
  let prev = prevId;
  let label = edgeLabel;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const isBranch = !!step.lanes && i === steps.length - 1;
    ctx.nodes.push({
      id: step.id,
      type: isBranch ? "branch" : "step",
      position: { x: centerX - NODE_W / 2, y },
      data: { step, selected: ctx.selectedId === step.id, onSelect: ctx.onSelect },
      draggable: false,
      selectable: false,
    });
    ctx.edges.push({ id: `e-${prev}-${step.id}`, source: prev, target: step.id, type: "smoothstep", label, labelStyle: { fontSize: 11, fill: "var(--muted-foreground)" } });
    prev = step.id;
    label = undefined;
    y += 66 + V_GAP;

    if (isBranch) {
      const total = branchWidth(step);
      let laneX = centerX - total / 2;
      for (let li = 0; li < step.lanes!.length; li++) {
        const lane = step.lanes![li];
        const lw = Math.max(NODE_W, chainWidth(lane.steps));
        const laneCenter = laneX + lw / 2;
        if (lane.steps.length) {
          layoutChain(lane.steps, laneCenter, y, step.id, lane.label, ctx);
        } else {
          const addId = uid("add");
          ctx.nodes.push({ id: addId, type: "add", position: { x: laneCenter - NODE_W / 2, y }, data: { onAdd: () => ctx.onAdd({ kind: "lane", branchId: step.id, laneIdx: li }) }, draggable: false, selectable: false });
          ctx.edges.push({ id: `e-${step.id}-${addId}`, source: step.id, target: addId, type: "smoothstep", label: lane.label, labelStyle: { fontSize: 11, fill: "var(--muted-foreground)" } });
        }
        laneX += lw + H_GAP;
      }
      return; // branch terminal
    }
  }
  // chain ended with normal steps → trunk add button
  const addId = uid("add");
  ctx.nodes.push({ id: addId, type: "add", position: { x: centerX - NODE_W / 2, y }, data: { onAdd: () => ctx.onAdd({ kind: "root" }) }, draggable: false, selectable: false });
  ctx.edges.push({ id: `e-${prev}-${addId}`, source: prev, target: addId, type: "smoothstep" });
}

/* ============================ node cards ============================ */
function TriggerNode({ data }: NodeProps) {
  const { trigger, onPick } = data as unknown as { trigger: CatalogItem; onPick: () => void };
  const Icon = trigger?.icon ?? Zap;
  return (
    <div onClick={onPick} className="w-[300px] cursor-pointer overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 to-background shadow-sm transition-colors hover:border-indigo-500/60">
      <div className="flex items-center gap-3 p-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><Icon className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">When</p>
          <p className="truncate text-sm font-semibold">{trigger?.label ?? "Choose a trigger"}</p>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
      <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-2 !border-indigo-500 !bg-background" />
    </div>
  );
}
function StepNode({ data }: NodeProps) {
  const { step, selected, onSelect } = data as unknown as { step: WfStep; selected: boolean; onSelect: (id: string) => void };
  const item = catalogItem(step.type);
  const Icon = item?.icon ?? Zap;
  const isBridge = step.type === "enrollInSequence" || step.type === "unenrollSequence";
  return (
    <div
      onClick={() => onSelect(step.id)}
      className={cn(
        "flex w-[300px] cursor-pointer items-center gap-3 rounded-lg border border-l-4 bg-background p-3 shadow-sm transition-colors hover:bg-muted/40",
        isBridge ? "border-l-violet-500" : "border-l-emerald-500",
        selected && "ring-2 ring-primary",
      )}
    >
      <Handle type="target" position={Position.Top} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
      <span className={cn("flex size-8 items-center justify-center rounded-lg", isBridge ? "bg-violet-500/10 text-violet-600" : "bg-emerald-500/10 text-emerald-600")}><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{isBridge ? "Hand off" : "Then"}</p>
        <p className="truncate text-sm font-medium">{step.summary || item?.label}</p>
      </div>
      {isBridge && <Badge variant="secondary" className="shrink-0 gap-1 bg-violet-500/10 text-violet-600"><Waypoints className="size-3" />Sequence</Badge>}
      <Handle type="source" position={Position.Bottom} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
    </div>
  );
}
function BranchNode({ data }: NodeProps) {
  const { step, selected, onSelect } = data as unknown as { step: WfStep; selected: boolean; onSelect: (id: string) => void };
  const item = catalogItem(step.type);
  const Icon = item?.icon ?? Zap;
  return (
    <div onClick={() => onSelect(step.id)} className={cn("flex w-[300px] cursor-pointer items-center gap-3 rounded-lg border border-l-4 border-l-amber-500 bg-background p-3 shadow-sm transition-colors hover:bg-muted/40", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
      <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Branch · If</p>
        <p className="truncate text-sm font-medium">{step.summary || item?.label}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
    </div>
  );
}
function AddNode({ data }: NodeProps) {
  const { onAdd } = data as unknown as { onAdd: () => void };
  return (
    <div className="flex w-[300px] justify-center">
      <Handle type="target" position={Position.Top} className="!size-2 !border-2 !border-muted-foreground/40 !bg-background" />
      <button type="button" onClick={onAdd} className="flex items-center gap-1.5 rounded-lg border border-dashed bg-background/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
        <Plus className="size-4" /> Add step
      </button>
    </div>
  );
}
const nodeTypes = { trigger: TriggerNode, step: StepNode, branch: BranchNode, add: AddNode };

/* ============================ catalog picker ============================ */
function CatalogPicker({
  open, mode, object, onClose, onChoose,
}: {
  open: boolean; mode: "trigger" | "step"; object: WfObject;
  onClose: () => void; onChoose: (type: string) => void;
}) {
  const [q, setQ] = useState("");
  const items = (mode === "trigger" ? TRIGGER_CATALOG : ACTION_CATALOG)
    .filter((c) => c.objects.includes(object))
    .filter((c) => (q ? (c.label + c.desc).toLowerCase().includes(q.toLowerCase()) : true));
  const groups = mode === "trigger"
    ? [["Triggers", items]] as const
    : CATEGORY_ORDER.map((g) => [g, items.filter((c) => c.group === g)] as const).filter(([, l]) => l.length);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[380px] gap-0 p-0 sm:max-w-[380px]">
        <SheetHeader className="border-b p-4">
          <SheetTitle>{mode === "trigger" ? "Choose a trigger" : "Add a step"}</SheetTitle>
          <SheetDescription>{mode === "trigger" ? "Pick the event that enrolls records." : "Pick an action, branch, delay, or integration."}</SheetDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-8" />
          </div>
        </SheetHeader>
        <div className="h-[calc(100vh-140px)] overflow-y-auto p-3">
          {groups.map(([g, list]) => (
            <div key={g} className="mb-4">
              <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{g}</p>
              <div className="space-y-1.5">
                {list.map((c) => {
                  const Icon = c.icon;
                  const bridge = c.type === "enrollInSequence" || c.type === "unenrollSequence";
                  return (
                    <button key={c.type} onClick={() => onChoose(c.type)} className="flex w-full items-start gap-3 rounded-lg border p-2.5 text-left transition-colors hover:border-primary hover:bg-primary/5">
                      <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", bridge ? "bg-violet-500/10 text-violet-600" : "bg-muted text-foreground/70")}><Icon className="size-4" /></span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{c.label}{bridge && <Badge variant="secondary" className="ml-1.5 bg-violet-500/10 text-violet-600">Bridge</Badge>}</p>
                        <p className="text-xs text-muted-foreground">{c.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ============================ main ============================ */
export function AutomationsBuilder({ initial }: { initial: Workflow }) {
  const [wf, setWf] = useState<Workflow>(initial);
  const [selectedId, setSelectedId] = useState<string>("");
  const [picker, setPicker] = useState<{ mode: "trigger" | "step"; target?: AddTarget } | null>(null);

  const trigger = catalogItem(wf.triggerType);
  const selected = selectedId ? findStep(wf.steps, selectedId) : undefined;
  const selectedItem = selected ? catalogItem(selected.type) : undefined;

  const setObject = (object: WfObject) => {
    // reset trigger to a valid one for the object
    const valid = TRIGGER_CATALOG.find((t) => t.objects.includes(object));
    setWf((w) => ({ ...w, object, triggerType: valid?.type ?? w.triggerType }));
    toast.message(`Object set to ${object === "lead" ? "Lead" : "Customer"} — catalog filtered`);
  };
  const choose = (type: string) => {
    if (!picker) return;
    if (picker.mode === "trigger") {
      setWf((w) => ({ ...w, triggerType: type }));
    } else if (picker.target) {
      const step = makeStep(type);
      setWf((w) => ({ ...w, steps: appendTo(w.steps, picker.target!, step) }));
      setSelectedId(step.id);
      toast.success(`Added “${catalogItem(type)?.label}”`);
    }
    setPicker(null);
  };
  const deleteStep = (id: string) => { setWf((w) => ({ ...w, steps: removeFrom(w.steps, id) })); setSelectedId(""); };

  const { nodes, edges } = useMemo(() => {
    const ctx: LayoutCtx = { nodes: [], edges: [], selectedId, onSelect: setSelectedId, onAdd: (t) => setPicker({ mode: "step", target: t }) };
    ctx.nodes.push({ id: "trigger", type: "trigger", position: { x: -NODE_W / 2, y: 0 }, data: { trigger, onPick: () => setPicker({ mode: "trigger" }) }, draggable: false, selectable: false });
    if (wf.steps.length) layoutChain(wf.steps, 0, 92 + V_GAP, "trigger", undefined, ctx);
    else {
      const addId = uid("add");
      ctx.nodes.push({ id: addId, type: "add", position: { x: -NODE_W / 2, y: 92 + V_GAP }, data: { onAdd: () => setPicker({ mode: "step", target: { kind: "root" } }) }, draggable: false, selectable: false });
      ctx.edges.push({ id: `e-trigger-${addId}`, source: "trigger", target: addId, type: "smoothstep" });
    }
    return { nodes: ctx.nodes, edges: ctx.edges };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wf, selectedId, trigger]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon-sm" render={<Link href="/marketing/automations" aria-label="Back to automations" />}><ArrowLeft className="size-4" /></Button>
        <Input value={wf.name} onChange={(e) => setWf((w) => ({ ...w, name: e.target.value }))} className="h-8 max-w-sm border-transparent bg-transparent px-1 text-base font-semibold shadow-none focus-visible:border-input" />
        <Badge variant="outline" className="capitalize">{wf.object}</Badge>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Runs on</span>
          <Select value={wf.object} onValueChange={(v) => setObject(v as WfObject)}>
            <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 rounded-md border px-2.5 py-1.5">
            <Switch checked={wf.enabled} onCheckedChange={() => setWf((w) => ({ ...w, enabled: !w.enabled }))} />
            <span className="text-xs">{wf.enabled ? "Active" : "Paused"}</span>
          </div>
          <Button size="sm" onClick={() => toast.success(wf.enabled ? "Workflow published" : "Draft saved")}>{wf.enabled ? "Publish" : "Save draft"}</Button>
        </div>
      </div>

      {/* canvas + inspector */}
      <div className="grid flex-1 grid-cols-[1fr_300px] overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-b from-muted/40 to-background">
          <ReactFlow
            nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView
            fitViewOptions={{ padding: 0.25, maxZoom: 1 }} minZoom={0.3} maxZoom={1.4}
            nodesDraggable={false} nodesConnectable={false} proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{ type: "smoothstep", style: { stroke: "var(--border)", strokeWidth: 1.5 } }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.4} color="var(--border)" />
            <Controls showInteractive={false} className="!rounded-lg !border !border-border !shadow-sm [&>button]:!border-border" />
          </ReactFlow>
        </div>

        {/* inspector */}
        <div className="overflow-y-auto border-l p-3">
          {selected && selectedItem ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <selectedItem.icon className="size-4" />
                  <span className="text-sm font-medium">{selectedItem.label}</span>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => deleteStep(selected.id)}><Trash2 className="size-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">{selectedItem.desc}</p>
              {(selected.type === "enrollInSequence" || selected.type === "unenrollSequence") && (
                <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-2.5 text-xs">
                  <p className="font-medium text-violet-600">Bridge → Sequences</p>
                  <p className="mt-1 text-muted-foreground">This hands the record from automation to a rep&apos;s 1:1 sequence. Pick which sequence below.</p>
                  <Select defaultValue="ae-fast-track">
                    <SelectTrigger className="mt-2 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ae-fast-track">AE fast-track</SelectItem>
                      <SelectItem value="nurture">Nurture</SelectItem>
                      <SelectItem value="reengage">Re-engage no-show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Separator />
              <div className="space-y-1.5">
                <Label className="text-xs">Step label</Label>
                <Textarea value={selected.summary ?? ""} onChange={(e) => setWf((w) => ({ ...w, steps: updateIn(w.steps, selected.id, { summary: e.target.value }) }))} rows={2} className="text-sm" />
              </div>
              {selected.lanes && (
                <div className="rounded-lg border border-dashed p-2.5 text-xs text-muted-foreground">
                  <p className="mb-1 font-medium text-foreground">Branches</p>
                  {selected.lanes.map((l) => <Badge key={l.label} variant="secondary" className="mr-1 mb-1 font-normal">{l.label}</Badge>)}
                  <p className="mt-2">Add steps under each branch on the canvas.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">Trigger</p>
              <button onClick={() => setPicker({ mode: "trigger" })} className="flex w-full items-center gap-2 rounded-lg border p-2.5 text-left text-sm hover:border-primary hover:bg-primary/5">
                {trigger && <trigger.icon className="size-4 text-indigo-500" />}
                <span className="flex-1">{trigger?.label ?? "Choose a trigger"}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
              <p className="text-xs text-muted-foreground">{trigger?.desc}</p>
              <Separator />
              <p className="text-xs text-muted-foreground">Click a step on the canvas to edit it, or use <span className="font-medium text-foreground">Add step</span> to grow the flow. Branch nodes (If / Value / Random Split) create parallel lanes.</p>
              <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-2.5 text-xs">
                <p className="font-medium text-violet-600">Tip · Hand off to Sequences</p>
                <p className="mt-1 text-muted-foreground">Add an <span className="font-medium">Enroll in Sequence</span> step to pass a qualified record to a rep&apos;s personal cadence.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {picker && (
        <CatalogPicker open mode={picker.mode} object={wf.object} onClose={() => setPicker(null)} onChoose={choose} />
      )}
    </div>
  );
}
