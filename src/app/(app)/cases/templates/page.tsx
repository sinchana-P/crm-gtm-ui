"use client";

import Link from "next/link";
import { ExternalLink, FileStack } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { CM_CASE_TEMPLATES } from "@/lib/mock-data/case-manager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriorityBadge } from "@/components/case-manager/cm-status-badges";

export default function CaseTemplatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Case Templates"
        description="Reusable case blueprints — fields, default priority, queue, and SLA. Field mappings pull directly from Connect CRM contacts on conversion."
        actions={
          <Link href="/case-manager/templates" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Manage in Case Manager <ExternalLink className="size-3.5" />
          </Link>
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Default priority</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead>Prefilled from CRM</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CM_CASE_TEMPLATES.map((t) => {
                const mapped = t.fields.filter((f) => f.crmField).length;
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <span className="flex items-center gap-2 font-medium">
                        <FileStack className="size-4 text-muted-foreground" /> {t.name}
                      </span>
                      <span className="ml-6 block text-xs text-muted-foreground">{t.caseType}</span>
                    </TableCell>
                    <TableCell className="text-sm">{t.projectName}</TableCell>
                    <TableCell><PriorityBadge priority={t.defaultPriority} /></TableCell>
                    <TableCell className="text-sm">{t.slaHours}h</TableCell>
                    <TableCell className="text-sm">{t.fields.length}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{mapped} fields</Badge>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{t.usageCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={t.active ? "border-emerald-500/30 text-emerald-600" : "text-muted-foreground"}
                      >
                        {t.active ? "Active" : "Draft"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
