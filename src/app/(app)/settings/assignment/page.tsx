"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { MOCK_ASSIGNMENT_RULES } from "@/lib/mock-data";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SettingsAssignmentPage() {
  const [rules, setRules] = useState(MOCK_ASSIGNMENT_RULES);
  const [roundRobinPool, setRoundRobinPool] = useState("sales-team");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignment rules"
        description="Round-robin pools and criteria-based routing for leads, contacts, and cases."
        actions={
          <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            Settings
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Round robin configuration</CardTitle>
          <CardDescription>
            Default pool used when no specific rule matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-md space-y-2">
          <Label>Active pool</Label>
          <Select value={roundRobinPool} onValueChange={(v) => setRoundRobinPool(v ?? "sales-team")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales-team">Sales team (4 members)</SelectItem>
              <SelectItem value="support-tier1">Support Tier 1 (6 members)</SelectItem>
              <SelectItem value="finance">Finance queue (3 members)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Rule builder</CardTitle>
            <CardDescription>Rules evaluated in priority order (lowest number first).</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Add rule
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Object</TableHead>
                <TableHead>Criteria</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Assignees</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules
                .sort((a, b) => a.priority - b.priority)
                .map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="tabular-nums">{rule.priority}</TableCell>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell className="capitalize">{rule.objectType}</TableCell>
                    <TableCell className="max-w-[180px] truncate font-mono text-xs">
                      {rule.criteria}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize font-normal">
                        {rule.method.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{rule.assignees.join(", ")}</TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.active}
                        onCheckedChange={() =>
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === rule.id ? { ...r, active: !r.active } : r
                            )
                          )
                        }
                      />
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
