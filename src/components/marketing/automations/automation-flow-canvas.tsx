"use client";

import "@xyflow/react/dist/style.css";

import { useMemo } from "react";
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
import { Fragment } from "react";
import { Pencil, Plus, Trash2, Zap } from "lucide-react";
import type { AutomationNode, AutomationNodeType, AutomationTrigger } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
import {
  CATEGORY_LABELS,
  NODE_META,
  type NodeCategory,
  nodeSummary,
  triggerSummary,
} from "@/components/marketing/automations/automation-shared";

const NODE_W = 300;
const NODE_H = 96;
const ADD_H = 48;
const V_GAP = 52;
const BRANCH_V_GAP = 56;
const H_GAP = 44;

const PALETTE: { category: NodeCategory; types: AutomationNodeType[] }[] = [
  { category: "communication", types: ["send_email", "send_whatsapp"] },
  { category: "delay", types: ["delay"] },
  { category: "branch", types: ["branch"] },
  { category: "crm", types: ["action"] },
  { category: "flow", types: ["goal", "end"] },
];

type AddFn = (type: AutomationNodeType, containerId: string, afterId?: string) => void;

interface CanvasProps {
  triggers: AutomationTrigger[];
  nodes: AutomationNode[];
  editable?: boolean;
  onAdd?: AddFn;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEditTrigger?: () => void;
  height?: number;
}

