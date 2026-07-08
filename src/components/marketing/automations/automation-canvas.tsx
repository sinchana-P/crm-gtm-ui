"use client";

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

const PALETTE: { category: NodeCategory; types: AutomationNodeType[] }[] = [
  { category: "communication", types: ["send_email", "send_whatsapp"] },
  { category: "delay", types: ["delay"] },
  { category: "branch", types: ["branch"] },
  { category: "crm", types: ["action"] },
  { category: "flow", types: ["goal", "end"] },
];

interface CanvasProps {
  triggers: AutomationTrigger[];
  nodes: AutomationNode[];
  editable?: boolean;
  onAdd?: (type: AutomationNodeType, containerId: string, afterId?: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEditTrigger?: () => void;
}

export function AutomationCanvas(props: CanvasProps) {
  const { triggers, editable, onEditTrigger } = props;
  return (
    <div
      className="overflow-x-auto rounded-xl border bg-muted/20 p-6"
      style={{
        backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      <div className="mx-auto flex w-full max-w-xl flex-col">
        {/* Trigger / start node */}
        <div
          className={cn(
            "rounded-xl border-2 border-primary/40 bg-background p-4 shadow-sm",
            editable && onEditTrigger && "cursor-pointer transition-colors hover:border-primary"
          )}
          onClick={editable && onEditTrigger ? onEditTrigger : undefined}
        >
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Enrollment trigger</p>
              <p className="text-xs text-muted-foreground">When a contact…</p>
            </div>
            {editable && onEditTrigger && <Pencil className="size-3.5 text-muted-foreground" />}
          </div>
          <div className="mt-3 space-y-1.5">
            {triggers.length === 0 ? (
              <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
                No triggers yet — add at least one so contacts can enter.
              </p>
            ) : (
              triggers.map((t, i) => (
                <div key={t.id} className="flex items-center gap-2">
                  {i > 0 && <Badge variant="outline" className="text-[10px] uppercase">or</Badge>}
                  <span className="rounded-md bg-muted px-2.5 py-1 text-xs">{triggerSummary(t)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <NodeColumn {...props} nodes={props.nodes} containerId="root" />
      </div>
    </div>
  );
}

function AddButton({
  editable,
  onAdd,
  containerId,
  afterId,
  variant = "inline",
}: {
  editable?: boolean;
  onAdd?: CanvasProps["onAdd"];
  containerId: string;
  afterId?: string;
  variant?: "inline" | "block";
}) {
  if (!editable || !onAdd) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          variant === "inline" ? (
            <button
              type="button"
              className="mx-auto flex size-7 items-center justify-center rounded-full border-2 border-dashed bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              aria-label="Add step"
            >
              <Plus className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="size-4" />
              Add step
            </button>
          )
        }
      />
      <DropdownMenuContent align="center" className="w-56">
        {PALETTE.map((group, gi) => (
          <Fragment key={group.category}>
            {gi > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase">
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

function Connector({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-1.5">
      <div className="h-4 w-0.5 bg-border" />
      {children}
      <div className="h-4 w-0.5 bg-border" />
    </div>
  );
}

function NodeColumn({
  nodes,
  containerId,
  editable,
  onAdd,
  onEdit,
  onDelete,
}: Omit<CanvasProps, "triggers"> & { nodes: AutomationNode[]; containerId: string }) {
  return (
    <div className="flex flex-col">
      {nodes.length === 0 ? (
        <>
          <Connector />
          <AddButton editable={editable} onAdd={onAdd} containerId={containerId} variant="block" />
          {!editable && <p className="py-2 text-center text-xs text-muted-foreground">No steps</p>}
        </>
      ) : (
        <>
          {nodes.map((node, i) => (
            <Fragment key={node.id}>
              <Connector>
                <AddButton
                  editable={editable}
                  onAdd={onAdd}
                  containerId={containerId}
                  afterId={i === 0 ? undefined : nodes[i - 1].id}
                />
              </Connector>

              <NodeCard node={node} editable={editable} onEdit={onEdit} onDelete={onDelete} />

              {node.type === "branch" && node.branches && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {node.branches.map((b) => (
                    <div key={b.id} className="rounded-lg border border-dashed bg-background/70 p-2.5">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">{b.label}</span>
                        {node.branchKind === "percentage" ? (
                          <Badge variant="outline" className="tabular-nums">{b.percent ?? 0}%</Badge>
                        ) : b.condition ? (
                          <Badge variant="outline" className="max-w-36 truncate font-mono text-[10px] font-normal">
                            {b.condition}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">else</Badge>
                        )}
                      </div>
                      <NodeColumn
                        nodes={b.nodes}
                        containerId={b.id}
                        editable={editable}
                        onAdd={onAdd}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Fragment>
          ))}
          <Connector>
            <AddButton editable={editable} onAdd={onAdd} containerId={containerId} />
          </Connector>
        </>
      )}
    </div>
  );
}

function NodeCard({
  node,
  editable,
  onEdit,
  onDelete,
}: {
  node: AutomationNode;
  editable?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const meta = NODE_META[node.type];
  const clickable = editable && !!onEdit;
  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-l-4 bg-background p-3 shadow-sm",
        meta.accent,
        clickable && "cursor-pointer transition-colors hover:bg-muted/40"
      )}
      onClick={clickable ? () => onEdit!(node.id) : undefined}
    >
      <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", meta.tint)}>
        <meta.icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{node.label}</p>
          <span className="text-[11px] text-muted-foreground">{meta.label}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{nodeSummary(node)}</p>
        {!editable && node.reached !== undefined && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground tabular-nums">
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
    </div>
  );
}
