"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ChevronRight,
  MailCheck,
  UserMinusIcon,
  Users,
  Waypoints,
  Workflow,
} from "lucide-react";
import {
  AUTO_TARGETS,
  ENROLL_CONTACTS,
  SEQ_TARGETS,
  contactById,
  targetName,
  type EnrollKind,
} from "@/lib/mock-data/enrollments";
import { countFor, isLive, membershipsOf, useEnrollmentStore } from "@/lib/stores/enrollment-store";
import { cn } from "@/lib/utils";
import { EnrollDialog } from "@/components/marketing/enrollments/enroll-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_TONE: Record<string, string> = {
  active: "text-emerald-600 bg-emerald-500/10",
  paused: "text-amber-600 bg-amber-500/10",
  completed: "text-blue-600 bg-blue-500/10",
  exited: "text-muted-foreground bg-muted",
};
function StatusPill({ s }: { s: string }) {
  return <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium capitalize", STATUS_TONE[s])}>{s}</span>;
}

export function EnrollmentsHub() {
  const rows = useEnrollmentStore((s) => s.rows);
  const unenroll = useEnrollmentStore((s) => s.unenroll);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogFor, setDialogFor] = useState<string[] | null>(null);
  const [drawerContact, setDrawerContact] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string>("");

  const toggle = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSel = selected.size === ENROLL_CONTACTS.length;

  const totals = useMemo(() => {
    const seq = rows.filter((r) => r.kind === "sequence");
    const auto = rows.filter((r) => r.kind === "automation");
    const inSeq = new Set(seq.filter(isLive).map((r) => r.contactId)).size;
    const inAuto = new Set(auto.filter(isLive).map((r) => r.contactId)).size;
    const replied = seq.filter((r) => r.replied).length;
    const seqEnrolled = seq.length;
    return { inSeq, inAuto, replyRate: seqEnrolled ? Math.round((replied / seqEnrolled) * 100) : 0, total: rows.length };
  }, [rows]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Enrollments"
        description="Enroll leads, contacts & customers into sequences or automations — and manage who's in what, with live counts and analytics."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="In a sequence" value={totals.inSeq} icon={Waypoints} subtitle="live enrollments" />
        <StatCard title="In an automation" value={totals.inAuto} icon={Workflow} subtitle="live enrollments" />
        <StatCard title="Total enrollments" value={totals.total} icon={Activity} subtitle="all-time" />
        <StatCard title="Sequence reply rate" value={`${totals.replyRate}%`} icon={MailCheck} trend={{ value: "+4%", positive: true }} />
      </div>

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="sequences">By sequence</TabsTrigger>
          <TabsTrigger value="automations">By automation</TabsTrigger>
        </TabsList>

        {/* ---------- Contacts (with bulk enroll) ---------- */}
        <TabsContent value="contacts" className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-3">
              <Checkbox checked={allSel} onCheckedChange={(c) => setSelected(c ? new Set(ENROLL_CONTACTS.map((x) => x.id)) : new Set())} />
              <span className="text-sm text-muted-foreground">
                {selected.size ? `${selected.size} selected` : "Select contacts to enroll"}
              </span>
            </div>
            <Button size="sm" disabled={!selected.size} onClick={() => setDialogFor([...selected])}>
              <Waypoints className="size-4" /> Enroll{selected.size ? ` ${selected.size}` : ""}…
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="w-10 p-3" />
                  <th className="p-3 font-medium">Contact</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Owner</th>
                  <th className="p-3 font-medium">Sequences</th>
                  <th className="p-3 font-medium">Automations</th>
                  <th className="w-8 p-3" />
                </tr>
              </thead>
              <tbody>
                {ENROLL_CONTACTS.map((c) => {
                  const mem = membershipsOf(rows, c.id).filter(isLive);
                  const seqN = mem.filter((m) => m.kind === "sequence").length;
                  const autoN = mem.filter((m) => m.kind === "automation").length;
                  return (
                    <tr key={c.id} className={cn("border-t transition-colors hover:bg-muted/30", selected.has(c.id) && "bg-primary/5")}>
                      <td className="p-3"><Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggle(c.id)} /></td>
                      <td className="p-3">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email} · {c.company}</p>
                      </td>
                      <td className="p-3"><Badge variant="outline" className="capitalize">{c.type}</Badge></td>
                      <td className="p-3 text-muted-foreground">{c.owner}</td>
                      <td className="p-3">{seqN ? <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">{seqN}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="p-3">{autoN ? <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600">{autoN}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="icon-sm" onClick={() => setDrawerContact(c.id)}><ChevronRight className="size-4" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ---------- By sequence ---------- */}
        <TabsContent value="sequences" className="mt-4 space-y-2">
          {SEQ_TARGETS.map((t) => {
            const c = countFor(rows, "sequence", t.id);
            const open = expanded === `seq-${t.id}`;
            return (
              <div key={t.id} className="rounded-lg border">
                <button onClick={() => setExpanded(open ? "" : `seq-${t.id}`)} className="flex w-full items-center gap-4 p-3.5 text-left hover:bg-muted/30">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600"><Waypoints className="size-4.5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t.type} · goal: {t.goal}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span><b>{c.active}</b> active</span>
                    <span className="text-muted-foreground">{c.completed} done</span>
                    <span className="text-muted-foreground">{c.exited} exited</span>
                    <Badge variant="secondary">{c.total} total</Badge>
                  </div>
                  <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-90")} />
                </button>
                {open && <EnrolledTable rows={rows.filter((r) => r.kind === "sequence" && r.targetId === t.id)} unenroll={unenroll} />}
              </div>
            );
          })}
        </TabsContent>

        {/* ---------- By automation ---------- */}
        <TabsContent value="automations" className="mt-4 space-y-2">
          {AUTO_TARGETS.map((t) => {
            const c = countFor(rows, "automation", t.id);
            const open = expanded === `auto-${t.id}`;
            return (
              <div key={t.id} className="rounded-lg border">
                <button onClick={() => setExpanded(open ? "" : `auto-${t.id}`)} className="flex w-full items-center gap-4 p-3.5 text-left hover:bg-muted/30">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600"><Workflow className="size-4.5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t.object} · when {t.triggerLabel}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span><b>{c.active}</b> active</span>
                    <span className="text-muted-foreground">{c.completed} done</span>
                    <Badge variant="secondary">{c.total} total</Badge>
                  </div>
                  <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-90")} />
                </button>
                {open && <EnrolledTable rows={rows.filter((r) => r.kind === "automation" && r.targetId === t.id)} unenroll={unenroll} />}
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* enroll dialog */}
      <EnrollDialog open={!!dialogFor} onOpenChange={(o) => { if (!o) { setDialogFor(null); setSelected(new Set()); } }} contactIds={dialogFor ?? []} />

      {/* per-contact memberships drawer */}
      <Sheet open={!!drawerContact} onOpenChange={(o) => !o && setDrawerContact(null)}>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          {drawerContact && (() => {
            const c = contactById(drawerContact)!;
            const mem = membershipsOf(rows, drawerContact);
            return (
              <>
                <SheetHeader className="border-b p-4">
                  <SheetTitle>{c.name}</SheetTitle>
                  <p className="text-xs text-muted-foreground">{c.email} · {c.company}</p>
                </SheetHeader>
                <div className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memberships</span>
                    <Button size="sm" variant="outline" onClick={() => setDialogFor([drawerContact])}>Enroll…</Button>
                  </div>
                  {mem.length === 0 && <p className="text-sm text-muted-foreground">Not enrolled in anything yet.</p>}
                  {mem.map((m) => {
                    const bridge = m.kind === "sequence";
                    return (
                      <div key={m.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                        <span className={cn("flex size-8 items-center justify-center rounded-lg", bridge ? "bg-violet-500/10 text-violet-600" : "bg-indigo-500/10 text-indigo-600")}>
                          {bridge ? <Waypoints className="size-4" /> : <Workflow className="size-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{targetName(m.kind, m.targetId)}</p>
                          <p className="text-[11px] text-muted-foreground">{m.step} · {m.enrolledAt}</p>
                        </div>
                        <StatusPill s={m.status} />
                        {isLive(m) && (
                          <Button variant="ghost" size="icon-sm" title="Unenroll" onClick={() => { unenroll(m.id); toast.message("Unenrolled"); }}>
                            <UserMinusIcon className="size-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EnrolledTable({ rows, unenroll }: { rows: ReturnType<typeof membershipsOf>; unenroll: (id: string) => void }) {
  if (!rows.length) return <div className="border-t p-4 text-sm text-muted-foreground">No one enrolled yet.</div>;
  return (
    <div className="border-t">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => {
            const c = contactById(r.contactId);
            return (
              <tr key={r.id} className="border-t first:border-t-0 hover:bg-muted/20">
                <td className="p-2.5 pl-4">
                  <p className="font-medium">{c?.name ?? r.contactId}</p>
                  <p className="text-xs text-muted-foreground">{c?.email}</p>
                </td>
                <td className="p-2.5 text-muted-foreground">{r.step}</td>
                <td className="p-2.5"><StatusPill s={r.status} /></td>
                <td className="p-2.5 text-right text-xs text-muted-foreground">{r.enrolledAt}</td>
                <td className="w-10 p-2.5">
                  {isLive(r) && <Button variant="ghost" size="icon-sm" title="Unenroll" onClick={() => unenroll(r.id)}><UserMinusIcon className="size-4" /></Button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
