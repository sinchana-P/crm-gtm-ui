"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Filter,
  LineChart,
  Mail,
  MessageCircle,
  Megaphone,
  Pencil,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Campaign,
  CampaignGoalMetric,
  SegmentRecord,
} from "@/lib/types";
import type {
  CampaignDraft,
  CampaignInsight,
  SegmentDraft,
  SegmentInsight,
} from "@/lib/marketing-copilot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { conditionLabel } from "@/lib/segment-eval";
import { createSegmentId, useSegmentStore } from "@/lib/stores/segment-store";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { cn } from "@/lib/utils";
import {
  ACCENTS,
  InsightBullets,
  InsightChart,
  MetricGrid,
} from "@/components/marketing/copilot/copilot-shared";

const GOAL_LABELS: Record<CampaignGoalMetric, string> = {
  opens: "Opens",
  clicks: "Clicks",
  form_submissions: "Form submissions",
  conversions: "Conversions",
};

/* ----------------------------------------------------- campaign draft card */

export function CampaignDraftCard({ draft }: { draft: CampaignDraft }) {
  const router = useRouter();
  const addCampaign = useCampaignStore((s) => s.addCampaign);
  const addSegment = useSegmentStore((s) => s.addSegment);
  const [created, setCreated] = useState(false);
  const accent = ACCENTS.violet;

  function handleCreate() {
    const now = new Date().toISOString();
    let segmentId = draft.segmentId;
    let segmentName = draft.segmentName;

    // Materialize the AI-suggested audience first so the campaign links to it.
    if (!segmentId && draft.suggestedSegment) {
      const s = draft.suggestedSegment;
      const seg: SegmentRecord = {
        id: createSegmentId(),
        name: s.name,
        description: s.description,
        type: "dynamic",
        origin: "ai_suggested",
        memberCount: s.estimatedCount,
        weeklyChange: 0,
        definition: s.definition,
        owner: "Priya Sharma",
        createdAt: now,
        updatedAt: now,
        refresh: { mode: "scheduled", frequency: "daily", lastRefreshedAt: now, history: [] },
        usedIn: [],
      };
      addSegment(seg);
      segmentId = seg.id;
      segmentName = seg.name;
    }

    const campaign: Campaign = {
      id: `cp${Date.now()}`,
      name: draft.name,
      description: draft.description,
      type: "one-time",
      status: "draft",
      channel: draft.channel,
      segmentId,
      segmentName,
      owner: "Priya Sharma",
      goals: [{ metric: draft.goalMetric, target: draft.goalTarget, current: 0 }],
      conversionTargets: [],
      utmEnabled: true,
      utm: {
        source: draft.channel === "whatsapp" ? "whatsapp" : "email",
        medium: draft.channel,
        campaign: draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      },
      createdAt: now,
      updatedAt: now,
      sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, converted: 0,
    };

    addCampaign(campaign);
    setCreated(true);
    toast.success("Campaign draft created — review it before sending");
    router.push(`/marketing/campaigns/${campaign.id}`);
  }

  return (
    <Card className={cn("shadow-none", accent.border, accent.ring)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <div className={cn("flex size-8 items-center justify-center rounded-lg", accent.bg, accent.text)}>
            {draft.channel === "whatsapp" ? <MessageCircle className="size-4" /> : <Megaphone className="size-4" />}
          </div>
          <div>
            <CardTitle className="text-base">{draft.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{draft.description}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("border-0", accent.bg, accent.text)}>
          <Sparkles className="size-3" /> AI draft
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Field icon={draft.channel === "whatsapp" ? MessageCircle : Mail} label="Channel" value={draft.channel === "whatsapp" ? "WhatsApp" : "Email"} />
          <Field icon={Users} label="Audience" value={draft.segmentName} sub={`~${draft.audienceEstimate.toLocaleString()} contacts`} />
          <Field icon={Target} label="Goal" value={GOAL_LABELS[draft.goalMetric]} sub={`Target ${draft.goalTarget.toLocaleString()}`} />
          <Field icon={LineChart} label="Send time" value={draft.recommendedSendTime} />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Suggested subject lines</p>
          <div className="space-y-1.5">
            {draft.subjectLines.map((s, i) => (
              <div key={i} className="rounded-md border bg-background px-3 py-2 text-sm">
                {s}
              </div>
            ))}
          </div>
        </div>

        {draft.suggestedSegment ? (
          <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            No existing segment matched, so I&apos;ll also create the audience{" "}
            <span className="font-medium text-foreground">{draft.suggestedSegment.name}</span> ({draft.suggestedSegment.estimatedCount.toLocaleString()} contacts) when you create this campaign.
          </p>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <Button onClick={handleCreate} disabled={created}>
            <Sparkles className="size-4" />
            {created ? "Created" : "Create campaign"}
            {!created && <ArrowRight className="size-4" />}
          </Button>
          <p className="text-xs text-muted-foreground">Opens as a draft — nothing sends automatically.</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------ segment draft card */

export function SegmentDraftCard({ draft }: { draft: SegmentDraft }) {
  const router = useRouter();
  const addSegment = useSegmentStore((s) => s.addSegment);
  const [created, setCreated] = useState(false);
  const accent = ACCENTS.emerald;
  const conditions = draft.definition.groups[0]?.conditions ?? [];

  function handleCreate(openEditor: boolean) {
    const now = new Date().toISOString();
    const seg: SegmentRecord = {
      id: createSegmentId(),
      name: draft.name,
      description: draft.description,
      type: "dynamic",
      origin: "ai_suggested",
      memberCount: draft.estimatedCount,
      weeklyChange: 0,
      definition: draft.definition,
      owner: "Priya Sharma",
      createdAt: now,
      updatedAt: now,
      refresh: { mode: "scheduled", frequency: "daily", lastRefreshedAt: now, history: [] },
      usedIn: [],
    };
    addSegment(seg);
    setCreated(true);
    toast.success("Segment created — review its rules before using it");
    if (openEditor) router.push(`/marketing/segments/${seg.id}/edit`);
  }

  return (
    <Card className={cn("shadow-none", accent.border, accent.ring)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <div className={cn("flex size-8 items-center justify-center rounded-lg", accent.bg, accent.text)}>
            <Filter className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">{draft.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{draft.description}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("border-0", accent.bg, accent.text)}>
          <Sparkles className="size-3" /> AI draft
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Targeting rules · match <span className="font-mono">ALL</span>
          </p>
          <div className="space-y-1.5">
            {conditions.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>{conditionLabel(c)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border bg-background p-3">
          <div>
            <p className="text-xs text-muted-foreground">Estimated size</p>
            <p className="text-2xl font-semibold tabular-nums">{draft.estimatedCount.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Of contact base</p>
            <p className="text-sm font-medium">{draft.matchPct}%</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-sm font-medium">{draft.confidence}%</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button onClick={() => handleCreate(false)} disabled={created}>
            <Sparkles className="size-4" />
            {created ? "Created" : "Create segment"}
          </Button>
          <Button variant="outline" onClick={() => handleCreate(true)} disabled={created}>
            <Pencil className="size-4" />
            Create &amp; refine
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------------------------------------------- insight cards */

export function CampaignInsightCard({ insight }: { insight: CampaignInsight }) {
  return (
    <div className="space-y-4">
      <MetricGrid metrics={insight.metrics} />
      {insight.chart ? (
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{insight.chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <InsightChart
              type={insight.chart.type}
              data={insight.chart.data}
              valueLabel={insight.chart.valueLabel}
              secondaryLabel={insight.chart.secondaryLabel}
              fill={ACCENTS.blue.fill}
            />
          </CardContent>
        </Card>
      ) : null}
      <InsightBullets bullets={insight.bullets} sources={insight.sources} />
    </div>
  );
}

export function SegmentInsightCard({ insight }: { insight: SegmentInsight }) {
  return (
    <div className="space-y-4">
      <MetricGrid metrics={insight.metrics} />
      {insight.chart ? (
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{insight.chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <InsightChart
              type={insight.chart.type}
              data={insight.chart.data}
              valueLabel={insight.chart.valueLabel}
              fill={ACCENTS.amber.fill}
            />
          </CardContent>
        </Card>
      ) : null}
      <InsightBullets bullets={insight.bullets} sources={insight.sources} />
    </div>
  );
}

/* ------------------------------------------------------------- small field */

function Field({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-medium" title={value}>{value}</p>
      {sub ? <p className="truncate text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
