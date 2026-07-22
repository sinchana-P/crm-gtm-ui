"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Link2,
  Plug,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useIntegrationStore } from "@/lib/stores/integration-store";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { ConflictRule, SyncDirection } from "@/lib/types/case-manager";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DIRECTION_LABEL: Record<SyncDirection, string> = {
  both: "Two-way",
  crm_to_cm: "CRM → Case Manager",
  cm_to_crm: "Case Manager → CRM",
};

export function CaseManagerConnection() {
  const {
    connection,
    fieldMappings,
    statusMap,
    priorityMap,
    syncLog,
    connect,
    disconnect,
    acceptCmToken,
    regenerateApiKey,
    setSyncDirection,
    setConflictRule,
    toggleAutoConvert,
    toggleSyncResolution,
  } = useIntegrationStore();

  const [open, setOpen] = useState(false);
  const [cmToken, setCmToken] = useState("");

  return (
    <>
      <Card className="border-indigo-500/20">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Plug className="size-5" />
            </span>
            <div>
              <CardTitle className="text-base">Case Manager</CardTitle>
              <CardDescription>
                Two-way sync of contacts, requests, and cases between the front office and back office.
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "font-normal",
              connection.connected
                ? "border-emerald-500/30 text-emerald-600"
                : "text-muted-foreground"
            )}
          >
            {connection.connected ? <CheckCircle2 className="size-3" /> : null}
            {connection.connected ? "Connected" : "Disconnected"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Last sync" value={connection.lastSyncAt ? formatRelative(connection.lastSyncAt) : "—"} />
            <Stat label="Records synced" value={connection.recordsSynced.toLocaleString()} />
            <Stat label="Direction" value={DIRECTION_LABEL[connection.syncDirection]} />
            <Stat label="Conflicts" value={connection.conflictRule.replace("_", " ")} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setOpen(true)}>
              <ShieldCheck className="size-4" /> Manage integration
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.success("Connection healthy", { description: "API latency 138ms · last sync successful" })
              }
            >
              <RefreshCw className="size-4" /> Health check
            </Button>
          </div>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-2xl">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2">
              <Plug className="size-4" /> Case Manager integration
            </SheetTitle>
            <SheetDescription>
              Governs how records flow between Connect CRM and the Case Manager back office.
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="connection" className="flex-1 overflow-hidden">
            <TabsList variant="line" className="w-full justify-start border-b bg-transparent px-4">
              <TabsTrigger value="connection">Connection</TabsTrigger>
              <TabsTrigger value="mapping">Field mapping</TabsTrigger>
              <TabsTrigger value="settings">Sync settings</TabsTrigger>
              <TabsTrigger value="log">Activity log</TabsTrigger>
            </TabsList>

            <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-4 py-4">
              {/* Connection — bidirectional token exchange */}
              <TabsContent value="connection" className="mt-0 space-y-4">
                <Step
                  n={1}
                  done={connection.cmTokenAccepted}
                  title="Paste the Case Manager integration token"
                  desc="In Case Manager, go to Settings → Integrations → CRM, generate a token, and paste it here."
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="cm_int_…"
                      value={cmToken}
                      onChange={(e) => setCmToken(e.target.value)}
                      disabled={connection.cmTokenAccepted}
                    />
                    <Button
                      variant="outline"
                      disabled={connection.cmTokenAccepted || !cmToken.trim()}
                      onClick={() => {
                        acceptCmToken();
                        toast.success("Token accepted", { description: "Case Manager can now read & write CRM data." });
                      }}
                    >
                      {connection.cmTokenAccepted ? <Check className="size-4" /> : "Verify"}
                    </Button>
                  </div>
                </Step>

                <Step
                  n={2}
                  done={Boolean(connection.crmApiKey)}
                  title="Share your Connect CRM API key"
                  desc="Paste this key into Case Manager so it can push data back to Connect CRM."
                >
                  <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm">
                    <KeyRound className="size-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{connection.crmApiKey ?? "— not generated —"}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(connection.crmApiKey ?? "");
                        toast.success("Copied API key");
                      }}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => { regenerateApiKey(); toast.success("New API key generated"); }}>
                    <RefreshCw className="size-3.5" /> Regenerate
                  </Button>
                </Step>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowLeftRight className="size-4 text-muted-foreground" />
                    {connection.connected ? "Integration is live." : "Not connected."}
                  </div>
                  {connection.connected ? (
                    <Button variant="outline" size="sm" onClick={() => { disconnect(); toast.message("Disconnected"); }}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => { connect(); toast.success("Connected"); }}>
                      <Link2 className="size-4" /> Connect
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* Field mapping */}
              <TabsContent value="mapping" className="mt-0 space-y-5">
                <div>
                  <p className="mb-2 text-sm font-medium">Object &amp; field mapping</p>
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Connect CRM</TableHead>
                          <TableHead>Case Manager</TableHead>
                          <TableHead>Direction</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fieldMappings.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="text-sm">
                              <span className="font-medium">{m.crmObject}</span>
                              <span className="block text-xs text-muted-foreground">{m.crmField}</span>
                            </TableCell>
                            <TableCell className="text-sm">
                              <span className="font-medium">{m.cmObject}</span>
                              <span className="block text-xs text-muted-foreground">{m.cmField}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="gap-1 font-normal">
                                <ArrowLeftRight className="size-3" /> {DIRECTION_LABEL[m.direction]}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <ValueMapTable title="Status value mapping" rows={statusMap} />
                <ValueMapTable title="Priority value mapping" rows={priorityMap} />
              </TabsContent>

              {/* Sync settings */}
              <TabsContent value="settings" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <Label>Sync direction</Label>
                  <Select value={connection.syncDirection} onValueChange={(v) => setSyncDirection(v as SyncDirection)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Two-way</SelectItem>
                      <SelectItem value="crm_to_cm">CRM → Case Manager</SelectItem>
                      <SelectItem value="cm_to_crm">Case Manager → CRM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Conflict resolution</Label>
                  <Select value={connection.conflictRule} onValueChange={(v) => setConflictRule(v as ConflictRule)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest_wins">Most recent update wins</SelectItem>
                      <SelectItem value="crm_wins">Connect CRM wins</SelectItem>
                      <SelectItem value="cm_wins">Case Manager wins</SelectItem>
                      <SelectItem value="manual">Flag for manual review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ToggleRow
                  label="Auto-convert inquiries to cases"
                  desc="Skip manual triage for inquiries that match an automation rule."
                  checked={connection.autoConvertInquiries}
                  onToggle={toggleAutoConvert}
                />
                <ToggleRow
                  label="Sync resolution back to portal"
                  desc="When a case is resolved, mark the originating portal request resolved for the customer."
                  checked={connection.syncResolutionToPortal}
                  onToggle={toggleSyncResolution}
                />
              </TabsContent>

              {/* Activity log */}
              <TabsContent value="log" className="mt-0">
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncLog.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="text-sm">
                            <span className="font-medium">{e.entity}</span>
                            <span className="block text-xs text-muted-foreground">{e.recordLabel}</span>
                            {e.detail && <span className="block text-xs text-muted-foreground">{e.detail}</span>}
                          </TableCell>
                          <TableCell className="text-sm capitalize">{e.action}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {e.direction === "crm_to_cm" ? "CRM → CM" : "CM → CRM"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-normal",
                                e.status === "success" && "border-emerald-500/30 text-emerald-600",
                                e.status === "pending" && "border-amber-500/30 text-amber-600",
                                e.status === "failed" && "border-red-500/30 text-red-600"
                              )}
                            >
                              {e.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground" title={formatDateTime(e.at)}>
                            {formatRelative(e.at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium capitalize">{value}</p>
    </div>
  );
}

function Step({
  n,
  done,
  title,
  desc,
  children,
}: {
  n: number;
  done: boolean;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-start gap-3">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
            done ? "bg-emerald-500 text-white" : "border border-border text-muted-foreground"
          )}
        >
          {done ? <Check className="size-3.5" /> : n}
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="pl-9">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onToggle,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}

function ValueMapTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; crmValue: string; cmValue: string }[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Connect CRM</TableHead>
              <TableHead>Case Manager</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.crmValue}>
                <TableCell className="text-sm">{r.crmValue}</TableCell>
                <TableCell className="text-sm">{r.cmValue}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
