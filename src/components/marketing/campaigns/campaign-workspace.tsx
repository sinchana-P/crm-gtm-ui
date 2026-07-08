"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  CheckCircle2,
  Copy,
  Eye,
  LayoutList,
  Mail,
  MoreHorizontal,
  MousePointerClick,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Send,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import type { Campaign, CampaignStatus } from "@/lib/types";
import { CampaignStatusBadge } from "@/components/marketing/status-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/format";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { cn } from "@/lib/utils";
import { CampaignCalendarView } from "@/components/marketing/campaigns/campaign-calendar-view";
import {
  CampaignTypeBadge,
  ChannelIcon,
  RECURRENCE_LABELS,
  rate,
} from "@/components/marketing/campaigns/campaign-shared";
import { CreateCampaignWizard } from "@/components/marketing/campaigns/create-campaign-wizard";

const STATUS_TABS: { value: CampaignStatus | "all" | "archived"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "running", label: "Running" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export function CampaignWorkspace() {
  const router = useRouter();
  const campaigns = useCampaignStore((s) => s.campaigns);
  const duplicateCampaign = useCampaignStore((s) => s.duplicateCampaign);
  const setStatus = useCampaignStore((s) => s.setStatus);
  const setArchived = useCampaignStore((s) => s.setArchived);

  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]["value"]>("all");
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return campaigns.filter((c) => {
      if (tab === "archived") {
        if (!c.archived) return false;
      } else {
        if (c.archived) return false;
        if (tab !== "all" && c.status !== tab) return false;
      }
      if (channel !== "all" && c.channel !== channel) return false;
      if (type !== "all" && c.type !== type) return false;
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.segmentName.toLowerCase().includes(q) &&
        !(c.templateName ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [campaigns, tab, search, channel, type]);

  const active = campaigns.filter((c) => !c.archived);
  const totals = useMemo(() => {
    const sent = active.reduce((n, c) => n + c.sent, 0);
    const opened = active.reduce((n, c) => n + c.opened, 0);
    const clicked = active.reduce((n, c) => n + c.clicked, 0);
    const converted = active.reduce((n, c) => n + c.converted, 0);
    return { sent, opened, clicked, converted };
  }, [active]);

  function lifecycleActions(c: Campaign) {
    const actions: { label: string; icon: typeof Play; to: CampaignStatus }[] = [];
    if (c.status === "draft") actions.push({ label: "Schedule", icon: CalendarDays, to: "scheduled" });
    if (c.status === "draft" || c.status === "scheduled")
      actions.push({ label: "Launch now", icon: Play, to: "running" });
    if (c.status === "running") actions.push({ label: "Pause", icon: Pause, to: "paused" });
    if (c.status === "paused") actions.push({ label: "Resume", icon: Play, to: "running" });
    if (c.status === "running" || c.status === "paused")
      actions.push({ label: "Mark completed", icon: CheckCircle2, to: "completed" });
    return actions;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Campaign workspace — create, schedule, track, and manage all marketing campaigns."
        actions={
          <>
            <div className="flex items-center rounded-lg border p-0.5">
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
              >
                <LayoutList className="size-4" />
                List
              </Button>
              <Button
                variant={view === "calendar" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("calendar")}
              >
                <CalendarDays className="size-4" />
                Calendar
              </Button>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create campaign
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Messages sent"
          value={totals.sent.toLocaleString()}
          subtitle="Across all campaigns"
          icon={Send}
        />
        <StatCard
          title="Open rate"
          value={`${rate(totals.opened, totals.sent)}%`}
          subtitle={`${totals.opened.toLocaleString()} opens`}
          icon={Mail}
        />
        <StatCard
          title="Click rate"
          value={`${rate(totals.clicked, totals.sent)}%`}
          subtitle={`${totals.clicked.toLocaleString()} clicks`}
          icon={MousePointerClick}
        />
        <StatCard
          title="Conversions"
          value={totals.converted.toLocaleString()}
          subtitle="Attributed to campaigns"
          icon={Target}
        />
      </div>

      {view === "calendar" ? (
        <CampaignCalendarView campaigns={campaigns.filter((c) => !c.archived)} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <Tabs value={tab} onValueChange={(v) => setTab((v as typeof tab) ?? "all")}>
              <TabsList>
                {STATUS_TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search by name, segment, or template…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={channel} onValueChange={(v) => setChannel(v ?? "all")}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={(v) => setType(v ?? "all")}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="No campaigns found"
              description={
                tab === "archived"
                  ? "Archived campaigns will appear here."
                  : "Create your first campaign to reach a segment with a one-time or recurring message."
              }
              action={
                tab !== "archived" ? (
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4" />
                    Create campaign
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Card className="shadow-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead className="text-right">Sent</TableHead>
                      <TableHead className="text-right">Open %</TableHead>
                      <TableHead className="text-right">Converted</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/marketing/campaigns/${c.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ChannelIcon channel={c.channel} />
                            <div>
                              <p className={cn("font-medium", c.archived && "text-muted-foreground line-through")}>
                                {c.name}
                              </p>
                              <div className="mt-0.5">
                                <CampaignTypeBadge type={c.type} />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.segmentName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.templateName ?? "—"}
                        </TableCell>
                        <TableCell>
                          <CampaignStatusBadge status={c.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.recurrence
                            ? `${RECURRENCE_LABELS[c.recurrence.frequency]} · ${c.recurrence.cron}`
                            : c.scheduledAt
                              ? formatDateTime(c.scheduledAt)
                              : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {c.sent.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {rate(c.opened, c.sent)}%
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {c.converted.toLocaleString()}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/marketing/campaigns/${c.id}`)}
                              >
                                <Eye className="size-4" />
                                View campaign
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/marketing/campaigns/${c.id}?tab=setup`)}
                              >
                                <Pencil className="size-4" />
                                Edit setup
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  duplicateCampaign(c.id);
                                  toast.success("Campaign duplicated as draft");
                                }}
                              >
                                <Copy className="size-4" />
                                Duplicate
                              </DropdownMenuItem>
                              {lifecycleActions(c).length > 0 && <DropdownMenuSeparator />}
                              {lifecycleActions(c).map((a) => (
                                <DropdownMenuItem
                                  key={a.label}
                                  onClick={() => {
                                    setStatus(c.id, a.to);
                                    toast.success(`Campaign ${a.to}`);
                                  }}
                                >
                                  <a.icon className="size-4" />
                                  {a.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setArchived(c.id, !c.archived);
                                  toast.success(c.archived ? "Campaign restored" : "Campaign archived");
                                }}
                              >
                                {c.archived ? (
                                  <ArchiveRestore className="size-4" />
                                ) : (
                                  <Archive className="size-4" />
                                )}
                                {c.archived ? "Restore" : "Archive"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <CreateCampaignWizard open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
