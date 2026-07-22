"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  GitMerge,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Send,
  ShieldAlert,
  Undo2,
  UserRound,
} from "lucide-react";
import { getContactById } from "@/lib/mock-data";
import { getRecordHref } from "@/lib/record-routes";
import { getCasesForContactCm } from "@/lib/mock-data/case-manager";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { formatDateTime, formatRelative } from "@/lib/format";
import {
  CM_CASE_LIFECYCLE,
  type CmCaseStatus,
  type CmTimelineType,
} from "@/lib/types/case-manager";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import {
  CaseStatusBadge,
  PriorityBadge,
  SlaBadge,
  SourceBadge,
} from "@/components/case-manager/cm-status-badges";
import {
  EscalateDialog,
  HandbackDialog,
  ResolveDialog,
} from "@/components/case-manager/case-action-dialogs";

const timelineIcon: Record<CmTimelineType, typeof Clock> = {
  created: FileText,
  assignment: UserRound,
  status: RefreshCw,
  comment: MessageSquare,
  sla: Clock,
  escalation: ArrowUpCircle,
  resolved: CheckCircle2,
  document: Paperclip,
  handback: Undo2,
  sync: GitMerge,
};

const ASSIGNEES = ["Karthik N", "Neha Reddy", "Arjun Mehta", "Support Tier 1", "Support Tier 2", "Finance Queue", "Onboarding Team"];

