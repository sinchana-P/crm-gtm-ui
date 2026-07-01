"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { PLUGINS, usePluginStore } from "@/lib/stores/plugin-store";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function SettingsPluginsPage() {
  const enabled = usePluginStore((s) => s.enabled);
  const setPlugin = usePluginStore((s) => s.setPlugin);

  const disablingAny = PLUGINS.some((p) => !enabled[p.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plugins"
        description="Toggle Connect Reach, Resolve, and Sign modules. Disabled plugins hide their navigation sections."
        actions={
          <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            Settings
          </Link>
        }
      />

      {disablingAny ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Navigation will change</AlertTitle>
          <AlertDescription>
            Disabling a plugin hides its sidebar section and related pages. Data is retained and
            reappears when you re-enable the plugin.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4">
        {PLUGINS.map((plugin) => (
          <Card key={plugin.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{plugin.name}</CardTitle>
                  <Badge variant="secondary">{plugin.sku}</Badge>
                </div>
                <CardDescription>{plugin.description}</CardDescription>
              </div>
              <Switch
                checked={enabled[plugin.id]}
                onCheckedChange={(checked) => setPlugin(plugin.id, checked)}
              />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Status: {enabled[plugin.id] ? "Enabled" : "Disabled — nav hidden"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
