"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Camera,
  Copy,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { SegmentRecord } from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatRelative } from "@/lib/format";
import { definitionSummary } from "@/lib/segment-eval";
import { useSegmentStore } from "@/lib/stores/segment-store";
import { cn } from "@/lib/utils";
import { AiSuggestionsPanel } from "@/components/marketing/segments/ai-suggestions-panel";
import { LookalikeDialog } from "@/components/marketing/segments/lookalike-dialog";
import {
  SegmentOriginBadge,
  SegmentTypeBadge,
  USAGE_MODULE_META,
  WeeklyTrend,
} from "@/components/marketing/segments/segment-shared";

const TABS = [
  { value: "all", label: "All" },
  { value: "dynamic", label: "Active (dynamic)" },
  { value: "static", label: "Static" },
  { value: "archived", label: "Archived" },
] as const;

export function SegmentWorkspace() {
  const router = useRouter();
  const segments = useSegmentStore((s) => s.segments);
  const refreshing = useSegmentStore((s) => s.refreshing);
  const duplicateSegment = useSegmentStore((s) => s.duplicateSegment);
  const convertToStatic = useSegmentStore((s) => s.convertToStatic);
  const setArchived = useSegmentStore((s) => s.setArchived);
  const deleteSegment = useSegmentStore((s) => s.deleteSegment);
  const refreshNow = useSegmentStore((s) => s.refreshNow);

  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<SegmentRecord | null>(null);
  const [lookalikeOpen, setLookalikeOpen] = useState(false);

  const owners = useMemo(
    () => [...new Set(segments.map((s) => s.owner))].sort(),
    [segments]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return segments.filter((s) => {
      if (tab === "archived") {
        if (!s.archived) return false;
      } else {
        if (s.archived) return false;
        if (tab !== "all" && s.type !== tab) return false;
      }
      if (owner !== "all" && s.owner !== owner) return false;
      if (q && !s.name.toLowerCase().includes(q) && !(s.description ?? "").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [segments, tab, search, owner]);

  const active = segments.filter((s) => !s.archived);
  const totalMembers = active.reduce((n, s) => n + s.memberCount, 0);
  const inUse = active.filter((s) => s.usedIn.length > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Segments"
        description="Build static and dynamic audiences, preview membership in real time, and reuse segments across campaigns, sequences, and automations."
        actions={
          <>
            <Button variant="outline" onClick={() => setLookalikeOpen(true)}>
              <Copy className="size-4" />
              Lookalike
              <Badge variant="outline" className="ml-1 border-0 bg-blue-500/10 text-blue-700 dark:text-blue-400">
                Phase 3
              </Badge>
            </Button>
            <Button onClick={() => router.push("/marketing/segments/new")}>
              <Plus className="size-4" />
              Create segment
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Segments" value={active.length} subtitle={`${segments.filter((s) => s.archived).length} archived`} icon={Filter} />
        <StatCard
          title="Active (dynamic)"
          value={active.filter((s) => s.type === "dynamic").length}
          subtitle="Auto-refreshing membership"
          icon={Zap}
        />
        <StatCard
          title="Contacts covered"
          value={totalMembers.toLocaleString()}
          subtitle="Across all live segments"
          icon={Users}
        />
        <StatCard
          title="In use"
          value={inUse}
          subtitle="Referenced by campaigns, sequences, or automations"
          icon={RefreshCw}
        />
      </div>

      <AiSuggestionsPanel />

      <div className="flex flex-col gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab((v as typeof tab) ?? "all")}>
          <TabsList>
            {TABS.map((t) => (
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
              placeholder="Search segments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={owner} onValueChange={(v) => setOwner(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owners</SelectItem>
              {owners.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No segments found"
          description="Create a dynamic segment with filter rules or a static list of hand-picked contacts."
          action={
            <Button onClick={() => router.push("/marketing/segments/new")}>
              <Plus className="size-4" />
              Create segment
            </Button>
          }
        />
      ) : (
        <Card className="shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Segment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead className="max-w-64">Criteria</TableHead>
                  <TableHead>Used in</TableHead>
                  <TableHead>Refresh</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const isRefreshing = refreshing.includes(s.id);
                  return (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/marketing/segments/${s.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <p className={cn("font-medium", s.archived && "text-muted-foreground line-through")}>
                            {s.name}
                          </p>
                          <SegmentOriginBadge origin={s.origin} />
                        </div>
                        {s.description && (
                          <p className="mt-0.5 max-w-72 truncate text-xs text-muted-foreground">
                            {s.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <SegmentTypeBadge type={s.type} />
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium tabular-nums">{s.memberCount.toLocaleString()}</p>
                        <WeeklyTrend change={s.weeklyChange} />
                      </TableCell>
                      <TableCell className="max-w-64">
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {s.type === "dynamic"
                            ? definitionSummary(s.definition)
                            : `Curated list · ${s.memberCount.toLocaleString()} contacts`}
                        </p>
                      </TableCell>
                      <TableCell>
                        {s.usedIn.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(["campaign", "sequence", "automation"] as const).map((mod) => {
                              const count = s.usedIn.filter((u) => u.module === mod).length;
                              if (!count) return null;
                              const Meta = USAGE_MODULE_META[mod];
                              return (
                                <Tooltip key={mod}>
                                  <TooltipTrigger
                                    render={
                                      <Badge variant="outline" className="gap-1">
                                        <Meta.icon className="size-3" />
                                        {count}
                                      </Badge>
                                    }
                                  />
                                  <TooltipContent>
                                    {count} {Meta.label.toLowerCase()}
                                    {count > 1 ? "s" : ""}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.type === "dynamic" ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <RefreshCw className={cn("size-3", isRefreshing && "animate-spin text-primary")} />
                            {isRefreshing
                              ? "Refreshing…"
                              : s.refresh.mode === "scheduled"
                                ? `${s.refresh.frequency} · ${s.refresh.lastRefreshedAt ? formatRelative(s.refresh.lastRefreshedAt) : "never"}`
                                : "Manual"}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Snapshot</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatRelative(s.updatedAt)}
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
                            <DropdownMenuItem onClick={() => router.push(`/marketing/segments/${s.id}`)}>
                              <Eye className="size-4" />
                              View segment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/marketing/segments/${s.id}/edit`)}>
                              <Pencil className="size-4" />
                              Edit {s.type === "dynamic" ? "rules" : "members"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                duplicateSegment(s.id);
                                toast.success("Segment duplicated");
                              }}
                            >
                              <Copy className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                            {s.type === "dynamic" && (
                              <>
                                <DropdownMenuItem
                                  disabled={isRefreshing}
                                  onClick={() => {
                                    refreshNow(s.id);
                                    toast.info("Recalculating segment membership…");
                                  }}
                                >
                                  <RefreshCw className="size-4" />
                                  Refresh now
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    convertToStatic(s.id);
                                    toast.success("Static snapshot created");
                                  }}
                                >
                                  <Camera className="size-4" />
                                  Convert to static snapshot
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setArchived(s.id, !s.archived);
                                toast.success(s.archived ? "Segment restored" : "Segment archived");
                              }}
                            >
                              {s.archived ? (
                                <ArchiveRestore className="size-4" />
                              ) : (
                                <Archive className="size-4" />
                              )}
                              {s.archived ? "Restore" : "Archive"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteTarget(s)}>
                              <Trash2 className="size-4 text-destructive" />
                              <span className="text-destructive">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          {deleteTarget && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {deleteTarget.usedIn.length > 0
                    ? `“${deleteTarget.name}” is in use`
                    : `Delete “${deleteTarget.name}”?`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteTarget.usedIn.length > 0
                    ? "Deleting this segment would break the assets below. Remove those references first, or archive the segment instead."
                    : "This permanently removes the segment. Assets that referenced it in the past keep their historical stats."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteTarget.usedIn.length > 0 && (
                <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3">
                  {deleteTarget.usedIn.map((u) => {
                    const Meta = USAGE_MODULE_META[u.module];
                    return (
                      <div key={`${u.module}-${u.refId}`} className="flex items-center gap-2 text-sm">
                        <Meta.icon className="size-3.5 text-muted-foreground" />
                        <span className="font-medium">{u.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {Meta.label} · {u.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                {deleteTarget.usedIn.length > 0 ? (
                  <Button
                    onClick={() => {
                      setArchived(deleteTarget.id, true);
                      setDeleteTarget(null);
                      toast.success("Segment archived instead");
                    }}
                  >
                    <Archive className="size-4" />
                    Archive instead
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteSegment(deleteTarget.id);
                      setDeleteTarget(null);
                      toast.success("Segment deleted");
                    }}
                  >
                    <Trash2 className="size-4" />
                    Delete segment
                  </Button>
                )}
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <LookalikeDialog open={lookalikeOpen} onOpenChange={setLookalikeOpen} />
    </div>
  );
}
