"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  BarChart3,
  MessageCircle,
  Plus,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { WhatsAppThreadView } from "@/components/whatsapp/whatsapp-thread-view";
import { SendWhatsAppDialog } from "@/components/whatsapp/send-whatsapp-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViewScope } from "@/hooks/use-view-scope";
import { filterWhatsAppThreadsByView } from "@/lib/view-scope";
import { formatDate, formatRelative } from "@/lib/format";
import {
  WHATSAPP_BOT_FLOWS,
  WHATSAPP_BROADCASTS,
  WHATSAPP_CONFIG,
  WHATSAPP_STATS,
  WHATSAPP_TEMPLATES,
  WHATSAPP_THREADS,
  getRepWhatsAppStats,
} from "@/lib/mock-data";

export default function WhatsAppPage() {
  const { isAdmin, isRep, rep, level, title } = useViewScope();
  const [sendOpen, setSendOpen] = useState(false);
  const [tab, setTab] = useState("conversations");

  const threads = useMemo(
    () => filterWhatsAppThreadsByView(WHATSAPP_THREADS, level),
    [level]
  );

  const stats = isRep ? getRepWhatsAppStats(rep.name) : WHATSAPP_STATS;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title("WhatsApp")}
        description={
          isRep
            ? `Your WhatsApp conversations and quick sends for contacts owned by ${rep.name}.`
            : "Business messaging — conversations, templates, broadcasts, bots, and analytics."
        }
        actions={
          <>
            {isAdmin ? (
              <ButtonLink href="/settings/whatsapp" variant="outline">
                <Settings className="size-4" />
                Configuration
              </ButtonLink>
            ) : null}
            <Button onClick={() => setSendOpen(true)}>
              <MessageCircle className="size-4" />
              Send message
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open conversations"
          value={isRep ? stats.threadsOpen : WHATSAPP_STATS.threadsOpen}
          subtitle={isRep ? "Assigned to you" : "Organization-wide"}
        />
        <StatCard
          title="Unread"
          value={isRep ? stats.unread : WHATSAPP_STATS.unread}
          subtitle="Needs response"
        />
        <StatCard
          title="Avg first response"
          value={`${isRep ? stats.avgFirstResponseMin : WHATSAPP_STATS.avgFirstResponseMin}m`}
          subtitle="Last 7 days"
        />
        <StatCard
          title="Reply rate"
          value={`${WHATSAPP_STATS.replyRate}%`}
          subtitle={isAdmin ? "All campaigns" : "Your threads"}
        />
      </div>

      {isAdmin ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                <MessageCircle className="size-5" />
              </div>
              <div>
                <p className="font-medium">{WHATSAPP_CONFIG.displayName}</p>
                <p className="text-sm text-muted-foreground">
                  {WHATSAPP_CONFIG.phoneNumber} · {WHATSAPP_CONFIG.provider}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={
                  WHATSAPP_CONFIG.qualityRating === "green"
                    ? "border-emerald-300 text-emerald-700"
                    : ""
                }
              >
                Quality: {WHATSAPP_CONFIG.qualityRating}
              </Badge>
              <Badge variant="outline">Limit: {WHATSAPP_CONFIG.messagingLimit}</Badge>
              <Badge variant="outline" className="capitalize">
                Webhook: {WHATSAPP_CONFIG.webhookStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          {isAdmin ? (
            <>
              <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
              <TabsTrigger value="bots">Bots</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </>
          ) : null}
        </TabsList>

        <TabsContent value="conversations" className="mt-6">
          <WhatsAppThreadView threads={threads} />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Meta-approved templates. {isRep ? "Select when sending to contacts." : "Manage and sync from Meta."}
            </p>
            {isAdmin ? (
              <Button variant="outline" size="sm" onClick={() => toast.message("Syncing templates from Meta…")}>
                Sync templates
              </Button>
            ) : null}
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Read rate</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {WHATSAPP_TEMPLATES.map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell>
                      <p className="font-medium">{tpl.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{tpl.body}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {tpl.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tpl.status === "approved" ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {tpl.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{tpl.sent.toLocaleString()}</TableCell>
                    <TableCell>
                      {tpl.sent > 0 ? `${Math.round((tpl.read / tpl.sent) * 100)}%` : "—"}
                    </TableCell>
                    <TableCell>
                      {tpl.status === "approved" ? (
                        <Button variant="ghost" size="sm" onClick={() => setSendOpen(true)}>
                          Use
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {isAdmin ? (
          <>
            <TabsContent value="broadcasts" className="mt-6 space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => toast.message("Create broadcast wizard")}>
                  <Plus className="size-4" />
                  New broadcast
                </Button>
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Replied</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {WHATSAPP_BROADCASTS.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell className="text-sm">{b.templateName}</TableCell>
                        <TableCell>{b.segmentName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {b.sent > 0 ? `${b.delivered}/${b.sent}` : b.scheduledAt ? formatDate(b.scheduledAt) : "—"}
                        </TableCell>
                        <TableCell>{b.replied > 0 ? b.replied : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ButtonLink href="/marketing/campaigns" variant="outline" size="sm">
                View all campaigns
              </ButtonLink>
            </TabsContent>

            <TabsContent value="bots" className="mt-6 space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => toast.message("Bot flow builder")}>
                  <Bot className="size-4" />
                  New bot flow
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {WHATSAPP_BOT_FLOWS.map((bot) => (
                  <Card key={bot.id} className="shadow-none">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{bot.name}</CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {bot.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Trigger: {bot.trigger}</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-muted-foreground">{bot.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{bot.steps} steps</span>
                        <span>{bot.handoffs} handoffs</span>
                        <span>{bot.completionRate}% completion</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Delivery rate" value={WHATSAPP_STATS.deliveryRate} />
                <MetricCard label="Read rate" value={WHATSAPP_STATS.readRate} />
                <MetricCard label="Reply rate" value={WHATSAPP_STATS.replyRate} />
              </div>
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="size-4" />
                    Leads from WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold">
                    {WHATSAPP_STATS.leadsFromWa.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All-time · second largest source after Website
                  </p>
                  <ButtonLink href="/reports" variant="link" className="mt-2 h-auto p-0">
                    View source report
                  </ButtonLink>
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Template performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {WHATSAPP_TEMPLATES.filter((t) => t.sent > 0)
                    .slice(0, 4)
                    .map((t) => (
                      <div key={t.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{t.name}</span>
                          <span className="text-muted-foreground">
                            {Math.round((t.replied / t.sent) * 100)}% replied
                          </span>
                        </div>
                        <Progress value={(t.replied / t.sent) * 100} className="h-1.5" />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : null}
      </Tabs>

      <SendWhatsAppDialog open={sendOpen} onOpenChange={setSendOpen} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}%</p>
      </CardContent>
    </Card>
  );
}
