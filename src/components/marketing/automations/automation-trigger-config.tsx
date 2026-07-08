"use client";

import { Plus, Trash2, Users } from "lucide-react";
import type { AutomationTrigger, AutomationTriggerType } from "@/lib/types";
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
import { TRIGGER_META } from "@/components/marketing/automations/automation-shared";

const ORDER: AutomationTriggerType[] = [
  "form_submitted",
  "segment_joined",
  "list_membership",
  "property_changed",
  "tag_added",
  "page_viewed",
  "email_engagement",
  "deal_stage",
  "date_based",
  "custom_event",
  "webhook",
  "manual",
];

const CRM_FIELDS = SEGMENT_FIELD_CATALOG.filter((f) => f.category === "crm");
const DEAL_STAGES = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

export function AutomationTriggerConfig({
  triggers,
  onChange,
}: {
  triggers: AutomationTrigger[];
  onChange: (t: AutomationTrigger[]) => void;
}) {
  const allSegments = useSegmentStore((s) => s.segments);
  const segments = allSegments.filter((s) => !s.archived);
  const segmentItems = Object.fromEntries(segments.map((s) => [s.id, `${s.name} (${s.memberCount.toLocaleString()})`]));
  const formItems = Object.fromEntries(MOCK_FORMS.map((f) => [f.id, f.name]));
  const campaignItems = Object.fromEntries(MOCK_CAMPAIGNS.filter((c) => !c.archived).map((c) => [c.id, c.name]));

  const patch = (id: string, p: Partial<AutomationTrigger>) =>
    onChange(triggers.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const remove = (id: string) => onChange(triggers.filter((t) => t.id !== id));
  const add = (type: AutomationTriggerType) =>
    onChange([
      ...triggers,
      {
        id: `atrg-${type}-${triggers.length}-${triggers.reduce((n, t) => n + t.id.length, 3)}`,
        type,
        ...(type === "email_engagement" ? { engagementEvent: "opened" as const } : {}),
        ...(type === "property_changed" ? { property: "leadScore", operator: "greater_than" } : {}),
      },
    ]);

  const seg = (id?: string) => segments.find((s) => s.id === id);

  return (
    <div className="space-y-3">
      {triggers.length === 0 && (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No triggers yet. Add at least one so contacts can enter this workflow.
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
                onValueChange={(v) => patch(trigger.id, { type: (v as AutomationTriggerType) ?? trigger.type })}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER.map((type) => (
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
              <Button variant="ghost" size="icon-sm" onClick={() => remove(trigger.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>

            <div className="mt-3">
              {trigger.type === "form_submitted" && (
                <Select items={formItems} value={trigger.formId ?? ""} onValueChange={(v) => patch(trigger.id, { formId: v ?? "" })}>
                  <SelectTrigger className="w-full sm:w-80"><SelectValue placeholder="Select form" /></SelectTrigger>
                  <SelectContent>{MOCK_FORMS.map((f) => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}</SelectContent>
                </Select>
              )}
              {trigger.type === "segment_joined" && (
                <div className="space-y-2">
                  <Select items={segmentItems} value={trigger.segmentId ?? ""} onValueChange={(v) => patch(trigger.id, { segmentId: v ?? "" })}>
                    <SelectTrigger className="w-full sm:w-80"><SelectValue placeholder="Select segment" /></SelectTrigger>
                    <SelectContent>{segments.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name} ({s.memberCount.toLocaleString()})</SelectItem>))}</SelectContent>
                  </Select>
                  {seg(trigger.segmentId) && (
                    <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm">
                      <Users className="size-4 text-muted-foreground" />
                      <span className="font-medium tabular-nums">{seg(trigger.segmentId)!.memberCount.toLocaleString()}</span>
                      <span className="text-muted-foreground">contacts currently match.</span>
                    </div>
                  )}
                </div>
              )}
              {trigger.type === "list_membership" && (
                <Input className="w-full sm:w-80" placeholder="List name" value={trigger.listName ?? ""} onChange={(e) => patch(trigger.id, { listName: e.target.value })} />
              )}
              {trigger.type === "property_changed" && (
                <div className="flex flex-wrap gap-2">
                  <Select value={trigger.property ?? ""} onValueChange={(v) => patch(trigger.id, { property: v ?? "" })}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Property" /></SelectTrigger>
                    <SelectContent>{CRM_FIELDS.map((f) => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}</SelectContent>
                  </Select>
                  <Select value={trigger.operator ?? "equals"} onValueChange={(v) => patch(trigger.id, { operator: v ?? "equals" })}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">is</SelectItem>
                      <SelectItem value="not_equals">is not</SelectItem>
                      <SelectItem value="greater_than">is greater than</SelectItem>
                      <SelectItem value="less_than">is less than</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input className="w-40" placeholder="Value" value={trigger.value ?? ""} onChange={(e) => patch(trigger.id, { value: e.target.value })} />
                </div>
              )}
              {trigger.type === "tag_added" && (
                <Input className="w-full sm:w-80" placeholder="Tag name" value={trigger.tag ?? ""} onChange={(e) => patch(trigger.id, { tag: e.target.value })} />
              )}
              {trigger.type === "page_viewed" && (
                <Input className="w-full sm:w-80" placeholder="https://connectnx.io/pricing" value={trigger.pageUrl ?? ""} onChange={(e) => patch(trigger.id, { pageUrl: e.target.value })} />
              )}
              {trigger.type === "email_engagement" && (
                <div className="flex flex-wrap gap-2">
                  <Select value={trigger.engagementEvent ?? "opened"} onValueChange={(v) => patch(trigger.id, { engagementEvent: (v as AutomationTrigger["engagementEvent"]) ?? "opened" })}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opened">Opened</SelectItem>
                      <SelectItem value="clicked">Clicked a link in</SelectItem>
                      <SelectItem value="not_opened">Did not open</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select items={campaignItems} value={trigger.engagementRef ?? ""} onValueChange={(v) => patch(trigger.id, { engagementRef: v ?? "" })}>
                    <SelectTrigger className="w-64"><SelectValue placeholder="Which campaign?" /></SelectTrigger>
                    <SelectContent>{MOCK_CAMPAIGNS.filter((c) => !c.archived).map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              )}
              {trigger.type === "deal_stage" && (
                <Select value={trigger.dealStage ?? ""} onValueChange={(v) => patch(trigger.id, { dealStage: v ?? "" })}>
                  <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Deal stage" /></SelectTrigger>
                  <SelectContent>{DEAL_STAGES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select>
              )}
              {trigger.type === "date_based" && (
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    items={{ createdAt: "Created date", lastActivity: "Last activity", renewalDate: "Renewal date", birthday: "Birthday" }}
                    value={trigger.dateField ?? "createdAt"}
                    onValueChange={(v) => patch(trigger.id, { dateField: v ?? "createdAt" })}
                  >
                    <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created date</SelectItem>
                      <SelectItem value="lastActivity">Last activity</SelectItem>
                      <SelectItem value="renewalDate">Renewal date</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">offset</span>
                  <Input type="number" className="w-24" placeholder="0" value={trigger.dateOffsetDays ?? ""} onChange={(e) => patch(trigger.id, { dateOffsetDays: Number(e.target.value) || 0 })} />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              )}
              {trigger.type === "custom_event" && (
                <Input className="w-full sm:w-80" placeholder="Event name, e.g. checkout_abandoned" value={trigger.eventName ?? ""} onChange={(e) => patch(trigger.id, { eventName: e.target.value })} />
              )}
              {trigger.type === "webhook" && (
                <div className="rounded-md bg-muted/40 p-2.5 font-mono text-xs text-muted-foreground">
                  POST https://api.connectnx.io/hooks/wf/&lt;generated-on-activation&gt;
                </div>
              )}
              {trigger.type === "manual" && (
                <p className="text-xs text-muted-foreground">Contacts are enrolled manually or in bulk from a list.</p>
              )}
            </div>
          </div>
        </div>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm">
              <Plus className="size-4" />
              Add enrollment trigger
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
          {ORDER.map((type) => {
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
