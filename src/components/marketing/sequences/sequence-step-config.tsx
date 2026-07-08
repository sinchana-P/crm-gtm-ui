"use client";

import type {
  SequenceActionType,
  SequenceBranchPath,
  SequenceStep,
  WaitMode,
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
import { useSequenceStore } from "@/lib/stores/sequence-store";
import { ACTION_META, STEP_META } from "@/components/marketing/sequences/sequence-shared";

export function SequenceStepConfig({
  step,
  currentSequenceId,
  onPatch,
  onClose,
}: {
  step: SequenceStep | null;
  currentSequenceId?: string;
  onPatch: (patch: Partial<SequenceStep>) => void;
  onClose: () => void;
}) {
  const allSequences = useSequenceStore((s) => s.sequences);
  const sequences = allSequences.filter((x) => !x.archived && x.id !== currentSequenceId);
  const open = !!step;
  const meta = step ? STEP_META[step.type] : null;

  function patchBranch(id: string, p: Partial<SequenceBranchPath>) {
    if (!step?.branches) return;
    onPatch({ branches: step.branches.map((b) => (b.id === id ? { ...b, ...p } : b)) });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        {step && meta && (
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
                <Label htmlFor="step-label">Step name</Label>
                <Input
                  id="step-label"
                  value={step.label}
                  onChange={(e) => onPatch({ label: e.target.value })}
                  placeholder="Give this step a name"
                />
              </div>

              {step.type === "email" && (
                <>
                  <div className="grid gap-2">
                    <Label>Template</Label>
                    <Select
                      items={Object.fromEntries(MOCK_EMAIL_TEMPLATES.map((t) => [t.id, t.name]))}
                      value={step.templateId ?? ""}
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
                    <Label htmlFor="step-subject">Subject line</Label>
                    <Input
                      id="step-subject"
                      value={step.subject ?? ""}
                      onChange={(e) => onPatch({ subject: e.target.value })}
                      placeholder="Use {{firstName}} for personalization"
                    />
                  </div>
                </>
              )}

              {step.type === "whatsapp" && (
                <div className="grid gap-2">
                  <Label htmlFor="step-snippet">Message</Label>
                  <Textarea
                    id="step-snippet"
                    rows={4}
                    value={step.snippet ?? ""}
                    onChange={(e) => onPatch({ snippet: e.target.value })}
                    placeholder="Hi {{firstName}}, …"
                  />
                  <p className="text-xs text-muted-foreground">
                    WhatsApp steps require an approved template in production.
                  </p>
                </div>
              )}

              {step.type === "wait" && <WaitFields step={step} onPatch={onPatch} />}

              {step.type === "branch" && (
                <BranchFields step={step} onPatch={onPatch} patchBranch={patchBranch} />
              )}

              {step.type === "action" && (
                <ActionFields step={step} sequences={sequences} onPatch={onPatch} />
              )}

              {step.type === "goal" && (
                <div className="grid gap-2">
                  <Label htmlFor="step-goal">Goal condition</Label>
                  <Input
                    id="step-goal"
                    value={step.goalCondition ?? ""}
                    onChange={(e) => onPatch({ goalCondition: e.target.value })}
                    placeholder="e.g. lifecycleStage = mql"
                  />
                  <p className="text-xs text-muted-foreground">
                    When a contact meets this condition they are marked Completed and exit the
                    sequence early.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function WaitFields({
  step,
  onPatch,
}: {
  step: SequenceStep;
  onPatch: (p: Partial<SequenceStep>) => void;
}) {
  const mode = step.waitMode ?? "duration";
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Wait type</Label>
        <Select value={mode} onValueChange={(v) => onPatch({ waitMode: (v as WaitMode) ?? "duration" })}>
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
              <Label htmlFor="wait-value">Duration</Label>
              <Input
                id="wait-value"
                type="number"
                min={1}
                value={step.waitValue ?? 1}
                onChange={(e) => onPatch({ waitValue: Number(e.target.value) || 1 })}
              />
            </div>
            <Select
              value={step.waitUnit ?? "days"}
              onValueChange={(v) => onPatch({ waitUnit: (v as SequenceStep["waitUnit"]) ?? "days" })}
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
              <p className="text-xs text-muted-foreground">Skip weekends when counting the delay.</p>
            </div>
            <Switch
              checked={!!step.businessDaysOnly}
              onCheckedChange={(v) => onPatch({ businessDaysOnly: v })}
            />
          </div>
        </>
      )}

      {mode === "until_date" && (
        <>
          <div className="grid gap-2">
            <Label>Date field</Label>
            <Select
              value={step.waitField ?? "renewalDate"}
              onValueChange={(v) => onPatch({ waitField: v ?? "renewalDate" })}
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
          <div className="flex items-end gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="wait-offset">Offset (negative = before)</Label>
              <Input
                id="wait-offset"
                type="number"
                value={step.waitValue ?? 0}
                onChange={(e) => onPatch({ waitValue: Number(e.target.value) || 0 })}
              />
            </div>
            <Select
              value={step.waitUnit ?? "days"}
              onValueChange={(v) => onPatch({ waitUnit: (v as SequenceStep["waitUnit"]) ?? "days" })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {mode === "until_condition" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="wait-cond">Condition</Label>
            <Input
              id="wait-cond"
              value={step.waitCondition ?? ""}
              onChange={(e) => onPatch({ waitCondition: e.target.value })}
              placeholder="e.g. replied = true"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="wait-timeout">Timeout (days)</Label>
            <Input
              id="wait-timeout"
              type="number"
              min={1}
              value={step.waitTimeoutDays ?? 3}
              onChange={(e) => onPatch({ waitTimeoutDays: Number(e.target.value) || 3 })}
            />
            <p className="text-xs text-muted-foreground">
              If the condition is never met, the contact continues after this many days.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function BranchFields({
  step,
  onPatch,
  patchBranch,
}: {
  step: SequenceStep;
  onPatch: (p: Partial<SequenceStep>) => void;
  patchBranch: (id: string, p: Partial<SequenceBranchPath>) => void;
}) {
  const kind = step.branchKind ?? "if_else";
  const branches = step.branches ?? [];
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
            <SelectItem value="if_else">If / else (condition)</SelectItem>
            <SelectItem value="percentage">Percentage split (A/B)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {kind === "if_else" ? (
        <div className="grid gap-2">
          <Label htmlFor="branch-cond">“Yes” path condition</Label>
          <Input
            id="branch-cond"
            value={branches[0]?.condition ?? ""}
            onChange={(e) => branches[0] && patchBranch(branches[0].id, { condition: e.target.value })}
            placeholder="e.g. opened_any_sequence_email = true"
          />
          <p className="text-xs text-muted-foreground">
            Contacts who match take the Yes path; everyone else takes the No path.
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
          <p className="text-xs text-muted-foreground">
            Percentages should total 100. Each contact is randomly assigned one path on entry.
          </p>
        </div>
      )}
    </div>
  );
}

function ActionFields({
  step,
  sequences,
  onPatch,
}: {
  step: SequenceStep;
  sequences: { id: string; name: string }[];
  onPatch: (p: Partial<SequenceStep>) => void;
}) {
  const actionType = step.actionType ?? "create_task";
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Action</Label>
        <Select
          value={actionType}
          onValueChange={(v) => onPatch({ actionType: (v as SequenceActionType) ?? "create_task" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ACTION_META) as SequenceActionType[]).map((a) => (
              <SelectItem key={a} value={a}>
                {ACTION_META[a].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(actionType === "add_tag" || actionType === "remove_tag") && (
        <div className="grid gap-2">
          <Label htmlFor="action-tag">Tag</Label>
          <Input
            id="action-tag"
            value={step.actionSummary ?? ""}
            onChange={(e) => onPatch({ actionSummary: e.target.value })}
            placeholder="Tag name"
          />
        </div>
      )}

      {actionType === "adjust_score" && (
        <div className="grid gap-2">
          <Label htmlFor="action-score">Score change</Label>
          <Input
            id="action-score"
            value={step.actionSummary ?? ""}
            onChange={(e) => onPatch({ actionSummary: e.target.value })}
            placeholder="e.g. +10 or -5"
          />
        </div>
      )}

      {(actionType === "enroll_sequence" || actionType === "unenroll_sequence") && (
        <div className="grid gap-2">
          <Label>Target sequence</Label>
          <Select
            value={step.actionSummary ?? ""}
            onValueChange={(v) => onPatch({ actionSummary: v ?? "" })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sequence" />
            </SelectTrigger>
            <SelectContent>
              {sequences.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(actionType === "create_task" ||
        actionType === "notify_owner" ||
        actionType === "update_property" ||
        actionType === "webhook") && (
        <div className="grid gap-2">
          <Label htmlFor="action-detail">Details</Label>
          <Input
            id="action-detail"
            value={step.actionSummary ?? ""}
            onChange={(e) => onPatch({ actionSummary: e.target.value })}
            placeholder={
              actionType === "webhook" ? "https://…" : "What should happen?"
            }
          />
        </div>
      )}
    </div>
  );
}
