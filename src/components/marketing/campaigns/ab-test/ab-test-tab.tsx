"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  FlaskConical,
  Hourglass,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Square,
  Timer,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { AbCohort, AbTestConfig, Campaign } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_EMAIL_TEMPLATES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  INCONCLUSIVE_COPY,
  WINNER_METRIC_LABELS,
  defaultMetricFor,
  evaluate,
  liftVsControl,
} from "@/lib/ab-testing";
import {
  SCENARIO_HELP,
  SCENARIO_LABELS,
  useAbTestStore,
  type SimulationScenario,
} from "@/lib/stores/ab-test-store";
import {
  AbStatusBadge,
  GuardrailChip,
  SignificanceChip,
} from "@/components/marketing/campaigns/ab-test/ab-test-shared";
import {
  ComparisonDetail,
  MetricComparisonChart,
  VariantFunnel,
  VariantResultsTable,
} from "@/components/marketing/campaigns/ab-test/ab-test-results";
import {
  AbTestConfigPanel,
  changedFields,
  emptyAbConfig,
} from "@/components/marketing/campaigns/ab-test/ab-test-config-panel";

function formatTime(ms?: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCountdown(target: number, now: number) {
  const diff = target - now;
  if (diff <= 0) return "due now";
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return hours > 0 ? `in ${hours}h ${minutes}m` : `in ${minutes}m`;
}

/** Minute-bucketed so the snapshot is stable between ticks. */
function currentMinute() {
  return Math.floor(Date.now() / 60_000);
}

function subscribeToMinute(onChange: () => void) {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
}

/**
 * Resolves only on the client. A clock-derived string rendered on the server
 * guarantees a hydration mismatch, so the server snapshot is deliberately null
 * and the first paint omits the countdown.
 */
function useCountdown(target?: number) {
  const minute = useSyncExternalStore(
    subscribeToMinute,
    currentMinute,
    () => null as number | null
  );
  if (!target || minute === null) return null;
  return formatCountdown(target, minute * 60_000);
}

/**
 * A test can be added to any campaign that hasn't sent yet. Once the first
 * email is out, adding one is meaningless — part of the audience has already
 * received a version that was never part of a comparison.
 */
export function canAddAbTest(campaign: Campaign) {
  return campaign.status === "draft" || campaign.status === "scheduled";
}

export function AbTestTab({ campaign }: { campaign: Campaign }) {
  const ab = campaign.abTest;
  const configure = useAbTestStore((s) => s.configure);

  if (!ab?.enabled) {
    const template = MOCK_EMAIL_TEMPLATES.find((t) => t.id === campaign.templateId);
    const eligible = canAddAbTest(campaign);
    const emailOnly = campaign.channel !== "email";

    if (!eligible) {
      return (
        <EmptyState
          title="This campaign has already sent"
          description="An A/B test can only be added before the first email goes out — part of this audience has already received a version that was never compared against anything. Duplicate the campaign to run a test on the same audience."
        />
      );
    }

    if (emailOnly) {
      return (
        <EmptyState
          title="A/B testing is email-only for now"
          description={`This campaign sends over ${campaign.channel}. Testing on that channel arrives with the channel itself.`}
        />
      );
    }

    // An A/B test duplicates the campaign's existing email — it never starts
    // from a blank canvas. Without an email chosen there is nothing to copy.
    if (!template) {
      return (
        <EmptyState
          title="Choose this campaign's email first"
          description="An A/B test starts by duplicating the email you've already built, so both versions share the same design. Pick a template in the campaign's Setup tab, then come back."
        />
      );
    }

    return (
      <EmptyState
        title="No A/B test on this campaign"
        description={`Both versions start as a copy of “${template.name}” — your campaign's email — so they share the same design. Edit either one, then test on a slice of the audience and send the winner to everyone else.`}
        action={
          <Button
            onClick={() => {
              configure(
                campaign.id,
                emptyAbConfig(
                  template?.subject ?? "",
                  campaign.type,
                  campaign.templateId,
                  campaign.templateName ?? template?.name
                )
              );
              toast.success("A/B test added — configure it below");
            }}
          >
            <FlaskConical className="size-4" />
            Add an A/B test
          </Button>
        }
      />
    );
  }

  // Keyed on the test's own identity so local UI state resets when the test is replaced.
  return <AbTestTabInner key={ab.variants.map((v) => v.id).join("-")} campaign={campaign} ab={ab} />;
}

/** Split out so `ab` is non-optional inside the render closures below. */
function AbTestTabInner({ campaign, ab }: { campaign: Campaign; ab: AbTestConfig }) {
  const actions = useAbTestStore();
  const [cohort, setCohort] = useState<AbCohort>("test");
  const [declareOpen, setDeclareOpen] = useState(false);
  const [pickedVariant, setPickedVariant] = useState<string>("");
  const [scenario, setScenario] = useState<SimulationScenario>("clear_winner");
  const [showConfig, setShowConfig] = useState(false);

  const audienceSize = campaign.sent || 12_480;

  const result = useMemo(() => evaluate(ab), [ab]);
  const shownConfidence = ab.winnerConfidence ?? result.confidence;
  const diffs = changedFields(ab.variants);
  const evaluateCountdown = useCountdown(ab.evaluateAt);

  const status = ab.status ?? "draft";
  const metric = ab.primaryMetric ?? defaultMetricFor(ab.testedVariable ?? "subject_line");
  const control = ab.variants.find((v) => v.isControl) ?? ab.variants[0];
  const winner = ab.variants.find((v) => v.id === ab.winningVariantId);
  const live = status === "running";
  // A recurring campaign runs HubSpot's permanent 50/50 split: no remainder, so
  // no rollout — picking a winner just stops the other version being sent.
  const permanent = ab.splitMode === "permanent_5050";
  const notStarted = status === "draft" || status === "scheduled";
  const configLocked = !notStarted;

  /* ── banner ───────────────────────────────────────────────────────── */

  function renderBanner() {
    if (notStarted) {
      return (
        <BannerShell tone="neutral" icon={<Hourglass className="size-5" />}>
          <p className="font-medium">
            {status === "scheduled" ? "Test starts with the campaign" : "Test not started"}
          </p>
          <p className="text-sm text-muted-foreground">
            {diffs.length ? `Differs on ${diffs.join(" + ")}` : "No differences set yet"} ·{" "}
            {permanent
              ? "50/50 as contacts enrol"
              : `${ab.samplePercent}% tested, remainder gets the winner`}{" "}
            · winner by {WINNER_METRIC_LABELS[metric].toLowerCase()} after{" "}
            {ab.testWindowHours ?? 4}h
          </p>
        </BannerShell>
      );
    }

    if (live) {
      return (
        <BannerShell tone="violet" icon={<Timer className="size-5" />}>
          <p className="font-medium">Test in progress — results are not final</p>
          <p className="text-sm text-muted-foreground">
            {permanent
              ? "Contacts are being split 50/50 as they enrol, so the split evens out over time."
              : `Comparing versions ${evaluateCountdown ? `${evaluateCountdown} ` : ""}(${formatTime(ab.evaluateAt)}).`}
            {ab.extensionCount ? ` Window extended ${ab.extensionCount}×.` : ""}
          </p>
        </BannerShell>
      );
    }

    if (status === "awaiting_decision") {
      const leader = ab.variants.find((v) => v.id === result?.leaderId);
      return (
        <BannerShell tone="amber" icon={<AlertTriangle className="size-5" />}>
          <p className="font-medium">
            Results ready — {leader?.name ?? leader?.label ?? "no version"} leads
            {result.significant
              ? ` with ${Math.round(shownConfidence * 100)}% confidence`
              : ", but not conclusively"}
          </p>
          <p className="text-sm text-muted-foreground">
            {permanent
              ? "Pick a winner and every future enrolment gets that version — the other is archived."
              : `You chose to pick the winner yourself. ${(ab.rolloutSize ?? 0).toLocaleString()} contacts are waiting.`}
          </p>
        </BannerShell>
      );
    }

    if (status === "winner_selected") {
      return (
        <BannerShell tone="emerald" icon={<Crown className="size-5" />}>
          <p className="font-medium">
            {winner?.name ?? winner?.label} won
            {ab.winnerIsSignificant ? ` with ${Math.round(shownConfidence * 100)}% confidence` : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            {winner && control && winner.id !== control.id
              ? `${(liftVsControl(winner, control, metric) * 100).toFixed(1)}% lift on ${WINNER_METRIC_LABELS[metric].toLowerCase()}. `
              : ""}
            Ready to send to the remaining {(ab.rolloutSize ?? 0).toLocaleString()} contacts.
          </p>
        </BannerShell>
      );
    }

    if (status === "inconclusive") {
      const copy = INCONCLUSIVE_COPY[ab.inconclusiveReason ?? "no_significance"];
      return (
        <BannerShell tone="orange" icon={<AlertTriangle className="size-5" />}>
          <p className="font-medium">{copy.title}</p>
          <p className="text-sm text-muted-foreground">
            {copy.body}
            {ab.winningVariantId
              ? ` Your fallback version, ${
                  ab.variants.find((v) => v.id === ab.winningVariantId)?.name ??
                  ab.variants.find((v) => v.id === ab.winningVariantId)?.label
                }, was sent to the remainder.`
              : " Nothing further was sent."}
          </p>
        </BannerShell>
      );
    }

    if (status === "rolled_out") {
      return (
        <BannerShell tone="emerald" icon={<CheckCircle2 className="size-5" />}>
          <p className="font-medium">
            {permanent
              ? `${winner?.name ?? winner?.label} is now the only version sent`
              : `${winner?.name ?? winner?.label} sent to ${(ab.rolloutSize ?? 0).toLocaleString()} remaining contacts`}
          </p>
          <p className="text-sm text-muted-foreground">
            {permanent
              ? `Chosen ${formatTime(ab.rolloutSentAt)}. Every future enrolment receives it; the other version is archived.`
              : `Completed ${formatTime(ab.rolloutSentAt)}. Results below are frozen as of the decision.`}
          </p>
        </BannerShell>
      );
    }

    if (status === "completed") {
      return (
        <BannerShell tone="blue" icon={<CheckCircle2 className="size-5" />}>
          <p className="font-medium">Measurement complete</p>
          <p className="text-sm text-muted-foreground">
            This test was set to measure only — no follow-up send was made.
            {ab.winningVariantId
              ? ` ${ab.variants.find((v) => v.id === ab.winningVariantId)?.label} performed best.`
              : ""}
          </p>
        </BannerShell>
      );
    }

    return (
      <BannerShell tone="red" icon={<Square className="size-5" />}>
        <p className="font-medium">Test stopped</p>
        <p className="text-sm text-muted-foreground">
          {ab.stoppedReason ?? "Stopped early."} Results below are partial and should be read as such.
        </p>
      </BannerShell>
    );
  }

  /* ── actions ──────────────────────────────────────────────────────── */

  function renderActions() {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {notStarted && (
          <>
            <Button onClick={() => { actions.launch(campaign.id, audienceSize); toast.success("Test cohort dispatched"); }}>
              <Play className="size-4" />
              Launch test
            </Button>
            <Button variant="outline" onClick={() => setShowConfig((s) => !s)}>
              <SlidersHorizontal className="size-4" />
              {showConfig ? "Hide settings" : "Edit test"}
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => { actions.remove(campaign.id); toast.success("A/B test removed — campaign will send normally"); }}
            >
              <Trash2 className="size-4" />
              Remove test
            </Button>
          </>
        )}

        {live && (
          <>
            <Button onClick={() => { actions.runEvaluation(campaign.id); toast.success("Results evaluated"); }}>
              <Sparkles className="size-4" />
              Evaluate now
            </Button>
            <Button variant="outline" onClick={() => { actions.extendWindow(campaign.id, 4); toast.success("Window extended by 4 hours"); }}>
              <Clock className="size-4" />
              Extend 4h
            </Button>
            <Button
              variant="outline"
              onClick={() => { actions.stop(campaign.id, "Stopped manually by Priya Sharma"); toast.success("Test stopped"); }}
            >
              <Square className="size-4" />
              Stop test
            </Button>
          </>
        )}

        {status === "awaiting_decision" && (
          <>
            <Button onClick={() => { setPickedVariant(result?.leaderId ?? control.id); setDeclareOpen(true); }}>
              <Crown className="size-4" />
              Declare winner
            </Button>
            <Button variant="outline" onClick={() => { actions.extendWindow(campaign.id, 4); toast.success("Window extended by 4 hours"); }}>
              <Clock className="size-4" />
              Keep testing 4h
            </Button>
          </>
        )}

        {status === "winner_selected" && !permanent && (
          <Button
            onClick={() => {
              actions.rolloutWinner(campaign.id);
              toast.success(`${winner?.name ?? winner?.label} sent to the remaining audience`);
            }}
          >
            <Send className="size-4" />
            Send winner to {(ab.rolloutSize ?? 0).toLocaleString()} remaining
          </Button>
        )}

        {status === "inconclusive" && (
          <Button variant="outline" onClick={() => { setPickedVariant(result?.leaderId ?? control.id); setDeclareOpen(true); }}>
            <Crown className="size-4" />
            Override and pick a winner
          </Button>
        )}

        {!notStarted && (
          <>
            <Button variant="outline" onClick={() => setShowConfig((v) => !v)}>
              <SlidersHorizontal className="size-4" />
              {showConfig ? "Hide versions" : "View versions"}
            </Button>
            <Button
              variant="ghost"
              className="ml-auto text-muted-foreground"
              onClick={() => { actions.reset(campaign.id); toast.success("Test reset to scheduled"); }}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </>
        )}
      </div>
    );
  }

  /* ── render ───────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">A/B test</h2>
          <AbStatusBadge status={status} />
          {result?.guardrailBreach && !notStarted && <GuardrailChip note={result.guardrailNote} />}
        </div>
        {!notStarted && !live && (
          <SignificanceChip
            confidence={shownConfidence}
            threshold={ab.confidenceThreshold ?? 0.95}
            sampleMet={result?.sampleMet ?? true}
            minObserved={result?.minObserved}
            forced={ab.winnerIsSignificant === false && !!ab.winningVariantId}
          />
        )}
        {live && <SignificanceChip confidence={0} live />}
      </div>

      {renderBanner()}
      {renderActions()}

      {/* Assignment health. Shown before any result, because a skewed split means
          the numbers below aren't comparing like with like. */}
      {result.sampleRatio.mismatch && !notStarted && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
          <div className="text-sm">
            <p className="font-medium text-red-700 dark:text-red-400">
              The split didn&apos;t come out even — treat these results as unusable
            </p>
            <p className="text-muted-foreground">
              You set{" "}
              {result.sampleRatio.rows
                .map((r) => `${Math.round(r.expected).toLocaleString()}`)
                .join(" / ")}{" "}
              but the versions actually reached{" "}
              {result.sampleRatio.rows
                .map((r) => `${r.observed.toLocaleString()}`)
                .join(" / ")}
              . The two groups aren&apos;t comparable, so any difference below could be the skew
              rather than the change you made.
            </p>
          </div>
        </div>
      )}

      {/* guardrail veto — a winner that burns the list must not roll out quietly */}
      {result?.guardrailBreach && status === "winner_selected" && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
          <div className="text-sm">
            <p className="font-medium text-red-700 dark:text-red-400">
              Automatic rollout is on hold
            </p>
            <p className="text-muted-foreground">
              {result.guardrailNote} This version leads on{" "}
              {WINNER_METRIC_LABELS[metric].toLowerCase()} but is costing you subscribers — worth a
              second look before it reaches another {ab.rolloutSize?.toLocaleString() ?? 0} people.
            </p>
          </div>
        </div>
      )}

      {/* configuration, editable only before the first send */}
      {(showConfig || notStarted) && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              {configLocked ? "Versions as sent" : "Test settings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AbTestConfigPanel
              config={ab}
              onChange={(patch) => actions.configure(campaign.id, { ...ab, ...patch })}
              audienceSize={audienceSize}
              campaignType={campaign.type}
              readOnly={configLocked}
            />
          </CardContent>
        </Card>
      )}

      {!notStarted && (
        <>
          {/* cohort separation — test and rollout results must never be pooled */}
          {ab.rolloutSentAt && (
            <Tabs value={cohort} onValueChange={(v) => setCohort((v as AbCohort) ?? "test")}>
              <TabsList>
                <TabsTrigger value="test">Test cohort</TabsTrigger>
                <TabsTrigger value="rollout">Rollout cohort</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {cohort === "rollout" ? (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Rollout cohort</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">{winner?.label}</span> was sent to{" "}
                  <span className="font-medium tabular-nums">
                    {ab.rolloutSize?.toLocaleString() ?? 0}
                  </span>{" "}
                  contacts on {formatTime(ab.rolloutSentAt)}.
                </p>
                <p className="text-muted-foreground">
                  These recipients had no competing version, so there is nothing to compare them
                  against. Their engagement is reported on the campaign Overview rather than here —
                  pooling them with the test cohort would bias the winner upward.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <VariantResultsTable config={ab} metric={metric} live={live} />

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {WINNER_METRIC_LABELS[metric]} by version
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricComparisonChart variants={ab.variants} metric={metric} />
                  </CardContent>
                </Card>
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">Where each version won or lost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VariantFunnel variants={ab.variants} />
                  </CardContent>
                </Card>
              </div>

              {!live && <ComparisonDetail config={ab} />}
            </div>
          )}
        </>
      )}

      {/* prototype-only: drive engagement without waiting on real traffic */}
      <Card className="border-dashed shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-muted-foreground" />
            Prototype controls
            <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
              Demo only
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            In production these numbers arrive from delivery and engagement events. Pick an outcome
            and simulate it to walk the full lifecycle.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">Outcome</Label>
              <Select
                value={scenario}
                onValueChange={(v) => setScenario((v as SimulationScenario) ?? "clear_winner")}
              >
                <SelectTrigger className="w-60">
                  <SelectValue>
                    {(v) => SCENARIO_LABELS[v as SimulationScenario] ?? "Pick an outcome"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SCENARIO_LABELS) as SimulationScenario[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {SCENARIO_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (notStarted) actions.launch(campaign.id, audienceSize);
                actions.simulateEngagement(campaign.id, scenario);
                toast.success(`Simulated: ${SCENARIO_LABELS[scenario]}`);
              }}
            >
              <ChevronRight className="size-4" />
              Simulate engagement
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{SCENARIO_HELP[scenario]}</p>
        </CardContent>
      </Card>

      {/* declare winner */}
      <Dialog open={declareOpen} onOpenChange={setDeclareOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Declare the winner</DialogTitle>
            <DialogDescription>
              {permanent
                ? "Every contact enrolling from now on receives the version you pick. The other version is archived."
                : `The version you pick is sent to the ${(ab.rolloutSize ?? 0).toLocaleString()} contacts who haven't received anything yet.`}
            </DialogDescription>
          </DialogHeader>

          <RadioGroup value={pickedVariant} onValueChange={(v) => setPickedVariant(v ?? "")} className="grid gap-2">
            {ab.variants.map((v) => {
              const isLeader = v.id === result?.leaderId;
              return (
                <label
                  key={v.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3",
                    pickedVariant === v.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={v.id} className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium">{v.name || v.label}</span>
                      {v.isControl && (
                        <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
                          Control
                        </Badge>
                      )}
                      {isLeader && (
                        <Badge variant="outline" className="border-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          Best performer
                        </Badge>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {ab.testedVariable === "content"
                        ? (v.templateName ?? "—")
                        : ab.testedVariable === "sender_name"
                          ? (v.senderName ?? "Connect NX")
                          : `“${v.subject}”`}
                    </span>
                  </span>
                </label>
              );
            })}
          </RadioGroup>

          {!result?.significant && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                The difference between versions isn&apos;t statistically reliable. Whichever you pick
                will be marked “selected manually — not statistically significant” everywhere it&apos;s
                reported, including exports.
              </span>
            </div>
          )}

          <Separator />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclareOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!pickedVariant}
              onClick={() => {
                actions.declareWinner(campaign.id, pickedVariant, { force: !result?.significant });
                setDeclareOpen(false);
                toast.success("Winner declared");
              }}
            >
              <Crown className="size-4" />
              Confirm winner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── banner shell ──────────────────────────────────────────────────────── */

const TONES = {
  neutral: "border-border bg-muted/40 text-muted-foreground",
  violet: "border-violet-500/30 bg-violet-500/5 text-violet-600 dark:text-violet-400",
  amber: "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400",
  emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  orange: "border-orange-500/30 bg-orange-500/5 text-orange-600 dark:text-orange-400",
  blue: "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400",
  red: "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400",
} as const;

function BannerShell({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof TONES;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-4", TONES[tone])}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 text-foreground">{children}</div>
    </div>
  );
}
