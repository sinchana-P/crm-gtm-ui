"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Filter, LifeBuoy, Search, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CM_PROJECTS } from "@/lib/mock-data/case-manager";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { CURRENT_REP } from "@/lib/stores/view-level-store";
import { formatRelative } from "@/lib/format";
import type { CaseSource, CmCaseStatus, CmPriority } from "@/lib/types/case-manager";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  CaseStatusBadge,
  PriorityBadge,
  SlaBadge,
  SourceBadge,
} from "@/components/case-manager/cm-status-badges";

type SavedView = "all" | "mine" | "risk" | "unassigned";

const VIEWS: { id: SavedView; label: string }[] = [
  { id: "all", label: "All cases" },
  { id: "mine", label: "My cases" },
  { id: "risk", label: "SLA at risk" },
  { id: "unassigned", label: "Unassigned" },
];

export default function CasesListPage() {
  const cases = useCaseManagerStore((s) => s.cases);
  const updateStatus = useCaseManagerStore((s) => s.updateCaseStatus);
  const reassign = useCaseManagerStore((s) => s.reassignCase);
  const escalate = useCaseManagerStore((s) => s.escalateCase);

  const [view, setView] = useState<SavedView>("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CmCaseStatus | "all">("all");
  const [priority, setPriority] = useState<CmPriority | "all">("all");
  const [projectId, setProjectId] = useState<string>("all");
  const [source, setSource] = useState<CaseSource | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return cases.filter((c) => {
      if (view === "mine" && c.assignee !== CURRENT_REP.name) return false;
      if (view === "risk" && c.slaStatus === "green") return false;
      if (view === "unassigned" && c.assignee !== "Unassigned") return false;
      if (status !== "all" && c.status !== status) return false;
      if (priority !== "all" && c.priority !== priority) return false;
      if (projectId !== "all" && c.projectId !== projectId) return false;
      if (source !== "all" && c.source !== source) return false;
      if (q && !`${c.title} ${c.displayId} ${c.assignee}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [cases, view, query, status, priority, projectId, source]);

  const allChecked = filtered.length > 0 && filtered.every((c) => selected.has(c.id));
  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(filtered.map((c) => c.id)));
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const bulk = (fn: (id: string) => void, msg: string) => {
    selected.forEach(fn);
    toast.success(msg, { description: `${selected.size} case(s) updated` });
    setSelected(new Set());
  };

  const activeFilters = [status, priority, projectId, source].filter((f) => f !== "all").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        description="Every back-office case, unified with its front-office origin. Filter, save a view, and act in bulk."
        actions={
          <Link href="/cases/intake" className="text-sm font-medium text-primary hover:underline">
            Convert from intake →
          </Link>
        }
      />

      {/* Saved views */}
      <div className="flex flex-wrap items-center gap-1.5">
        {VIEWS.map((v) => {
          const count = cases.filter((c) => {
            if (v.id === "mine") return c.assignee === CURRENT_REP.name;
            if (v.id === "risk") return c.slaStatus !== "green";
            if (v.id === "unassigned") return c.assignee === "Unassigned";
            return true;
          }).length;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                view === v.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted"
              )}
            >
              {v.label}
              <span className={cn("ml-1.5 text-xs", view === v.id ? "opacity-80" : "text-muted-foreground")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 py-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title, ID, assignee…"
              className="h-8 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as CmCaseStatus | "all")}>
            <SelectTrigger className="h-8 w-32"><Filter className="size-3.5" /><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(["New", "In Progress", "Pending", "Resolved", "Closed"] as CmCaseStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => setPriority(v as CmPriority | "all")}>
            <SelectTrigger className="h-8 w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {(["low", "medium", "high", "urgent"] as CmPriority[]).map((p) => (
                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {CM_PROJECTS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={(v) => setSource(v as CaseSource | "all")}>
            <SelectTrigger className="h-8 w-32"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="portal">Portal</SelectItem>
              <SelectItem value="inquiry">Inquiry</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="crm">CRM</SelectItem>
            </SelectContent>
          </Select>
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatus("all");
                setPriority("all");
                setProjectId("all");
                setSource("all");
              }}
            >
              <X className="size-3.5" /> Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => bulk((id) => updateStatus(id, "In Progress"), "Moved to In Progress")}>
              Mark in progress
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm">Assign <ChevronDown className="size-3.5" /></Button>} />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {["Karthik N", "Neha Reddy", "Arjun Mehta", "Support Tier 1"].map((a) => (
                  <DropdownMenuItem key={a} onClick={() => bulk((id) => reassign(id, a), `Assigned to ${a}`)}>
                    {a}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => bulk((id) => escalate(id, 2, "Bulk escalation"), "Escalated to Tier 2")}>
              Escalate
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setSelected(new Set())}><X className="size-4" /></Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState icon={LifeBuoy} title="No cases" description="No cases match these filters." className="border-0" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Project / Queue</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} data-state={selected.has(c.id) ? "selected" : undefined}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleOne(c.id)} aria-label={`Select ${c.displayId}`} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/cases/${c.id}`} className="block">
                        <span className="font-medium">{c.title}</span>
                        <span className="block text-xs text-muted-foreground">{c.displayId}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{c.projectName}</span>
                      <span className="block text-xs text-muted-foreground">{c.queueName}</span>
                    </TableCell>
                    <TableCell><SourceBadge source={c.source} /></TableCell>
                    <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                    <TableCell><CaseStatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-sm">{c.assignee}</TableCell>
                    <TableCell><SlaBadge status={c.slaStatus} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatRelative(c.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
