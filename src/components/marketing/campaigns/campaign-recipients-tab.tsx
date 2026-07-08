"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import type { Campaign, CampaignRecipient, RecipientEventType } from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_CAMPAIGN_RECIPIENTS } from "@/lib/mock-data";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RecipientStatusBadge } from "@/components/marketing/campaigns/campaign-shared";

const STATUS_FILTERS: (RecipientEventType | "all")[] = [
  "all",
  "queued",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "converted",
  "bounced",
  "unsubscribed",
];

const EVENT_DOT: Record<RecipientEventType, string> = {
  queued: "bg-muted-foreground",
  sent: "bg-sky-500",
  delivered: "bg-blue-500",
  opened: "bg-amber-500",
  clicked: "bg-violet-500",
  converted: "bg-emerald-500",
  bounced: "bg-red-500",
  unsubscribed: "bg-orange-500",
};

export function CampaignRecipientsTab({ campaign }: { campaign: Campaign }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [selected, setSelected] = useState<CampaignRecipient | null>(null);

  const recipients = useMemo(
    () => MOCK_CAMPAIGN_RECIPIENTS.filter((r) => r.campaignId === campaign.id),
    [campaign.id]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return recipients.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (q && !r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [recipients, search, status]);

  if (recipients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No recipient activity yet"
        description="Individual recipient status and engagement history will appear here once the campaign starts sending."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search recipients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus((v as typeof status) ?? "all")}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s === "all" ? "All statuses" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last activity</TableHead>
                <TableHead className="text-right">Events</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(r)}
                >
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email}</TableCell>
                  <TableCell>
                    <RecipientStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelative(r.lastEventAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.events.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.email} · {campaign.name}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 px-4">
                <div className="flex items-center gap-2">
                  <RecipientStatusBadge status={selected.status} />
                  <span className="text-xs text-muted-foreground">
                    Last event {formatRelative(selected.lastEventAt)}
                  </span>
                </div>
                <div className="relative space-y-0 pl-4">
                  <div className="absolute top-1 bottom-1 left-[5px] w-px bg-border" />
                  {selected.events.map((e) => (
                    <div key={e.id} className="relative pb-5 last:pb-0">
                      <span
                        className={cn(
                          "absolute top-1 -left-4 size-2.5 rounded-full ring-2 ring-background",
                          EVENT_DOT[e.type]
                        )}
                      />
                      <div className="pl-2">
                        <p className="text-sm font-medium capitalize">{e.type}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(e.at)}</p>
                        {e.detail && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{e.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
