"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { MOCK_INTEGRATIONS } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import type { IntegrationStatus } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { CaseManagerConnection } from "@/components/settings/case-manager-connection";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusStyles: Record<IntegrationStatus["status"], string> = {
  connected: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  disconnected: "bg-muted text-muted-foreground",
  error: "bg-red-500/10 text-red-700 dark:text-red-400",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export default function SettingsIntegrationsPage() {
  const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS);

  const esignProviders = integrations.filter((i) => i.category === "esign");
  const messaging = integrations.filter((i) => i.category === "messaging");
  const email = integrations.filter((i) => i.category === "email");

  function testConnection(id: string) {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: "connected" as const, lastSync: new Date().toISOString() }
          : i
      )
    );
    toast.success("Connection test passed");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect the Case Manager back office, e-sign providers, WhatsApp, and email."
        actions={
          <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            Settings
          </Link>
        }
      />

      <CaseManagerConnection />

      <IntegrationGroup
        title="E-sign OAuth providers"
        description="DocuSign, Dropbox Sign, and SignNow connections."
        items={esignProviders}
        onTest={testConnection}
      />

      <IntegrationGroup
        title="WhatsApp"
        description="Business messaging via Meta Cloud API."
        items={messaging}
        onTest={testConnection}
        configureHref="/settings/whatsapp"
      />

      <IntegrationGroup
        title="Email"
        description="Gmail and Outlook sync for inbox and send."
        items={email}
        onTest={testConnection}
      />
    </div>
  );
}

function IntegrationGroup({
  title,
  description,
  items,
  onTest,
  configureHref,
}: {
  title: string;
  description: string;
  items: IntegrationStatus[];
  onTest: (id: string) => void;
  configureHref?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{item.name}</p>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {item.lastSync ? (
                <p className="text-xs text-muted-foreground">
                  Last sync {formatRelative(item.lastSync)}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              {configureHref ? (
                <Link href={configureHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Configure
                </Link>
              ) : null}
              {item.status === "connected" ? (
                <Button variant="outline" size="sm" onClick={() => onTest(item.id)}>
                  Test
                </Button>
              ) : (
                <Button size="sm">
                  {item.status === "pending" ? "Complete setup" : "Connect"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: IntegrationStatus["status"] }) {
  return (
    <Badge variant="outline" className={`capitalize font-normal ${statusStyles[status]}`}>
      {status === "error" ? (
        <XCircle className="mr-1 size-3" />
      ) : status === "connected" ? (
        <CheckCircle2 className="mr-1 size-3" />
      ) : null}
      {status}
    </Badge>
  );
}
