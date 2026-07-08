"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  FlaskConical,
  Link2,
  Plus,
  Repeat,
  Send,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Campaign,
  CampaignGoal,
  CampaignGoalMetric,
  CampaignRecurrence,
  ConversionTarget,
  UtmParameters,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  MOCK_EMAIL_TEMPLATES,
  MOCK_FORMS,
} from "@/lib/mock-data";
import { definitionSummary } from "@/lib/segment-eval";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { useSegmentStore } from "@/lib/stores/segment-store";
import { cn } from "@/lib/utils";
import {
  GOAL_METRIC_LABELS,
  buildUtmUrl,
} from "@/components/marketing/campaigns/campaign-shared";

const STEPS = [
  "Details",
  "Audience",
  "Content",
  "Goals & tracking",
  "Schedule",
  "Review",
] as const;

const CRON_PRESETS: Record<CampaignRecurrence["frequency"], string> = {
  daily: "0 9 * * *",
  weekly: "0 9 * * 1",
  monthly: "0 10 1 * *",
  custom: "*/30 * * * *",
};

interface WizardState {
  name: string;
  description: string;
  channel: Campaign["channel"];
  type: Campaign["type"];
  segmentId: string;
  templateId: string;
  abEnabled: boolean;
  abSubjectA: string;
  abSubjectB: string;
  abWinnerCriteria: "open_rate" | "click_rate";
  abSamplePercent: number;
  goals: { metric: CampaignGoalMetric; target: string }[];
  conversionTargets: { type: ConversionTarget["type"]; ref: string; url: string }[];
  utmEnabled: boolean;
  utm: UtmParameters;
  scheduleMode: "now" | "later";
  scheduledAt: string;
  frequency: CampaignRecurrence["frequency"];
  cron: string;
  startDate: string;
  endDate: string;
}

const INITIAL_STATE: WizardState = {
  name: "",
  description: "",
  channel: "email",
  type: "one-time",
  segmentId: "",
  templateId: "",
  abEnabled: false,
  abSubjectA: "",
  abSubjectB: "",
  abWinnerCriteria: "open_rate",
  abSamplePercent: 20,
  goals: [{ metric: "opens", target: "" }],
  conversionTargets: [],
  utmEnabled: false,
  utm: { source: "connect-nx", medium: "email", campaign: "" },
  scheduleMode: "now",
  scheduledAt: "",
  frequency: "weekly",
  cron: CRON_PRESETS.weekly,
  startDate: "",
  endDate: "",
};

