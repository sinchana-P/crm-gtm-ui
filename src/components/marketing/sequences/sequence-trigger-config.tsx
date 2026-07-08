"use client";

import { useMemo } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import type { SequenceTrigger, SequenceTriggerType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_CAMPAIGNS, MOCK_FORMS } from "@/lib/mock-data";
import { SEGMENT_FIELD_CATALOG } from "@/lib/segment-eval";
import { useSegmentStore } from "@/lib/stores/segment-store";
import { useSequenceStore } from "@/lib/stores/sequence-store";
import { cn } from "@/lib/utils";
import { TRIGGER_META } from "@/components/marketing/sequences/sequence-shared";

const TRIGGER_ORDER: SequenceTriggerType[] = [
  "segment_joined",
  "form_submitted",
  "tag_added",
  "manual",
  "property_changed",
  "email_engagement",
  "date_based",
  "another_sequence",
  "webhook",
  "custom_event",
];

const CRM_FIELDS = SEGMENT_FIELD_CATALOG.filter((f) => f.category === "crm");

export function SequenceTriggerConfig({
  triggers,
  currentSequenceId,
  disabled,
  onChange,
}: {
  triggers: SequenceTrigger[];
  currentSequenceId?: string;
  disabled?: boolean;
  onChange: (triggers: SequenceTrigger[]) => void;
}) {
  const allSegments = useSegmentStore((s) => s.segments);
  const allSequences = useSequenceStore((s) => s.sequences);
  const segments = allSegments.filter((x) => !x.archived);
  const sequences = allSequences.filter((x) => !x.archived && x.id !== currentSequenceId);

  const patch = (id: string, p: Partial<SequenceTrigger>) =>
    onChange(triggers.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const remove = (id: string) => onChange(triggers.filter((t) => t.id !== id));
  const add = (type: SequenceTriggerType) =>
    onChange([
      ...triggers,
      {
        id: `trg-${type}-${triggers.length}-${Math.round(triggers.reduce((n, t) => n + t.id.length, 1) * 7)}`,
        type,
        ...(type === "email_engagement" ? { engagementEvent: "opened" as const } : {}),
        ...(type === "property_changed" ? { property: "leadScore", operator: "greater_than" } : {}),
      },
    ]);

  return (
    <div className="space-y-3">
      {triggers.length === 0 && (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No enrollment triggers yet. Add at least one so contacts can enter this sequence.
        </p>
      )}

      {triggers.map((trigger, i) => (
        <div key={trigger.id}>
          {i > 0 && (
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <Badge variant="outline" className="uppercase">or</Badge>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
          <div className="rounded-lg border p-3">
            <div className="flex items-start gap-2">
              <Select
                value={trigger.type}
                disabled={disabled}
                onValueChange={(v) =>
                  patch(trigger.id, { type: (v as SequenceTriggerType) ?? trigger.type })
                }
              >
                <SelectTrigger className="w-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_ORDER.map((type) => (
                    <SelectItem key={type} value={type}>
                      {TRIGGER_META[type].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="flex-1 pt-1.5 text-xs text-muted-foreground">
                {TRIGGER_META[trigger.type].description}
              </p>
              {TRIGGER_META[trigger.type].phase && (
                <Badge variant="outline" className="border-0 bg-violet-500/10 text-violet-700 dark:text-violet-400">
                  {TRIGGER_META[trigger.type].phase}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                onClick={() => remove(trigger.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <TriggerFields
              trigger={trigger}
              disabled={disabled}
              segments={segments}
              sequences={sequences}
              patch={(p) => patch(trigger.id, p)}
            />
          </div>
        </div>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          render={
            <Button variant="outline" size="sm">
              <Plus className="size-4" />
              Add enrollment trigger
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
          {TRIGGER_ORDER.map((type) => {
            const Meta = TRIGGER_META[type];
            return (
              <DropdownMenuItem key={type} onClick={() => add(type)}>
                <Meta.icon className="size-4" />
                <span className="flex-1">{Meta.label}</span>
                {Meta.phase && (
                  <Badge variant="outline" className="border-0 bg-violet-500/10 text-violet-700 dark:text-violet-400">
                    {Meta.phase}
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function TriggerFields({
  trigger,
  disabled,
  segments,
  sequences,
  patch,
}: {
  trigger: SequenceTrigger;
  disabled?: boolean;
  segments: { id: string; name: string; memberCount: number }[];
  sequences: { id: string; name: string }[];
  patch: (p: Partial<SequenceTrigger>) => void;
}) {
  const segment = useMemo(
    () => segments.find((s) => s.id === trigger.segmentId),
    [segments, trigger.segmentId]
  );
  const segmentItems = Object.fromEntries(
    segments.map((s) => [s.id, `${s.name} (${s.memberCount.toLocaleString()})`])
  );
  const formItems = Object.fromEntries(MOCK_FORMS.map((f) => [f.id, f.name]));
  const campaignItems = Object.fromEntries(
    MOCK_CAMPAIGNS.filter((c) => !c.archived).map((c) => [c.id, c.name])
  );
  const sequenceItems = Object.fromEntries(sequences.map((s) => [s.id, s.name]));
  const dateFieldItems = {
    createdAt: "Created date",
    lastActivity: "Last activity date",
    renewalDate: "Renewal date (custom)",
    birthday: "Birthday (custom)",
  };

  switch (trigger.type) {
    case "segment_joined":
      return (
        <div className="mt-3 space-y-2">
          <Select
            items={segmentItems}
            value={trigger.segmentId ?? ""}
            disabled={disabled}
            onValueChange={(v) => patch({ segmentId: v ?? "" })}
          >
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Select segment" />
            </SelectTrigger>
            <SelectContent>
              {segments.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.memberCount.toLocaleString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {segment && (
            <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm">
              <Users className="size-4 text-muted-foreground" />
              <span className="font-medium tabular-nums">{segment.memberCount.toLocaleString()}</span>
              <span className="text-muted-foreground">
                contacts currently match — they enroll as they enter this segment.
              </span>
            </div>
          )}
        </div>
      );
    case "form_submitted":
      return (
        <div className="mt-3">
          <Select
            items={formItems}
            value={trigger.formId ?? ""}
            disabled={disabled}
            onValueChange={(v) => patch({ formId: v ?? "" })}
          >
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_FORMS.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "tag_added":
      return (
        <div className="mt-3">
          <Input
            className="w-full sm:w-80"
            placeholder="Tag name, e.g. sales-ready"
            value={trigger.tag ?? ""}
            disabled={disabled}
            onChange={(e) => patch({ tag: e.target.value })}
          />
        </div>
      );
    case "manual":
      return (
        <p className="mt-3 text-xs text-muted-foreground">
          Reps enroll contacts from a contact record or in bulk from a list. No automatic entry.
        </p>
      );
    case "property_changed":
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          <Select
            value={trigger.property ?? ""}
            disabled={disabled}
            onValueChange={(v) => patch({ property: v ?? "" })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Property" />
            </SelectTrigger>
            <SelectContent>
              {CRM_FIELDS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={trigger.operator ?? "equals"}
            disabled={disabled}
            onValueChange={(v) => patch({ operator: v ?? "equals" })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">is</SelectItem>
              <SelectItem value="not_equals">is not</SelectItem>
              <SelectItem value="greater_than">is greater than</SelectItem>
              <SelectItem value="less_than">is less than</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="w-40"
            placeholder="Value"
            value={trigger.value ?? ""}
            disabled={disabled}
            onChange={(e) => patch({ value: e.target.value })}
          />
        </div>
      );
    case "email_engagement":
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          <Select
            value={trigger.engagementEvent ?? "opened"}
            disabled={disabled}
            onValueChange={(v) =>
              patch({ engagementEvent: (v as SequenceTrigger["engagementEvent"]) ?? "opened" })
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="clicked">Clicked a link in</SelectItem>
              <SelectItem value="not_opened">Did not open</SelectItem>
            </SelectContent>
          </Select>
          <Select
            items={campaignItems}
            value={trigger.engagementRef ?? ""}
            disabled={disabled}
            onValueChange={(v) => patch({ engagementRef: v ?? "" })}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Which campaign?" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CAMPAIGNS.filter((c) => !c.archived).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "date_based":
      return (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select
            items={dateFieldItems}
            value={trigger.dateField ?? "createdAt"}
            disabled={disabled}
            onValueChange={(v) => patch({ dateField: v ?? "createdAt" })}
          >
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created date</SelectItem>
              <SelectItem value="lastActivity">Last activity date</SelectItem>
              <SelectItem value="renewalDate">Renewal date (custom)</SelectItem>
              <SelectItem value="birthday">Birthday (custom)</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">offset</span>
          <Input
            type="number"
            className="w-24"
            placeholder="0"
            value={trigger.dateOffsetDays ?? ""}
            disabled={disabled}
            onChange={(e) => patch({ dateOffsetDays: Number(e.target.value) || 0 })}
          />
          <span className="text-sm text-muted-foreground">days (negative = before)</span>
        </div>
      );
    case "another_sequence":
      return (
        <div className="mt-3">
          <Select
            items={sequenceItems}
            value={trigger.sourceSequenceId ?? ""}
            disabled={disabled}
            onValueChange={(v) => patch({ sourceSequenceId: v ?? "" })}
          >
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Source sequence" />
            </SelectTrigger>
            <SelectContent>
              {sequences.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "custom_event":
      return (
        <div className="mt-3">
          <Input
            className="w-full sm:w-80"
            placeholder="Event name, e.g. order_completed"
            value={trigger.eventName ?? ""}
            disabled={disabled}
            onChange={(e) => patch({ eventName: e.target.value })}
          />
        </div>
      );
    case "webhook":
      return (
        <div className={cn("mt-3 rounded-md bg-muted/40 p-2.5 font-mono text-xs text-muted-foreground")}>
          POST https://api.connectnx.io/hooks/seq/&lt;generated-on-activation&gt;
        </div>
      );
    default:
      return null;
  }
}
