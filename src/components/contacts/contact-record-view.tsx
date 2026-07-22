"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  ClipboardList,
  FileText,
  FileUp,
  List,
  Mail,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Phone,
  StickyNote,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import type { ActivityItem, ContactRecord } from "@/lib/types";
import {
  getActivitiesForContact,
  getContactById,
  MOCK_DOCUMENTS,
  MOCK_ENVELOPES,
  MOCK_LISTS,
} from "@/lib/mock-data";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { ConvertToCaseWizard } from "@/components/case-manager/convert-to-case-wizard";
import {
  CaseStatusBadge,
  SlaBadge as CmSlaBadge,
} from "@/components/case-manager/cm-status-badges";
import {
  getRecordEntityLabel,
  getRecordListHref,
  type RecordEntityType,
} from "@/lib/record-routes";
import { usePluginStore } from "@/lib/stores/plugin-store";
import { getNavIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { AiRecordBrief } from "@/components/contacts/ai-record-brief";
import { ConvertLeadDialog } from "@/components/contacts/convert-lead-dialog";
import { RecordProfileLayout } from "@/components/contacts/record-profile-layout";
import { SendDocumentRequestDialog } from "@/components/outreach/send-document-request-dialog";
import { SendSurveyDialog } from "@/components/outreach/send-survey-dialog";
import { SendWhatsAppDialog } from "@/components/whatsapp/send-whatsapp-dialog";
import { HealthBadge } from "@/components/shared/health-badge";
import { LifecycleBadge } from "@/components/shared/lifecycle-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ACTIVITY_FILTERS = [
  { value: "all", label: "All activity" },
  { value: "note", label: "Notes" },
  { value: "email", label: "Email" },
  { value: "call", label: "Calls" },
  { value: "case", label: "Cases" },
  { value: "esign", label: "E-sign" },
  { value: "campaign", label: "Campaigns" },
] as const;

type ActivityFilter = (typeof ACTIVITY_FILTERS)[number]["value"];

const QUICK_ACTIONS = [
  { id: "note", label: "Note", icon: StickyNote },
  { id: "email", label: "Email", icon: Mail },
  { id: "call", label: "Call", icon: Phone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "task", label: "Task", icon: Calendar },
  { id: "meeting", label: "Meeting", icon: Calendar },
] as const;

interface ContactRecordViewProps {
  contact: ContactRecord;
  entityType?: RecordEntityType;
}

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value}</p>
    </div>
  );
}

function ConsentRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <Badge
        variant="outline"
        className={cn(
          enabled
            ? "border-foreground/20 bg-foreground/5"
            : "text-muted-foreground"
        )}
      >
        {enabled ? "Opted in" : "Opted out"}
      </Badge>
    </div>
  );
}

