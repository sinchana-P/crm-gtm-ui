"use client";

import { useMemo, useState } from "react";
import { Ban, RotateCcw, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AUDIENCE_STATUS_COUNTS, CONSENT_EVENTS, SUB_CONTACTS, SUB_TOPICS,
  type MarketableStatus, type SubContact,
} from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<MarketableStatus, string> = {
  subscribed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  partial: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  unsubscribed: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  bounced: "bg-red-500/10 text-red-700 dark:text-red-400",
  complained: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  suppressed: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  pending: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};
const STATUS_LABEL: Record<MarketableStatus, string> = {
  subscribed: "Subscribed", partial: "Partial", unsubscribed: "Unsubscribed",
  bounced: "Bounced", complained: "Complained", suppressed: "Suppressed", pending: "Pending",
};
const isMailable = (s: MarketableStatus) => s === "subscribed" || s === "partial";

export function AudienceTab() {
  const [statusFilter, setStatusFilter] = useState<MarketableStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<SubContact | null>(null);
  const [resubOpen, setResubOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return SUB_CONTACTS.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (q && !`${c.name} ${c.email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [statusFilter, search]);

  const activeEvents = active ? CONSENT_EVENTS.filter((e) => e.email === active.email) : [];

  return (
    <div className="space-y-4">
      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors",
            statusFilter === "all" ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted"
          )}
        >
          All contacts
        </button>
        {AUDIENCE_STATUS_COUNTS.map((s) => (
          <button
            key={s.status}
            type="button"
            onClick={() => setStatusFilter(s.status)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              statusFilter === s.status ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted"
            )}
          >
            {s.label}{" "}
            <span className="tabular-nums text-muted-foreground">{s.count.toLocaleString()}</span>
          </button>
        ))}
      </div>

      <div className="relative sm:max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="shadow-none">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={ShieldAlert} title="No contacts" description="No one matches this status or search." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Topics</TableHead>
                  <TableHead className="hidden lg:table-cell">Segments</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const subCount = Object.entries(c.topics).filter(([, v]) => v).length;
                  return (
                    <TableRow key={c.id} className="cursor-pointer" onClick={() => setActive(c)}>
                      <TableCell>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border-0", STATUS_STYLES[c.status])}>
                          {STATUS_LABEL[c.status]}
                        </Badge>
                        {!isMailable(c.status) && (
                          <Badge variant="outline" className="ml-1 border-0 bg-muted text-xs text-muted-foreground">
                            <Ban className="mr-1 size-3" /> Won’t send
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell tabular-nums">
                        {subCount}/{SUB_TOPICS.length}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.segments.map((s) => (
                            <Badge key={s} variant="outline" className="border-0 bg-muted text-xs text-muted-foreground">{s}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-right text-xs text-muted-foreground sm:table-cell">
                        {formatDateTime(c.lastActivityAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Contact subscription drawer */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="sm:max-w-md">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {active.name}
                  <Badge variant="outline" className={cn("border-0", STATUS_STYLES[active.status])}>
                    {STATUS_LABEL[active.status]}
                  </Badge>
                </SheetTitle>
                <SheetDescription>{active.email}</SheetDescription>
              </SheetHeader>

              <div className="space-y-5 overflow-y-auto px-4 pb-6">
                {!isMailable(active.status) && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                    <Ban className="size-4 shrink-0 text-amber-600" />
                    <span>This contact is <b>not mailable</b> — they’re skipped on every send until they opt back in.</span>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Subscription topics</p>
                  <div className="space-y-1.5">
                    {SUB_TOPICS.map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded-lg border p-2.5">
                        <div>
                          <p className="text-sm font-medium">{t.name}</p>
                          {t.required && <p className="text-xs text-muted-foreground">Always on (transactional)</p>}
                        </div>
                        <Switch checked={t.required ? true : !!active.topics[t.id]} disabled={t.required} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {isMailable(active.status) ? (
                    <Button variant="outline" size="sm" onClick={() => toast.success("Added to suppression list")}>
                      <Ban className="size-4" /> Suppress
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => { setConsentChecked(false); setResubOpen(true); }}>
                      <RotateCcw className="size-4" /> Resubscribe
                    </Button>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Consent history</p>
                  <div className="space-y-2">
                    {activeEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recorded events.</p>
                    ) : (
                      activeEvents.map((e) => (
                        <div key={e.id} className="flex gap-3 text-sm">
                          <span className="mt-1 size-2 shrink-0 rounded-full bg-muted-foreground/40" />
                          <div>
                            <p>
                              <span className="font-medium capitalize">{e.action}</span>
                              {e.topic && <span className="text-muted-foreground"> · {e.topic}</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {e.source} · {formatDateTime(e.at)}{e.reason ? ` · ${e.reason}` : ""}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Resubscribe consent modal */}
      <Dialog open={resubOpen} onOpenChange={setResubOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resubscribe {active?.name}?</DialogTitle>
            <DialogDescription>
              Manually resubscribing requires explicit consent from the contact. This is logged for compliance.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2.5 rounded-lg border p-3 text-sm">
            <Checkbox checked={consentChecked} onCheckedChange={(v) => setConsentChecked(!!v)} className="mt-0.5" />
            <span>I confirm this contact has given consent to receive marketing emails again.</span>
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResubOpen(false)}>Cancel</Button>
            <Button
              disabled={!consentChecked}
              onClick={() => { setResubOpen(false); setActive(null); toast.success("Contact resubscribed — consent logged"); }}
            >
              Resubscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
