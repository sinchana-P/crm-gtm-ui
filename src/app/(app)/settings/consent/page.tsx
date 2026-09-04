import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Cookie,
  Database,
  FileText,
  Mail,
  MessageSquare,
  Monitor,
  PenLine,
  Phone,
  PhoneCall,
  SquareCheckBig,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AI_LADDER,
  CAPTURE_SOURCES,
  CONSENT_CATALOG,
  CONSENT_CATEGORIES,
  DURATION_BY_KEY,
  LEGAL_BASIS_LABEL,
  PROOF_STRENGTH_LABEL,
  captureSourceById,
  definitionsByCategory,
  type ProofStrength,
} from "@/lib/mock-data/consent-policy";

const SOURCE_ICONS: Record<string, LucideIcon> = {
  monitor: Monitor,
  mail: Mail,
  "square-check-big": SquareCheckBig,
  "message-square": MessageSquare,
  "pen-line": PenLine,
  upload: Upload,
  "phone-call": PhoneCall,
  cookie: Cookie,
  phone: Phone,
  database: Database,
};

const STRENGTH_STYLES: Record<ProofStrength, string> = {
  strong: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "confirm-required": "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  risky: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
};

const toggleableCount = CONSENT_CATALOG.filter((d) => d.toggleable).length;
const trackedCount = CONSENT_CATALOG.length - toggleableCount;

function SummaryStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function SettingsConsentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent & Privacy"
        description="The catalog of consents this organization captures, tracks, and manages — one reference register. This lists scope, not on/off state; per-contact capture happens on each contact record."
        actions={
          <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            Settings
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryStat value={CONSENT_CATALOG.length} label="Consents managed" />
        <SummaryStat value={toggleableCount} label="Consent-gated" />
        <SummaryStat value={trackedCount} label="Tracked only" />
        <SummaryStat value={CAPTURE_SOURCES.length} label="Capture sources" />
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col gap-2 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl">
            <span className="font-medium text-foreground">Read-only register.</span> Managing a
            consent means ConnectNx records it with its source, timestamp &amp; proof and surfaces it
            on every contact record. Enforcement (gating sends or reads) is not switched on in this
            version — this page documents what is covered.
          </p>
          <Link
            href="/marketing/subscriptions"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
          >
            Email subscriptions &amp; suppression
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </CardContent>
      </Card>

      {/* ---- The catalog, grouped by category ---- */}
      {CONSENT_CATEGORIES.map((cat) => (
        <Card key={cat.id}>
          <CardHeader>
            <CardTitle className="text-base">{cat.label}</CardTitle>
            <CardDescription>{cat.blurb}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {definitionsByCategory(cat.id).map((def) => {
              const duration = DURATION_BY_KEY[def.durationKey];
              const highBar = def.basis === "explicit-consent";
              return (
                <div key={def.key} className="border-t py-4 first:border-t-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{def.name}</p>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          {def.key}
                        </code>
                        {highBar ? (
                          <Badge
                            variant="outline"
                            className="border-red-500/30 bg-red-500/10 font-mono text-[10px] text-red-700 dark:text-red-400"
                          >
                            High bar
                          </Badge>
                        ) : null}
                        {!def.toggleable ? (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            Tracked only
                          </Badge>
                        ) : null}
                      </div>
                      <p className="max-w-2xl text-sm text-muted-foreground">{def.description}</p>
                    </div>
                    <div className="flex flex-none flex-wrap gap-1.5 sm:flex-col sm:items-end">
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {LEGAL_BASIS_LABEL[def.basis]}
                      </Badge>
                      {duration ? (
                        <Badge variant="secondary" className="font-mono text-[11px]">
                          {duration.label}
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  {def.captureVia.length > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Captured from
                      </span>
                      {def.captureVia.map((id) => {
                        const src = captureSourceById(id);
                        return (
                          <span
                            key={id}
                            className="rounded-full border bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                          >
                            {src?.name ?? id}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* ---- Document → AI escalation ladder ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document → AI escalation ladder</CardTitle>
          <CardDescription>
            Submitting a record is not consent to do anything with it. Each rung is a separate
            consent — reading and OCR, then AI inference, then training.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
            {AI_LADDER.map((step, i) => {
              const isDoc = step.key === null;
              return (
                <li key={step.title} className="flex flex-1 items-stretch gap-2">
                  <div
                    className={cn(
                      "flex-1 rounded-lg border p-3",
                      isDoc ? "border-dashed bg-muted/40" : "bg-card",
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-md text-[11px] font-semibold",
                          isDoc
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {isDoc ? <FileText className="size-3.5" /> : i}
                      </span>
                      <p className="text-sm font-medium">{step.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    {step.key ? (
                      <code className="mt-1.5 inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {step.key}
                      </code>
                    ) : null}
                  </div>
                  {i < AI_LADDER.length - 1 ? (
                    <ArrowRight className="hidden size-4 shrink-0 self-center text-muted-foreground lg:block" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {/* ---- Capture sources & proof registry ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Where consent is captured — and the proof</CardTitle>
          <CardDescription>
            Every capture stores who, when, and what was shown. The channel varies; the evidence is
            the point.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {CAPTURE_SOURCES.map((source) => {
            const Icon = SOURCE_ICONS[source.icon] ?? Monitor;
            return (
              <div key={source.id} className="flex gap-3 rounded-lg border p-3">
                <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{source.name}</p>
                    <Badge
                      variant="outline"
                      className={cn("font-mono text-[10px]", STRENGTH_STYLES[source.strength])}
                    >
                      {PROOF_STRENGTH_LABEL[source.strength]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{source.how}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground/70">Proof:</span> {source.proof}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
