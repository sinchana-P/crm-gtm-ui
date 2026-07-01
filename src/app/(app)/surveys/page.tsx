"use client";

import { useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  ExternalLink,
  FileUp,
  GitBranch,
  Link2,
  Plus,
  Send,
} from "lucide-react";
import { CustomerJourneyDiagram } from "@/components/outreach/customer-journey-diagram";
import { SendDocumentRequestDialog } from "@/components/outreach/send-document-request-dialog";
import { SendSurveyDialog } from "@/components/outreach/send-survey-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatRelative } from "@/lib/format";
import {
  DOCUMENT_REQUEST_TEMPLATES,
  MOCK_OUTREACH_DISPATCHES,
  MOCK_SURVEYS,
} from "@/lib/mock-data";
import type { OutreachDispatchStatus } from "@/lib/types";

const DISPATCH_STATUS: Record<
  OutreachDispatchStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "outline",
  sent: "secondary",
  opened: "default",
  in_progress: "default",
  completed: "outline",
  expired: "destructive",
  bounced: "destructive",
};

export default function SurveysPage() {
  const [selectedId, setSelectedId] = useState(MOCK_SURVEYS[0]?.id ?? "");
  const [docRequestOpen, setDocRequestOpen] = useState(false);
  const [surveySendOpen, setSurveySendOpen] = useState(false);
  const [surveySendId, setSurveySendId] = useState<string | undefined>();

  const selected = MOCK_SURVEYS.find((s) => s.id === selectedId);
  const docDispatches = MOCK_OUTREACH_DISPATCHES.filter((d) => d.type === "document_request");
  const surveyDispatches = MOCK_OUTREACH_DISPATCHES.filter((d) => d.type === "survey");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Surveys & customer outreach"
        description="Design feedback flows, request documents from customers, and track magic-link deliveries — admin and rep use the same tools."
        actions={
          <>
            <Button variant="outline" onClick={() => setSurveySendOpen(true)}>
              <Send className="size-4" />
              Send survey
            </Button>
            <Button onClick={() => setDocRequestOpen(true)}>
              <FileUp className="size-4" />
              Request documents
            </Button>
          </>
        }
      />

      <CustomerJourneyDiagram />

      <Tabs defaultValue="flows">
        <TabsList>
          <TabsTrigger value="flows">Survey flows</TabsTrigger>
          <TabsTrigger value="dispatches">
            Outbound log
            <Badge variant="secondary" className="ml-2">
              {MOCK_OUTREACH_DISPATCHES.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="documents">Document collection</TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="mt-6 space-y-6">
          {MOCK_SURVEYS.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No survey flows"
              description="Create a survey to collect NPS and CSAT feedback from contacts."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-border">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <p className="text-sm font-medium">Active flows</p>
                  <Button variant="ghost" size="sm">
                    <Plus className="size-4" />
                    New flow
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead>NPS</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_SURVEYS.map((survey) => (
                      <TableRow
                        key={survey.id}
                        className="cursor-pointer"
                        data-state={selectedId === survey.id ? "selected" : undefined}
                        onClick={() => setSelectedId(survey.id)}
                      >
                        <TableCell className="font-medium">{survey.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{survey.status}</Badge>
                        </TableCell>
                        <TableCell>{survey.responses.toLocaleString()}</TableCell>
                        <TableCell>
                          {survey.nps != null ? (
                            <span className="font-medium">{survey.nps}</span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {survey.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSurveySendId(survey.id);
                                setSurveySendOpen(true);
                              }}
                            >
                              Send
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selected ? (
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GitBranch className="size-4" />
                      {selected.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selected.trigger ? (
                      <div className="rounded-lg border border-dashed p-3 text-sm">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Automation trigger
                        </p>
                        <p className="mt-1">{selected.trigger}</p>
                      </div>
                    ) : null}

                    <div className="rounded-lg border border-border p-4 text-center text-sm">
                      NPS question: How likely are you to recommend us?
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                        <p className="mb-2 text-xs font-medium uppercase text-emerald-700 dark:text-emerald-400">
                          Promoter path (9–10)
                        </p>
                        <p className="text-sm">{selected.promoterPath}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <ArrowRight className="size-3" />
                          Referral + upsell
                        </div>
                      </div>
                      <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/20">
                        <p className="mb-2 text-xs font-medium uppercase text-red-700 dark:text-red-400">
                          Detractor path (0–6)
                        </p>
                        <p className="text-sm">{selected.detractorPath}</p>
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <ArrowRight className="size-3" />
                          Case + escalation
                        </div>
                      </div>
                    </div>

                    {selected.followUpAction ? (
                      <p className="text-xs text-muted-foreground">
                        Auto follow-up: {selected.followUpAction}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      {selected.channels.map((ch) => (
                        <Badge key={ch} variant="secondary">
                          {ch}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dispatches" className="mt-6 space-y-6">
          <DispatchTable
            title="Document requests"
            rows={docDispatches}
            emptyLabel="No document requests sent yet."
          />
          <DispatchTable
            title="Survey invitations"
            rows={surveyDispatches}
            emptyLabel="No surveys sent manually yet."
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {DOCUMENT_REQUEST_TEMPLATES.map((tpl) => (
              <Card key={tpl.id} className="shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{tpl.name}</CardTitle>
                  <Badge variant="outline" className="w-fit capitalize">
                    {tpl.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{tpl.description}</p>
                  <p className="text-xs">
                    {tpl.items.length} items · TTL {tpl.defaultTtlDays}d ·{" "}
                    {tpl.defaultChannels.join(", ")}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setDocRequestOpen(true)}
                  >
                    Use template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Active document requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DispatchTable rows={docDispatches} embedded />
            </CardContent>
          </Card>

          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Preview customer experience</p>
            <p className="mt-1">
              Open the magic-link upload page your customers see when they click the email
              or WhatsApp link.
            </p>
            <ButtonLink
              href="/portal/upload/vk-onboard-ananya"
              variant="outline"
              size="sm"
              className="mt-3"
              target="_blank"
            >
              <ExternalLink className="size-4" />
              Sample upload link
            </ButtonLink>
          </div>
        </TabsContent>
      </Tabs>

      <SendDocumentRequestDialog open={docRequestOpen} onOpenChange={setDocRequestOpen} />
      <SendSurveyDialog
        open={surveySendOpen}
        onOpenChange={(o) => {
          setSurveySendOpen(o);
          if (!o) setSurveySendId(undefined);
        }}
        surveyId={surveySendId}
      />
    </div>
  );
}

function DispatchTable({
  title,
  rows,
  emptyLabel,
  embedded,
}: {
  title?: string;
  rows: typeof MOCK_OUTREACH_DISPATCHES;
  emptyLabel?: string;
  embedded?: boolean;
}) {
  if (rows.length === 0 && emptyLabel) {
    return (
      <EmptyState icon={Send} title={title ?? "No dispatches"} description={emptyLabel} />
    );
  }

  const table = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contact</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Channels</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <p className="font-medium">{row.contactName}</p>
              <p className="text-xs text-muted-foreground">{row.contactEmail}</p>
            </TableCell>
            <TableCell>
              <p className="text-sm">{row.subject}</p>
              <p className="text-xs text-muted-foreground">
                {row.templateName ?? row.surveyName}
              </p>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {row.channels.map((ch) => (
                  <Badge key={ch} variant="secondary" className="text-[10px]">
                    {ch}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={DISPATCH_STATUS[row.status]} className="capitalize">
                {row.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>
              {row.progress ? (
                <div className="w-24 space-y-1">
                  <Progress
                    value={(row.progress.completed / row.progress.total) * 100}
                    className="h-1.5"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {row.progress.completed}/{row.progress.total}
                  </p>
                </div>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {formatRelative(row.sentAt)}
              <br />
              <span className="text-[10px]">by {row.sentBy}</span>
            </TableCell>
            <TableCell>
              {row.type === "document_request" ? (
                <ButtonLink
                  href={`/portal/upload/${row.magicLinkToken}`}
                  variant="ghost"
                  size="sm"
                  target="_blank"
                >
                  <Link2 className="size-4" />
                </ButtonLink>
              ) : (
                <ButtonLink href="/portal/surveys" variant="ghost" size="sm" target="_blank">
                  <ExternalLink className="size-4" />
                </ButtonLink>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (embedded) return table;

  return (
    <div className="space-y-3">
      {title ? <h3 className="text-sm font-semibold">{title}</h3> : null}
      <div className="rounded-lg border">{table}</div>
    </div>
  );
}
