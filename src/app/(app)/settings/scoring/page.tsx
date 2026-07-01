"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, LineChart, ListChecks } from "lucide-react";
import { MOCK_SCORING_RULES } from "@/lib/mock-data";
import type { ScoringRule } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const tabMeta = {
  rule: { label: "Rule-based", icon: ListChecks },
  behavioral: { label: "Behavioral", icon: LineChart },
  ai: { label: "AI scoring", icon: Brain },
} as const;

export default function SettingsScoringPage() {
  const [rules, setRules] = useState(MOCK_SCORING_RULES);

  function toggleRule(id: string) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }

  function renderTable(type: ScoringRule["type"]) {
    const filtered = rules.filter((r) => r.type === type);
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rule</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead className="text-right">Points</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell className="font-medium">{rule.name}</TableCell>
              <TableCell className="max-w-xs font-mono text-xs text-muted-foreground">
                {rule.condition}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <Badge variant={rule.points < 0 ? "destructive" : "secondary"}>
                  {rule.points > 0 ? `+${rule.points}` : rule.points}
                </Badge>
              </TableCell>
              <TableCell>
                <Switch checked={rule.active} onCheckedChange={() => toggleRule(rule.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead scoring"
        description="Combine rule-based, behavioral, and AI signals into a unified lead score."
        actions={
          <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            Settings
          </Link>
        }
      />

      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="rule">
            <TabsList>
              {(Object.keys(tabMeta) as Array<keyof typeof tabMeta>).map((key) => {
                const meta = tabMeta[key];
                const Icon = meta.icon;
                return (
                  <TabsTrigger key={key} value={key} className="gap-2">
                    <Icon className="size-4" />
                    {meta.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <TabsContent value="rule" className="mt-4">
              {renderTable("rule")}
            </TabsContent>
            <TabsContent value="behavioral" className="mt-4">
              {renderTable("behavioral")}
            </TabsContent>
            <TabsContent value="ai" className="mt-4">
              {renderTable("ai")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
