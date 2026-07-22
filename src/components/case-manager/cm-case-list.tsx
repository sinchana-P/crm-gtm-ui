"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { getContactById } from "@/lib/mock-data";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { formatRelative } from "@/lib/format";
import type { CmCase } from "@/lib/types/case-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CaseStatusBadge,
  PriorityBadge,
  SlaBadge,
  SourceBadge,
} from "@/components/case-manager/cm-status-badges";

export function CmCaseList({
  filter,
  baseHref = "/case-manager/cases",
  emptyLabel = "No cases",
}: {
  filter?: (c: CmCase) => boolean;
  baseHref?: string;
  emptyLabel?: string;
}) {
  const cases = useCaseManagerStore((s) => s.cases);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return cases
      .filter((c) => (filter ? filter(c) : true))
      .filter((c) => !q || `${c.title} ${c.displayId} ${c.assignee}`.toLowerCase().includes(q));
  }, [cases, filter, query]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search cases…"
          className="h-8 pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <EmptyState title={emptyLabel} description="Nothing here yet." className="border-0" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Queue</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => {
                  const contact = c.clientIds[0] ? getContactById(c.clientIds[0]) : undefined;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link href={`${baseHref}/${c.id}`} className="block">
                          <span className="font-medium">{c.title}</span>
                          <span className="block font-mono text-xs text-muted-foreground">{c.displayId}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        {contact ? `${contact.firstName} ${contact.lastName}` : "—"}
                      </TableCell>
                      <TableCell className="text-sm">{c.queueName}</TableCell>
                      <TableCell><SourceBadge source={c.source} /></TableCell>
                      <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                      <TableCell><CaseStatusBadge status={c.status} /></TableCell>
                      <TableCell><SlaBadge status={c.slaStatus} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatRelative(c.updatedAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
