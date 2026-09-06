"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ConsentStateBadge,
  type DisplayConsentState,
} from "@/components/settings/consent-state-badge";
import { collectableConsents } from "@/lib/mock-data/consent-policy";
import {
  CONSENT_AUDIENCE,
  audienceByType,
  consentBreakdown,
  type AudienceType,
} from "@/lib/mock-data/consent-analytics";

const CONSENTS = collectableConsents();

const SEG = [
  { key: "opt-in", label: "Opted in", cls: "bg-emerald-500" },
  { key: "neutral", label: "Neutral", cls: "bg-amber-500" },
  { key: "provisional", label: "Provisional", cls: "bg-violet-500" },
  { key: "opt-out", label: "Opted out", cls: "bg-red-500" },
] as const;

function ReachBar({
  b,
}: {
  b: { optIn: number; neutral: number; provisional: number; optOut: number; total: number };
}) {
  const parts = [
    { cls: "bg-emerald-500", n: b.optIn },
    { cls: "bg-amber-500", n: b.neutral },
    { cls: "bg-violet-500", n: b.provisional },
    { cls: "bg-red-500", n: b.optOut },
  ];
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
      {parts.map((p, i) =>
        p.n > 0 ? (
          <div key={i} className={p.cls} style={{ width: `${(p.n / b.total) * 100}%` }} />
        ) : null,
      )}
    </div>
  );
}

export function ConsentInsights() {
  const [segment, setSegment] = useState<AudienceType | "all">("all");
  const [drillKey, setDrillKey] = useState<string>(CONSENTS[0]?.key ?? "");
  const [drillStatus, setDrillStatus] = useState<DisplayConsentState | "all">("opt-in");

  const rows = useMemo(() => audienceByType(segment), [segment]);
  const breakdowns = useMemo(
    () => CONSENTS.map((c) => ({ def: c, b: consentBreakdown(c.key, rows) })),
    [rows],
  );

  const totalPeople = rows.length;
  const drillRows = useMemo(
    () =>
      rows.filter((r) => drillStatus === "all" || r.consents[drillKey] === drillStatus),
    [rows, drillKey, drillStatus],
  );
  const drillDef = CONSENTS.find((c) => c.key === drillKey);

  return (
    <div className="space-y-6">
      {/* segment switch + summary */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{totalPeople}</span> people in scope
        </div>
        <Select value={segment} onValueChange={(v) => setSegment((v as AudienceType | "all") ?? "all")}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({CONSENT_AUDIENCE.length})</SelectItem>
            <SelectItem value="lead">Leads only</SelectItem>
            <SelectItem value="customer">Customers only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* per-consent reach cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {breakdowns.map(({ def, b }) => {
          const gap = b.neutral + b.optOut;
          return (
            <Card key={def.key} className="shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">{def.name}</CardTitle>
                <CardDescription className="font-mono text-[11px]">{def.key}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-semibold tabular-nums leading-none">
                    {b.optInPct}
                    <span className="ml-0.5 text-base text-muted-foreground">%</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {b.optIn}
                    </span>{" "}
                    of {b.total} opted in
                  </p>
                </div>
                <ReachBar b={b} />
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="tabular-nums">{b.neutral} neutral</span>
                  {b.provisional > 0 ? <span className="tabular-nums">{b.provisional} provisional</span> : null}
                  <span className="tabular-nums">{b.optOut} opted out</span>
                  <span className="ml-auto tabular-nums">{gap} not reachable</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {SEG.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-full", s.cls)} /> {s.label}
          </span>
        ))}
      </div>

      {/* drill-down: who? */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Who consented — drill down</CardTitle>
          <CardDescription>
            Pick a consent and a status to see exactly who — the list marketing acts on, and the gap
            to work on.
          </CardDescription>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Select value={drillKey} onValueChange={(v) => setDrillKey(v ?? CONSENTS[0].key)}>
              <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONSENTS.map((c) => (
                  <SelectItem key={c.key} value={c.key}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={drillStatus} onValueChange={(v) => setDrillStatus((v as DisplayConsentState | "all") ?? "all")}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="opt-in">Opted in</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="provisional">Provisional</SelectItem>
                <SelectItem value="opt-out">Opted out</SelectItem>
                <SelectItem value="all">All statuses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{drillRows.length}</span>{" "}
            {drillRows.length === 1 ? "person" : "people"}
            {drillDef ? ` · ${drillDef.name}` : ""}
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="whitespace-nowrap">Captured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drillRows.slice(0, 40).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{r.type}</TableCell>
                    <TableCell className="text-muted-foreground">{r.company}</TableCell>
                    <TableCell><ConsentStateBadge state={r.consents[drillKey]} /></TableCell>
                    <TableCell className="text-muted-foreground">{r.sources[drillKey] ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                      {r.capturedAt[drillKey] ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {drillRows.length > 40 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Showing first 40 of {drillRows.length}. <Badge variant="secondary" className="ml-1">demo</Badge>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
