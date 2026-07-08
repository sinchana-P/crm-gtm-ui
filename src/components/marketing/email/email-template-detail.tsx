"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  CheckCheck,
  Clock,
  Copy,
  Mail,
  MousePointerClick,
  Pencil,
  Send,
  Sparkles,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelative } from "@/lib/format";
import { useEmailTemplateStore } from "@/lib/stores/email-template-store";
import { EmailPreview } from "@/components/marketing/email/email-editor";
import {
  EmailStatusBadge,
  EmailTypeBadge,
  PERSONALIZATION_TOKENS,
  rate,
} from "@/components/marketing/email/email-shared";
import { TestSendDialog } from "@/components/marketing/email/test-send-dialog";

export function EmailTemplateDetail({ id }: { id: string }) {
  const router = useRouter();
  const template = useEmailTemplateStore((s) => s.templates.find((t) => t.id === id));
  const duplicateTemplate = useEmailTemplateStore((s) => s.duplicateTemplate);
  const setStatus = useEmailTemplateStore((s) => s.setStatus);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [testOpen, setTestOpen] = useState(false);

  if (!template) {
    return (
      <EmptyState
        title="Email not found"
        description="This template may have been deleted."
        action={<Button variant="outline" onClick={() => router.push("/marketing/templates")}><ArrowLeft className="size-4" /> Back to templates</Button>}
      />
    );
  }

  const blocks = template.blocks ?? [];
  const usedTokens = PERSONALIZATION_TOKENS.filter(
    (t) => template.subject.includes(t.token) || blocks.some((b) => (b.text ?? "").includes(t.token) || (b.colText ?? []).some((c) => c.includes(t.token)))
  );
  const hasUnsub = template.subject.includes("{{unsubscribeLink}}") || blocks.some((b) => (b.text ?? "").includes("{{unsubscribeLink}}"));

  const opened = Math.round((template.sent * template.openRate) / 100);
  const clicked = Math.round((template.sent * template.clickRate) / 100);
  const delivered = Math.round((template.sent * (template.deliveredRate ?? 98)) / 100);
  const bounced = template.sent - delivered;
  const unsub = Math.round((template.sent * (template.unsubRate ?? 0)) / 100);

  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-border pb-6">
        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={() => router.push("/marketing/templates")}>
          <ArrowLeft className="size-4" /> Templates
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-6 w-1.5 rounded-full" style={{ backgroundColor: template.accent ?? "#94a3b8" }} />
              <h1 className="text-2xl font-semibold tracking-tight">{template.name}</h1>
              <EmailStatusBadge status={template.status} />
              <EmailTypeBadge type={template.type} />
            </div>
            <p className="text-sm text-muted-foreground">
              Subject: <span className="text-foreground">{template.subject || "(none)"}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              From {template.fromName ?? "Connect NX"} · Owner {template.owner ?? "—"} · updated {formatRelative(template.updatedAt)}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setTestOpen(true)}><Send className="size-4" /> Send test</Button>
            <Button onClick={() => router.push(`/marketing/templates/${id}/edit`)}><Pencil className="size-4" /> Edit</Button>
            <Button variant="outline" onClick={() => { duplicateTemplate(id); toast.success("Template duplicated"); }}><Copy className="size-4" /> Duplicate</Button>
            <Button variant="ghost" onClick={() => { const to = template.status === "archived" ? "draft" : "archived"; setStatus(id, to); toast.success(to === "archived" ? "Archived" : "Restored"); }}>
              <Archive className="size-4" /> {template.status === "archived" ? "Restore" : "Archive"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-6 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center rounded-lg border p-0.5">
              <Button variant={device === "desktop" ? "secondary" : "ghost"} size="sm" onClick={() => setDevice("desktop")}>Desktop</Button>
              <Button variant={device === "mobile" ? "secondary" : "ghost"} size="sm" onClick={() => setDevice("mobile")}>Mobile</Button>
            </div>
          </div>
          <EmailPreview
            device={device}
            subject={template.subject}
            preheader={template.preheader}
            fromName={template.fromName}
            blocks={blocks}
            htmlMode={template.htmlMode}
            rawHtml={template.rawHtml}
          />
        </TabsContent>

        <TabsContent value="performance" className="mt-6 space-y-6">
          {template.sent === 0 ? (
            <EmptyState icon={Mail} title="No sends yet" description="Open & click tracking will appear here once this template is used in a campaign or sequence." />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Kpi icon={Send} label="Sent" value={template.sent.toLocaleString()} />
                <Kpi icon={CheckCheck} label="Delivered" value={delivered.toLocaleString()} hint={`${template.deliveredRate ?? 98}%`} />
                <Kpi icon={Mail} label="Opened" value={opened.toLocaleString()} hint={`${template.openRate}%`} />
                <Kpi icon={MousePointerClick} label="Clicked" value={clicked.toLocaleString()} hint={`${template.clickRate}%`} />
                <Kpi icon={UserMinus} label="Unsubscribed" value={unsub.toLocaleString()} hint={`${template.unsubRate ?? 0}%`} />
              </div>
              <Card className="shadow-none">
                <CardHeader><CardTitle className="text-base">Engagement funnel</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <FunnelRow label="Delivered" value={delivered} total={template.sent} className="bg-blue-500" />
                  <FunnelRow label="Opened" value={opened} total={template.sent} className="bg-amber-500" />
                  <FunnelRow label="Clicked" value={clicked} total={template.sent} className="bg-violet-500" />
                  <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <AlertTriangle className="size-3.5" /> {bounced.toLocaleString()} bounced ({rate(bounced, template.sent)}%) · {unsub.toLocaleString()} unsubscribed
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-none">
              <CardHeader><CardTitle className="text-base">Content settings</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid gap-x-6 gap-y-3">
                  <Item label="Subject" value={template.subject || "—"} />
                  <Item label="Preheader" value={template.preheader || "—"} />
                  <Item label="From name" value={template.fromName ?? "—"} />
                  <Item label="Editor mode" value={template.htmlMode ? "Custom HTML" : "Drag & drop"} />
                </dl>
              </CardContent>
            </Card>
            <Card className="shadow-none">
              <CardHeader><CardTitle className="text-base">Tracking & delivery</CardTitle></CardHeader>
              <CardContent className="space-y-2.5">
                <SettingToggle label="Open tracking" on={template.trackOpens ?? true} />
                <SettingToggle label="Click tracking" on={template.trackClicks ?? true} />
                <SettingToggle label="Predictive send time" on={template.predictiveSendTime ?? false} badge="Phase 3" icon={Clock} />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-none">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-muted-foreground" /> Personalization</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {usedTokens.length === 0 ? (
                <p className="text-sm text-muted-foreground">No personalization tokens used in this email.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {usedTokens.map((t) => (
                    <Badge key={t.token} variant="outline" className="font-mono text-xs font-normal">{t.token} → {t.sample}</Badge>
                  ))}
                </div>
              )}
              <div className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${hasUnsub ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/10"}`}>
                {hasUnsub ? (
                  <><CheckCheck className="size-4 text-emerald-600" /> <span>Includes an unsubscribe link — compliant with CAN-SPAM / GDPR.</span></>
                ) : (
                  <><AlertTriangle className="size-4 text-amber-600" /> <span className="text-amber-700 dark:text-amber-400">No unsubscribe link found. Add {"{{unsubscribeLink}}"} before sending to a marketing audience.</span></>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TestSendDialog open={testOpen} onOpenChange={setTestOpen} templateName={template.name} />
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint }: { icon: typeof Mail; label: string; value: string; hint?: string }) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Icon className="size-3.5 text-muted-foreground" />
        </div>
        <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function FunnelRow({ label, value, total, className }: { label: string; value: number; total: number; className: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{value.toLocaleString()} · {pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-1.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] truncate text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

function SettingToggle({ label, on, badge, icon: Icon }: { label: string; on: boolean; badge?: string; icon?: typeof Clock }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="flex items-center gap-2 text-sm">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        {label}
        {badge && <Badge variant="outline" className="border-0 bg-blue-500/10 text-blue-700 dark:text-blue-400">{badge}</Badge>}
      </span>
      <Badge variant="outline" className={on ? "border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-0 bg-muted text-muted-foreground"}>
        {on ? "On" : "Off"}
      </Badge>
    </div>
  );
}
