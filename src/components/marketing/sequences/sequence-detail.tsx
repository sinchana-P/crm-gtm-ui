"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CheckCircle2,
  Copy,
  DoorOpen,
  LogOut,
  Pause,
  Pencil,
  Play,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { SequenceEnrollment, SequenceEnrollmentState } from "@/lib/types";
import {
  SequenceStatusBadge,
  SequenceTypeBadge,
} from "@/components/marketing/status-badges";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, formatRelative } from "@/lib/format";
import { useSequenceStore } from "@/lib/stores/sequence-store";
import { cn } from "@/lib/utils";
import { SequenceFlowView } from "@/components/marketing/sequences/sequence-flow-view";
import {
  ChannelIcon,
  EXIT_REASON_LABELS,
  senderSummary,
  TRIGGER_META,
  triggerSummary,
} from "@/components/marketing/sequences/sequence-shared";

const growthConfig = {
  active: { label: "Active", color: "var(--chart-1)" },
  completed: { label: "Completed", color: "var(--chart-2)" },
} satisfies ChartConfig;

const STATE_STYLES: Record<SequenceEnrollmentState, string> = {
  active: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  exited: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const EVENT_DOT: Record<string, string> = {
  enrolled: "bg-sky-500",
  sent: "bg-sky-500",
  delivered: "bg-blue-500",
  opened: "bg-amber-500",
  clicked: "bg-violet-500",
  waiting: "bg-muted-foreground",
  branched: "bg-violet-500",
  task_created: "bg-slate-500",
  completed: "bg-emerald-500",
  exited: "bg-orange-500",
};

export function SequenceDetail({ id }: { id: string }) {
  const router = useRouter();
  const sequence = useSequenceStore((s) => s.sequences.find((x) => x.id === id));
  const allEnrollments = useSequenceStore((s) => s.enrollments);
  const setStatus = useSequenceStore((s) => s.setStatus);
  const setArchived = useSequenceStore((s) => s.setArchived);
  const duplicateSequence = useSequenceStore((s) => s.duplicateSequence);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<SequenceEnrollmentState | "all">("all");
  const [selected, setSelected] = useState<SequenceEnrollment | null>(null);

  const enrollments = useMemo(
    () => allEnrollments.filter((e) => e.sequenceId === id),
    [allEnrollments, id]
  );

  const filteredEnrollments = useMemo(() => {
    const q = search.toLowerCase();
    return enrollments.filter((e) => {
      if (stateFilter !== "all" && e.state !== stateFilter) return false;
      if (q && !e.contactName.toLowerCase().includes(q) && !e.email.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [enrollments, search, stateFilter]);

  const growth = useMemo(() => {
    if (!sequence) return [];
    const active = sequence.activeCount ?? 0;
    const completed = sequence.completed;
    return Array.from({ length: 6 }, (_, i) => {
      const r = 0.5 + (i * 0.5) / 5;
      const date = new Date(2026, 5, 1 + i * 6);
      return {
        label: format(date, "MMM d"),
        active: Math.round(active * (0.6 + (i * 0.4) / 5)),
        completed: Math.round(completed * r),
      };
    });
  }, [sequence]);

  if (!sequence) {
    return (
      <EmptyState
        title="Sequence not found"
        description="This sequence may have been deleted."
        action={
          <Button variant="outline" onClick={() => router.push("/marketing/sequences")}>
            <ArrowLeft className="size-4" />
            Back to sequences
          </Button>
        }
      />
    );
  }

  const active = sequence.activeCount ?? 0;
  const exited = sequence.exitedCount ?? 0;
  const replyRate = sequence.enrolled > 0 ? ((sequence.replied / sequence.enrolled) * 100).toFixed(1) : "0.0";
  const completionRate = sequence.enrolled > 0 ? ((sequence.completed / sequence.enrolled) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-border pb-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => router.push("/marketing/sequences")}
        >
          <ArrowLeft className="size-4" />
          Sequences
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <ChannelIcon channel={sequence.channel} className="size-5" />
              <h1 className="text-2xl font-semibold tracking-tight">{sequence.name}</h1>
              <SequenceStatusBadge status={sequence.status} />
              <SequenceTypeBadge type={sequence.type} />
              {sequence.archived && (
                <span className="text-xs font-medium text-muted-foreground">(Archived)</span>
              )}
            </div>
            {sequence.description && (
              <p className="max-w-3xl text-sm text-muted-foreground">{sequence.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Owner: {sequence.owner ?? "—"} · {sequence.steps} steps · Sends from{" "}
              {sequence.sender?.mode === "rep_inbox" ? "rep inbox" : "marketing address"}
              {sequence.updatedAt ? ` · updated ${formatRelative(sequence.updatedAt)}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {sequence.status === "active" ? (
              <Button variant="outline" onClick={() => { setStatus(id, "paused"); toast.success("Sequence paused"); }}>
                <Pause className="size-4" />
                Pause
              </Button>
            ) : (
              <Button onClick={() => { setStatus(id, "active"); toast.success("Sequence activated"); }}>
                <Play className="size-4" />
                {sequence.status === "draft" ? "Activate" : "Resume"}
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push(`/marketing/sequences/${id}/edit`)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                duplicateSequence(id);
                toast.success("Sequence duplicated");
              }}
            >
              <Copy className="size-4" />
              Duplicate
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setArchived(id, !sequence.archived);
                toast.success(sequence.archived ? "Sequence restored" : "Sequence archived");
              }}
            >
              {sequence.archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
              {sequence.archived ? "Restore" : "Archive"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments ({enrollments.length})</TabsTrigger>
          <TabsTrigger value="flow">Flow</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MiniStat icon={UserPlus} label="Enrolled" value={sequence.enrolled.toLocaleString()} />
            <MiniStat icon={Users} label="Active now" value={active.toLocaleString()} />
            <MiniStat icon={CheckCircle2} label="Completed" value={sequence.completed.toLocaleString()} hint={`${completionRate}%`} />
            <MiniStat icon={LogOut} label="Exited" value={exited.toLocaleString()} />
            <MiniStat icon={DoorOpen} label="Reply rate" value={`${replyRate}%`} hint={`${sequence.replied.toLocaleString()} replies`} />
          </div>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Enrollment breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <FunnelBar
                segments={[
                  { label: "Active", value: active, className: "bg-amber-500" },
                  { label: "Completed", value: sequence.completed, className: "bg-emerald-500" },
                  { label: "Exited", value: exited, className: "bg-slate-400" },
                ]}
                total={Math.max(sequence.enrolled, active + sequence.completed + exited, 1)}
              />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Enrollment over time</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={growthConfig} className="h-[220px] w-full">
                <LineChart data={growth}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="active" stroke="var(--color-active)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Step performance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Send, open, click, and continuation counts per step.
              </p>
            </CardHeader>
            <CardContent>
              {sequence.flow && sequence.flow.length > 0 ? (
                <SequenceFlowView flow={sequence.flow} />
              ) : (
                <p className="text-sm text-muted-foreground">No steps defined.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments" className="mt-6 space-y-4">
          {enrollments.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No enrollments yet"
              description="Once contacts enter this sequence, their per-step progress appears here."
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search enrollments…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={stateFilter} onValueChange={(v) => setStateFilter((v as typeof stateFilter) ?? "all")}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All states</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="exited">Exited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Card className="shadow-none">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Current / exit</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEnrollments.map((e) => (
                        <TableRow key={e.id} className="cursor-pointer" onClick={() => setSelected(e)}>
                          <TableCell>
                            <p className="font-medium">{e.contactName}</p>
                            <p className="text-xs text-muted-foreground">{e.email}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("border-0 capitalize", STATE_STYLES[e.state])}>
                              {e.state}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {e.state === "active"
                              ? e.currentStepLabel ?? "—"
                              : e.state === "exited"
                                ? EXIT_REASON_LABELS[e.exitReason ?? "manual"]
                                : "Reached goal"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {TRIGGER_META[e.source]?.label ?? e.source}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatRelative(e.updatedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="flow" className="mt-6">
          {sequence.flow && sequence.flow.length > 0 ? (
            <SequenceFlowView flow={sequence.flow} />
          ) : (
            <p className="text-sm text-muted-foreground">No steps defined.</p>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Sending identity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <ChannelIcon channel="email" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {sequence.sender?.mode === "rep_inbox" ? "Rep's inbox (1:1)" : "Marketing address (bulk)"}
                  </p>
                  <p className="text-xs text-muted-foreground">{senderSummary(sequence.sender)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Enrollment triggers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(sequence.triggers ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No triggers configured.</p>
              ) : (
                (sequence.triggers ?? []).map((t) => {
                  const Meta = TRIGGER_META[t.type];
                  return (
                    <div key={t.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                        <Meta.icon className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{Meta.label}</p>
                        <p className="text-xs text-muted-foreground">{triggerSummary(t)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Exit & re-enrollment rules</CardTitle>
            </CardHeader>
            <CardContent>
              {sequence.exit ? (
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <SettingItem label="Pause on reply" value={sequence.exit.pauseOnReply ? "On" : "Off"} />
                  <SettingItem
                    label="Goal exit"
                    value={sequence.exit.goalEnabled ? (sequence.exit.goalCondition ?? "On") : "Off"}
                  />
                  <SettingItem
                    label="Suppression segment"
                    value={sequence.exit.suppressionSegmentId ? "Configured" : "None"}
                  />
                  <SettingItem
                    label="Unenroll on segment exit"
                    value={sequence.exit.unenrollOnSegmentExit ? "On" : "Off"}
                  />
                  <SettingItem
                    label="Re-enrollment"
                    value={
                      sequence.exit.reEnrollment === "cooldown"
                        ? `After ${sequence.exit.reEnrollCooldownDays ?? 30} days`
                        : sequence.exit.reEnrollment === "always"
                          ? "Every time they qualify"
                          : "Never"
                    }
                  />
                  <SettingItem
                    label="One active per contact"
                    value={sequence.exit.oneActivePerContact ? "On" : "Off"}
                  />
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">Default exit rules.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.contactName}</SheetTitle>
                <SheetDescription>
                  {selected.email} · {sequence.name}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 px-4 pb-8">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("border-0 capitalize", STATE_STYLES[selected.state])}>
                    {selected.state}
                  </Badge>
                  {selected.state === "exited" && (
                    <span className="text-xs text-muted-foreground">
                      {EXIT_REASON_LABELS[selected.exitReason ?? "manual"]}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Enrolled {formatRelative(selected.enrolledAt)}
                  </span>
                </div>
                <div className="relative space-y-0 pl-4">
                  <div className="absolute top-1 bottom-1 left-[5px] w-px bg-border" />
                  {selected.events.map((ev) => (
                    <div key={ev.id} className="relative pb-5 last:pb-0">
                      <span
                        className={cn(
                          "absolute top-1 -left-4 size-2.5 rounded-full ring-2 ring-background",
                          EVENT_DOT[ev.outcome] ?? "bg-muted-foreground"
                        )}
                      />
                      <div className="pl-2">
                        <p className="text-sm font-medium">{ev.stepLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="capitalize">{ev.outcome.replace("_", " ")}</span> ·{" "}
                          {formatDateTime(ev.at)}
                        </p>
                        {ev.detail && <p className="mt-0.5 text-xs text-muted-foreground">{ev.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className="size-3.5 text-muted-foreground" />
        </div>
        <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function FunnelBar({
  segments,
  total,
}: {
  segments: { label: string; value: number; className: string }[];
  total: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <div
            key={s.label}
            className={cn("h-full", s.className)}
            style={{ width: `${(s.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className={cn("size-2.5 rounded-full", s.className)} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-medium tabular-nums">{s.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
