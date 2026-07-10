"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  GitBranch,
  Inbox,
  Mail,
  Save,
  Send,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Sequence,
  SequenceExitConfig,
  SequenceSender,
  SequenceStep,
  SequenceStepType,
  SequenceTrigger,
} from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_SENDER_ADDRESSES, MOCK_SEQUENCE_TEMPLATES } from "@/lib/mock-data";
import {
  appendToContainer,
  insertAfter,
  makeStep,
  removeStep,
  updateStep,
  validateFlow,
} from "@/lib/sequence-flow";
import {
  createSequenceId,
  createStepId,
  useSequenceStore,
} from "@/lib/stores/sequence-store";
import { useSegmentStore } from "@/lib/stores/segment-store";
import {
  countSteps,
  defaultSenderForType,
  flowChannel,
  senderShortLabel,
} from "@/components/marketing/sequences/sequence-shared";
import { SequenceFlowCanvas } from "@/components/marketing/sequences/sequence-flow-canvas";
import { SequenceStepConfig } from "@/components/marketing/sequences/sequence-step-config";
import { SequenceTriggerConfig } from "@/components/marketing/sequences/sequence-trigger-config";
import { cn } from "@/lib/utils";

const DEFAULT_EXIT: SequenceExitConfig = {
  pauseOnReply: true,
  goalEnabled: false,
  unenrollOnSegmentExit: false,
  reEnrollment: "never",
  oneActivePerContact: true,
};

