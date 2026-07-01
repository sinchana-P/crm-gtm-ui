"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { KAAYAKA_PROJECTS, MOCK_INTEGRATIONS } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import type { IntegrationStatus } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusStyles: Record<IntegrationStatus["status"], string> = {
  connected: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  disconnected: "bg-muted text-muted-foreground",
  error: "bg-red-500/10 text-red-700 dark:text-red-400",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export default function SettingsIntegrationsPage() {
  const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS);
  const [kaayakaHealth, setKaayakaHealth] = useState<"healthy" | "checking">("healthy");

  const kaayaka = integrations.find((i) => i.id === "int1");
  const esignProviders = integrations.filter((i) => i.category === "esign");
  const messaging = integrations.filter((i) => i.category === "messaging");
  const email = integrations.filter((i) => i.category === "email");

  function runHealthCheck() {
    setKaayakaHealth("checking");
    setTimeout(() => {
      setKaayakaHealth("healthy");
      toast.success("Kaayaka connection healthy", {
        description: "API latency 142ms · last sync successful",
      });
    }, 1200);
  }

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
        description="Connect Kaayaka Case Manager, e-sign providers, WhatsApp, and email."
        actions={
          <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            Settings
          </Link>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Kaayaka Case Manager</CardTitle>
            <CardDescription>{kaayaka?.description}</CardDescription>
          </div>
          <StatusBadge status={kaayaka?.status ?? "disconnected"} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runHealthCheck}
              disabled={kaayakaHealth === "checking"}
            >
              <RefreshCw className={`mr-2 size-4 ${kaayakaHealth === "checking" ? "animate-spin" : ""}`} />
              Health check
            </Button>
            <Button variant="outline" size="sm" onClick={() => testConnection("int1")}>
              Test connection
            </Button>
            {kaayakaHealth === "healthy" ? (
              <span className="flex items-center gap-1 text-sm text-emerald-600">
                <CheckCircle2 className="size-4" />
                All systems operational
              </span>
            ) : null}
          </div>
          {kaayaka?.lastSync ? (
            <p className="text-xs text-muted-foreground">
              Last sync {formatRelative(kaayaka.lastSync)}
            </p>
          ) : null}
          <div>
            <p className="mb-2 text-sm font-medium">Project mapping</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CRM case type</TableHead>
                  <TableHead>Kaayaka project</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {KAAYAKA_PROJECTS.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.crmType}</TableCell>
                    <TableCell>{p.kaayakaProject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