function TimelineList({
  activities,
  filter,
}: {
  activities: ActivityItem[];
  filter: ActivityFilter;
}) {
  const filtered = useMemo(
    () =>
      filter === "all"
        ? activities
        : activities.filter((item) => item.type === filter),
    [activities, filter]
  );

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No activity matches this filter.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {filtered.map((item) => {
        const Icon = getNavIcon(
          item.type === "email"
            ? "Mail"
            : item.type === "call"
              ? "Phone"
              : item.type === "case"
                ? "LifeBuoy"
                : item.type === "esign"
                  ? "PenLine"
                  : item.type === "campaign"
                    ? "Megaphone"
                    : "FileText"
        );

        return (
          <li
            key={item.id}
            className="flex gap-3 rounded-lg border bg-card p-3"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{item.title}</p>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {format(new Date(item.createdAt), "MMM d, h:mm a")}
                </time>
              </div>
              {item.body ? (
                <p className="text-sm text-muted-foreground">{item.body}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                by {item.createdBy}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function RecentInteractions({
  activities,
  contact,
}: {
  activities: ActivityItem[];
  contact: ContactRecord;
}) {
  const inbound = activities.filter(
    (a) => a.type === "email" || a.type === "call" || a.type === "note"
  );
  const outbound = activities.filter(
    (a) =>
      a.type === "campaign" ||
      a.type === "email" ||
      a.type === "call" ||
      a.type === "meeting"
  );

  const handleCreateEmail = () => {
    toast.success(`Email composer opened for ${contact.firstName}`);
  };

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">
          Recent interactions
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handleCreateEmail}>
          <Mail className="size-4" />
          Create an email
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Inbound
            </p>
            {inbound.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                <Mail className="mb-2 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No inbound messages yet
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {inbound.slice(0, 4).map((item) => (
                  <li
                    key={item.id}
                    className="rounded-md border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeShort(item.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Outbound
            </p>
            {outbound.length === 0 ? (
              <p className="text-sm text-muted-foreground">No outbound yet.</p>
            ) : (
              <ol className="relative space-y-3 border-l border-border pl-4">
                {outbound.slice(0, 5).map((item) => (
                  <li key={item.id} className="relative">
                    <span className="absolute -left-[1.35rem] top-1 size-2 rounded-full bg-foreground" />
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeShort(item.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatRelativeShort(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

function AssociationPanel({
  title,
  count,
  onAdd,
  children,
  defaultOpen,
}: {
  title: string;
  count?: number;
  onAdd?: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, "-")}>
      <div className="flex items-center gap-2">
        <AccordionTrigger className="flex-1 py-3 hover:no-underline">
          <span className="text-sm font-medium">
            {title}
            {count !== undefined ? (
              <span className="ml-1 text-muted-foreground">({count})</span>
            ) : null}
          </span>
        </AccordionTrigger>
        {onAdd ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            <UserPlus className="size-4" />
          </Button>
        ) : null}
      </div>
      <AccordionContent className="pb-3">{children}</AccordionContent>
    </AccordionItem>
  );
}

export function ContactRecordView({
  contact,
  entityType = contact.type,
}: ContactRecordViewProps) {
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [aiQuestion, setAiQuestion] = useState("");
  const [convertOpen, setConvertOpen] = useState(false);
  const [docRequestOpen, setDocRequestOpen] = useState(false);
  const [surveySendOpen, setSurveySendOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const isCasesEnabled = usePluginStore((s) => s.isEnabled("cases"));
  const isEsignEnabled = usePluginStore((s) => s.isEnabled("esign"));
  const isMarketingEnabled = usePluginStore((s) => s.isEnabled("marketing"));

  const [caseWizardOpen, setCaseWizardOpen] = useState(false);
  const allCmCases = useCaseManagerStore((s) => s.cases);
  const contactEventsMap = useCaseManagerStore((s) => s.contactEvents);
  const cmCases = useMemo(
    () => allCmCases.filter((c) => c.clientIds.includes(contact.id)),
    [allCmCases, contact.id]
  );
  const cmContactEvents = useMemo(
    () => contactEventsMap[contact.id] ?? [],
    [contactEventsMap, contact.id]
  );

  const activities = getActivitiesForContact(contact.id);
  const cases = cmCases;
  const envelopes = MOCK_ENVELOPES.filter((e) => e.contactId === contact.id);
  const documents = MOCK_DOCUMENTS.filter((d) => d.contactId === contact.id);

  const entityLabel = getRecordEntityLabel(entityType);
  const listHref = getRecordListHref(entityType);

  const handleQuickAction = (action: string) => {
    if (action === "Case creation") {
      setCaseWizardOpen(true);
      return;
    }
    if (action === "Request documents") {
      setDocRequestOpen(true);
      return;
    }
    if (action === "Send survey") {
      setSurveySendOpen(true);
      return;
    }
    if (action === "WhatsApp") {
      setWhatsappOpen(true);
      return;
    }
    toast.success(`${action} queued for ${contact.firstName} ${contact.lastName}`);
  };

  const handleAskAi = () => {
    if (!aiQuestion.trim()) return;
    toast.success("AI insight generated from your question.");
    setAiQuestion("");
  };

  const keyFields = [
    { label: "Email", value: contact.email },
    { label: "Phone", value: contact.phone },
    { label: "Owner", value: contact.owner },
    { label: "Source", value: contact.source },
    {
      label: entityType === "lead" ? "Lead status" : "Lifecycle stage",
      value: contact.lifecycleStage.toUpperCase(),
    },
    { label: "Lead score", value: String(contact.leadScore) },
    { label: "Health score", value: String(contact.healthScore) },
    { label: "Territory", value: contact.territory ?? "—" },
    { label: "Create date", value: format(new Date(contact.createdAt), "MMM d, yyyy") },
    { label: "Last activity", value: contact.lastActivity },
    ...(contact.nextActivity
      ? [{ label: "Next activity", value: contact.nextActivity }]
      : []),
  ];

  const defaultAccordion = [
    contact.company ? "company" : null,
    isCasesEnabled ? "cases" : null,
    isEsignEnabled ? "e-sign" : null,
    "documents",
    isMarketingEnabled ? "lists" : null,
    "consent",
  ].filter(Boolean) as string[];

  const leftColumn = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <ButtonLink
          href={listHref}
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2 text-muted-foreground"
        >
          <ChevronLeft className="size-4" />
          {entityLabel}s
        </ButtonLink>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm">
                Actions
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleQuickAction("Edit")}>
              Edit record
            </DropdownMenuItem>
            {entityType === "lead" ? (
              <DropdownMenuItem onClick={() => setConvertOpen(true)}>
                Convert lead
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => handleQuickAction("Merge")}>
              Merge duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleQuickAction("Delete")}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="shadow-none">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="size-20" data-size="lg">
              <AvatarFallback className="text-lg font-semibold">
                {initials(contact.firstName, contact.lastName)}
              </AvatarFallback>
            </Avatar>
            <h1 className="mt-3 text-xl font-semibold tracking-tight">
              {contact.firstName} {contact.lastName}
            </h1>
            {contact.title ? (
              <p className="text-sm text-muted-foreground">{contact.title}</p>
            ) : null}
            <a
              href={`mailto:${contact.email}`}
              className="mt-1 text-sm text-foreground underline-offset-4 hover:underline"
            >
              {contact.email}
            </a>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <LifecycleBadge stage={contact.lifecycleStage} />
              <HealthBadge score={contact.healthScore} />
              {contact.slaStatus ? (
                <HealthBadge status={contact.slaStatus} variant="sla" />
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            {QUICK_ACTIONS.map((action) => (
              <Tooltip key={action.id}>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                      onClick={() => handleQuickAction(action.label)}
                    >
                      <action.icon className="size-4" />
                    </Button>
                  }
                />
                <TooltipContent>{action.label}</TooltipContent>
              </Tooltip>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-full"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent>
                {isCasesEnabled ? (
                  <DropdownMenuItem
                    onClick={() => handleQuickAction("Case creation")}
                  >
                    <Briefcase className="size-4" />
                    Create case
                  </DropdownMenuItem>
                ) : null}
                {isEsignEnabled ? (
                  <DropdownMenuItem
                    onClick={() => handleQuickAction("NDA send")}
                  >
                    <PenLine className="size-4" />
                    Send NDA
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => handleQuickAction("Request documents")}>
                  <FileUp className="size-4" />
                  Request documents
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickAction("Send survey")}>
                  <ClipboardList className="size-4" />
                  Send survey
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Key information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {keyFields.map((field) => (
            <DetailField key={field.label} label={field.label} value={field.value} />
          ))}
          {contact.tags.length > 0 ? (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );

  const centerColumn = (
    <div className="space-y-4">
      <Tabs defaultValue="catch-up">
        <TabsList variant="line" className="w-full justify-start border-b bg-transparent">
          <TabsTrigger value="catch-up">Catch-up</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="catch-up" className="mt-4 space-y-4">
          <AiRecordBrief contact={contact} />
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Ask about this {entityLabel.toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder={`e.g. What should I do next with ${contact.firstName}?`}
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskAi()}
              />
              <Button onClick={handleAskAi}>Ask</Button>
            </CardContent>
          </Card>
          <RecentInteractions activities={activities} contact={contact} />
        </TabsContent>

        <TabsContent value="activities" className="mt-4 space-y-4">
          <Select
            value={activityFilter}
            onValueChange={(value) =>
              setActivityFilter(value as ActivityFilter)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TimelineList activities={activities} filter={activityFilter} />
        </TabsContent>
      </Tabs>
    </div>
  );

  const rightColumn = (
    <Accordion
      multiple
      defaultValue={defaultAccordion}
      className="rounded-lg border bg-card px-3"
    >
      {contact.company ? (
        <AssociationPanel title="Company" count={1}>
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium">{contact.company}</p>
            <p className="text-xs text-muted-foreground">
              Primary company · {contact.territory ?? "No territory"}
            </p>
            <Button variant="link" size="sm" className="mt-1 h-auto p-0">
              View company
            </Button>
          </div>
        </AssociationPanel>
      ) : null}

      {isCasesEnabled ? (
        <AssociationPanel
          title="Cases"
          count={cases.length}
          onAdd={() => handleQuickAction("Case creation")}
        >
          {cases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cases linked.</p>
          ) : (
            <ul className="space-y-2">
              {cases.map((caseRecord) => (
                <li key={caseRecord.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/cases/${caseRecord.id}`}
                        className="font-mono text-xs text-muted-foreground hover:underline"
                      >
                        {caseRecord.displayId}
                      </Link>
                      <p className="truncate text-sm font-medium">{caseRecord.title}</p>
                    </div>
                    <CmSlaBadge status={caseRecord.slaStatus} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <CaseStatusBadge status={caseRecord.status} />
                    <span className="text-xs text-muted-foreground">{caseRecord.projectName}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {cmContactEvents.length > 0 ? (
            <div className="mt-3 border-t pt-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Synced from Case Manager
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {cmContactEvents.slice(0, 4).map((e) => (
                  <li key={e.id}>• {e.title}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </AssociationPanel>
      ) : null}

      {isEsignEnabled ? (
        <AssociationPanel
          title="E-sign"
          count={envelopes.length}
          onAdd={() => handleQuickAction("NDA send")}
        >
          {envelopes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No envelopes yet.</p>
          ) : (
            <ul className="space-y-2">
              {envelopes.map((envelope) => (
                <li
                  key={envelope.id}
                  className="flex items-center justify-between gap-2 rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{envelope.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {envelope.status}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {envelope.signed}/{envelope.signers}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </AssociationPanel>
      ) : null}

      <AssociationPanel
        title="Documents"
        count={documents.length}
        onAdd={() => setDocRequestOpen(true)}
      >
        {documents.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="size-4 shrink-0" />
            No documents attached.
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.type} · {doc.size}
                </p>
              </li>
            ))}
          </ul>
        )}
      </AssociationPanel>

      {isMarketingEnabled ? (
        <AssociationPanel title="Lists" count={MOCK_LISTS.length}>
          <ul className="space-y-2">
            {MOCK_LISTS.slice(0, 3).map((list) => (
              <li
                key={list.id}
                className="flex items-center gap-2 text-sm"
              >
                <List className="size-4 text-muted-foreground" />
                <span>{list.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {list.count}
                </Badge>
              </li>
            ))}
          </ul>
        </AssociationPanel>
      ) : null}

      <AssociationPanel title="Consent">
        <div className="space-y-3">
          <ConsentRow label="Email" enabled={contact.consent.email} />
          <ConsentRow label="WhatsApp" enabled={contact.consent.whatsapp} />
          <ConsentRow label="SMS" enabled={contact.consent.sms} />
          {contact.consent.topics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {contact.consent.topics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </AssociationPanel>
    </Accordion>
  );

  return (
    <>
      <div className="w-full">
        <RecordProfileLayout
          left={leftColumn}
          center={centerColumn}
          right={rightColumn}
        />
      </div>
      {entityType === "lead" ? (
        <ConvertLeadDialog
          contact={contact}
          open={convertOpen}
          onOpenChange={setConvertOpen}
        />
      ) : null}
      <SendDocumentRequestDialog
        contactId={contact.id}
        open={docRequestOpen}
        onOpenChange={setDocRequestOpen}
      />
      <SendSurveyDialog
        contactId={contact.id}
        open={surveySendOpen}
        onOpenChange={setSurveySendOpen}
      />
      <SendWhatsAppDialog
        contactId={contact.id}
        open={whatsappOpen}
        onOpenChange={setWhatsappOpen}
      />
      <ConvertToCaseWizard
        open={caseWizardOpen}
        onOpenChange={setCaseWizardOpen}
        contactId={contact.id}
      />
    </>
  );
}

interface ContactRecordPageProps {
  id: string;
  entityType: RecordEntityType;
}

export function ContactRecordPage({ id, entityType }: ContactRecordPageProps) {
  const contact = getContactById(id);

  if (!contact || contact.type !== entityType) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold">
          {getRecordEntityLabel(entityType)} not found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          This record may have been deleted or moved.
        </p>
        <ButtonLink href={getRecordListHref(entityType)} className="mt-4">
          Back to {getRecordEntityLabel(entityType)}s
        </ButtonLink>
      </div>
    );
  }

  return <ContactRecordView contact={contact} entityType={entityType} />;
}