export function CreateCampaignWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addCampaign = useCampaignStore((s) => s.addCampaign);
  const segments = useSegmentStore((s) => s.segments);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  const patch = (p: Partial<WizardState>) => setState((s) => ({ ...s, ...p }));

  const segment = segments.find((l) => l.id === state.segmentId);
  const template = MOCK_EMAIL_TEMPLATES.find((t) => t.id === state.templateId);

  const canNext = useMemo(() => {
    if (step === 0) return state.name.trim().length > 0;
    if (step === 1) return !!state.segmentId;
    return true;
  }, [step, state]);

  function close() {
    onOpenChange(false);
    setStep(0);
    setState(INITIAL_STATE);
  }

  function handleCreate(asDraft: boolean) {
    const goals: CampaignGoal[] = state.goals
      .filter((g) => g.target)
      .map((g) => ({ metric: g.metric, target: Number(g.target) || 0, current: 0 }));

    const conversionTargets: ConversionTarget[] = state.conversionTargets
      .filter((t) => t.ref || t.url)
      .map((t, i) => ({
        id: `ct-new-${i}`,
        type: t.type,
        name:
          t.type === "form"
            ? MOCK_FORMS.find((f) => f.id === t.ref)?.name ?? "Form"
            : t.url,
        url: t.type === "landing_page" ? t.url : undefined,
        conversions: 0,
      }));

    const recurring = state.type === "recurring";
    const scheduled = !asDraft && (recurring || state.scheduleMode === "later");
    const now = new Date().toISOString();

    const campaign: Campaign = {
      id: `cp${Date.now()}`,
      name: state.name.trim() || "Untitled campaign",
      description: state.description.trim() || undefined,
      type: state.type,
      status: asDraft ? "draft" : scheduled ? "scheduled" : "running",
      channel: state.channel,
      segmentId: state.segmentId || undefined,
      segmentName: segment?.name ?? "Custom segment",
      templateId: state.templateId || undefined,
      templateName: template?.name,
      owner: "Priya Sharma",
      goals,
      conversionTargets,
      utmEnabled: state.utmEnabled,
      utm: state.utmEnabled
        ? { ...state.utm, campaign: state.utm.campaign || slugify(state.name) }
        : undefined,
      abTest: state.abEnabled
        ? {
            enabled: true,
            winnerCriteria: state.abWinnerCriteria,
            samplePercent: state.abSamplePercent,
            variants: [
              { id: "va", label: "Variant A", subject: state.abSubjectA || template?.subject || "Subject A", sent: 0, opened: 0, clicked: 0 },
              { id: "vb", label: "Variant B", subject: state.abSubjectB || "Subject B", sent: 0, opened: 0, clicked: 0 },
            ],
          }
        : undefined,
      recurrence: recurring
        ? {
            frequency: state.frequency,
            cron: state.cron,
            startDate: state.startDate || now.slice(0, 10),
            endDate: state.endDate || undefined,
          }
        : undefined,
      scheduledAt:
        !recurring && state.scheduleMode === "later" && state.scheduledAt
          ? new Date(state.scheduledAt).toISOString()
          : undefined,
      createdAt: now,
      updatedAt: now,
      sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, converted: 0,
    };

    addCampaign(campaign);
    toast.success(
      asDraft
        ? "Campaign saved as draft"
        : scheduled
          ? "Campaign scheduled"
          : "Campaign is sending now"
    );
    close();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create campaign</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        <div className="max-h-[55vh] space-y-5 overflow-y-auto py-2 pr-1">
          {step === 0 && (
            <DetailsStep state={state} patch={patch} />
          )}
          {step === 1 && (
            <AudienceStep state={state} patch={patch} />
          )}
          {step === 2 && (
            <ContentStep state={state} patch={patch} />
          )}
          {step === 3 && (
            <GoalsTrackingStep state={state} patch={patch} />
          )}
          {step === 4 && (
            <ScheduleStep state={state} patch={patch} />
          )}
          {step === 5 && (
            <ReviewStep state={state} segmentName={segment?.name} templateName={template?.name} />
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleCreate(true)}>
                  Save as draft
                </Button>
                <Button onClick={() => handleCreate(false)}>
                  {state.type === "recurring" || state.scheduleMode === "later"
                    ? "Schedule campaign"
                    : "Send now"}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface StepProps {
  state: WizardState;
  patch: (p: Partial<WizardState>) => void;
}

function OptionCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Send;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
      )}
    >
      <Icon className={cn("mt-0.5 size-4", selected ? "text-primary" : "text-muted-foreground")} />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