export function CaseDetail({ caseId, backHref }: { caseId: string; backHref: string }) {
  const c = useCaseManagerStore((s) => s.cases.find((x) => x.id === caseId));
  const contactEvents = useCaseManagerStore((s) => s.contactEvents);
  const updateStatus = useCaseManagerStore((s) => s.updateCaseStatus);
  const reassign = useCaseManagerStore((s) => s.reassignCase);
  const addComment = useCaseManagerStore((s) => s.addComment);

  const [comment, setComment] = useState("");
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [handbackOpen, setHandbackOpen] = useState(false);

  // Keep case-to-case links within the active shell (CRM vs back office).
  const caseBase = backHref.endsWith("/list") ? backHref.slice(0, -5) : backHref;

  if (!c) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Case not found"
        description="This case may have been closed or does not exist."
        action={<Link href={backHref} className="text-sm font-medium text-primary hover:underline">Back to cases</Link>}
      />
    );
  }

  const stageIndex = CM_CASE_LIFECYCLE.indexOf(c.status);
  const isClosed = c.status === "Closed" || c.status === "Resolved";
  const comments = c.timeline.filter((e) => e.type === "comment");

  const handleStage = (target: CmCaseStatus) => {
    if (target === "Resolved") return setResolveOpen(true);
    updateStatus(c.id, target);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-3">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Cases
        </Link>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{c.displayId}</span>
              <SourceBadge source={c.source} />
              {c.sourceRef && <span className="text-xs text-muted-foreground">from {c.sourceRef}</span>}
              {c.escalationTier && (
                <Badge variant="outline" className="border-orange-500/30 text-orange-600">
                  Tier {c.escalationTier}
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-semibold tracking-tight">{c.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <CaseStatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
              <SlaBadge status={c.slaStatus} />
              <span className="text-xs text-muted-foreground">
                {c.projectName} · {c.queueName}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm">Assign: {c.assignee} <ChevronDown className="size-3.5" /></Button>} />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Reassign to</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {ASSIGNEES.map((a) => (
                  <DropdownMenuItem key={a} onClick={() => reassign(c.id, a)}>
                    {a === c.assignee && <Check className="size-4" />}
                    {a}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {!isClosed && (
              <Button variant="outline" size="sm" onClick={() => setEscalateOpen(true)}>
                <ArrowUpCircle className="size-4" /> Escalate
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setHandbackOpen(true)}>
              <Undo2 className="size-4" /> Hand back
            </Button>
            {!isClosed && (
              <Button size="sm" onClick={() => setResolveOpen(true)}>
                <CheckCircle2 className="size-4" /> Resolve
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lifecycle stepper */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center">
            {CM_CASE_LIFECYCLE.map((stage, i) => {
              const done = i < stageIndex;
              const current = i === stageIndex;
              const clickable = i === stageIndex + 1 && !isClosed;
              return (
                <div key={stage} className="flex flex-1 items-center last:flex-none">
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => clickable && handleStage(stage)}
                    className={cn(
                      "flex items-center gap-2",
                      clickable && "cursor-pointer",
                      !clickable && "cursor-default"
                    )}
                    title={clickable ? `Advance to ${stage}` : undefined}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                        done && "bg-primary text-primary-foreground",
                        current && "border-2 border-primary text-primary",
                        !done && !current && "border border-border text-muted-foreground",
                        clickable && "ring-2 ring-primary/20 hover:bg-primary/10"
                      )}
                    >
                      {done ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className={cn("hidden text-sm sm:inline", current ? "font-medium" : "text-muted-foreground")}>
                      {stage}
                    </span>
                  </button>
                  {i < CM_CASE_LIFECYCLE.length - 1 && (
                    <span className={cn("mx-2 h-px flex-1", done ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>
          {!isClosed && stageIndex + 1 < CM_CASE_LIFECYCLE.length && (
            <p className="mt-2 text-xs text-muted-foreground">
              Click the next stage to advance, or use Resolve to close with a customer sync.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b bg-transparent">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="journey">Journey</TabsTrigger>
              <TabsTrigger value="contact">Contact 360</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{c.description}</p></CardContent>
              </Card>
              {c.customFields.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Case fields</CardTitle></CardHeader>
                  <CardContent>
                    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {c.customFields.map((f) => (
                        <div key={f.label}>
                          <dt className="text-xs text-muted-foreground">{f.label}</dt>
                          <dd className="text-sm font-medium">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="journey" className="mt-4">
              <Card>
                <CardContent className="py-4">
                  <ol className="space-y-4">
                    {[...c.timeline].reverse().map((e) => {
                      const Icon = timelineIcon[e.type];
                      return (
                        <li key={e.id} className="flex gap-3">
                          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Icon className="size-3.5 text-muted-foreground" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{e.title}</p>
                            {e.body && <p className="text-sm text-muted-foreground">{e.body}</p>}
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {e.actor} · {formatRelative(e.createdAt)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-4 space-y-4">
              {c.clientIds.length === 0 ? (
                <EmptyState icon={UserRound} title="No linked contact" description="This case is not linked to a CRM contact yet." />
              ) : (
                c.clientIds.map((cid) => {
                  const contact = getContactById(cid);
                  if (!contact) return null;
                  const otherCases = getCasesForContactCm(cid).filter((x) => x.id !== c.id);
                  const events = contactEvents[cid] ?? [];
                  return (
                    <Card key={cid}>
                      <CardHeader className="flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm">Connect CRM · Contact 360</CardTitle>
                        <Link href={getRecordHref(contact)} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          Open in CRM <ExternalLink className="size-3" />
                        </Link>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarFallback>{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{contact.firstName} {contact.lastName}</p>
                            <p className="text-xs text-muted-foreground">{contact.title} · {contact.company}</p>
                          </div>
                          <Badge variant="secondary" className="ml-auto capitalize">{contact.lifecycleStage}</Badge>
                        </div>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                          <Meta label="Owner" value={contact.owner} />
                          <Meta label="Territory" value={contact.territory} />
                          <Meta label="Health" value={`${contact.healthScore ?? "—"}`} />
                          <Meta label="Lead score" value={`${contact.leadScore ?? "—"}`} />
                        </dl>
                        {otherCases.length > 0 && (
                          <div>
                            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Other cases for this contact</p>
                            <div className="space-y-1.5">
                              {otherCases.map((oc) => (
                                <Link key={oc.id} href={`${caseBase}/${oc.id}`} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50">
                                  <span className="font-mono text-xs text-muted-foreground">{oc.displayId}</span>
                                  <span className="flex-1 truncate">{oc.title}</span>
                                  <CaseStatusBadge status={oc.status} />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {events.length > 0 && (
                          <div>
                            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Recent 360 activity (synced to CRM)</p>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {events.slice(0, 4).map((e) => (
                                <li key={e.id}>• {e.title} — {formatRelative(e.createdAt)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardContent className="py-4">
                  {c.documents.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No documents attached.</p>
                  ) : (
                    <ul className="divide-y">
                      {c.documents.map((d) => (
                        <li key={d.id} className="flex items-center gap-3 py-2.5">
                          <FileText className="size-4 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.type} · {d.size} · {d.uploadedBy}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatRelative(d.uploadedAt)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardContent className="py-4">
                  {c.tasks.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No tasks on this case.</p>
                  ) : (
                    <ul className="space-y-2">
                      {c.tasks.map((t) => (
                        <li key={t.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
                          <span className={cn("flex size-5 items-center justify-center rounded-full border", t.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-border")}>
                            {t.done && <Check className="size-3" />}
                          </span>
                          <span className={cn("flex-1 text-sm", t.done && "text-muted-foreground line-through")}>{t.title}</span>
                          <span className="text-xs text-muted-foreground">{t.assignee}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-4 space-y-3">
              <Card>
                <CardContent className="space-y-3 py-4">
                  <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add an internal comment…" />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      disabled={!comment.trim()}
                      onClick={() => {
                        addComment(c.id, comment.trim());
                        setComment("");
                      }}
                    >
                      <Send className="size-3.5" /> Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {comments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                [...comments].reverse().map((e) => (
                  <Card key={e.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6"><AvatarFallback className="text-[10px]">{e.actor.split(" ").map((n) => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                        <span className="text-sm font-medium">{e.actor}</span>
                        <span className="text-xs text-muted-foreground">{formatRelative(e.createdAt)}</span>
                      </div>
                      <p className="mt-1.5 pl-8 text-sm">{e.body}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Side rail */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-2.5 text-sm">
                <Meta label="Case type" value={c.caseType} />
                <Meta label="Project" value={c.projectName} />
                <Meta label="Queue" value={c.queueName} />
                <Meta label="Assignee" value={c.assignee} />
                <Meta label="Watchers" value={c.watchers.length ? c.watchers.join(", ") : "—"} />
                <Meta label="SLA due" value={formatDateTime(c.slaDue)} />
                <Meta label="Created" value={formatDateTime(c.createdAt)} />
                <Meta label="Updated" value={formatRelative(c.updatedAt)} />
                {c.csatScore ? <Meta label="CSAT" value={`${c.csatScore}/5`} /> : null}
                {c.handbackRef ? <Meta label="Handback" value={c.handbackRef} /> : null}
              </dl>
            </CardContent>
          </Card>

          {c.clientIds.map((cid) => {
            const contact = getContactById(cid);
            if (!contact) return null;
            return (
              <Card key={cid} className="border-primary/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Linked contact</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserRound className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{contact.firstName} {contact.lastName}</span>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Building2 className="size-3" /> {contact.company}</p>
                  <Link href={getRecordHref(contact)} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    Open Contact 360 <ExternalLink className="size-3" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <EscalateDialog case={c} open={escalateOpen} onOpenChange={setEscalateOpen} />
      <ResolveDialog case={c} open={resolveOpen} onOpenChange={setResolveOpen} />
      <HandbackDialog case={c} open={handbackOpen} onOpenChange={setHandbackOpen} />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
