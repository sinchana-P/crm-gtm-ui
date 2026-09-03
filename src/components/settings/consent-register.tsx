"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConsentStateBadge } from "@/components/settings/consent-state-badge";
import {
  CONSENT_CATEGORIES,
  DURATION_BY_KEY,
  LEGAL_BASIS_LABEL,
  captureSourceById,
  definitionsByCategory,
  type ConsentDefinition,
  type ConsentState,
} from "@/lib/mock-data/consent-policy";

const SEGMENTS: { value: ConsentState; label: string }[] = [
  { value: "opt-in", label: "In" },
  { value: "neutral", label: "—" },
  { value: "opt-out", label: "Out" },
];

const SEGMENT_ACTIVE: Record<ConsentState, string> = {
  "opt-in": "bg-emerald-600 text-white",
  neutral: "bg-amber-600 text-white",
  "opt-out": "bg-red-600 text-white",
};

function StateSegments({
  value,
  onChange,
  label,
}: {
  value: ConsentState;
  onChange: (next: ConsentState) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={`Default state for ${label}`}
      className="inline-flex rounded-lg border bg-muted p-0.5"
    >
      {SEGMENTS.map((seg) => {
        const active = seg.value === value;
        return (
          <button
            key={seg.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(seg.value)}
            className={cn(
              "rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors",
              active
                ? SEGMENT_ACTIVE[seg.value]
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}

function ConsentDefinitionRow({
  def,
  state,
  onChange,
}: {
  def: ConsentDefinition;
  state: ConsentState;
  onChange: (next: ConsentState) => void;
}) {
  const duration = DURATION_BY_KEY[def.durationKey];
  const sources = def.captureVia
    .map((id) => captureSourceById(id)?.name)
    .filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-3 border-t py-3.5 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{def.name}</p>
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            {def.key}
          </code>
        </div>
        <p className="max-w-prose text-xs text-muted-foreground">{def.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <span>
            <span className="text-foreground/70">Basis</span> {LEGAL_BASIS_LABEL[def.basis]}
          </span>
          <span>
            <span className="text-foreground/70">Duration</span> {duration.label}
          </span>
          {sources.length > 0 ? (
            <span>
              <span className="text-foreground/70">Capture</span> {sources.join(" · ")}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-none items-center gap-3 sm:justify-end">
        <ConsentStateBadge state={state} />
        {def.toggleable ? (
          <StateSegments
            value={state}
            label={def.name}
            onChange={(next) => {
              onChange(next);
              toast.success(`${def.name} default set to ${next.replace("-", " ")}`);
            }}
          />
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Badge variant="secondary" className="cursor-help font-mono text-[11px]">
                  Tracked only
                </Badge>
              }
            />
            <TooltipContent>
              Not consent-based ({LEGAL_BASIS_LABEL[def.basis]}) — recorded, not toggled.
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export function ConsentRegister() {
  const [states, setStates] = useState<Record<string, ConsentState>>(() =>
    Object.fromEntries(
      CONSENT_CATEGORIES.flatMap((cat) =>
        definitionsByCategory(cat.id).map((d) => [d.key, d.defaultState]),
      ),
    ),
  );

  const setState = (key: string, next: ConsentState) =>
    setStates((prev) => ({ ...prev, [key]: next }));

  return (
    <div className="space-y-4">
      {CONSENT_CATEGORIES.map((cat) => {
        const defs = definitionsByCategory(cat.id);
        return (
          <Card key={cat.id}>
            <CardHeader>
              <CardTitle className="text-base">{cat.label}</CardTitle>
              <CardDescription>{cat.blurb}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {defs.map((def) => (
                <ConsentDefinitionRow
                  key={def.key}
                  def={def}
                  state={states[def.key]}
                  onChange={(next) => setState(def.key, next)}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
