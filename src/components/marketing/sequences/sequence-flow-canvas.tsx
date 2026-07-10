"use client";

import "@xyflow/react/dist/style.css";

import { Fragment, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Plus, Trash2 } from "lucide-react";
import type { SequenceStep, SequenceStepType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { STEP_META, stepSummary } from "@/components/marketing/sequences/sequence-shared";

const NODE_W = 300;
const NODE_H = 96;
const ADD_H = 48;
const V_GAP = 52;
const BRANCH_V_GAP = 56;
const H_GAP = 44;

const PALETTE: { label: string; types: SequenceStepType[] }[] = [
  { label: "Communication", types: ["email", "whatsapp"] },
  { label: "Timing", types: ["wait"] },
  { label: "Logic", types: ["branch"] },
  { label: "CRM & data", types: ["action"] },
  { label: "Flow", types: ["goal"] },
];

type AddFn = (type: SequenceStepType, containerId: string, afterId?: string) => void;

interface CanvasProps {
  flow: SequenceStep[];
  editable?: boolean;
  onAdd?: AddFn;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  height?: number;
}

function AddMenu({
  onAdd,
  containerId,
  afterId,
  trigger,
}: {
  onAdd: AddFn;
  containerId: string;
  afterId?: string;
  trigger: React.ReactElement;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align="center" className="w-56">
        {PALETTE.map((group, gi) => (
          <Fragment key={group.label}>
            {gi > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-[11px] uppercase text-muted-foreground">{group.label}</DropdownMenuLabel>
            {group.types.map((type) => {
              const Meta = STEP_META[type];
              return (
                <DropdownMenuItem key={type} onClick={() => onAdd(type, containerId, afterId)}>
                  <span className={cn("flex size-5 items-center justify-center rounded", Meta.tint)}>
                    <Meta.icon className="size-3" />
                  </span>
                  {Meta.label}
                </DropdownMenuItem>
              );
            })}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StartNode() {
  return (
    <div className="w-[300px] rounded-xl border-2 border-primary/40 bg-background p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="text-sm font-bold">▸</span>
        </span>
        <div>
          <p className="text-sm font-semibold">Enrolled contacts start here</p>
          <p className="text-xs text-muted-foreground">Steps run top to bottom.</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!size-2 !border-2 !border-primary !bg-background" />
    </div>
  );
}

interface StepData {
  step: SequenceStep;
  editable?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  [key: string]: unknown;
}

function StepNode({ data }: NodeProps) {
  const { step, editable, onEdit, onDelete } = data as unknown as StepData;
  const meta = STEP_META[step.type];
  const clickable = editable && !!onEdit;
  return (
    <div
      className={cn(
        "group flex w-[300px] items-start gap-3 rounded-lg border border-l-4 bg-background p-3 shadow-sm",
        meta.accent,
        clickable && "cursor-pointer transition-colors hover:bg-muted/40 hover:shadow-md"
      )}
      onClick={clickable ? () => onEdit!(step.id) : undefined}
    >
      <Handle type="target" position={Position.Top} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
      <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", meta.tint)}>
        <meta.icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{step.label}</p>
          <span className="shrink-0 text-[11px] text-muted-foreground">{meta.label}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{stepSummary(step)}</p>
        {!editable && step.stats && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] tabular-nums text-muted-foreground">
            <span>{step.stats.reached.toLocaleString()} reached</span>
            <span>{step.stats.continued.toLocaleString()} continued</span>
          </div>
        )}
      </div>
      {editable && onDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(step.id);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
      <Handle type="source" position={Position.Bottom} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
    </div>
  );
}

interface AddData {
  onAdd: AddFn;
  containerId: string;
  afterId?: string;
  [key: string]: unknown;
}

function AddNode({ data }: NodeProps) {
  const { onAdd, containerId, afterId } = data as unknown as AddData;
  return (
    <div className="w-[300px]">
      <Handle type="target" position={Position.Top} className="!size-2 !border-2 !border-muted-foreground/40 !bg-background" />
      <AddMenu
        onAdd={onAdd}
        containerId={containerId}
        afterId={afterId}
        trigger={
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="size-4" /> Add step
          </button>
        }
      />
    </div>
  );
}

const nodeTypes = { start: StartNode, step: StepNode, add: AddNode };

interface InsertEdgeData {
  onAdd?: AddFn;
  containerId?: string;
  afterId?: string;
  editable?: boolean;
  [key: string]: unknown;
}

function InsertEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 12 });
  const d = (data ?? {}) as InsertEdgeData;
  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: "var(--border)", strokeWidth: 1.5 }} />
      {d.editable && d.onAdd && d.containerId && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: "all" }}
          >
            <AddMenu
              onAdd={d.onAdd}
              containerId={d.containerId}
              afterId={d.afterId}
              trigger={
                <button
                  type="button"
                  aria-label="Insert step"
                  className="flex size-6 items-center justify-center rounded-full border-2 border-dashed border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <Plus className="size-3.5" />
                </button>
              }
            />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

interface LabelEdgeData {
  label?: string;
  tone?: "yes" | "no" | "pct";
  [key: string]: unknown;
}

function LabelEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 12 });
  const d = (data ?? {}) as LabelEdgeData;
  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: "var(--border)", strokeWidth: 1.5 }} />
      {d.label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: "all" }}
          >
            <span
              className={cn(
                "rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium shadow-sm",
                d.tone === "yes" && "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
                d.tone === "no" && "border-rose-500/40 text-rose-700 dark:text-rose-300",
                d.tone === "pct" && "border-violet-500/40 text-violet-700 dark:text-violet-300"
              )}
            >
              {d.label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const edgeTypes = { insert: InsertEdge, labeled: LabelEdge };

function colWidth(steps: SequenceStep[]): number {
  let w = NODE_W;
  for (const s of steps) w = Math.max(w, stepWidth(s));
  return w;
}
function stepWidth(s: SequenceStep): number {
  if (s.type === "branch" && s.branches?.length) {
    const widths = s.branches.map((b) => colWidth(b.steps));
    return Math.max(NODE_W, widths.reduce((a, b) => a + b, 0) + (s.branches.length - 1) * H_GAP);
  }
  return NODE_W;
}

function branchLabel(step: SequenceStep, index: number): { label: string; tone: "yes" | "no" | "pct" } {
  const b = step.branches?.[index];
  if (step.branchKind === "percentage") return { label: `${b?.percent ?? 0}%`, tone: "pct" };
  return { label: b?.label ?? (index === 0 ? "Yes" : "No"), tone: index === 0 ? "yes" : "no" };
}

function buildGraph(props: CanvasProps): { rfNodes: Node[]; rfEdges: Edge[] } {
  const rfNodes: Node[] = [];
  const rfEdges: Edge[] = [];
  const { editable, onAdd, onEdit, onDelete } = props;

  const START_ID = "__start";
  rfNodes.push({ id: START_ID, type: "start", position: { x: -NODE_W / 2, y: 0 }, data: {}, draggable: false, selectable: false });

  function layout(
    steps: SequenceStep[],
    containerId: string,
    centerX: number,
    topY: number,
    sourceId: string,
    entry?: { label: string; tone: "yes" | "no" | "pct" }
  ): number {
    let y = topY;
    let prevId = sourceId;
    let firstEntry = entry;

    steps.forEach((step, i) => {
      const nodeY = y;
      rfNodes.push({
        id: step.id,
        type: "step",
        position: { x: centerX - NODE_W / 2, y: nodeY },
        data: { step, editable, onEdit, onDelete },
        draggable: false,
      });

      if (i === 0 && firstEntry) {
        rfEdges.push({ id: `e-${prevId}-${step.id}`, source: prevId, target: step.id, type: "labeled", data: { label: firstEntry.label, tone: firstEntry.tone } });
      } else if (i === 0) {
        rfEdges.push({ id: `e-${prevId}-${step.id}`, source: prevId, target: step.id, type: "smoothstep" });
      } else {
        rfEdges.push({ id: `e-${prevId}-${step.id}`, source: prevId, target: step.id, type: "insert", data: { onAdd, containerId, afterId: steps[i - 1].id, editable } });
      }
      firstEntry = undefined;
      y = nodeY + NODE_H;

      if (step.type === "branch" && step.branches?.length) {
        const widths = step.branches.map((b) => colWidth(b.steps));
        const totalW = widths.reduce((a, b) => a + b, 0) + (step.branches.length - 1) * H_GAP;
        let bx = centerX - totalW / 2;
        const branchTop = y + BRANCH_V_GAP;
        let maxBottom = branchTop;
        step.branches.forEach((b, bi) => {
          const bCenter = bx + widths[bi] / 2;
          const bottom = layout(b.steps, b.id, bCenter, branchTop, step.id, branchLabel(step, bi));
          maxBottom = Math.max(maxBottom, bottom);
          bx += widths[bi] + H_GAP;
        });
        y = maxBottom;
      }

      prevId = step.id;
      y += V_GAP;
    });

    if (editable && onAdd) {
      const addId = `__add-${containerId}`;
      rfNodes.push({
        id: addId,
        type: "add",
        position: { x: centerX - NODE_W / 2, y },
        data: { onAdd, containerId, afterId: steps.length ? steps[steps.length - 1].id : undefined },
        draggable: false,
        selectable: false,
      });
      rfEdges.push({
        id: `e-${prevId}-${addId}`,
        source: prevId,
        target: addId,
        type: firstEntry ? "labeled" : "smoothstep",
        data: firstEntry ? { label: firstEntry.label, tone: firstEntry.tone } : undefined,
      });
      y += ADD_H + V_GAP;
    }
    return y;
  }

  layout(props.flow, "main", 0, NODE_H + 64, START_ID);
  return { rfNodes, rfEdges };
}

export function SequenceFlowCanvas(props: CanvasProps) {
  const { rfNodes, rfEdges } = useMemo(
    () => buildGraph(props),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.flow, props.editable]
  );

  return (
    <div className="rounded-xl border bg-muted/20" style={{ height: props.height ?? 600 }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable className="!bg-background" nodeStrokeWidth={2} />
      </ReactFlow>
    </div>
  );
}