// ── Add-step palette (shared by add-node and insert-edge) ────────────────────
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
          <Fragment key={group.category}>
            {gi > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-[11px] uppercase text-muted-foreground">
              {CATEGORY_LABELS[group.category]}
            </DropdownMenuLabel>
            {group.types.map((type) => {
              const Meta = NODE_META[type];
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

// ── Custom nodes ─────────────────────────────────────────────────────────────
interface TriggerData {
  triggers: AutomationTrigger[];
  editable?: boolean;
  onEditTrigger?: () => void;
  [key: string]: unknown;
}

function TriggerNode({ data }: NodeProps) {
  const d = data as unknown as TriggerData;
  const clickable = d.editable && d.onEditTrigger;
  return (
    <div
      className={cn(
        "w-[300px] rounded-xl border-2 border-primary/40 bg-background p-4 shadow-sm",
        clickable && "cursor-pointer transition-colors hover:border-primary"
      )}
      onClick={clickable ? d.onEditTrigger : undefined}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Zap className="size-4" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Enrollment trigger</p>
          <p className="text-xs text-muted-foreground">When a contact…</p>
        </div>
        {clickable && <Pencil className="size-3.5 text-muted-foreground" />}
      </div>
      <div className="mt-3 space-y-1.5">
        {d.triggers.length === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
            No triggers yet — add at least one so contacts can enter.
          </p>
        ) : (
          d.triggers.map((t, i) => (
            <div key={t.id} className="flex items-center gap-2">
              {i > 0 && <Badge variant="outline" className="text-[10px] uppercase">or</Badge>}
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs">{triggerSummary(t)}</span>
            </div>
          ))
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!size-2 !border-2 !border-primary !bg-background" />
    </div>
  );
}

interface StepData {
  node: AutomationNode;
  editable?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  [key: string]: unknown;
}

function StepNode({ data }: NodeProps) {
  const { node, editable, onEdit, onDelete } = data as unknown as StepData;
  const meta = NODE_META[node.type];
  const clickable = editable && !!onEdit;
  return (
    <div
      className={cn(
        "group flex w-[300px] items-start gap-3 rounded-lg border border-l-4 bg-background p-3 shadow-sm",
        meta.accent,
        clickable && "cursor-pointer transition-colors hover:bg-muted/40 hover:shadow-md"
      )}
      onClick={clickable ? () => onEdit!(node.id) : undefined}
    >
      <Handle type="target" position={Position.Top} className="!size-2 !border-2 !border-muted-foreground/50 !bg-background" />
      <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", meta.tint)}>
        <meta.icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{node.label}</p>
          <span className="shrink-0 text-[11px] text-muted-foreground">{meta.label}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{nodeSummary(node)}</p>
        {!editable && node.reached !== undefined && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] tabular-nums text-muted-foreground">
            <span>{node.reached.toLocaleString()} reached</span>
            {node.completed !== undefined && <span>{node.completed.toLocaleString()} continued</span>}
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
            onDelete(node.id);
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

const nodeTypes = { trigger: TriggerNode, step: StepNode, add: AddNode };

// ── Custom edges ─────────────────────────────────────────────────────────────
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

// ── Layout: recursive tree → positioned nodes + edges ────────────────────────
function colWidth(nodes: AutomationNode[]): number {
  let w = NODE_W;
  for (const n of nodes) w = Math.max(w, nodeWidth(n));
  return w;
}
function nodeWidth(n: AutomationNode): number {
  if (n.type === "branch" && n.branches?.length) {
    const widths = n.branches.map((b) => colWidth(b.nodes));
    return Math.max(NODE_W, widths.reduce((a, b) => a + b, 0) + (n.branches.length - 1) * H_GAP);
  }
  return NODE_W;
}

function branchLabel(n: AutomationNode, index: number): { label: string; tone: "yes" | "no" | "pct" } {
  const b = n.branches?.[index];
  if (n.branchKind === "percentage") return { label: `${b?.percent ?? 0}%`, tone: "pct" };
  if (index === 0) return { label: b?.condition ? "Match" : "Yes", tone: "yes" };
  return { label: "Else", tone: "no" };
}

function buildGraph(props: CanvasProps): { rfNodes: Node[]; rfEdges: Edge[] } {
  const rfNodes: Node[] = [];
  const rfEdges: Edge[] = [];
  const { triggers, editable, onAdd, onEdit, onDelete, onEditTrigger } = props;

  const TRIGGER_ID = "__trigger";
  rfNodes.push({
    id: TRIGGER_ID,
    type: "trigger",
    position: { x: -NODE_W / 2, y: 0 },
    data: { triggers, editable, onEditTrigger },
    draggable: false,
    selectable: false,
  });

  function layout(
    nodes: AutomationNode[],
    containerId: string,
    centerX: number,
    topY: number,
    sourceId: string,
    entry?: { label: string; tone: "yes" | "no" | "pct" }
  ): number {
    let y = topY;
    let prevId = sourceId;
    let firstEntry = entry;

    nodes.forEach((node, i) => {
      const nodeY = y;
      rfNodes.push({
        id: node.id,
        type: "step",
        position: { x: centerX - NODE_W / 2, y: nodeY },
        data: { node, editable, onEdit, onDelete },
        draggable: false,
      });

      // Edge into this node
      if (i === 0 && firstEntry) {
        rfEdges.push({
          id: `e-${prevId}-${node.id}`,
          source: prevId,
          target: node.id,
          type: "labeled",
          data: { label: firstEntry.label, tone: firstEntry.tone },
        });
      } else if (i === 0) {
        rfEdges.push({ id: `e-${prevId}-${node.id}`, source: prevId, target: node.id, type: "smoothstep" });
      } else {
        rfEdges.push({
          id: `e-${prevId}-${node.id}`,
          source: prevId,
          target: node.id,
          type: "insert",
          data: { onAdd, containerId, afterId: nodes[i - 1].id, editable },
        });
      }
      firstEntry = undefined;
      y = nodeY + NODE_H;

      if (node.type === "branch" && node.branches?.length) {
        const widths = node.branches.map((b) => colWidth(b.nodes));
        const totalW = widths.reduce((a, b) => a + b, 0) + (node.branches.length - 1) * H_GAP;
        let bx = centerX - totalW / 2;
        const branchTop = y + BRANCH_V_GAP;
        let maxBottom = branchTop;
        node.branches.forEach((b, bi) => {
          const bCenter = bx + widths[bi] / 2;
          const bottom = layout(b.nodes, b.id, bCenter, branchTop, node.id, branchLabel(node, bi));
          maxBottom = Math.max(maxBottom, bottom);
          bx += widths[bi] + H_GAP;
        });
        y = maxBottom;
      }

      prevId = node.id;
      y += V_GAP;
    });

    // Trailing add affordance (or empty-branch add)
    if (editable && onAdd) {
      const addId = `__add-${containerId}`;
      rfNodes.push({
        id: addId,
        type: "add",
        position: { x: centerX - NODE_W / 2, y },
        data: { onAdd, containerId, afterId: nodes.length ? nodes[nodes.length - 1].id : undefined },
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

  layout(props.nodes, "root", 0, NODE_H + 64, TRIGGER_ID);
  return { rfNodes, rfEdges };
}

export function AutomationFlowCanvas(props: CanvasProps) {
  const { rfNodes, rfEdges } = useMemo(
    () => buildGraph(props),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.nodes, props.triggers, props.editable]
  );

  return (
    <div
      className="rounded-xl border bg-muted/20"
      style={{ height: props.height ?? 600 }}
    >
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
