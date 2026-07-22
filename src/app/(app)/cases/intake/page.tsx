"use client";

import { useMemo, useState } from "react";
import { Filter, Inbox, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TriageDrawer } from "@/components/case-manager/triage-drawer";
import { ConvertToCaseWizard } from "@/components/case-manager/convert-to-case-wizard";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { formatRelative } from "@/lib/format";
import type { IntakeChannel, IntakeItem, IntakeStatus } from "@/lib/types/case-manager";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  IntakeStatusBadge,
  PriorityBadge,
  SourceBadge,
} from "@/components/case-manager/cm-status-badges";

export default function IntakeTriagePage() {
  const intake = useCaseManagerStore((s) => s.intake);
  const [channel, setChannel] = useState<IntakeChannel | "all">("all");
  const [status, setStatus] = useState<IntakeStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<IntakeItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardItem, setWizardItem] = useState<IntakeItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return intake.filter(
      (i) =>
        (channel === "all" || i.channel === channel) &&
        (status === "all" || i.status === status) &&
        (!q ||
          i.subject.toLowerCase().includes(q) ||
          i.submitterName.toLowerCase().includes(q) ||
          i.submitterEmail.toLowerCase().includes(q))
    );
  }, [intake, channel, status, query]);

  const openTriage = (item: IntakeItem) => {
    setSelected(item);
    setDrawerOpen(true);
  };

  const startConvert = (item: IntakeItem) => {
    setDrawerOpen(false);
    setWizardItem(item);
    setWizardOpen(true);
  };

  const newCount = intake.filter((i) => i.status === "New").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intake & Triage"
        description="Every inbound request — customer portal, public inquiry, and email — lands here first. Triage, respond, or convert to a back-office case."
        actions={
          <span className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-3 py-1.5 text-sm">
            <Inbox className="size-4 text-muted-foreground" />
            {newCount} awaiting triage
          </span>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 py-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subject, name, email…"
              className="h-8 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={channel} onValueChange={(v) => setChannel(v as IntakeChannel | "all")}>
            <SelectTrigger className="h-8 w-36">
              <Filter className="size-3.5" />
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              <SelectItem value="portal">Portal</SelectItem>
              <SelectItem value="inquiry">Inquiry</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as IntakeStatus | "all")}>
            <SelectTrigger className="h-8 w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Responded">Responded</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No intake items"
              description="Nothing matches these filters. New portal requests and inquiries will appear here."
              className="border-0"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow
                    key={i.id}
                    className="cursor-pointer"
                    onClick={() => openTriage(i)}
                  >
                    <TableCell>
                      <span className="font-medium">{i.subject}</span>
                      {i.duplicateOfId && (
                        <span className="ml-2 rounded bg-amber-500/10 px-1.5 text-[10px] text-amber-600">
                          possible dup
                        </span>
                      )}
                      {i.sourceRef && (
                        <span className="block text-xs text-muted-foreground">{i.sourceRef}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{i.submitterName}</span>
                      <span className="block text-xs text-muted-foreground">{i.submitterEmail}</span>
                    </TableCell>
                    <TableCell><SourceBadge source={i.channel} /></TableCell>
                    <TableCell><PriorityBadge priority={i.priority} /></TableCell>
                    <TableCell><IntakeStatusBadge status={i.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatRelative(i.receivedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TriageDrawer
        item={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onConvert={startConvert}
      />
      <ConvertToCaseWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        intake={wizardItem ?? undefined}
      />
    </div>
  );
}
