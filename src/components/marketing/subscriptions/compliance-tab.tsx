"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CONSENT_EVENTS, type ConsentAction } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACTION_STYLES: Record<ConsentAction, string> = {
  subscribed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  resubscribed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  unsubscribed: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  suppressed: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  imported: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  bounced: "bg-red-500/10 text-red-700 dark:text-red-400",
  complained: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export function ComplianceTab() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CONSENT_EVENTS.filter((e) => {
      if (action !== "all" && e.action !== action) return false;
      if (q && !`${e.email} ${e.name}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, action]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Every consent change is recorded — who, what, when, and the source. This is your audit trail for GDPR/CAN-SPAM.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search email or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={action} onValueChange={(v) => setAction(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="subscribed">Subscribed</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            <SelectItem value="resubscribed">Resubscribed</SelectItem>
            <SelectItem value="suppressed">Suppressed</SelectItem>
            <SelectItem value="imported">Imported</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="complained">Complained</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => toast.success("Audit log exported (CSV)")}>
          <Download className="size-4" /> Export
        </Button>
      </div>

      <Card className="shadow-none">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No events" description="No consent events match this filter." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden md:table-cell">Topic</TableHead>
                  <TableHead className="hidden sm:table-cell">Source</TableHead>
                  <TableHead className="hidden lg:table-cell">Actor</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <p className="font-medium">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 capitalize", ACTION_STYLES[e.action])}>
                        {e.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{e.topic ?? "—"}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">{e.source}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{e.actor}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{formatDateTime(e.at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
