"use client";

import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MOCK_DELIVERABILITY, MOCK_SUPPRESSION } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import { toast } from "sonner";

const DNS_STEPS = [
  { id: "spf", label: "SPF record", status: MOCK_DELIVERABILITY.spf },
  { id: "dkim", label: "DKIM signing", status: MOCK_DELIVERABILITY.dkim },
  { id: "dmarc", label: "DMARC policy", status: MOCK_DELIVERABILITY.dmarc },
];

export default function DeliverabilityPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Deliverability"
        description="Domain authentication, suppression lists, and sender reputation."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4" />
              Health score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-semibold tabular-nums">
                {MOCK_DELIVERABILITY.score}
              </span>
              <span className="pb-1 text-muted-foreground">/ 100</span>
            </div>
            <Progress value={MOCK_DELIVERABILITY.score} className="h-2" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Bounce rate</p>
                <p className="font-medium tabular-nums">{MOCK_DELIVERABILITY.bounceRate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Complaint rate</p>
                <p className="font-medium tabular-nums">{MOCK_DELIVERABILITY.complaintRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Domain setup wizard</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("DNS records copied to clipboard")}
            >
              Copy DNS records
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {DNS_STEPS.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  {step.status === "verified" ? (
                    <CheckCircle2 className="size-5 text-foreground" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{step.label}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {step.status}
                    </p>
                  </div>
                </div>
                {step.status !== "verified" && (
                  <Button variant="outline" size="sm">
                    Verify
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Suppression list</CardTitle>
          <Button variant="outline" size="sm">
            Import suppressions
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SUPPRESSION.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-sm">{row.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {row.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelative(row.addedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
