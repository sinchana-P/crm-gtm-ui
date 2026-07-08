"use client";

import { useState } from "react";
import {
  CalendarClock,
  LayoutTemplate,
  Link2,
  Plus,
  Save,
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
import { MOCK_EMAIL_TEMPLATES, MOCK_FORMS } from "@/lib/mock-data";
import { definitionSummary } from "@/lib/segment-eval";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { useSegmentStore } from "@/lib/stores/segment-store";
import {
  GOAL_METRIC_LABELS,
  buildUtmUrl,
} from "@/components/marketing/campaigns/campaign-shared";

const CRON_PRESETS: Record<CampaignRecurrence["frequency"], string> = {
  daily: "0 9 * * *",
  weekly: "0 9 * * 1",
  monthly: "0 10 1 * *",
  custom: "*/30 * * * *",
};

export function CampaignSetupTab({ campaign }: { campaign: Campaign }) {
  const updateCampaign = useCampaignStore((s) => s.updateCampaign);
  const editable = campaign.status === "draft" || campaign.status === "scheduled" || campaign.status === "paused";

  const [segmentId, setSegmentId] = useState(campaign.segmentId ?? "");
  const [templateId, setTemplateId] = useState(campaign.templateId ?? "");
  const [goals, setGoals] = useState<CampaignGoal[]>(campaign.goals);
  const [targets, setTargets] = useState<ConversionTarget[]>(campaign.conversionTargets);
  const [utmEnabled, setUtmEnabled] = useState(campaign.utmEnabled);
  const [utm, setUtm] = useState<UtmParameters>(
    campaign.utm ?? { source: "connect-nx", medium: campaign.channel, campaign: "" }
  );
  const [scheduledAt, setScheduledAt] = useState(
    campaign.scheduledAt ? campaign.scheduledAt.slice(0, 16) : ""
  );
  const [recurrence, setRecurrence] = useState<CampaignRecurrence | undefined>(
    campaign.recurrence
  );

  const segments = useSegmentStore((s) => s.segments);
  const candidates = segments.filter((s) => !s.archived);
  const segment = candidates.find((l) => l.id === segmentId);
  const template = MOCK_EMAIL_TEMPLATES.find((t) => t.id === templateId);

  function save() {
    updateCampaign(campaign.id, {
      segmentId: segmentId || undefined,
      segmentName: segment?.name ?? campaign.segmentName,
      templateId: templateId || undefined,
      templateName: template?.name,
      goals,
      conversionTargets: targets,
      utmEnabled,
      utm: utmEnabled ? utm : undefined,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      recurrence,
    });
    toast.success("Campaign setup saved");
  }

  return (
    <div className="space-y-6">
      {!editable && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          Setup is read-only while the campaign is {campaign.status}. Pause the campaign to make
          changes.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-muted-foreground" />
              Audience segment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={segmentId}
              onValueChange={(v) => setSegmentId(v ?? "")}
              disabled={!editable}
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
            {segment ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium tabular-nums">
                  {segment.memberCount.toLocaleString()} members
                  <span className="ml-2 text-xs font-normal text-muted-foreground capitalize">
                    {segment.type} segment
                  </span>
                </p>
                {segment.definition && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {definitionSummary(segment.definition)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Currently linked to “{campaign.segmentName}”.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LayoutTemplate className="size-4 text-muted-foreground" />
              Email template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={templateId}
              onValueChange={(v) => setTemplateId(v ?? "")}
              disabled={!editable}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select approved template" />
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
                  {template.category} · {template.openRate}% open · {template.clickRate}% click
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="size-4 text-muted-foreground" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.type === "recurring" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-2">
                <Label>Frequency</Label>
                <Select
                  value={recurrence?.frequency ?? "weekly"}
                  onValueChange={(v) => {
                    const frequency = (v as CampaignRecurrence["frequency"]) ?? "weekly";
                    setRecurrence((r) => ({
                      frequency,
                      cron: frequency === "custom" ? (r?.cron ?? CRON_PRESETS.custom) : CRON_PRESETS[frequency],
                      startDate: r?.startDate ?? "",
                      endDate: r?.endDate,
                    }));
                  }}
                  disabled={!editable}
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
                <Label>Cron expression</Label>
                <Input
                  className="font-mono"
                  value={recurrence?.cron ?? ""}
                  disabled={!editable || recurrence?.frequency !== "custom"}
                  onChange={(e) =>
                    setRecurrence((r) => (r ? { ...r, cron: e.target.value } : r))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={recurrence?.startDate ?? ""}
                  disabled={!editable}
                  onChange={(e) =>
                    setRecurrence((r) => (r ? { ...r, startDate: e.target.value } : r))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>End date</Label>
                <Input
                  type="date"
                  value={recurrence?.endDate ?? ""}
                  disabled={!editable}
                  onChange={(e) =>
                    setRecurrence((r) => (r ? { ...r, endDate: e.target.value || undefined } : r))
                  }
                />
              </div>
            </div>
          ) : (
            <div className="grid max-w-sm gap-2">
              <Label>Send at</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                disabled={!editable}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to send immediately on launch.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-muted-foreground" />
              Success goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {goals.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select
                  value={g.metric}
                  disabled={!editable}
                  onValueChange={(v) =>
                    setGoals((gs) =>
                      gs.map((x, j) =>
                        j === i ? { ...x, metric: (v as CampaignGoalMetric) ?? x.metric } : x
                      )
                    )
                  }
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
                  className="w-28"
                  value={g.target || ""}
                  placeholder="Target"
                  disabled={!editable}
                  onChange={(e) =>
                    setGoals((gs) =>
                      gs.map((x, j) =>
                        j === i ? { ...x, target: Number(e.target.value) || 0 } : x
                      )
                    )
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={!editable}
                  onClick={() => setGoals((gs) => gs.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={!editable}
              onClick={() =>
                setGoals((gs) => [...gs, { metric: "clicks", target: 0, current: 0 }])
              }
            >
              <Plus className="size-4" />
              Add goal
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="size-4 text-muted-foreground" />
              Conversion targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {targets.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2">
                <Select
                  value={t.type}
                  disabled={!editable}
                  onValueChange={(v) =>
                    setTargets((ts) =>
                      ts.map((x, j) =>
                        j === i
                          ? { ...x, type: (v as ConversionTarget["type"]) ?? x.type }
                          : x
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="landing_page">Landing page</SelectItem>
                  </SelectContent>
                </Select>
                {t.type === "form" ? (
                  <Select
                    value={MOCK_FORMS.find((f) => f.name === t.name)?.id ?? ""}
                    disabled={!editable}
                    onValueChange={(v) => {
                      const form = MOCK_FORMS.find((f) => f.id === v);
                      setTargets((ts) =>
                        ts.map((x, j) =>
                          j === i ? { ...x, name: form?.name ?? x.name, url: undefined } : x
                        )
                      );
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={t.name || "Select form"} />
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
                    value={t.url ?? ""}
                    placeholder="https://example.com/landing"
                    disabled={!editable}
                    onChange={(e) =>
                      setTargets((ts) =>
                        ts.map((x, j) =>
                          j === i
                            ? { ...x, url: e.target.value, name: e.target.value }
                            : x
                        )
                      )
                    }
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={!editable}
                  onClick={() => setTargets((ts) => ts.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={!editable}
              onClick={() =>
                setTargets((ts) => [
                  ...ts,
                  { id: `ct-${Date.now()}`, type: "form", name: "", conversions: 0 },
                ])
              }
            >
              <Plus className="size-4" />
              Add target
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">UTM parameter tracking</CardTitle>
          <Switch checked={utmEnabled} onCheckedChange={setUtmEnabled} disabled={!editable} />
        </CardHeader>
        {utmEnabled && (
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["utm_source", "source"],
                  ["utm_medium", "medium"],
                  ["utm_campaign", "campaign"],
                  ["utm_content", "content"],
                ] as const
              ).map(([label, key]) => (
                <div key={key} className="grid gap-2">
                  <Label>{label}</Label>
                  <Input
                    value={utm[key] ?? ""}
                    disabled={!editable}
                    onChange={(e) => setUtm((u) => ({ ...u, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="rounded-md bg-muted/50 p-2 font-mono text-xs break-all text-muted-foreground">
              {buildUtmUrl("https://connectnx.io", utm)}
            </div>
          </CardContent>
        )}
      </Card>

      {editable && (
        <div className="flex justify-end">
          <Button onClick={save}>
            <Save className="size-4" />
            Save changes
          </Button>
        </div>
      )}
    </div>
  );
}
