"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import type { SuppressionEntry } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MOCK_SUPPRESSION,
  MOCK_UNSUBSCRIBE_REASONS,
  MOCK_UNSUBSCRIBE_TOPICS,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const REASON_STYLES: Record<SuppressionEntry["reason"], string> = {
  bounce: "bg-red-500/10 text-red-700 dark:text-red-400",
  unsubscribe: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  complaint: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  manual: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

export function UnsubscribeManagement() {
  const router = useRouter();
  const [topics, setTopics] = useState(MOCK_UNSUBSCRIBE_TOPICS.map((t) => ({ ...t, active: true })));
  const [suppression, setSuppression] = useState<SuppressionEntry[]>(MOCK_SUPPRESSION);
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [footerText, setFooterText] = useState(
    "You're receiving this because you opted in at connectnx.io. Manage your preferences or unsubscribe anytime."
  );

  const filteredSuppression = useMemo(() => {
    const q = search.toLowerCase();
    return suppression.filter((s) => {
      if (reasonFilter !== "all" && s.reason !== reasonFilter) return false;
      if (q && !s.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [suppression, search, reasonFilter]);

  const maxReason = Math.max(...MOCK_UNSUBSCRIBE_REASONS.map((r) => r.count), 1);

  function addSuppression() {
    if (!newEmail.trim()) return;
    setSuppression((s) => [
      { id: `sp${Date.now()}`, email: newEmail.trim(), reason: "manual", addedAt: new Date().toISOString() },
      ...s,
    ]);
    toast.success("Added to suppression list");
    setNewEmail("");
    setAddOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unsubscribes & suppression"
        description="Manage subscription preferences, the global suppression list, and unsubscribe insights."
        actions={
          <Button variant="outline" onClick={() => router.push("/marketing/templates")}>
            <ArrowLeft className="size-4" /> Back to templates
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Suppressed" value={suppression.length.toLocaleString()} subtitle="Never contacted" icon={Ban} />
        <StatCard title="Preference topics" value={topics.length} subtitle={`${topics.filter((t) => t.active).length} active`} icon={Mail} />
        <StatCard title="Unsub (30d)" value={MOCK_UNSUBSCRIBE_REASONS.reduce((n, r) => n + r.count, 0).toLocaleString()} subtitle="Across all emails" icon={UserMinus} />
        <StatCard title="Enforcement" value="On" subtitle="Applied to every send" icon={ShieldCheck} />
      </div>

      <Tabs defaultValue="preferences">
        <TabsList>
          <TabsTrigger value="preferences">Preference center</TabsTrigger>
          <TabsTrigger value="suppression">Suppression list</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Preference center */}
        <TabsContent value="preferences" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Subscription topics</CardTitle>
                <CardDescription>Contacts choose which topics they receive. Turning one off hides it from the preference page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {topics.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {t.label}
                        {t.required && <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">Always on</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{t.subscribers.toLocaleString()} subscribed</p>
                    </div>
                    <Switch
                      checked={t.required ? true : t.active}
                      disabled={t.required}
                      onCheckedChange={(v) => setTopics((ts) => ts.map((x) => (x.id === t.id ? { ...x, active: v } : x)))}
                    />
                  </div>
                ))}
                <div className="grid gap-2 pt-2">
                  <Label className="text-xs">Email footer text</Label>
                  <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Appended above the unsubscribe link on every marketing email.</p>
                </div>
              </CardContent>
            </Card>

            {/* Hosted preference page preview */}
            <Card className="shadow-none">
              <CardHeader><CardTitle className="text-base">Hosted preference page</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="mx-auto max-w-sm rounded-lg bg-white p-5 shadow-sm">
                    <p className="text-center text-sm font-semibold text-neutral-900">Manage your preferences</p>
                    <p className="mt-1 text-center text-xs text-neutral-500">ananya.iyer@techcorp.in</p>
                    <div className="mt-4 space-y-2">
                      {topics.filter((t) => t.active || t.required).map((t) => (
                        <label key={t.id} className="flex items-center gap-2.5 rounded-md border border-neutral-200 p-2.5">
                          <span className={cn("flex size-4 items-center justify-center rounded border", t.required ? "border-neutral-300 bg-neutral-200" : "border-emerald-500 bg-emerald-500 text-white")}>
                            {(t.required || true) && <span className="text-[10px]">✓</span>}
                          </span>
                          <span className="text-xs text-neutral-700">{t.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 rounded-md bg-neutral-900 py-2 text-center text-xs font-medium text-white">Save preferences</div>
                    <p className="mt-3 text-center text-[11px] text-neutral-400 underline">Unsubscribe from all</p>
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">Preview of the page contacts see via {"{{unsubscribeLink}}"}.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Suppression list */}
        <TabsContent value="suppression" className="mt-6 space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 text-sm">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Suppression is <span className="font-medium">enforced automatically</span> — these addresses are skipped on every campaign, sequence, and automation send.</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search email…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={reasonFilter} onValueChange={(v) => setReasonFilter(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reasons</SelectItem>
                <SelectItem value="unsubscribe">Unsubscribe</SelectItem>
                <SelectItem value="bounce">Bounce</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setAddOpen(true)}><Plus className="size-4" /> Add address</Button>
          </div>
          <Card className="shadow-none">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppression.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.email}</TableCell>
                      <TableCell><Badge variant="outline" className={cn("border-0 capitalize", REASON_STYLES[s.reason])}>{s.reason}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(s.addedAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => { setSuppression((list) => list.filter((x) => x.id !== s.id)); toast.success("Removed from suppression list"); }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="mt-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Why people unsubscribe (last 30 days)</CardTitle>
              <CardDescription>Captured on the unsubscribe confirmation page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_UNSUBSCRIBE_REASONS.map((r) => (
                <div key={r.reason} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{r.reason}</span>
                    <span className="tabular-nums text-muted-foreground">{r.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(r.count / maxReason) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to suppression list</DialogTitle>
            <DialogDescription>This address will be skipped on all future sends.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-1">
            <Label htmlFor="sup-email">Email address</Label>
            <Input id="sup-email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addSuppression}><ShieldOff className="size-4" /> Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
