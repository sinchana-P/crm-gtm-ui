"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Pause,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import type { CampaignStatus } from "@/lib/types";
import { CampaignStatusBadge } from "@/components/marketing/status-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { cn } from "@/lib/utils";
import {
  CampaignTypeBadge,
  ChannelIcon,
} from "@/components/marketing/campaigns/campaign-shared";
import { CampaignOverviewTab } from "@/components/marketing/campaigns/campaign-overview-tab";
import { CampaignRecipientsTab } from "@/components/marketing/campaigns/campaign-recipients-tab";
import { CampaignSetupTab } from "@/components/marketing/campaigns/campaign-setup-tab";

const LIFECYCLE_STEPS: { status: CampaignStatus; label: string }[] = [
  { status: "draft", label: "Draft" },
  { status: "scheduled", label: "Scheduled" },
  { status: "running", label: "Running" },
  { status: "completed", label: "Completed" },
];

function stepIndex(status: CampaignStatus) {
  if (status === "paused") return 2; // paused sits at the running stage
  return LIFECYCLE_STEPS.findIndex((s) => s.status === status);
}

export function CampaignDetail({
  id,
  initialTab,
}: {
  id: string;
  initialTab?: string;
}) {
  const router = useRouter();
  const campaign = useCampaignStore((s) => s.campaigns.find((c) => c.id === id));
  const duplicateCampaign = useCampaignStore((s) => s.duplicateCampaign);
  const setStatus = useCampaignStore((s) => s.setStatus);
  const setArchived = useCampaignStore((s) => s.setArchived);
  const [tab, setTab] = useState(
    initialTab === "setup" || initialTab === "recipients" ? initialTab : "overview"
  );

  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign may have been removed."
        action={
          <Button variant="outline" onClick={() => router.push("/marketing/campaigns")}>
            <ArrowLeft className="size-4" />
            Back to campaigns
          </Button>
        }
      />
    );
  }

  function transition(to: CampaignStatus, message: string) {
    setStatus(id, to);
    toast.success(message);
  }

  const current = stepIndex(campaign.status);

  return (
    <div className="space-y-6">
      <div className="space-y-4 border-b border-border pb-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => router.push("/marketing/campaigns")}
        >
          <ArrowLeft className="size-4" />
          Campaigns
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <ChannelIcon channel={campaign.channel} className="size-5" />
              <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
              <CampaignStatusBadge status={campaign.status} />
              <CampaignTypeBadge type={campaign.type} />
              {campaign.archived && (
                <span className="text-xs font-medium text-muted-foreground">(Archived)</span>
              )}
            </div>
            {campaign.description && (
              <p className="max-w-3xl text-sm text-muted-foreground">{campaign.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Owner: {campaign.owner} · Segment: {campaign.segmentName}
              {campaign.templateName ? ` · Template: ${campaign.templateName}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {campaign.status === "draft" && (
              <>
                <Button variant="outline" onClick={() => transition("scheduled", "Campaign scheduled")}>
                  <CalendarDays className="size-4" />
                  Schedule
                </Button>
                <Button onClick={() => transition("running", "Campaign launched")}>
                  <Play className="size-4" />
                  Launch now
                </Button>
              </>
            )}
            {campaign.status === "scheduled" && (
              <Button onClick={() => transition("running", "Campaign launched")}>
                <Play className="size-4" />
                Launch now
              </Button>
            )}
            {campaign.status === "running" && (
              <>
                <Button variant="outline" onClick={() => transition("paused", "Campaign paused")}>
                  <Pause className="size-4" />
                  Pause
                </Button>
                <Button variant="outline" onClick={() => transition("completed", "Campaign completed")}>
                  <CheckCircle2 className="size-4" />
                  Complete
                </Button>
              </>
            )}
            {campaign.status === "paused" && (
              <>
                <Button onClick={() => transition("running", "Campaign resumed")}>
                  <Play className="size-4" />
                  Resume
                </Button>
                <Button variant="outline" onClick={() => transition("completed", "Campaign completed")}>
                  <CheckCircle2 className="size-4" />
                  Complete
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => {
                duplicateCampaign(id);
                toast.success("Campaign duplicated as draft");
              }}
            >
              <Copy className="size-4" />
              Duplicate
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setArchived(id, !campaign.archived);
                toast.success(campaign.archived ? "Campaign restored" : "Campaign archived");
              }}
            >
              {campaign.archived ? (
                <ArchiveRestore className="size-4" />
              ) : (
                <Archive className="size-4" />
              )}
              {campaign.archived ? "Restore" : "Archive"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-0">
          {LIFECYCLE_STEPS.map((step, i) => {
            const reached = i <= current;
            const isCurrent = i === current;
            const pausedHere = campaign.status === "paused" && step.status === "running";
            return (
              <div key={step.status} className="flex items-center">
                {i > 0 && (
                  <div
                    className={cn("h-px w-8 sm:w-14", i <= current ? "bg-primary" : "bg-border")}
                  />
                )}
                <div className="flex items-center gap-1.5 px-1">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border text-[10px] font-medium",
                      reached
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground",
                      pausedHere && "border-orange-500 bg-orange-500 text-white"
                    )}
                  >
                    {reached && !isCurrent ? <Check className="size-3" /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      reached ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {pausedHere ? "Paused" : step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v ?? "overview")}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <CampaignOverviewTab campaign={campaign} />
        </TabsContent>
        <TabsContent value="recipients" className="mt-6">
          <CampaignRecipientsTab campaign={campaign} />
        </TabsContent>
        <TabsContent value="setup" className="mt-6">
          <CampaignSetupTab campaign={campaign} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
