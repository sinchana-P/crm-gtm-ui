"use client";

import { PageHeader } from "@/components/shared/page-header";
import { CM_QUEUES } from "@/lib/mock-data/case-manager";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CmQueuesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Queues"
        description="Work queues route cases to the right team. SLA breaches surface here first."
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>SLA breaches</TableHead>
                <TableHead>Avg resolution</TableHead>
                <TableHead>Members</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CM_QUEUES.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.name}</TableCell>
                  <TableCell className="text-sm">{q.projectName}</TableCell>
                  <TableCell className="tabular-nums">{q.openCases}</TableCell>
                  <TableCell>
                    {q.slaBreaches > 0 ? (
                      <Badge variant="outline" className="border-red-500/30 text-red-600">{q.slaBreaches}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{q.avgResolutionHrs}h</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{q.members.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
