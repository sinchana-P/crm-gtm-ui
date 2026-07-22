"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, Plug, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { useIntegrationStore } from "@/lib/stores/integration-store";
import { formatRelative } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CmSettingsPage() {
  const connection = useIntegrationStore((s) => s.connection);
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Back-office configuration and the Connect CRM link." />

      <Card className="border-indigo-500/20">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Plug className="size-5" />
            </span>
            <div>
              <CardTitle className="text-base">Connect CRM</CardTitle>
              <CardDescription>Shared contacts and two-way sync power the front office.</CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={connection.connected ? "border-emerald-500/30 text-emerald-600" : "text-muted-foreground"}
          >
            {connection.connected ? "Connected" : "Disconnected"}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
          <span className="text-muted-foreground">
            Last sync: <span className="font-medium text-foreground">{connection.lastSyncAt ? formatRelative(connection.lastSyncAt) : "—"}</span>
          </span>
          <span className="text-muted-foreground">
            Records synced: <span className="font-medium text-foreground">{connection.recordsSynced.toLocaleString()}</span>
          </span>
          <Link href="/settings/integrations" className="ml-auto inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Manage in Connect CRM <ArrowUpRight className="size-3.5" />
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Building2 className="size-4" /> Organization</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Projects, case types, statuses, priorities, and SLA policies are configured per organization.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Users className="size-4" /> Team &amp; roles</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Users, teams, and queue membership determine routing and permissions.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
