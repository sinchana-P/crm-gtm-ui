"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ArrowRight,
  Copy,
  Eye,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Target,
  Trash2,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { Automation } from "@/lib/types";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_AUTOMATION_RECIPES } from "@/lib/mock-data";
import { countNodes } from "@/lib/automation-flow";
import { formatRelative } from "@/lib/format";
import { useAutomationStore } from "@/lib/stores/automation-store";
import { cn } from "@/lib/utils";
import { AutomationStatusBadge } from "@/components/marketing/automations/automation-shared";

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
] as const;

export function AutomationWorkspace() {
  const router = useRouter();
  const automations = useAutomationStore((s) => s.automations);
  const duplicateAutomation = useAutomationStore((s) => s.duplicateAutomation);
  const setStatus = useAutomationStore((s) => s.setStatus);
  const setArchived = useAutomationStore((s) => s.setArchived);
  const deleteAutomation = useAutomationStore((s) => s.deleteAutomation);

  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Automation | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return automations.filter((a) => {
      if (tab === "archived") {
        if (!a.archived) return false;
      } else {
        if (a.archived) return false;
        if (tab !== "all" && a.status !== tab) return false;
      }
      if (q && !a.name.toLowerCase().includes(q) && !(a.description ?? "").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [automations, tab, search]);

  const active = automations.filter((a) => !a.archived);
  const totalEnrolled = active.reduce((n, a) => n + a.enrolled, 0);
  const totalActiveNow = active.reduce((n, a) => n + (a.activeCount ?? 0), 0);
  const totalGoal = active.reduce((n, a) => n + (a.goalMet ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automations"
        description="Visual workflows — enroll on triggers, then branch, wait, and run CRM actions on a canvas."
        actions={
          <Button onClick={() => router.push("/marketing/automations/new")}>
            <Plus className="size-4" /> New automation
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Automations" value={active.length} subtitle={`${automations.filter((a) => a.archived).length} archived`} icon={Workflow} />
        <StatCard title="Active now" value={active.filter((a) => a.status === "active").length} subtitle="Running workflows" icon={Play} />
        <StatCard title="Contacts enrolled" value={totalEnrolled.toLocaleString()} subtitle={`${totalActiveNow.toLocaleString()} active right now`} icon={Users} />
        <StatCard title="Goals met" value={totalGoal.toLocaleString()} subtitle="Across live workflows" icon={Target} />
      </div>

      <div className="flex flex-col gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab((v as typeof tab) ?? "all")}>
          <TabsList>
            {TABS.map((t) => (<TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>))}
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search automations…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No automations found"
          description="Build a workflow from scratch or start from a recipe below."
          action={<Button onClick={() => router.push("/marketing/automations/new")}><Plus className="size-4" /> New automation</Button>}
        />
      ) : (
        <Card className="shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Automation</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Steps</TableHead>
                  <TableHead className="text-right">Enrolled</TableHead>
                  <TableHead className="text-right">Active</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => router.push(`/marketing/automations/${a.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-muted"><Zap className="size-3.5 text-muted-foreground" /></span>
                        <div className="min-w-0">
                          <p className={cn("font-medium", a.archived && "text-muted-foreground line-through")}>{a.name}</p>
                          {a.category && <p className="text-xs text-muted-foreground">{a.category}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-52"><p className="truncate text-xs text-muted-foreground">{a.trigger}</p></TableCell>
                    <TableCell><AutomationStatusBadge status={a.status} /></TableCell>
                    <TableCell className="text-right tabular-nums">{a.actions}</TableCell>
                    <TableCell className="text-right tabular-nums">{a.enrolled.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{(a.activeCount ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.updatedAt ? formatRelative(a.updatedAt) : "—"}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/marketing/automations/${a.id}`)}><Eye className="size-4" /> View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/marketing/automations/${a.id}/edit`)}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { duplicateAutomation(a.id); toast.success("Automation duplicated"); }}><Copy className="size-4" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {a.status === "active" ? (
                            <DropdownMenuItem onClick={() => { setStatus(a.id, "paused"); toast.success("Automation paused"); }}><Pause className="size-4" /> Pause</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => { setStatus(a.id, "active"); toast.success("Automation activated"); }}><Play className="size-4" /> {a.status === "draft" ? "Activate" : "Resume"}</DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => { setArchived(a.id, !a.archived); toast.success(a.archived ? "Automation restored" : "Automation archived"); }}>
                            {a.archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />} {a.archived ? "Restore" : "Archive"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(a)}><Trash2 className="size-4 text-destructive" /><span className="text-destructive">Delete</span></DropdownMenuItem>
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

      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Start from a recipe</h2>
          <p className="text-sm text-muted-foreground">Best-practice workflows you can customize on the canvas.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_AUTOMATION_RECIPES.map((r) => (
            <Card key={r.id} className="flex flex-col shadow-none">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted"><Workflow className="size-4 text-muted-foreground" /></span>
                  <Badge variant="outline" className="capitalize">{r.category}</Badge>
                </div>
                <CardTitle className="text-sm">{r.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">{r.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">{countNodes(r.nodes)} steps</span>
                <Button variant="ghost" size="sm" onClick={() => router.push(`/marketing/automations/new?recipe=${r.id}`)}>Use <ArrowRight className="size-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          {deleteTarget && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{deleteTarget.name}”?</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteTarget.status === "active" || (deleteTarget.activeCount ?? 0) > 0
                    ? `${(deleteTarget.activeCount ?? 0).toLocaleString()} contacts are mid-workflow. They will be removed immediately. Consider archiving instead.`
                    : "This permanently removes the workflow. Run history stays on contact timelines."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                {deleteTarget.status === "active" || (deleteTarget.activeCount ?? 0) > 0 ? (
                  <Button onClick={() => { setArchived(deleteTarget.id, true); setDeleteTarget(null); toast.success("Automation archived instead"); }}>
                    <Archive className="size-4" /> Archive instead
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => { deleteAutomation(deleteTarget.id); setDeleteTarget(null); toast.success("Automation deleted"); }}>
                    <Trash2 className="size-4" /> Delete
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
