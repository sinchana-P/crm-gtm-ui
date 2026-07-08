"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowUpRight,
  Camera,
  Copy,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { ContactRecord } from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_CONTACTS, MOCK_SEGMENT_GROWTH } from "@/lib/mock-data";
import { contactName, formatDateTime, formatRelative } from "@/lib/format";
import { conditionLabel, matchContacts } from "@/lib/segment-eval";
import { useSegmentStore } from "@/lib/stores/segment-store";
import { cn } from "@/lib/utils";
import {
  SegmentOriginBadge,
  SegmentTypeBadge,
  USAGE_MODULE_META,
  WeeklyTrend,
} from "@/components/marketing/segments/segment-shared";

const growthConfig = {
  count: { label: "Members", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function SegmentDetail({ id }: { id: string }) {
  const router = useRouter();
  const segment = useSegmentStore((s) => s.segments.find((sg) => sg.id === id));
  const refreshing = useSegmentStore((s) => s.refreshing.includes(id));
  const refreshNow = useSegmentStore((s) => s.refreshNow);
  const duplicateSegment = useSegmentStore((s) => s.duplicateSegment);
  const convertToStatic = useSegmentStore((s) => s.convertToStatic);
  const setArchived = useSegmentStore((s) => s.setArchived);
  const removeStaticMember = useSegmentStore((s) => s.removeStaticMember);
  const addStaticMembers = useSegmentStore((s) => s.addStaticMembers);

  const [memberSearch, setMemberSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [pickerIds, setPickerIds] = useState<string[]>([]);

  const recorded = MOCK_SEGMENT_GROWTH.filter((g) => g.segmentId === id);
  // Deterministic synthetic history for segments without recorded points.
  const growth =
    recorded.length > 0
      ? recorded.map((p) => ({ ...p, label: format(new Date(p.date), "MMM d") }))
      : Array.from({ length: 8 }, (_, i) => {
          const ratio = 0.82 + (i * 0.18) / 7;
          const date = new Date(2026, 4, 18 + i * 7);
          return {
            segmentId: id,
            date: date.toISOString(),
            count: Math.round((segment?.memberCount ?? 0) * ratio),
            label: format(date, "MMM d"),
          };
        });

  const members: ContactRecord[] = useMemo(() => {
    if (!segment) return [];
    if (segment.type === "static") {
      return MOCK_CONTACTS.filter((c) => (segment.staticMemberIds ?? []).includes(c.id));
    }
    return segment.definition ? matchContacts(MOCK_CONTACTS, segment.definition) : [];
  }, [segment]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.toLowerCase();
    return members.filter(
      (c) =>
        !q ||
        contactName(c.firstName, c.lastName).toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const pickerCandidates = useMemo(
    () =>
      MOCK_CONTACTS.filter((c) => !(segment?.staticMemberIds ?? []).includes(c.id)),
    [segment?.staticMemberIds]
  );

  if (!segment) {
    return (
      <EmptyState
        title="Segment not found"
        description="This segment may have been deleted."
        action={
          <Button variant="outline" onClick={() => router.push("/marketing/segments")}>
            <ArrowLeft className="size-4" />
            Back to segments
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-border pb-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => router.push("/marketing/segments")}
        >
          <ArrowLeft className="size-4" />
          Segments
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="size-5 text-muted-foreground" />
              <h1 className="text-2xl font-semibold tracking-tight">{segment.name}</h1>
              <SegmentTypeBadge type={segment.type} />
              <SegmentOriginBadge origin={segment.origin} />
              {segment.archived && (
                <span className="text-xs font-medium text-muted-foreground">(Archived)</span>
              )}
            </div>
            {segment.description && (
              <p className="max-w-3xl text-sm text-muted-foreground">{segment.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Owner: {segment.owner} · Created {formatRelative(segment.createdAt)} · Updated{" "}
              {formatRelative(segment.updatedAt)}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {segment.type === "dynamic" && (
              <Button
                variant="outline"
                disabled={refreshing}
                onClick={() => {
                  refreshNow(segment.id);
                  toast.info("Recalculating segment membership…");
                }}
              >
                <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
                {refreshing ? "Refreshing…" : "Refresh now"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push(`/marketing/segments/${segment.id}/edit`)}
            >
              <Pencil className="size-4" />
              Edit {segment.type === "dynamic" ? "rules" : "members"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                duplicateSegment(segment.id);
                toast.success("Segment duplicated");
              }}
            >
              <Copy className="size-4" />
              Duplicate
            </Button>
            {segment.type === "dynamic" && (
              <Button
                variant="outline"
                onClick={() => {
                  const snap = convertToStatic(segment.id);
                  if (snap) {
                    toast.success("Static snapshot created");
                    router.push(`/marketing/segments/${snap.id}`);
                  }
                }}
              >
                <Camera className="size-4" />
                Snapshot
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setArchived(segment.id, !segment.archived);
                toast.success(segment.archived ? "Segment restored" : "Segment archived");
              }}
            >
              {segment.archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
              {segment.archived ? "Restore" : "Archive"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="usage">Usage ({segment.usedIn.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="shadow-none">
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">Members</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {segment.memberCount.toLocaleString()}
                </p>
                <WeeklyTrend change={segment.weeklyChange} />
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">Type</p>
                <p className="mt-1 text-2xl font-semibold">
                  {segment.type === "dynamic" ? "Active" : "Static"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {segment.type === "dynamic"
                    ? "Rule-based, auto-refreshing"
                    : "Fixed membership snapshot"}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground">Used in</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{segment.usedIn.length}</p>
                <p className="text-xs text-muted-foreground">
                  Campaigns, sequences & automations
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Membership growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={growthConfig} className="h-[220px] w-full">
                  <LineChart data={growth}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={48} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--color-count)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {segment.type === "dynamic" ? (
              <Card className="shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <RefreshCw className="size-4 text-muted-foreground" />
                    Refresh engine
                  </CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {segment.refresh.mode === "scheduled"
                      ? `${segment.refresh.frequency} schedule`
                      : "On demand"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Last refreshed</p>
                      <p className="mt-0.5 font-medium">
                        {segment.refresh.lastRefreshedAt
                          ? formatRelative(segment.refresh.lastRefreshedAt)
                          : "Never"}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Next scheduled run</p>
                      <p className="mt-0.5 font-medium">
                        {segment.refresh.nextRefreshAt
                          ? formatDateTime(segment.refresh.nextRefreshAt)
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase">
                      Recent runs
                    </p>
                    {segment.refresh.history.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No refresh runs recorded yet.</p>
                    ) : (
                      <div className="divide-y rounded-lg border">
                        {segment.refresh.history.slice(0, 5).map((h) => (
                          <div key={h.id} className="flex items-center justify-between px-3 py-2 text-sm">
                            <span className="text-muted-foreground">
                              {formatDateTime(h.at)}
                              <Badge variant="outline" className="ml-2 capitalize">
                                {h.trigger}
                              </Badge>
                            </span>
                            <span className="tabular-nums">
                              <span
                                className={cn(
                                  "font-medium",
                                  h.delta > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : h.delta < 0
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-muted-foreground"
                                )}
                              >
                                {h.delta > 0 ? "+" : ""}
                                {h.delta}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                {(h.durationMs / 1000).toFixed(1)}s
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Static list</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Membership only changes when you add or remove contacts — there is no
                    automatic recalculation.
                  </p>
                  <p>
                    Need it to stay current instead? Recreate it as an active segment with filter
                    rules.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {segment.type === "dynamic" && segment.definition && (
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Criteria</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/marketing/segments/${segment.id}/edit`)}
                >
                  <Pencil className="size-4" />
                  Edit rules
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {segment.definition.groups.map((g, gi) => (
                  <div key={g.id}>
                    {gi > 0 && (
                      <Badge variant="outline" className="mb-2 uppercase">
                        {segment.definition!.match === "all" ? "and" : "or"}
                      </Badge>
                    )}
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                        Match {g.match === "all" ? "all" : "any"} of
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {g.conditions.map((c) => (
                          <Badge key={c.id} variant="outline" className="font-mono text-xs font-normal">
                            {conditionLabel(c)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search members…"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>
            {segment.type === "static" && (
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="size-4" />
                Add members
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Showing {filteredMembers.length} sample member{filteredMembers.length === 1 ? "" : "s"}{" "}
            of {segment.memberCount.toLocaleString()} total.
            {segment.type === "dynamic" && " Membership is evaluated live from segment rules."}
          </p>
          {filteredMembers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No members to show"
              description={
                segment.type === "static"
                  ? "Add contacts to this list to get started."
                  : "No sample contacts currently match the segment rules."
              }
            />
          ) : (
            <Card className="shadow-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead className="text-right">Lead score</TableHead>
                      <TableHead>Owner</TableHead>
                      {segment.type === "static" && <TableHead className="w-12" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((c) => (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/contacts/${c.id}`)}
                      >
                        <TableCell>
                          <p className="font-medium">{contactName(c.firstName, c.lastName)}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.company ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {c.lifecycleStage}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{c.leadScore}</TableCell>
                        <TableCell className="text-muted-foreground">{c.owner}</TableCell>
                        {segment.type === "static" && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                removeStaticMember(segment.id, c.id);
                                toast.success("Member removed");
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="usage" className="mt-6 space-y-4">
          {segment.usedIn.length === 0 ? (
            <EmptyState
              icon={ArrowUpRight}
              title="Not used anywhere yet"
              description="Pick this segment as the audience of a campaign, sequence, or automation and it will show up here."
              action={
                <Button variant="outline" onClick={() => router.push("/marketing/campaigns")}>
                  Go to campaigns
                </Button>
              }
            />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                This segment powers {segment.usedIn.length} asset
                {segment.usedIn.length === 1 ? "" : "s"} across modules. Deleting it is blocked
                while these references exist.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {segment.usedIn.map((u) => {
                  const Meta = USAGE_MODULE_META[u.module];
                  const href = Meta.href(u.refId);
                  return (
                    <button
                      key={`${u.module}-${u.refId}`}
                      type="button"
                      onClick={() => href && router.push(href)}
                      className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/40"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <Meta.icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Meta.label} · <span className="capitalize">{u.status}</span>
                        </p>
                      </div>
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setPickerIds([]); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add members</DialogTitle>
            <DialogDescription>
              Select contacts to add to “{segment.name}”.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 divide-y overflow-y-auto rounded-lg border">
            {pickerCandidates.map((c) => {
              const checked = pickerIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/40"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) =>
                      setPickerIds((ids) => (v ? [...ids, c.id] : ids.filter((x) => x !== c.id)))
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {contactName(c.firstName, c.lastName)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {c.lifecycleStage}
                  </Badge>
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={pickerIds.length === 0}
              onClick={() => {
                addStaticMembers(segment.id, pickerIds, pickerIds.length);
                toast.success(`${pickerIds.length} member${pickerIds.length > 1 ? "s" : ""} added`);
                setAddOpen(false);
                setPickerIds([]);
              }}
            >
              <Plus className="size-4" />
              Add {pickerIds.length > 0 ? pickerIds.length : ""} member
              {pickerIds.length === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
