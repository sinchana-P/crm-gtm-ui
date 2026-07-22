"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, FileInput } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { formatRelative } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IntakeStatusBadge } from "@/components/case-manager/cm-status-badges";

export default function CmInquiryPage() {
  const intake = useCaseManagerStore((s) => s.intake);
  const inquiries = useMemo(
    () => intake.filter((i) => i.channel === "inquiry"),
    [intake]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiry"
        description="Public intake forms capture requests from anyone. Submissions land in Intake & Triage and convert into cases — creating a Connect CRM contact when there's no match."
        actions={
          <Link href="/cases/intake" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Triage in CRM <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />
      <Card>
        <CardContent className="p-0">
          {inquiries.length === 0 ? (
            <EmptyState icon={FileInput} title="No inquiries" description="Public form submissions will appear here." className="border-0" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{i.sourceRef}</TableCell>
                    <TableCell className="font-medium">{i.subject}</TableCell>
                    <TableCell className="text-sm">
                      {i.submitterName}
                      <span className="block text-xs text-muted-foreground">{i.submitterEmail}</span>
                    </TableCell>
                    <TableCell className="text-sm">{i.formName ?? "—"}</TableCell>
                    <TableCell><IntakeStatusBadge status={i.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatRelative(i.receivedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
