"use client";

import { useMemo, useState } from "react";
import { Download, RefreshCw, Search, ShieldCheck, Trash2, Upload, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  SUPPRESSIONS, SUPPRESSION_REQUEST_TYPES, SUPPRESSION_SOURCES, SUPPRESSION_SYNC,
  type SuppressionReason, type SuppressionRow,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const REASON_STYLES: Record<SuppressionReason, string> = {
  unsubscribe: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  bounce: "bg-red-500/10 text-red-700 dark:text-red-400",
  complaint: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  manual: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  import: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "global-opt-out": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

export function SuppressionTab() {
  const [rows, setRows] = useState<SuppressionRow[]>(SUPPRESSIONS);
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRequestType, setNewRequestType] = useState<string>(SUPPRESSION_REQUEST_TYPES[0].value);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      if (reason !== "all" && r.reason !== reason) return false;
      if (q && !`${r.email} ${r.name}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, reason]);

  const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(filtered.map((r) => r.id)));
  }
  function toggleOne(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  function removeRows(ids: string[]) {
    setRows((list) => list.filter((r) => !ids.includes(r.id)));
    setSelected(new Set());
    toast.success(`${ids.length} address${ids.length > 1 ? "es" : ""} removed — they can be emailed again`);
  }
  function addRow() {
    if (!newEmail.trim()) return;
    const req = SUPPRESSION_REQUEST_TYPES.find((r) => r.value === newRequestType);
    setRows((list) => [
      { id: `s${list.length + 1}`, email: newEmail.trim(), name: "—", reason: "manual", scope: "global", addedAt: new Date(0).toISOString(), addedBy: "You", note: req?.label },
      ...list,
    ]);
    toast.success("Suppressed on request — logged for compliance");
    setNewEmail("");
    setAddOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Auto-sync headline — the list maintains itself */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="size-4 text-emerald-600" />
              Automatically maintained
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              This list builds itself. Addresses are added the moment someone unsubscribes, hard-bounces, or reports spam —
              and it stays in two-way sync with the email provider. No one has to add them by hand.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge variant="outline" className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500" /> Synced
            </Badge>
            <span className="text-xs text-muted-foreground">Provider sync · {SUPPRESSION_SYNC.lastSyncedLabel}</span>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => toast.success("Sync started — pulling latest opt-outs")}>
              <RefreshCw className="size-3.5" /> Sync now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPRESSION_SOURCES.map((s) => (
              <div key={s.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{s.label}</p>
                  {s.auto ? (
                    <Badge variant="outline" className="border-0 bg-emerald-500/10 text-[11px] text-emerald-700 dark:text-emerald-400">
                      {s.twoWay ? "Auto · two-way" : "Auto"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-0 bg-muted text-[11px] text-muted-foreground">On request</Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold tabular-nums">+{s.last7d}</span>{" "}
                  <span className="text-muted-foreground">this week</span>
                  <span className="text-muted-foreground"> · {s.total.toLocaleString()} total</span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 text-sm">
        <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
        <span>
          Suppression is <span className="font-medium">enforced on every send</span> — these addresses are skipped on all campaigns,
          sequences, and automations, even if they belong to a targeted segment.
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search email or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={reason} onValueChange={(v) => setReason(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reasons</SelectItem>
            <SelectItem value="unsubscribe">Unsubscribe</SelectItem>
            <SelectItem value="bounce">Bounce</SelectItem>
            <SelectItem value="complaint">Complaint</SelectItem>
            <SelectItem value="manual">On request</SelectItem>
            <SelectItem value="import">Migration import</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => toast.success("Suppression list exported (CSV)")}><Download className="size-4" /> Export</Button>
        <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="size-4" /> Import (migration)</Button>
        <Button variant="outline" onClick={() => setAddOpen(true)}><UserCog className="size-4" /> Suppress on request</Button>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2 text-sm">
          <span>{selected.size} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => removeRows([...selected])}>
              <Trash2 className="size-4" /> Remove
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      <Card className="shadow-none">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={ShieldCheck} title="No suppressed addresses" description="No one matches this filter — everyone here is mailable." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="hidden md:table-cell">Scope</TableHead>
                  <TableHead className="hidden lg:table-cell">Added by</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell><Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} aria-label={`Select ${r.email}`} /></TableCell>
                    <TableCell>
                      <p className="font-medium">{r.email}</p>
                      {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 capitalize", REASON_STYLES[r.reason])}>
                        {r.reason.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {r.scope === "topic" ? `Topic · ${r.topic}` : "Global"}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{r.addedBy}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(r.addedAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" aria-label="Remove" onClick={() => removeRows([r.id])}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Suppress on request — compliance exception only */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suppress on request</DialogTitle>
            <DialogDescription>
              For compliance requests that arrive outside email — a GDPR erasure, a legal do-not-contact,
              or a support ask. Everyday unsubscribes, bounces, and complaints are captured automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid gap-2">
              <Label htmlFor="sup-email">Email address</Label>
              <Input id="sup-email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Request type</Label>
              <Select value={newRequestType} onValueChange={(v) => setNewRequestType(v ?? SUPPRESSION_REQUEST_TYPES[0].value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPRESSION_REQUEST_TYPES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
              This action is written to the compliance log with who added it and why.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={!newEmail.trim()} onClick={addRow}>Suppress</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import — one-time migration only */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import suppression list (migration)</DialogTitle>
            <DialogDescription>
              For one-time migration from another platform. After this, opt-outs flow in automatically —
              you shouldn’t need to import again.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
              <Upload className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Drag a CSV here or click to browse</p>
              <p className="text-xs text-muted-foreground">One email per row · reason column optional</p>
            </div>
            <p className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
              Importing never re-subscribes anyone — addresses already opted out stay suppressed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={() => { setImportOpen(false); toast.success("Import queued — 0 new, 0 duplicates skipped"); }}>Import file</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
