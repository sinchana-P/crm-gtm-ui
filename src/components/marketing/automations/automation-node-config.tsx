"use client";

import type {
  AutomationActionType,
  AutomationBranchPath,
  AutomationNode,
} from "@/lib/types";
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
import { MOCK_EMAIL_TEMPLATES } from "@/lib/mock-data";
import { ACTION_META, NODE_META } from "@/components/marketing/automations/automation-shared";

export function AutomationNodeConfig({
  node,
  onPatch,
  onClose,
}: {
  node: AutomationNode | null;
  onPatch: (patch: Partial<AutomationNode>) => void;
  onClose: () => void;
}) {
  const meta = node ? NODE_META[node.type] : null;

  function patchBranch(id: string, p: Partial<AutomationBranchPath>) {
    if (!node?.branches) return;
    onPatch({ branches: node.branches.map((b) => (b.id === id ? { ...b, ...p } : b)) });
  }

  return (
    <Sheet open={!!node} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        {node && meta && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <meta.icon className="size-4" />
                Configure step
              </SheetTitle>
              <SheetDescription>{meta.label}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-5 px-4 pb-8">
              <div className="grid gap-2">
                <Label htmlFor="an-label">Step name</Label>
                <Input
                  id="an-label"
                  value={node.label}
                  onChange={(e) => onPatch({ label: e.target.value })}
                />
              </div>

              {node.type === "send_email" && (
                <>
                  <div className="grid gap-2">
                    <Label>Template</Label>
                    <Select
                      items={Object.fromEntries(MOCK_EMAIL_TEMPLATES.map((t) => [t.id, t.name]))}
                      value={node.templateId ?? ""}
                      onValueChange={(v) => onPatch({ templateId: v ?? "" })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_EMAIL_TEMPLATES.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="an-subject">Subject line</Label>
                    <Input
                      id="an-subject"
                      value={node.subject ?? ""}
                      onChange={(e) => onPatch({ subject: e.target.value })}
                      placeholder="Use {{firstName}} for personalization"
                    />
                  </div>
                </>
              )}

              {node.type === "send_whatsapp" && (
                <div className="grid gap-2">
                  <Label htmlFor="an-snippet">Message</Label>
                  <Textarea
                    id="an-snippet"
                    rows={4}
                    value={node.snippet ?? ""}
                    onChange={(e) => onPatch({ snippet: e.target.value })}
                    placeholder="Hi {{firstName}}, …"
                  />
                </div>
              )}

              {node.type === "delay" && <DelayFields node={node} onPatch={onPatch} />}

              {node.type === "branch" && (
                <BranchFields node={node} onPatch={onPatch} patchBranch={patchBranch} />
              )}

              {node.type === "action" && <ActionFields node={node} onPatch={onPatch} />}

              {node.type === "goal" && (
                <div className="grid gap-2">
                  <Label htmlFor="an-goal">Goal condition</Label>
                  <Input
                    id="an-goal"
                    value={node.goalCondition ?? ""}
                    onChange={(e) => onPatch({ goalCondition: e.target.value })}
                    placeholder="e.g. lifecycleStage = mql"
                  />
                  <p className="text-xs text-muted-foreground">
                    Contacts who meet this are counted as goal met and exit early.
                  </p>
                </div>
              )}

              {node.type === "end" && (
                <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Contacts who reach this point leave the workflow. Use it to close a branch
                  explicitly.
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DelayFields({
  node,
  onPatch,
}: {
  node: AutomationNode;
  onPatch: (p: Partial<AutomationNode>) => void;
}) {
  const mode = node.delayMode ?? "duration";
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Delay type</Label>
        <Select
          value={mode}
          onValueChange={(v) => onPatch({ delayMode: (v as AutomationNode["delayMode"]) ?? "duration" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="duration">A set amount of time</SelectItem>
            <SelectItem value="until_date">Until a date / date field</SelectItem>
            <SelectItem value="until_condition">Until a condition is met</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "duration" && (
        <>
          <div className="flex items-end gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="an-delay">Duration</Label>
              <Input
                id="an-delay"
                type="number"
                min={1}
                value={node.delayValue ?? 1}
                onChange={(e) => onPatch({ delayValue: Number(e.target.value) || 1 })}
              />
            </div>
            <Select
              value={node.delayUnit ?? "days"}
              onValueChange={(v) => onPatch({ delayUnit: (v as AutomationNode["delayUnit"]) ?? "days" })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Business days only</p>
              <p className="text-xs text-muted-foreground">Skip weekends when counting.</p>
            </div>
            <Switch checked={!!node.businessDaysOnly} onCheckedChange={(v) => onPatch({ businessDaysOnly: v })} />
          </div>
        </>
      )}

      {mode === "until_date" && (
        <div className="grid gap-2">
          <Label>Date field</Label>
          <Select
            value={node.delayField ?? "renewalDate"}
            onValueChange={(v) => onPatch({ delayField: v ?? "renewalDate" })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="renewalDate">Renewal date</SelectItem>
              <SelectItem value="eventDate">Event date</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="createdAt">Created date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === "until_condition" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="an-cond">Condition</Label>
            <Input
              id="an-cond"
              value={node.delayCondition ?? ""}
              onChange={(e) => onPatch({ delayCondition: e.target.value })}
              placeholder="e.g. replied = true"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="an-timeout">Timeout (days)</Label>
            <Input
              id="an-timeout"
              type="number"
              min={1}
              value={node.delayTimeoutDays ?? 3}
              onChange={(e) => onPatch({ delayTimeoutDays: Number(e.target.value) || 3 })}
            />
          </div>
        </>
      )}
    </div>
  );
}

function BranchFields({
  node,
  onPatch,
  patchBranch,
}: {
  node: AutomationNode;
  onPatch: (p: Partial<AutomationNode>) => void;
  patchBranch: (id: string, p: Partial<AutomationBranchPath>) => void;
}) {
  const kind = node.branchKind ?? "if_else";
  const branches = node.branches ?? [];
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Branch type</Label>
        <Select
          value={kind}
          onValueChange={(v) => onPatch({ branchKind: (v as "if_else" | "percentage") ?? "if_else" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="if_else">If / then (condition)</SelectItem>
            <SelectItem value="percentage">Percentage split (A/B)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {kind === "if_else" ? (
        <div className="grid gap-2">
          <Label htmlFor="an-branch-cond">“Yes” path condition</Label>
          <Input
            id="an-branch-cond"
            value={branches[0]?.condition ?? ""}
            onChange={(e) => branches[0] && patchBranch(branches[0].id, { condition: e.target.value })}
            placeholder="e.g. leadScore > 80"
          />
          <p className="text-xs text-muted-foreground">
            Contacts who match take Yes; everyone else takes No.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {branches.map((b) => (
            <div key={b.id} className="flex items-center gap-2">
              <Input
                className="flex-1"
                value={b.label}
                onChange={(e) => patchBranch(b.id, { label: e.target.value })}
              />
              <div className="flex w-24 items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={b.percent ?? 0}
                  onChange={(e) => patchBranch(b.id, { percent: Number(e.target.value) || 0 })}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Percentages should total 100.</p>
        </div>
      )}
    </div>
  );
}

function ActionFields({
  node,
  onPatch,
}: {
  node: AutomationNode;
  onPatch: (p: Partial<AutomationNode>) => void;
}) {
  const actionType = node.actionType ?? "set_property";
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Action</Label>
        <Select
          value={actionType}
          onValueChange={(v) => onPatch({ actionType: (v as AutomationActionType) ?? "set_property" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ACTION_META) as AutomationActionType[]).map((a) => (
              <SelectItem key={a} value={a}>
                {ACTION_META[a].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="an-action-detail">Details</Label>
        <Input
          id="an-action-detail"
          value={node.actionSummary ?? ""}
          onChange={(e) => onPatch({ actionSummary: e.target.value })}
          placeholder={
            actionType === "webhook"
              ? "https://…"
              : actionType === "add_tag" || actionType === "remove_tag"
                ? "Tag name"
                : actionType === "adjust_score"
                  ? "e.g. +10"
                  : "What should happen?"
          }
        />
      </div>
    </div>
  );
}
