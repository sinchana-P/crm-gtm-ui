"use client";

import Link from "next/link";
import { FileInput, GitBranch, Inbox, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useViewScope } from "@/hooks/use-view-scope";
import { MOCK_INBOX, MOCK_SEQUENCES } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";

export function MarketingRepDashboard() {
  const { filterInbox, rep } = useViewScope();
  const inbox = filterInbox(MOCK_INBOX);
  const unread = inbox.filter((m) => m.unread).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Marketing"
        description={`Replies, sequences, and forms tied to ${rep.name}'s contacts.`}
        actions={
          <ButtonLink href="/marketing/inbox">
            <Inbox className="mr-2 size-4" />
            Open inbox
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Inbox unread" value={unread} subtitle="Needs your reply" />
        <StatCard
          title="Active sequences"
          value={MOCK_SEQUENCES.filter((s) => s.type === "sales").length}
          subtitle="Sales cadences you run"
        />
        <StatCard title="Contacts enrolled" value={12} subtitle="In your sequences" />
        <StatCard title="Form leads this week" value={3} subtitle="Assigned to you" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Inbox</CardTitle>
            <ButtonLink href="/marketing/inbox" variant="ghost" size="sm">
              View all
            </ButtonLink>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inbox.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <p className="font-medium">{m.contactName}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {m.preview}
                      </p>
                    </TableCell>
                    <TableCell className="capitalize">{m.channel}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelative(m.receivedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <ButtonLink href="/marketing/inbox" variant="outline" className="justify-start">
              <MessageCircle className="mr-2 size-4" />
              Reply to messages
            </ButtonLink>
            <ButtonLink href="/marketing/sequences" variant="outline" className="justify-start">
              <GitBranch className="mr-2 size-4" />
              Sequences
            </ButtonLink>
            <ButtonLink href="/marketing/forms" variant="outline" className="justify-start">
              <FileInput className="mr-2 size-4" />
              Form submissions
            </ButtonLink>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
