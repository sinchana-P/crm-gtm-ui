"use client";

import { ShieldCheck, TrendingUp, Users, UserCheck, UserX } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEGMENT_ELIGIBILITY, SUB_KPIS } from "@/lib/mock-data";
import { ReportingTab } from "./reporting-tab";
import { SuppressionTab } from "./suppression-tab";
import { TopicsTab } from "./topics-tab";
import { AudienceTab } from "./audience-tab";
import { ComplianceTab } from "./compliance-tab";
import { PreferencePreview } from "./preference-preview";

export function SubscriptionsHub() {
  const seg = SEGMENT_ELIGIBILITY;
  const eligiblePct = Math.round((seg.eligible / seg.total) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Manage unsubscribes, suppression, and consent — and never email someone who opted out."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total contacts" value={SUB_KPIS.totalContacts.toLocaleString()} icon={Users} />
        <StatCard title="Marketable" value={SUB_KPIS.marketable.toLocaleString()} subtitle="Can receive marketing" icon={UserCheck} trend={{ value: "Eligible", positive: true }} />
        <StatCard title="Suppressed" value={SUB_KPIS.suppressedTotal.toLocaleString()} subtitle="Unsub + bounce + complaint + manual" icon={UserX} trend={{ value: "Never emailed", positive: false }} />
        <StatCard title="Net list growth" value={`+${SUB_KPIS.netListGrowth}%`} subtitle="Opt-ins minus opt-outs" icon={TrendingUp} trend={{ value: "Growing", positive: true }} />
      </div>

      {/* Enforcement callout — how suppression protects a real send */}
      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-emerald-600" />
            Send protection — segment eligibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Example: sending to <span className="font-medium text-foreground">“{seg.segment}”</span>. Suppressed contacts are
            skipped automatically — segment membership never overrides an opt-out.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-sm">
              <span className="text-2xl font-semibold tabular-nums">{seg.total.toLocaleString()}</span>{" "}
              <span className="text-muted-foreground">in segment</span>
            </span>
            <span className="text-sm">
              <span className="text-2xl font-semibold tabular-nums text-emerald-600">{seg.eligible.toLocaleString()}</span>{" "}
              <span className="text-muted-foreground">eligible</span>
            </span>
            <span className="text-sm">
              <span className="text-2xl font-semibold tabular-nums text-amber-600">{seg.suppressed.toLocaleString()}</span>{" "}
              <span className="text-muted-foreground">skipped</span>
            </span>
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="bg-emerald-500" style={{ width: `${eligiblePct}%` }} />
            <div className="bg-amber-400" style={{ width: `${100 - eligiblePct}%` }} />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {seg.breakdown.map((b) => (
              <Badge key={b.label} variant="outline" className="border-0 bg-muted text-xs text-muted-foreground">
                {b.label}: {b.count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reporting">
        <TabsList className="flex-wrap">
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
          <TabsTrigger value="suppression">Suppression list</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="preference">Preference center</TabsTrigger>
          <TabsTrigger value="compliance">Compliance log</TabsTrigger>
        </TabsList>

        <TabsContent value="reporting" className="mt-6"><ReportingTab /></TabsContent>
        <TabsContent value="suppression" className="mt-6"><SuppressionTab /></TabsContent>
        <TabsContent value="topics" className="mt-6"><TopicsTab /></TabsContent>
        <TabsContent value="audience" className="mt-6"><AudienceTab /></TabsContent>
        <TabsContent value="preference" className="mt-6"><PreferencePreview /></TabsContent>
        <TabsContent value="compliance" className="mt-6"><ComplianceTab /></TabsContent>
      </Tabs>
    </div>
  );
}
