"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsConsentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent & privacy"
        description="Default consent policies and preference center configuration."
        actions={
          <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            Settings
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default consent</CardTitle>
          <CardDescription>Applied to new contacts unless overridden at capture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConsentToggle label="Email marketing" description="Product updates and campaigns" defaultChecked />
          <ConsentToggle label="WhatsApp" description="Transactional and promotional messages" defaultChecked />
          <ConsentToggle label="SMS" description="Short-code alerts and OTP" />
          <div className="space-y-2 pt-2">
            <Label>Default topic subscriptions</Label>
            <Select defaultValue="product-updates">
              <SelectTrigger className="max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product-updates">Product updates only</SelectItem>
                <SelectItem value="all-marketing">All marketing topics</SelectItem>
                <SelectItem value="none">None — explicit opt-in required</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preference center</CardTitle>
          <CardDescription>
            Public page where contacts manage channel and topic preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-mono text-muted-foreground">
              https://preferences.connect.example/c/your-workspace
            </p>
            <p className="text-xs text-muted-foreground">
              Linked from email footers and WhatsApp opt-out flows.
            </p>
          </div>
          <a href="#" onClick={(e) => e.preventDefault()} className={buttonVariants({ variant: "outline" })}>
            <ExternalLink className="mr-2 size-4" />
            Preview preference center
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

function ConsentToggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
