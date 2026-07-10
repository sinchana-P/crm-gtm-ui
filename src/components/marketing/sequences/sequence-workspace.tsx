"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Copy,
  Eye,
  GitBranch,
  MailCheck,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { Sequence } from "@/lib/types";
import {
  SequenceStatusBadge,
  SequenceTypeBadge,
} from "@/components/marketing/status-badges";
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
import { formatRelative } from "@/lib/format";
import { useSequenceStore } from "@/lib/stores/sequence-store";
import { cn } from "@/lib/utils";
import { SequenceTemplates } from "@/components/marketing/sequences/sequence-templates";
import {
  ChannelIcon,
  triggerSummary,
} from "@/components/marketing/sequences/sequence-shared";

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
] as const;

function replyRate(s: Sequence) {
  return s.enrolled > 0 ? ((s.replied / s.enrolled) * 100).toFixed(1) : "0.0";
}

export function SequenceWorkspace() {
  const router = useRouter();
  const sequences = useSequenceStore((s) => s.sequences);
  const duplicateSequence = useSequenceStore((s) => s.duplicateSequence);
  const setStatus = useSequenceStore((s) => s.setStatus);
  const setArchived = useSequenceStore((s) => s.setArchived);
  const deleteSequence = useSequenceStore((s) => s.deleteSequence);

  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Sequence | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sequences.filter((s) => {
      if (tab === "archived") {
        if (!s.archived) return false;
      } else {
        if (s.archived) return false;
        if (tab !== "all" && s.status !== tab) return false;
      }
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !(s.description ?? "").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [sequences, tab, search, typeFilter]);

  const active = sequences.filter((s) => !s.archived);
  const totalEnrolled = active.reduce((n, s) => n + s.enrolled, 0);
  const totalActiveNow = active.reduce((n, s) => n + (s.activeCount ?? 0), 0);
  const avgReply = active.length
    ? (
        active.reduce((n, s) => n + (s.enrolled ? s.replied / s.enrolled : 0), 0) /
        active.length *
        100
      ).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sequences"
        description="One builder for every automation — 1:1 rep cadences and bulk marketing drips, event- or manually-triggered, with branches, waits, and CRM actions in a single flow."
        actions={
          <Button onClick={() => router.push("/marketing/sequences/new")}>
            <Plus className="size-4" />
            New sequence
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Sequences" value={active.length} subtitle={`${sequences.filter((s) => s.archived).length} archived`} icon={GitBranch} />
        <StatCard title="Active now" value={active.filter((s) => s.status === "active").length} subtitle="Running sequences" icon={Play} />
        <StatCard title="Contacts enrolled" value={totalEnrolled.toLocaleString()} subtitle={`${totalActiveNow.toLocaleString()} active right now`} icon={Users} />
        <StatCard title="Avg reply rate" value={`${avgReply}%`} subtitle="Across live sequences" icon={MailCheck} />
      </div>

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
              placeholder="Search sequences…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No sequences found"
          description="Build a multi-step drip or start from a template below."
          action={
            <Button onClick={() => router.push("/marketing/sequences/new")}>
              <Plus className="size-4" />
              New sequence
            </Button>
          }
        />
      ) : (
        <Card className="shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sequence</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead className="text-right">Steps</TableHead>
                  <TableHead className="text-right">Enrolled</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                  <TableHead className="text-right">Reply %</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/marketing/sequences/${s.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ChannelIcon channel={s.channel} />
                        <div className="min-w-0">
                          <p className={cn("font-medium", s.archived && "text-muted-foreground line-through")}>
                            {s.name}
                          </p>
                          {s.description && (
                            <p className="max-w-72 truncate text-xs text-muted-foreground">
                              {s.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <SequenceTypeBadge type={s.type} />
                    </TableCell>
                    <TableCell>
                      <SequenceStatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="max-w-52">
                      <p className="truncate text-xs text-muted-foreground">
                        {s.triggers && s.triggers.length > 0
                          ? triggerSummary(s.triggers[0]) +
                            (s.triggers.length > 1 ? ` +${s.triggers.length - 1}` : "")
                          : "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{s.steps}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.enrolled.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(s.activeCount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{replyRate(s)}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.updatedAt ? formatRelative(s.updatedAt) : "—"}
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
                          <DropdownMenuItem onClick={() => router.push(`/marketing/sequences/${s.id}`)}>
                            <Eye className="size-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/marketing/sequences/${s.id}/edit`)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              duplicateSequence(s.id);
                              toast.success("Sequence duplicated");
                            }}
                          >
                            <Copy className="size-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {s.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setStatus(s.id, "paused");
                                toast.success("Sequence paused");
                              }}
                            >
                              <Pause className="size-4" />
                              Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setStatus(s.id, "active");
                                toast.success("Sequence activated");
                              }}
                            >
                              <Play className="size-4" />
                              {s.status === "draft" ? "Activate" : "Resume"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setArchived(s.id, !s.archived);
                              toast.success(s.archived ? "Sequence restored" : "Sequence archived");
                            }}
                          >
                            {s.archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <SequenceTemplates />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          {deleteTarget && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{deleteTarget.name}”?</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteTarget.status === "active" || (deleteTarget.activeCount ?? 0) > 0
                    ? `This sequence has ${(deleteTarget.activeCount ?? 0).toLocaleString()} contacts mid-flow. They will be removed immediately. Consider archiving instead.`
                    : "This permanently removes the sequence and its flow. Enrollment history is retained on contact timelines."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                {deleteTarget.status === "active" || (deleteTarget.activeCount ?? 0) > 0 ? (
                  <Button
                    onClick={() => {
                      setArchived(deleteTarget.id, true);
                      setDeleteTarget(null);
                      toast.success("Sequence archived instead");
                    }}
                  >
                    <Archive className="size-4" />
                    Archive instead
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteSequence(deleteTarget.id);
                      setDeleteTarget(null);
                      toast.success("Sequence deleted");
                    }}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                )}
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
