"use client";

import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  FileText,
  Mail,
  PenLine,
  Phone,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import type { ActivityItem, ContactRecord } from "@/lib/types";
import {
  getActivitiesForContact,
  getContactById,
  MOCK_CASES,
  MOCK_ENVELOPES,
} from "@/lib/mock-data";
import { usePluginStore } from "@/lib/stores/plugin-store";
import { getNavIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { AiRecordBrief } from "@/components/contacts/ai-record-brief";
import { HealthBadge } from "@/components/shared/health-badge";
import { LifecycleBadge } from "@/components/shared/lifecycle-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface ContactDrawerProps {
  contact?: ContactRecord | null;
  contactId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EngagementSummary({ contact }: { contact: ContactRecord }) {
  const { engagement } = contact;
  const openRate =
    engagement.emailsSent > 0
      ? Math.round((engagement.emailsOpened / engagement.emailsSent) * 100)
      : 0;

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Engagement</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Last touch</p>
          <p className="font-medium">
            {formatDistanceToNow(new Date(engagement.lastTouchAt), { addSuffix: true })}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Days since contact</p>
          <p className="font-medium">{engagement.daysSinceContact}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Emails opened</p>
          <p className="font-medium">
            {engagement.emailsOpened}/{engagement.emailsSent} ({openRate}%)
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Top channel</p>
          <p className="font-medium capitalize">
            {Object.entries(engagement.channelMix).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"}
          </p>
        </div>
      </CardContent>
    </Card>
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
              {item.body && (
                <p className="text-sm text-muted-foreground">{item.body}</p>
              )}
              <p className="text-xs text-muted-foreground">by {item.createdBy}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DrawerContent({ contact }: { contact: ContactRecord }) {
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const isCasesEnabled = usePluginStore((s) => s.isEnabled("cases"));
  const isEsignEnabled = usePluginStore((s) => s.isEnabled("esign"));

  const activities = getActivitiesForContact(contact.id);
  const cases = MOCK_CASES.filter((c) => c.contactId === contact.id);
  const envelopes = MOCK_ENVELOPES.filter((e) => e.contactId === contact.id);

  const handleQuickAction = (action: string) => {
    toast.success(`${action} queued for ${contact.firstName} ${contact.lastName}`);
  };

  return (
    <>
      <SheetHeader className="border-b px-6 py-4">
        <div className="flex items-start justify-between gap-4 pr-8">
          <div className="space-y-1">
            <SheetTitle className="text-xl">
              {contact.firstName} {contact.lastName}
            </SheetTitle>
            <SheetDescription>
              {contact.title && `${contact.title} · `}
              {contact.company ?? contact.email}
            </SheetDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <LifecycleBadge stage={contact.lifecycleStage} />
            <HealthBadge score={contact.healthScore} />
            {contact.slaStatus && (
              <HealthBadge status={contact.slaStatus} variant="sla" />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-3">
          <Button size="sm" variant="outline" onClick={() => handleQuickAction("Call")}>
            <Phone className="size-4" />
            Call
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleQuickAction("Email")}>
            <Mail className="size-4" />
            Email
          </Button>
          {isCasesEnabled && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction("Case creation")}
            >
              <Briefcase className="size-4" />
              Create case
            </Button>
          )}
          {isEsignEnabled && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction("NDA send")}
            >
              <PenLine className="size-4" />
              Send NDA
            </Button>
          )}
        </div>
      </SheetHeader>

      <div className="space-y-4 px-6 py-4">
        <AiRecordBrief contact={contact} />
        <EngagementSummary contact={contact} />

        <Tabs defaultValue="overview">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            {isCasesEnabled && <TabsTrigger value="cases">Cases</TabsTrigger>}
            {isEsignEnabled && <TabsTrigger value="esign">E-sign</TabsTrigger>}
            <TabsTrigger value="consent">Consent</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Email" value={contact.email} />
              <DetailField label="Phone" value={contact.phone} />
              <DetailField label="Owner" value={contact.owner} />
              <DetailField label="Source" value={contact.source} />
              <DetailField label="Lead score" value={String(contact.leadScore)} />
              <DetailField label="Health score" value={String(contact.healthScore)} />
              <DetailField label="Territory" value={contact.territory ?? "—"} />
              <DetailField label="Pincode" value={contact.pincode ?? "—"} />
            </div>
            {contact.tags.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Separator />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Last activity</p>
              <p className="text-muted-foreground">{contact.lastActivity}</p>
              {contact.nextActivity && (
                <>
                  <p className="pt-2 font-medium">Next activity</p>
                  <p className="text-muted-foreground">{contact.nextActivity}</p>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4 space-y-4">
            <Select
              value={activityFilter}
              onValueChange={(value) => setActivityFilter(value as ActivityFilter)}
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

          <TabsContent value="documents" className="mt-4">
            <Card className="shadow-none">
              <CardContent className="flex items-center gap-3 py-6">
                <FileText className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">No documents linked</p>
                  <p className="text-sm text-muted-foreground">
                    Upload agreements, proposals, or supporting files from the record.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isCasesEnabled && (
            <TabsContent value="cases" className="mt-4 space-y-3">
              {cases.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No cases for this contact.
                </p>
              ) : (
                cases.map((caseRecord) => (
                  <Card key={caseRecord.id} className="shadow-none">
                    <CardContent className="space-y-2 py-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            {caseRecord.number} — {caseRecord.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {caseRecord.type} · {caseRecord.assignee}
                          </p>
                        </div>
                        <HealthBadge status={caseRecord.slaStatus} variant="sla" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {caseRecord.description}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          )}

          {isEsignEnabled && (
            <TabsContent value="esign" className="mt-4 space-y-3">
              {envelopes.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No envelopes for this contact.
                </p>
              ) : (
                envelopes.map((envelope) => (
                  <Card key={envelope.id} className="shadow-none">
                    <CardContent className="flex items-center justify-between gap-3 py-4">
                      <div>
                        <p className="text-sm font-medium">{envelope.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {envelope.status} · {envelope.signed}/{envelope.signers} signed
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {envelope.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          )}

          <TabsContent value="consent" className="mt-4">
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="size-4" />
                  Consent preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ConsentRow label="Email" enabled={contact.consent.email} />
                <ConsentRow label="WhatsApp" enabled={contact.consent.whatsapp} />
                <ConsentRow label="SMS" enabled={contact.consent.sms} />
                {contact.consent.topics.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Topics
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {contact.consent.topics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export function ContactDrawer({
  contact: contactProp,
  contactId,
  open,
  onOpenChange,
}: ContactDrawerProps) {
  const contact =
    contactProp ?? (contactId ? getContactById(contactId) : undefined) ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl"
      >
        {contact ? (
          <DrawerContent contact={contact} />
        ) : (
          <SheetHeader className="px-6 py-4">
            <SheetTitle>Contact</SheetTitle>
            <SheetDescription>Contact not found.</SheetDescription>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function ConsentRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <Badge
        variant="outline"
        className={cn(
          enabled
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "text-muted-foreground"
        )}
      >
        {enabled ? "Opted in" : "Opted out"}
      </Badge>
    </div>
  );
}
