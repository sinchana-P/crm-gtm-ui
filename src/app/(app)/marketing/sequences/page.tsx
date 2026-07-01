"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { SequencePacks } from "@/components/marketing/sequence-packs";
import {
  SequenceStatusBadge,
  SequenceTypeBadge,
} from "@/components/marketing/status-badges";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_SEQUENCES } from "@/lib/mock-data";

export default function SequencesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Sequences"
        description="Multi-step nurture and sales cadences with channel mix and branching."
        actions={
          <ButtonLink href="/marketing/sequences/s1">
            <Plus className="mr-2 size-4" />
            New sequence
          </ButtonLink>
        }
      />

      <Card className="shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Steps</TableHead>
                <TableHead className="text-right">Enrolled</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Replied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SEQUENCES.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={`/marketing/sequences/${s.id}`}
                      className="font-medium hover:underline"
                    >
                      {s.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <SequenceTypeBadge type={s.type} />
                  </TableCell>
                  <TableCell>
                    <SequenceStatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{s.steps}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.enrolled.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.completed.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.replied.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SequencePacks />
    </div>
  );
}
