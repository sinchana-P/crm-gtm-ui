"use client";

import Link from "next/link";
import {
  AppWindow,
  Calendar,
  FileInput,
  GitBranch,
  Mail,
  Megaphone,
  Plus,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { MarketingRepDashboard } from "@/components/dashboard/marketing-rep-dashboard";
import { SequencePacks } from "@/components/marketing/sequence-packs";
import { PageHeader } from "@/components/shared/page-header";
import { useClientStoresHydrated } from "@/hooks/use-client-stores-hydrated";
import { StatCard } from "@/components/shared/stat-card";
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
import { useViewScope } from "@/hooks/use-view-scope";
import {
  MOCK_CAMPAIGNS,
  MOCK_DELIVERABILITY,
  MOCK_SEQUENCES,
} from "@/lib/mock-data";
import { CampaignStatusBadge } from "@/components/marketing/status-badges";

const totalSent = MOCK_CAMPAIGNS.reduce((a, c) => a + c.sent, 0);
const totalOpened = MOCK_CAMPAIGNS.reduce((a, c) => a + c.opened, 0);
const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0";
const activeSequences = MOCK_SEQUENCES.filter((s) => s.status === "active").length;
const totalEnrolled = MOCK_SEQUENCES.reduce((a, s) => a + s.enrolled, 0);

const quickActions = [
  { label: "New campaign", href: "/marketing/campaigns", icon: Mail },
  { label: "Build sequence", href: "/marketing/sequences", icon: GitBranch },
  { label: "Landing page", href: "/marketing/landing-pages", icon: AppWindow },
  { label: "Create form", href: "/marketing/forms", icon: FileInput },
  { label: "View calendar", href: "/marketing/calendar", icon: Calendar },
];

export default function MarketingHomePage() {
  const hydrated = useClientStoresHydrated();
  const { isRep } = useViewScope();

  if (!hydrated) {
    return <MarketingAdminHome />;
  }

  if (isRep) {
    return <MarketingRepDashboard />;
  }

  return <MarketingAdminHome />;
}

function MarketingAdminHome() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Marketing"
        description="Campaign performance, sequences, and deliverability at a glance."
        actions={
          <ButtonLink href="/marketing/campaigns">
            <Plus className="mr-2 size-4" />
            Create campaign
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Emails sent (30d)"
          value={totalSent.toLocaleString()}
          icon={Megaphone}
          trend={{ value: "+12% vs prior period", positive: true }}
        />
        <StatCard
          title="Avg. open rate"
          value={`${openRate}%`}
          icon={TrendingUp}
          subtitle="Across active campaigns"
        />
        <StatCard
          title="Active sequences"
          value={activeSequences}
          icon={GitBranch}
          subtitle={`${totalEnrolled.toLocaleString()} enrolled`}
        />
        <StatCard
          title="Deliverability score"
          value={MOCK_DELIVERABILITY.score}
          icon={ShieldCheck}
          trend={{ value: "SPF & DKIM verified", positive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent campaigns</CardTitle>
            <ButtonLink href="/marketing/campaigns" variant="ghost" size="sm">
              View all
            </ButtonLink>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Open rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_CAMPAIGNS.map((c) => {
                  const rate = c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : "—";
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.segmentName}</p>
                      </TableCell>
                      <TableCell className="capitalize">{c.channel}</TableCell>
                      <TableCell>
                        <CampaignStatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{rate}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Deliverability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold tabular-nums">
                  {MOCK_DELIVERABILITY.score}
                </span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <Progress value={MOCK_DELIVERABILITY.score} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-medium uppercase">{MOCK_DELIVERABILITY.spf}</p>
                  <p className="text-muted-foreground">SPF</p>
                </div>
                <div>
                  <p className="font-medium uppercase">{MOCK_DELIVERABILITY.dkim}</p>
                  <p className="text-muted-foreground">DKIM</p>
                </div>
                <div>
                  <p className="font-medium uppercase">{MOCK_DELIVERABILITY.dmarc}</p>
                  <p className="text-muted-foreground">DMARC</p>
                </div>
              </div>
              <ButtonLink href="/marketing/deliverability" variant="outline" size="sm" className="w-full">
                Manage deliverability
              </ButtonLink>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((action) => (
                <ButtonLink key={action.href} href={action.href} variant="outline" className="justify-start">
                  <action.icon className="mr-2 size-4" />
                  {action.label}
                </ButtonLink>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Sequence performance</CardTitle>
          <ButtonLink href="/marketing/sequences" variant="ghost" size="sm">
            Manage sequences
          </ButtonLink>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sequence</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Enrolled</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Reply rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SEQUENCES.map((s) => {
                const replyRate =
                  s.enrolled > 0 ? ((s.replied / s.enrolled) * 100).toFixed(1) : "0";
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link
                        href={`/marketing/sequences/${s.id}`}
                        className="font-medium hover:underline"
                      >
                        {s.name}
                      </Link>
                    </TableCell>
                    <TableCell className="capitalize">{s.type}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {s.enrolled.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {s.completed.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{replyRate}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SequencePacks />
    </div>
  );
}