function DetailsStep({ state, patch }: StepProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="cw-name">Campaign name</Label>
        <Input
          id="cw-name"
          value={state.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="July newsletter"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="cw-desc">Description (optional)</Label>
        <Textarea
          id="cw-desc"
          value={state.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="What is this campaign about?"
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label>Channel</Label>
        <Select
          value={state.channel}
          onValueChange={(v) => patch({ channel: (v as Campaign["channel"]) ?? "email" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Campaign type</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <OptionCard
            selected={state.type === "one-time"}
            onClick={() => patch({ type: "one-time" })}
            icon={Send}
            title="One-time broadcast"
            description="Send a single message immediately or at a scheduled time."
          />
          <OptionCard
            selected={state.type === "recurring"}
            onClick={() => patch({ type: "recurring" })}
            icon={Repeat}
            title="Recurring"
            description="Repeat on a cron-based schedule within a date range."
          />
        </div>
      </div>
    </div>
  );
}

function AudienceStep({ state, patch }: StepProps) {
  const segments = useSegmentStore((s) => s.segments);
  const candidates = segments.filter((s) => !s.archived);
  const segment = candidates.find((l) => l.id === state.segmentId);
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Target segment</Label>
        <Select
          value={state.segmentId}
          onValueChange={(v) => patch({ segmentId: v ?? "" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select segment" />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name} ({l.memberCount.toLocaleString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {segment ? (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4 text-muted-foreground" />
            Live member preview
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {segment.memberCount.toLocaleString()}
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              recipients right now
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {segment.type === "dynamic"
              ? `Dynamic segment — membership refreshes automatically. Criteria: ${definitionSummary(segment.definition)}`
              : "Static segment — membership is fixed until manually updated."}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Every campaign is linked to a segment for precise recipient selection.
        </p>
      )}
    </div>
  );
}

function ContentStep({ state, patch }: StepProps) {
  const template = MOCK_EMAIL_TEMPLATES.find((t) => t.id === state.templateId);
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Approved template</Label>
        <Select
          value={state.templateId}
          onValueChange={(v) => patch({ templateId: v ?? "" })}
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
        {template && (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">“{template.subject}”</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {template.category} · {template.sent.toLocaleString()} sends ·{" "}
              {template.openRate}% open · {template.clickRate}% click
            </p>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <FlaskConical className="size-4 text-muted-foreground" />
            A/B subject line testing
            <Badge variant="outline" className="border-0 bg-violet-500/10 text-violet-700 dark:text-violet-400">
              Phase 2
            </Badge>
          </p>
          <p className="text-xs text-muted-foreground">
            Test two subject lines and auto-select the winner by engagement.
          </p>
        </div>
        <Switch
          checked={state.abEnabled}
          onCheckedChange={(v) => patch({ abEnabled: v })}
        />
      </div>

      {state.abEnabled && (
        <div className="grid gap-3 rounded-lg border p-3">
          <div className="grid gap-2">
            <Label htmlFor="cw-sub-a">Subject A</Label>
            <Input
              id="cw-sub-a"
              value={state.abSubjectA}
              onChange={(e) => patch({ abSubjectA: e.target.value })}
              placeholder={template?.subject ?? "Subject line A"}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cw-sub-b">Subject B</Label>
            <Input
              id="cw-sub-b"
              value={state.abSubjectB}
              onChange={(e) => patch({ abSubjectB: e.target.value })}
              placeholder="Subject line B"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Winner criteria</Label>
              <Select
                value={state.abWinnerCriteria}
                onValueChange={(v) =>
                  patch({ abWinnerCriteria: (v as WizardState["abWinnerCriteria"]) ?? "open_rate" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open_rate">Highest open rate</SelectItem>
                  <SelectItem value="click_rate">Highest click rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cw-sample">Test sample (%)</Label>
              <Input
                id="cw-sample"
                type="number"
                min={5}
                max={50}
                value={state.abSamplePercent}
                onChange={(e) => patch({ abSamplePercent: Number(e.target.value) || 20 })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalsTrackingStep({ state, patch }: StepProps) {
  const previewUrl = buildUtmUrl(
    "https://connectnx.io/launch",
    state.utmEnabled
      ? { ...state.utm, campaign: state.utm.campaign || slugify(state.name) }
      : undefined
  );

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <Label className="flex items-center gap-2">
          <Target className="size-4 text-muted-foreground" />
          Success goals
        </Label>
        {state.goals.map((g, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={g.metric}
              onValueChange={(v) => {
                const goals = [...state.goals];
                goals[i] = { ...goals[i], metric: (v as CampaignGoalMetric) ?? "opens" };
                patch({ goals });
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_METRIC_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              className="w-32"
              placeholder="Target"
              value={g.target}
              onChange={(e) => {
                const goals = [...state.goals];
                goals[i] = { ...goals[i], target: e.target.value };
                patch({ goals });
              }}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={state.goals.length === 1}
              onClick={() => patch({ goals: state.goals.filter((_, j) => j !== i) })}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => patch({ goals: [...state.goals, { metric: "clicks", target: "" }] })}
        >
          <Plus className="size-4" />
          Add goal
        </Button>
      </div>

      <Separator />

      <div className="grid gap-2">
        <Label className="flex items-center gap-2">
          <Link2 className="size-4 text-muted-foreground" />
          Conversion targets
        </Label>
        <p className="text-xs text-muted-foreground">
          Link forms and landing page URLs as conversion endpoints for attribution.
        </p>
        {state.conversionTargets.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={t.type}
              onValueChange={(v) => {
                const conversionTargets = [...state.conversionTargets];
                conversionTargets[i] = {
                  ...conversionTargets[i],
                  type: (v as ConversionTarget["type"]) ?? "form",
                };
                patch({ conversionTargets });
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="form">Form</SelectItem>
                <SelectItem value="landing_page">Landing page</SelectItem>
              </SelectContent>
            </Select>
            {t.type === "form" ? (
              <Select
                value={t.ref}
                onValueChange={(v) => {
                  const conversionTargets = [...state.conversionTargets];
                  conversionTargets[i] = { ...conversionTargets[i], ref: v ?? "" };
                  patch({ conversionTargets });
                }}
              >
                <SelectTrigger className="flex-1">
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
            ) : (
              <Input
                className="flex-1"
                placeholder="https://example.com/landing"
                value={t.url}
                onChange={(e) => {
                  const conversionTargets = [...state.conversionTargets];
                  conversionTargets[i] = { ...conversionTargets[i], url: e.target.value };
                  patch({ conversionTargets });
                }}
              />
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                patch({ conversionTargets: state.conversionTargets.filter((_, j) => j !== i) })
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() =>
            patch({
              conversionTargets: [
                ...state.conversionTargets,
                { type: "form", ref: "", url: "" },
              ],
            })
          }
        >
          <Plus className="size-4" />
          Add conversion target
        </Button>
      </div>

      <Separator />

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">UTM parameter tracking</p>
          <p className="text-xs text-muted-foreground">
            Append UTM parameters to every outbound link in this campaign.
          </p>
        </div>
        <Switch
          checked={state.utmEnabled}
          onCheckedChange={(v) => patch({ utmEnabled: v })}
        />
      </div>

      {state.utmEnabled && (
        <div className="grid gap-3 rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="cw-utm-source">utm_source</Label>
              <Input
                id="cw-utm-source"
                value={state.utm.source}
                onChange={(e) => patch({ utm: { ...state.utm, source: e.target.value } })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cw-utm-medium">utm_medium</Label>
              <Input
                id="cw-utm-medium"
                value={state.utm.medium}
                onChange={(e) => patch({ utm: { ...state.utm, medium: e.target.value } })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cw-utm-campaign">utm_campaign</Label>
              <Input
                id="cw-utm-campaign"
                placeholder={slugify(state.name) || "campaign-slug"}
                value={state.utm.campaign}
                onChange={(e) => patch({ utm: { ...state.utm, campaign: e.target.value } })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cw-utm-content">utm_content (optional)</Label>
              <Input
                id="cw-utm-content"
                value={state.utm.content ?? ""}
                onChange={(e) => patch({ utm: { ...state.utm, content: e.target.value } })}
              />
            </div>
          </div>
          <div className="rounded-md bg-muted/50 p-2 font-mono text-xs break-all text-muted-foreground">
            {previewUrl}
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleStep({ state, patch }: StepProps) {
  if (state.type === "recurring") {
    return (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Frequency</Label>
          <Select
            value={state.frequency}
            onValueChange={(v) => {
              const frequency = (v as CampaignRecurrence["frequency"]) ?? "weekly";
              patch({ frequency, cron: CRON_PRESETS[frequency] });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="custom">Custom (cron)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cw-cron">Cron expression</Label>
          <Input
            id="cw-cron"
            className="font-mono"
            value={state.cron}
            onChange={(e) => patch({ cron: e.target.value })}
            disabled={state.frequency !== "custom"}
          />
          <p className="text-xs text-muted-foreground">
            Executions follow this cron schedule within the date range below.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="cw-start">Start date</Label>
            <Input
              id="cw-start"
              type="date"
              value={state.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cw-end">End date (optional)</Label>
            <Input
              id="cw-end"
              type="date"
              value={state.endDate}
              onChange={(e) => patch({ endDate: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <OptionCard
          selected={state.scheduleMode === "now"}
          onClick={() => patch({ scheduleMode: "now" })}
          icon={Send}
          title="Send immediately"
          description="Deliver to the full audience as soon as the campaign launches."
        />
        <OptionCard
          selected={state.scheduleMode === "later"}
          onClick={() => patch({ scheduleMode: "later" })}
          icon={CalendarClock}
          title="Schedule for later"
          description="Pick a date and time for one-time delivery."
        />
      </div>
      {state.scheduleMode === "later" && (
        <div className="grid gap-2">
          <Label htmlFor="cw-when">Send at</Label>
          <Input
            id="cw-when"
            type="datetime-local"
            value={state.scheduledAt}
            onChange={(e) => patch({ scheduledAt: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

function ReviewStep({
  state,
  segmentName,
  templateName,
}: {
  state: WizardState;
  segmentName?: string;
  templateName?: string;
}) {
  const rows: [string, string][] = [
    ["Name", state.name || "Untitled campaign"],
    ["Channel", state.channel === "email" ? "Email" : "WhatsApp"],
    ["Type", state.type === "one-time" ? "One-time broadcast" : "Recurring"],
    ["Segment", segmentName ?? "—"],
    ["Template", templateName ?? "—"],
    [
      "Goals",
      state.goals.filter((g) => g.target).length
        ? state.goals
            .filter((g) => g.target)
            .map((g) => `${GOAL_METRIC_LABELS[g.metric]} ≥ ${g.target}`)
            .join(", ")
        : "—",
    ],
    ["Conversion targets", String(state.conversionTargets.filter((t) => t.ref || t.url).length)],
    ["UTM tracking", state.utmEnabled ? "Enabled" : "Off"],
    ["A/B subject test", state.abEnabled ? `Enabled (${state.abSamplePercent}% sample)` : "Off"],
    [
      "Schedule",
      state.type === "recurring"
        ? `${state.frequency} · ${state.cron}${state.startDate ? ` · from ${state.startDate}` : ""}${state.endDate ? ` to ${state.endDate}` : ""}`
        : state.scheduleMode === "later" && state.scheduledAt
          ? new Date(state.scheduledAt).toLocaleString()
          : "Send immediately",
    ],
  ];

  return (
    <div className="rounded-lg border">
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className={cn(
            "flex items-start justify-between gap-4 px-4 py-2.5 text-sm",
            i > 0 && "border-t"
          )}
        >
          <span className="text-muted-foreground">{label}</span>
          <span className="text-right font-medium">{value}</span>
        </div>
      ))}
    </div>
  );
}
