"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileSignature, Send } from "lucide-react";
import { MOCK_ENVELOPES } from "@/lib/mock-data";
import { formatDate, formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { SendEnvelopeDialog } from "@/components/esign/send-envelope-dialog";
import { EnvelopeStatusBadge } from "@/components/crm/status-badges";
import { useViewScope } from "@/hooks/use-view-scope";
import { Button, buttonVariants } from "@/components/ui/button";
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

const pipeline = [
  { status: "draft" as const, label: "Draft" },
  { status: "sent" as const, label: "Sent" },
  { status: "viewed" as const, label: "Viewed" },
  { status: "signed" as const, label: "Signed" },
];

export default function EsignPage() {
  const { filterEnvelopes, isRep, title, rep } = useViewScope();
  const [sendOpen, setSendOpen] = useState(false);

  const envelopes = useMemo(() => filterEnvelopes(MOCK_ENVELOPES), [filterEnvelopes]);

  const counts = pipeline.map((p) => ({
    ...p,
    count: envelopes.filter((e) => e.status === p.status).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={title("E-sign")}
        description={
          isRep
            ? `Agreements for ${rep.name}'s contacts — send and track from the record.`
            : "Send, track, and store agreements from any contact record."
        }
        actions={
          <>
            {!isRep && (
              <Link href="/esign/bulk" className={buttonVariants({ variant: "outline" })}>
                Bulk send
              </Link>
            )}
            <Button onClick={() => setSendOpen(true)}>
              <Send className="mr-2 size-4" />
              Send from contact
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {counts.map((stage, i) => (
          <Card key={stage.status}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stage.label}</p>
                <span className="text-lg font-semibold tabular-nums">{stage.count}</span>
              </div>
              {i < counts.length - 1 ? (
                <Progress
                  value={stage.count && envelopes.length ? (stage.count / envelopes.length) * 100 : 0}
                  className="mt-2 h-1"
                />
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Envelopes</CardTitle>
          {!isRep && (
            <Link href="/esign/templates" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <FileSignature className="mr-2 size-4" />
              Templates
            </Link>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signing</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {envelopes.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>{e.contactName}</TableCell>
                  <TableCell>
                    <EnvelopeStatusBadge status={e.status} />
                  </TableCell>
                  <TableCell className="capitalize text-sm">{e.signingOrder}</TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {e.signed}/{e.signers} signed
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {e.sentAt ? formatRelative(e.sentAt) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {e.expiresAt ? formatDate(e.expiresAt) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SendEnvelopeDialog open={sendOpen} onOpenChange={setSendOpen} />
    </div>
  );
}