export function SequenceBuilder({
  sequenceId,
  templateId,
}: {
  sequenceId?: string;
  templateId?: string;
}) {
  const router = useRouter();
  const existing = useSequenceStore((s) =>
    sequenceId ? s.sequences.find((x) => x.id === sequenceId) : undefined
  );
  const template = templateId
    ? MOCK_SEQUENCE_TEMPLATES.find((t) => t.id === templateId)
    : undefined;
  const addSequence = useSequenceStore((s) => s.addSequence);
  const updateSequence = useSequenceStore((s) => s.updateSequence);
  const segments = useSegmentStore((s) => s.segments);

  const editMode = !!sequenceId;

  const [name, setName] = useState(existing?.name ?? template?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? template?.description ?? "");
  const [type, setType] = useState<Sequence["type"]>(existing?.type ?? template?.type ?? "marketing");
  const [sender, setSender] = useState<SequenceSender>(
    existing?.sender ?? template?.sender ?? defaultSenderForType(existing?.type ?? template?.type ?? "marketing")
  );
  const [triggers, setTriggers] = useState<SequenceTrigger[]>(
    existing?.triggers ?? template?.triggers ?? []
  );
  const [flow, setFlow] = useState<SequenceStep[]>(existing?.flow ?? template?.flow ?? []);
  const [exit, setExit] = useState<SequenceExitConfig>(
    existing?.exit ?? template?.exit ?? DEFAULT_EXIT
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"build" | "settings">("build");

  const editingStep = useMemo(
    () => (editingId ? findInFlow(flow, editingId) : null),
    [flow, editingId]
  );

  const stepCount = countSteps(flow);
  const channel = flowChannel(flow);
  const senderIssues =
    sender.mode === "marketing_address" && !sender.fromAddress
      ? ["Select a verified marketing from-address"]
      : [];
  const issues = [...validateFlow(flow), ...senderIssues];

  function changeType(next: Sequence["type"]) {
    setType(next);
    // Keep the sender aligned with the type's default unless the user already
    // customized a marketing from-address.
    if (next === "sales") setSender(defaultSenderForType("sales"));
    else if (sender.mode === "rep_inbox") setSender(defaultSenderForType("marketing"));
  }

  const estAudience = useMemo(() => {
    let total = 0;
    let hasSegment = false;
    triggers.forEach((t) => {
      if (t.type === "segment_joined") {
        const seg = segments.find((s) => s.id === t.segmentId);
        if (seg) {
          total += seg.memberCount;
          hasSegment = true;
        }
      }
    });
    return hasSegment ? total : null;
  }, [triggers, segments]);

  function handleAdd(stepType: SequenceStepType, containerId: string, afterId?: string) {
    const step = makeStep(stepType, createStepId());
    setFlow((f) => (afterId ? insertAfter(f, afterId, step) : appendToContainer(f, containerId, step)));
    setEditingId(step.id);
  }

  function handlePatchStep(patch: Partial<SequenceStep>) {
    if (!editingId) return;
    setFlow((f) => updateStep(f, editingId, patch));
  }

  function handleDelete(id: string) {
    setFlow((f) => removeStep(f, id));
    if (editingId === id) setEditingId(null);
  }

  function save(activate: boolean) {
    if (!name.trim()) {
      toast.error("Give the sequence a name first");
      return;
    }
    if (triggers.length === 0) {
      toast.error("Add at least one enrollment trigger");
      return;
    }
    if (flow.length === 0) {
      toast.error("Add at least one step");
      return;
    }
    if (activate && issues.length > 0) {
      toast.error(issues[0]);
      return;
    }
    const now = new Date().toISOString();
    const shared = {
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      channel,
      sender,
      triggers,
      flow,
      exit,
      steps: stepCount,
      pauseOnReply: exit.pauseOnReply,
    };
    if (editMode && existing) {
      updateSequence(existing.id, {
        ...shared,
        status: activate ? "active" : existing.status,
      });
      toast.success(activate ? "Sequence activated" : "Sequence saved");
      router.push(`/marketing/sequences/${existing.id}`);
      return;
    }
    const sequence: Sequence = {
      id: createSequenceId(),
      ...shared,
      status: activate ? "active" : "draft",
      owner: "Priya Sharma",
      enrolled: 0,
      activeCount: 0,
      completed: 0,
      exitedCount: 0,
      replied: 0,
      createdAt: now,
      updatedAt: now,
    };
    addSequence(sequence);
    toast.success(activate ? "Sequence created & activated" : "Sequence saved as draft");
    router.push(`/marketing/sequences/${sequence.id}`);
  }

  if (editMode && !existing) {
    return (
      <EmptyState
        title="Sequence not found"
        description="This sequence may have been deleted."
        action={
          <Button variant="outline" onClick={() => router.push("/marketing/sequences")}>
            <ArrowLeft className="size-4" />
            Back to sequences
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            onClick={() => router.push("/marketing/sequences")}
          >
            <ArrowLeft className="size-4" />
            Sequences
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {editMode ? `Edit ${existing?.name}` : "Build sequence"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Drip email, WhatsApp, waits, branches, and internal actions — all in one flow.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => save(false)}>
            <Save className="size-4" />
            Save draft
          </Button>
          <Button onClick={() => save(true)}>
            <Zap className="size-4" />
            {editMode ? "Save & activate" : "Activate"}
          </Button>
        </div>
      </div>

      {editMode && existing?.status === "active" && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          This sequence is live. Changes apply to contacts who enroll after you save; contacts
          already mid-flow keep their current path.
        </p>
      )}

      <div className="flex gap-1 border-b">
        <button
          type="button"
          onClick={() => setTab("build")}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
            tab === "build" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          )}
        >
          Build
        </button>
        <button
          type="button"
          onClick={() => setTab("settings")}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
            tab === "settings" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          )}
        >
          Settings & exit rules
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {tab === "build" ? (
            <>
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="seq-name">Sequence name</Label>
                    <Input
                      id="seq-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="New lead welcome"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="seq-desc">Description (optional)</Label>
                    <Textarea
                      id="seq-desc"
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this sequence for?"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v) => changeType((v as Sequence["type"]) ?? "marketing")}>
                      <SelectTrigger className="w-full sm:w-60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing nurture</SelectItem>
                        <SelectItem value="sales">Sales cadence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <SendingIdentityCard type={type} sender={sender} setSender={setSender} />

              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Enrollment triggers</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Contacts enter when they match <span className="font-medium">any</span> of these.
                  </p>
                </CardHeader>
                <CardContent>
                  <SequenceTriggerConfig
                    triggers={triggers}
                    currentSequenceId={sequenceId}
                    onChange={setTriggers}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Flow</CardTitle>
                  <span className="text-xs text-muted-foreground">{stepCount} steps</span>
                </CardHeader>
                <CardContent>
                  <SequenceFlowCanvas
                    flow={flow}
                    editable
                    onAdd={handleAdd}
                    onEdit={setEditingId}
                    onDelete={handleDelete}
                    height={640}
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <SettingsPanel exit={exit} setExit={setExit} segments={segments} />
          )}
        </div>

        <div className="space-y-4">
          <Card className="shadow-none lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <SummaryRow icon={Users} label="Est. starting audience">
                {estAudience !== null ? (
                  <span className="font-semibold tabular-nums">~{estAudience.toLocaleString()}</span>
                ) : (
                  <span className="text-muted-foreground">Depends on triggers</span>
                )}
              </SummaryRow>
              <SummaryRow icon={Zap} label="Enrollment triggers">
                <span className="font-medium tabular-nums">{triggers.length}</span>
              </SummaryRow>
              <SummaryRow icon={GitBranch} label="Steps">
                <span className="font-medium tabular-nums">{stepCount}</span>
              </SummaryRow>
              <SummaryRow icon={Target} label="Channel">
                <Badge variant="outline" className="capitalize">{channel}</Badge>
              </SummaryRow>
              <SummaryRow icon={sender.mode === "rep_inbox" ? Inbox : Send} label="Sends from">
                <Badge variant="outline">{senderShortLabel(sender)}</Badge>
              </SummaryRow>
              <div className="border-t pt-3">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase">Exit rules</p>
                <div className="flex flex-wrap gap-1.5">
                  {exit.pauseOnReply && <Badge variant="outline">Pause on reply</Badge>}
                  {exit.goalEnabled && <Badge variant="outline">Goal exit</Badge>}
                  {exit.suppressionSegmentId && <Badge variant="outline">Suppression</Badge>}
                  {exit.oneActivePerContact && <Badge variant="outline">One active/contact</Badge>}
                  <Badge variant="outline" className="capitalize">
                    Re-enroll: {exit.reEnrollment}
                  </Badge>
                </div>
              </div>
              {issues.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-3.5" />
                    {issues.length} issue{issues.length > 1 ? "s" : ""} before activation
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-amber-700/90 dark:text-amber-400/90">
                    {issues.slice(0, 4).map((iss) => (
                      <li key={iss}>• {iss}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <SequenceStepConfig
        step={editingStep}
        currentSequenceId={sequenceId}
        onPatch={handlePatchStep}
        onClose={() => setEditingId(null)}
      />
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Users;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      {children}
    </div>
  );
}

function SendingIdentityCard({
  type,
  sender,
  setSender,
}: {
  type: Sequence["type"];
  sender: SequenceSender;
  setSender: (s: SequenceSender) => void;
}) {
  const addressItems = Object.fromEntries(
    MOCK_SENDER_ADDRESSES.map((a) => [a.address, `${a.name} <${a.address}>${a.verified ? "" : " — unverified"}`])
  );
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Sending identity</CardTitle>
        <p className="text-sm text-muted-foreground">Who these emails are sent from.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setSender(defaultSenderForType("marketing"))}
            className={cn(
              "flex flex-1 items-start gap-3 rounded-lg border p-3 text-left transition-colors",
              sender.mode === "marketing_address" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
            )}
          >
            <Send className={cn("mt-0.5 size-4", sender.mode === "marketing_address" ? "text-primary" : "text-muted-foreground")} />
            <span>
              <span className="block text-sm font-medium">Marketing address</span>
              <span className="block text-xs text-muted-foreground">
                Bulk send from a verified company address, with an unsubscribe footer.
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSender({ mode: "rep_inbox" })}
            className={cn(
              "flex flex-1 items-start gap-3 rounded-lg border p-3 text-left transition-colors",
              sender.mode === "rep_inbox" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
            )}
          >
            <Inbox className={cn("mt-0.5 size-4", sender.mode === "rep_inbox" ? "text-primary" : "text-muted-foreground")} />
            <span>
              <span className="block text-sm font-medium">Rep&rsquo;s inbox</span>
              <span className="block text-xs text-muted-foreground">
                1:1 send from each contact&rsquo;s owner. Replies go to that rep.
              </span>
            </span>
          </button>
        </div>

        {sender.mode === "marketing_address" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label>From address</Label>
              <Select
                items={addressItems}
                value={sender.fromAddress ?? ""}
                onValueChange={(v) => {
                  const picked = MOCK_SENDER_ADDRESSES.find((a) => a.address === v);
                  setSender({
                    ...sender,
                    fromAddress: v ?? "",
                    fromName: picked?.name ?? sender.fromName,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a verified address" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_SENDER_ADDRESSES.map((a) => (
                    <SelectItem key={a.address} value={a.address} disabled={!a.verified}>
                      {a.name} &lt;{a.address}&gt;{a.verified ? "" : " — unverified"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="from-name">From name</Label>
              <Input
                id="from-name"
                value={sender.fromName ?? ""}
                onChange={(e) => setSender({ ...sender, fromName: e.target.value })}
                placeholder="Connect NX"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reply-to">Reply-to</Label>
              <Input
                id="reply-to"
                value={sender.replyTo ?? ""}
                onChange={(e) => setSender({ ...sender, replyTo: e.target.value })}
                placeholder="marketing@connectnx.io"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Mail className="size-4 text-muted-foreground" />
              Sends from each contact&rsquo;s owner
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Every email goes out from the enrolled contact&rsquo;s owner&rsquo;s connected mailbox
              and looks like a personal 1:1 email. Replies route back to that rep — keep
              &ldquo;pause on reply&rdquo; on so the human takes over.
            </p>
          </div>
        )}
        {type === "marketing" && sender.mode === "rep_inbox" && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Heads up: rep-inbox sending is unusual for a marketing nurture — it sends 1:1 from
            owners rather than in bulk.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SettingsPanel({
  exit,
  setExit,
  segments,
}: {
  exit: SequenceExitConfig;
  setExit: (e: SequenceExitConfig) => void;
  segments: { id: string; name: string; archived?: boolean }[];
}) {
  const patch = (p: Partial<SequenceExitConfig>) => setExit({ ...exit, ...p });
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Exit & re-enrollment rules</CardTitle>
        <p className="text-sm text-muted-foreground">
          Control when contacts leave the sequence and whether they can enter again.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleRow
          title="Pause / unenroll on reply"
          description="Stop messaging a contact as soon as they reply."
          checked={exit.pauseOnReply}
          onChange={(v) => patch({ pauseOnReply: v })}
        />

        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Goal exit</p>
              <p className="text-xs text-muted-foreground">
                Mark contacts Completed and exit early when they hit a goal.
              </p>
            </div>
            <Switch checked={exit.goalEnabled} onCheckedChange={(v) => patch({ goalEnabled: v })} />
          </div>
          {exit.goalEnabled && (
            <Input
              className="mt-3"
              value={exit.goalCondition ?? ""}
              onChange={(e) => patch({ goalCondition: e.target.value })}
              placeholder="e.g. lifecycleStage = mql"
            />
          )}
        </div>

        <div className="rounded-lg border p-3">
          <Label className="text-sm">Suppression segment</Label>
          <p className="mb-2 text-xs text-muted-foreground">
            Contacts in this segment never enroll and are removed immediately if added.
          </p>
          <Select
            items={{
              none: "None",
              ...Object.fromEntries(segments.filter((s) => !s.archived).map((s) => [s.id, s.name])),
            }}
            value={exit.suppressionSegmentId ?? "none"}
            onValueChange={(v) => patch({ suppressionSegmentId: v === "none" ? undefined : (v ?? undefined) })}
          >
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {segments
                .filter((s) => !s.archived)
                .map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <ToggleRow
          title="Unenroll when a contact leaves the trigger segment"
          description="Remove contacts who no longer match the segment they enrolled from."
          checked={exit.unenrollOnSegmentExit}
          onChange={(v) => patch({ unenrollOnSegmentExit: v })}
        />

        <div className="rounded-lg border p-3">
          <Label className="text-sm">Re-enrollment</Label>
          <p className="mb-2 text-xs text-muted-foreground">
            Whether a contact who already finished can enter again.
          </p>
          <Select
            value={exit.reEnrollment}
            onValueChange={(v) => patch({ reEnrollment: (v as SequenceExitConfig["reEnrollment"]) ?? "never" })}
          >
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never re-enroll</SelectItem>
              <SelectItem value="cooldown">After a cooldown</SelectItem>
              <SelectItem value="always">Every time they qualify</SelectItem>
            </SelectContent>
          </Select>
          {exit.reEnrollment === "cooldown" && (
            <div className="mt-3 flex items-center gap-2">
              <Input
                type="number"
                min={1}
                className="w-24"
                value={exit.reEnrollCooldownDays ?? 30}
                onChange={(e) => patch({ reEnrollCooldownDays: Number(e.target.value) || 30 })}
              />
              <span className="text-sm text-muted-foreground">days between enrollments</span>
            </div>
          )}
        </div>

        <ToggleRow
          title="One active enrollment per contact"
          description="Prevent a contact from being in this sequence more than once at a time."
          checked={exit.oneActivePerContact}
          onChange={(v) => patch({ oneActivePerContact: v })}
        />
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="pr-4">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// Local flow lookup (avoids importing the store's find just for read).
function findInFlow(flow: SequenceStep[], id: string): SequenceStep | null {
  for (const step of flow) {
    if (step.id === id) return step;
    if (step.branches) {
      for (const b of step.branches) {
        const found = findInFlow(b.steps, id);
        if (found) return found;
      }
    }
  }
  return null;
}
