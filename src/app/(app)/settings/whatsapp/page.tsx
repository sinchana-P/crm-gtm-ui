"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { WHATSAPP_CONFIG, WHATSAPP_TEMPLATES } from "@/lib/mock-data";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelative } from "@/lib/format";

export default function SettingsWhatsAppPage() {
  const [autoAck, setAutoAck] = useState(true);
  const [businessHours, setBusinessHours] = useState(true);
  const [leadCapture, setLeadCapture] = useState(true);

  function syncTemplates() {
    toast.success("Templates synced", {
      description: `${WHATSAPP_TEMPLATES.filter((t) => t.status === "approved").length} approved templates loaded.`,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Business"
        description="Meta Cloud API connection, webhooks, automation defaults, and template sync."
        actions={
          <Link href="/marketing/whatsapp" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            WhatsApp hub
          </Link>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base">Connected account</CardTitle>
            <CardDescription>{WHATSAPP_CONFIG.provider}</CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-300 text-emerald-700">
            <CheckCircle2 className="mr-1 size-3" />
            Connected
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input defaultValue={WHATSAPP_CONFIG.displayName} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Phone number</Label>
            <Input defaultValue={WHATSAPP_CONFIG.phoneNumber} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Business ID</Label>
            <Input defaultValue={WHATSAPP_CONFIG.businessId} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Messaging limit</Label>
            <Input defaultValue={WHATSAPP_CONFIG.messagingLimit} readOnly />
          </div>
          <p className="sm:col-span-2 text-xs text-muted-foreground">
            Last sync {formatRelative(WHATSAPP_CONFIG.lastSync)} · Quality rating{" "}
            {WHATSAPP_CONFIG.qualityRating} · Webhook {WHATSAPP_CONFIG.webhookStatus}
          </p>
          <div className="flex gap-2 sm:col-span-2">
            <Button variant="outline" onClick={() => toast.success("Webhook test passed")}>
              Test webhook
            </Button>
            <Button variant="outline" onClick={syncTemplates}>
              <RefreshCw className="mr-2 size-4" />
              Sync templates
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automation defaults</CardTitle>
          <CardDescription>Applied to all inbound WhatsApp messages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            label="Auto-acknowledge new messages"
            description="Send welcome template when a new conversation starts"
            checked={autoAck}
            onCheckedChange={setAutoAck}
          />
          <ToggleRow
            label="Business hours bot"
            description="After-hours auto-reply with expected response time"
            checked={businessHours}
            onCheckedChange={setBusinessHours}
          />
          <ToggleRow
            label="Auto-create leads"
            description="Unknown numbers create a lead with source WhatsApp"
            checked={leadCapture}
            onCheckedChange={setLeadCapture}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhook events</CardTitle>
          <CardDescription>Inbound events processed by Connect CRM.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Action in CRM</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {WEBHOOK_EVENTS.map((e) => (
                <TableRow key={e.event}>
                  <TableCell className="font-mono text-xs">{e.event}</TableCell>
                  <TableCell className="text-sm">{e.action}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="size-4" />
            Click-to-WhatsApp links
          </CardTitle>
          <CardDescription>Pre-filled messages for ads, website, and QR codes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border bg-muted/30 p-3 font-mono text-xs">
            https://wa.me/918045678900?text=Hi%2C%20I%27m%20interested%20in%20Connect%20CRM
          </div>
          <p className="text-muted-foreground">
            UTM parameters are captured as lead source &quot;WhatsApp — Campaign&quot; when the contact
            first messages.
          </p>
          <Button variant="outline" size="sm" onClick={() => toast.message("Link copied")}>
            Copy sales link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const WEBHOOK_EVENTS = [
  { event: "messages", action: "Append to thread · notify assignee · update timeline" },
  { event: "message_status", action: "Update sent / delivered / read on outbound messages" },
  { event: "message_template_status_update", action: "Sync template approval status" },
  { event: "phone_number_quality_update", action: "Update quality rating badge" },
];

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
