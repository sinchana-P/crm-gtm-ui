"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileInput,
  FolderOpen,
  LifeBuoy,
  PenLine,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PORTAL_ACTIONS,
  PORTAL_ACTIVITY,
  PORTAL_CUSTOMER,
  getPortalStats,
} from "@/lib/mock-data/portal";
import { formatRelative } from "@/lib/format";

const ACTION_ICONS = {
  upload_document: FolderOpen,
  complete_form: FileInput,
  sign_document: PenLine,
  complete_survey: ClipboardList,
  respond_request: LifeBuoy,
  update_profile: LifeBuoy,
} as const;

const PRIORITY_VARIANT = {
  low: "secondary" as const,
  medium: "outline" as const,
  high: "default" as const,
  urgent: "destructive" as const,
};

export default function PortalHomePage() {
  const stats = getPortalStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${PORTAL_CUSTOMER.firstName}`}
        description={`Your centralized workspace for requests, documents, forms, and agreements with ${PORTAL_CUSTOMER.company}.`}
        actions={
          <ButtonLink href="/portal/requests?new=1">New request</ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Action required" value={stats.actionCount} subtitle="Items need your attention" />
        <StatCard title="Open requests" value={stats.openRequests} subtitle="Support & account cases" />
        <StatCard title="Pending signatures" value={stats.pendingSignatures} subtitle="Agreements awaiting sign-off" />
        <StatCard title="Uploads requested" value={stats.pendingUploads} subtitle="Documents from your team" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Action required</CardTitle>
            <Badge variant="outline">{PORTAL_ACTIONS.length} pending</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {PORTAL_ACTIONS.map((action) => {
              const Icon = ACTION_ICONS[action.type] ?? LifeBuoy;
              return (
                <Link key={action.id} href={action.href} className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{action.title}</p>
                      <Badge variant={PRIORITY_VARIANT[action.priority]} className="capitalize">{action.priority}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{action.description}</p>
                    {action.dueAt ? <p className="mt-1 text-xs text-muted-foreground">Due {formatRelative(action.dueAt)}</p> : null}
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {PORTAL_ACTIVITY.map((item) => (
                <li key={item.id} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <p className="text-[10px] text-muted-foreground">{formatRelative(item.createdAt)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed bg-muted/20 shadow-none">
        <CardContent className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Need help?</p>
            <p className="text-sm text-muted-foreground">Contact {PORTAL_CUSTOMER.accountOwner} or browse FAQs.</p>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/portal/help" variant="outline">Help center</ButtonLink>
            <Button variant="outline" onClick={() => window.open(`mailto:${PORTAL_CUSTOMER.accountOwnerEmail}`)}>Email rep</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
