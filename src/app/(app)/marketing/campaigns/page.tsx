"use client";

import { useState } from "react";
import { Copy, Eye, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Campaign } from "@/lib/types";
import { CampaignStatusBadge } from "@/components/marketing/status-badges";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_CAMPAIGNS, MOCK_LISTS } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [abTest, setAbTest] = useState(false);
  const [form, setForm] = useState({
    name: "",
    segment: "",
    channel: "email",
    schedule: "",
  });

  function handleCreate() {
    const newCampaign: Campaign = {
      id: `cp${Date.now()}`,
      name: form.name || "Untitled campaign",
      status: form.schedule ? "scheduled" : "draft",
      channel: form.channel as Campaign["channel"],
      segmentName: MOCK_LISTS.find((l) => l.id === form.segment)?.name ?? "Custom segment",
      scheduledAt: form.schedule || undefined,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    setCreateOpen(false);
    setForm({ name: "", segment: "", channel: "email", schedule: "" });
    setAbTest(false);
    toast.success(abTest ? "A/B campaign created as draft" : "Campaign created");
  }

  function cloneCampaign(campaign: Campaign) {
    const clone: Campaign = {
      ...campaign,
      id: `cp${Date.now()}`,
      name: `${campaign.name} (Copy)`,
      status: "draft",
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
    };
    setCampaigns((prev) => [clone, ...prev]);
    toast.success("Campaign cloned");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create, schedule, and track email and WhatsApp campaigns."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create campaign
          </Button>
        }
      />

      <Card className="shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.segmentName}</TableCell>
                  <TableCell className="capitalize">{c.channel}</TableCell>
                  <TableCell>
                    <CampaignStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {c.sent.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelected(c)}>
                          <Eye className="size-4" />
                          View metrics
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => cloneCampaign(c)}>
                          <Copy className="size-4" />
                          Clone campaign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create campaign</DialogTitle>
            <DialogDescription>
              Define audience, channel, and schedule for your outreach.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="June newsletter"
              />
            </div>
            <div className="grid gap-2">
              <Label>Segment</Label>
              <Select
                value={form.segment}
                onValueChange={(v) => setForm((f) => ({ ...f, segment: v ?? "" }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select segment" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_LISTS.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} ({l.count.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Channel</Label>
              <Select
                value={form.channel}
                onValueChange={(v) => setForm((f) => ({ ...f, channel: v ?? "email" }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="schedule">Schedule (optional)</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={form.schedule}
                onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">A/B test</p>
                <p className="text-xs text-muted-foreground">
                  Split audience to test subject lines or content
                </p>
              </div>
              <Switch checked={abTest} onCheckedChange={setAbTest} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.segmentName} · {selected.channel}
                  {selected.scheduledAt && ` · ${formatDateTime(selected.scheduledAt)}`}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6 px-4">
                <div className="flex items-center gap-2">
                  <CampaignStatusBadge status={selected.status} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Metric label="Sent" value={selected.sent} />
                  <Metric label="Opened" value={selected.opened} rate={selected.sent} />
                  <Metric label="Clicked" value={selected.clicked} rate={selected.sent} />
                  <Metric label="Bounced" value={selected.bounced} rate={selected.sent} negative />
                </div>
                <div className="rounded-lg border p-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Delivered</span>
                    <span className="font-medium tabular-nums">
                      {selected.delivered.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Unsubscribed</span>
                    <span className="font-medium tabular-nums">
                      {selected.unsubscribed.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => cloneCampaign(selected)}
                >
                  <Copy className="mr-2 size-4" />
                  Clone campaign
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Metric({
  label,
  value,
  rate,
  negative,
}: {
  label: string;
  value: number;
  rate?: number;
  negative?: boolean;
}) {
  const pct = rate && rate > 0 ? ((value / rate) * 100).toFixed(1) : null;
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      {pct && (
        <p className={`text-xs ${negative ? "text-destructive" : "text-muted-foreground"}`}>
          {pct}%
        </p>
      )}
    </div>
  );
}
