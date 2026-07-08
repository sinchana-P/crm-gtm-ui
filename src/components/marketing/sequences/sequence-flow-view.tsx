"use client";

import { Fragment } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SequenceStep, SequenceStepType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { STEP_META, stepSummary } from "@/components/marketing/sequences/sequence-shared";

const ADDABLE: SequenceStepType[] = ["email", "whatsapp", "wait", "branch", "action", "goal"];

interface FlowViewProps {
  flow: SequenceStep[];
  editable?: boolean;
  onAdd?: (type: SequenceStepType, containerId: string, afterId?: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function SequenceFlowView(props: FlowViewProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          ▸
        </span>
        <span className="text-sm font-medium">Enrolled contacts start here</span>
      </div>
      <FlowColumn {...props} steps={props.flow} containerId="main" />
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
  onAdd?: FlowViewProps["onAdd"];
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
              className="mx-auto flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              aria-label="Add step here"
            >
              <Plus className="size-3.5" />
            </button>
          ) : (
            <button
              type="button"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="size-4" />
              Add step
            </button>
          )
        }
      />
      <DropdownMenuContent align="center">
        {ADDABLE.map((type) => {
          const Meta = STEP_META[type];
          return (
            <DropdownMenuItem key={type} onClick={() => onAdd(type, containerId, afterId)}>
              <Meta.icon className="size-4" />
              {Meta.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Connector({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="h-3 w-px bg-border" />
      {children}
      <div className="h-3 w-px bg-border" />
    </div>
  );
}

function FlowColumn({
  steps,
  containerId,
  editable,
  onAdd,
  onEdit,
  onDelete,
}: Omit<FlowViewProps, "flow"> & { steps: SequenceStep[]; containerId: string }) {
  return (
    <div className="flex flex-col">
      {steps.length === 0 && (
        <div className="py-1">
          <AddButton
            editable={editable}
            onAdd={onAdd}
            containerId={containerId}
            variant="block"
          />
          {!editable && (
            <p className="py-2 text-center text-xs text-muted-foreground">No steps</p>
          )}
        </div>
      )}

      {steps.map((step, i) => (
        <Fragment key={step.id}>
          {i > 0 && (
            <Connector>
              <AddButton editable={editable} onAdd={onAdd} containerId={containerId} afterId={steps[i - 1].id} />
            </Connector>
          )}

          <StepCard step={step} editable={editable} onEdit={onEdit} onDelete={onDelete} />

          {step.type === "branch" && step.branches && (
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {step.branches.map((b) => (
                <div key={b.id} className="rounded-lg border border-dashed bg-background/60 p-2.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">{b.label}</span>
                    {step.branchKind === "percentage" ? (
                      <Badge variant="outline" className="tabular-nums">{b.percent ?? 0}%</Badge>
                    ) : b.condition ? (
                      <Badge variant="outline" className="max-w-40 truncate font-mono text-[10px] font-normal">
                        {b.condition}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">else</Badge>
                    )}
                  </div>
                  <FlowColumn
                    steps={b.steps}
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

      {steps.length > 0 && (
        <Connector>
          <AddButton editable={editable} onAdd={onAdd} containerId={containerId} />
        </Connector>
      )}
    </div>
  );
}

function StepCard({
  step,
  editable,
  onEdit,
  onDelete,
}: {
  step: SequenceStep;
  editable?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const meta = STEP_META[step.type];
  const clickable = editable && !!onEdit;
  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border border-l-4 bg-background p-3 shadow-none",
        meta.accent,
        clickable && "cursor-pointer transition-colors hover:bg-muted/40"
      )}
      onClick={clickable ? () => onEdit!(step.id) : undefined}
    >
      <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", meta.tint)}>
        <meta.icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{step.label}</p>
          <span className="text-[11px] text-muted-foreground">{meta.label}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{stepSummary(step)}</p>
        {!editable && step.stats && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground tabular-nums">
            <span>{step.stats.sent.toLocaleString()} sent</span>
            <span>{step.stats.opened.toLocaleString()} opened</span>
            <span>{step.stats.clicked.toLocaleString()} clicked</span>
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
    </div>
  );
}
