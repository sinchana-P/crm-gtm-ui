"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Info, Lock } from "lucide-react";
import type {
  AbTestConfig,
  AbTestVariant,
  AbWinnerMetric,
  Campaign,
  EmailBlock,
} from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_EMAIL_TEMPLATES } from "@/lib/mock-data";
import { cloneBlocks } from "@/components/marketing/email/email-shared";
import { AbVersionEditor } from "@/components/marketing/campaigns/ab-test/ab-version-editor";
import {
  RECIPIENT_FLOOR,
  RECOMMENDED_SAMPLE,
  WINNER_METRIC_HELP,
  WINNER_METRIC_LABELS,
  buildSplitPreview,
  metricMismatch,
} from "@/lib/ab-testing";

/**
 * HubSpot's marketing-email A/B test is strictly two versions ("Version A" /
 * "Version B"), so this mirrors that rather than offering 3-4.
 */
export const MAX_VARIANTS = 2;

/** Confidence used to decide "inconclusive", and therefore whether the fallback
 * version is sent. HubSpot does not expose a threshold, so this is fixed. */
export const CONFIDENCE_THRESHOLD = 0.95;

/**
 * HubSpot runs a permanent 50/50 split for automated (workflow) emails and a
 * sample-then-rollout for one-off marketing emails. Recurring campaigns here
 * are the equivalent of a workflow: contacts arrive over time, so there is no
 * fixed list to hold a remainder back from.
 */
export function splitModeFor(campaignType: Campaign["type"]) {
  return campaignType === "recurring" ? "permanent_5050" : "sample_and_rollout";
}

export function emptyAbConfig(
  campaignSubject: string,
  campaignType: Campaign["type"],
  campaignTemplateId?: string,
  campaignTemplateName?: string
): AbTestConfig {
  // Both versions start as independent copies of the campaign's template, the
  // way HubSpot seeds Version B from Version A. Copies, not references: editing
  // one version must never touch the other or the underlying template.
  const template = MOCK_EMAIL_TEMPLATES.find((t) => t.id === campaignTemplateId);
  const sourceBlocks = template?.blocks ?? [];

  const base = {
    subject: campaignSubject || template?.subject || "",
    preheader: template?.preheader,
    senderName: template?.fromName ?? "Connect NX",
    templateId: campaignTemplateId,
    templateName: campaignTemplateName ?? template?.name,
    weight: 50,
    sent: 0,
    opened: 0,
    clicked: 0,
  };

  return {
    enabled: true,
    status: "draft",
    splitMode: splitModeFor(campaignType),
    samplePercent: 20,
    winnerCriteria: "open_rate",
    primaryMetric: "open_rate",
    winnerMode: campaignType === "recurring" ? "manual" : "auto",
    confidenceThreshold: CONFIDENCE_THRESHOLD,
    minSamplePerVariant: RECOMMENDED_SAMPLE,
    testWindowHours: 4,
    fallbackVariantId: "va",
    variants: [
      {
        ...base,
        id: "va",
        label: "Version A",
        name: "Original",
        isControl: true,
        blocks: cloneBlocks(sourceBlocks),
      },
      {
        ...base,
        id: "vb",
        label: "Version B",
        name: "Variation",
        isControl: false,
        blocks: cloneBlocks(sourceBlocks),
      },
    ],
  };
}

/** Which of the three editable fields actually differ between the versions. */
export function changedFields(variants: AbTestVariant[]) {
  const [a, b] = variants;
  if (!a || !b) return [];
  const diffs: string[] = [];
  if ((a.subject ?? "") !== (b.subject ?? "")) diffs.push("subject line");
  if ((a.preheader ?? "") !== (b.preheader ?? "")) diffs.push("preview text");
  if ((a.senderName ?? "") !== (b.senderName ?? "")) diffs.push("sender name");
  if (!blocksEqual(a.blocks ?? [], b.blocks ?? [])) diffs.push("content");
  return diffs;
}

/** Structural comparison that ignores block ids — those always differ by design. */
function blocksEqual(a: EmailBlock[], b: EmailBlock[]) {
  if (a.length !== b.length) return false;
  const strip = (block: EmailBlock) =>
    JSON.stringify(block, (key, value) => (key === "id" ? undefined : value));
  return a.every((block, i) => strip(block) === strip(b[i]));
}

export interface AbConfigValidation {
  errors: string[];
  warnings: string[];
  valid: boolean;
}

export function validateAbConfig(
  config: AbTestConfig,
  audienceSize: number
): AbConfigValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const permanent = config.splitMode === "permanent_5050";
  const diffs = changedFields(config.variants);

  if (config.variants.length !== 2) {
    errors.push("An A/B test has exactly two versions.");
  }
  config.variants.forEach((v) => {
    if (!v.name?.trim()) errors.push(`${v.label} needs a name.`);
  });
  if (diffs.length === 0) {
    errors.push("The two versions are identical — change something on Version B to have a test.");
  }

  const preview = buildSplitPreview(
    audienceSize,
    config.samplePercent,
    config.splitMode ?? "sample_and_rollout",
    config.variants
  );

  if (!permanent) {
    if (config.samplePercent < 1 || config.samplePercent > 100) {
      errors.push("The test percentage must be between 1 and 100.");
    }
    if (preview.minVariant < RECIPIENT_FLOOR) {
      errors.push(
        `At ${config.samplePercent}% each version reaches about ${preview.minVariant.toLocaleString()} contacts — below the ${RECIPIENT_FLOOR} minimum.`
      );
    } else if (preview.belowRecommended) {
      warnings.push(
        `About ${preview.minVariant.toLocaleString()} recipients per version. HubSpot recommends at least ${RECOMMENDED_SAMPLE.toLocaleString()} contacts for a reliable read — at this size only a difference of roughly ${(preview.mdePoints * 100).toFixed(1)} percentage points would show up clearly.`
      );
    }
    if (!config.fallbackVariantId) {
      errors.push("Pick a fallback version to send if the test is inconclusive.");
    }
  }

  const window = config.testWindowHours ?? 4;
  if (!window || window < 1) {
    errors.push("Test length must be at least 1 hour.");
  } else if (window > 168) {
    errors.push("Test length can't exceed 168 hours (7 days).");
  }

  const metric = config.primaryMetric ?? "open_rate";
  if (diffs.length > 1) {
    warnings.push(
      `You've changed ${diffs.length} things between versions (${diffs.join(", ")}). You'll learn which version won, but not which change caused it.`
    );
  }
  const mismatch = metricMismatch(config.testedVariable ?? "subject_line", metric);
  if (diffs.length === 1 && diffs[0] === "subject line" && mismatch) {
    warnings.push(mismatch);
  }
  if (metric === "open_rate" && window < 2) {
    warnings.push("Most opens land in the first 2-4 hours. A shorter window may pick the wrong winner.");
  }
  if (metric === "open_rate") {
    warnings.push("Apple Mail Privacy Protection inflates open counts. Worth confirming with click rate.");
  }

  return { errors, warnings, valid: errors.length === 0 };
}

/* ── panel ─────────────────────────────────────────────────────────────── */

interface Props {
  config: AbTestConfig;
  onChange: (patch: Partial<AbTestConfig>) => void;
  audienceSize: number;
  campaignType: Campaign["type"];
  readOnly?: boolean;
}

export function AbTestConfigPanel({
  config,
  onChange,
  audienceSize,
  campaignType,
  readOnly = false,
}: Props) {
  const metric = config.primaryMetric ?? "open_rate";
  const splitMode = config.splitMode ?? splitModeFor(campaignType);
  const permanent = splitMode === "permanent_5050";
  const validation = useMemo(() => validateAbConfig(config, audienceSize), [config, audienceSize]);
  const preview = useMemo(
    () => buildSplitPreview(audienceSize, config.samplePercent, splitMode, config.variants),
    [audienceSize, config.samplePercent, splitMode, config.variants]
  );
  const diffs = changedFields(config.variants);
  const [activeVersionId, setActiveVersionId] = useState(config.variants[0]?.id ?? "va");

  function patchVariant(id: string, patch: Partial<AbTestVariant>) {
    onChange({ variants: config.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
  }

  return (
    <div className="grid gap-6">
      {readOnly && (
        <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
          <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">
            This test has already sent. Versions, split and winning metric are locked — changing them
            now would invalidate everything measured so far.
          </p>
        </div>
      )}

      {/* ── 1. build both versions of the email ────────────────────── */}
      <section className="grid gap-3">
        <div>
          <Label className="text-sm font-medium">Build your versions</Label>
          <p className="text-xs text-muted-foreground">
            Both versions start as a duplicate of your campaign email and are independently editable
            from there — subject, preview text, sender and body. Change one thing to learn{" "}
            <em>why</em> it won; change several and you&apos;ll only learn <em>that</em> it did.
          </p>
        </div>

        <AbVersionEditor
          variants={config.variants}
          activeId={activeVersionId}
          onActiveIdChange={setActiveVersionId}
          onPatchVariant={patchVariant}
          sourceTemplateName={config.variants[0]?.templateName}
          readOnly={readOnly}
        />

        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs">
            {diffs.length ? (
              <>
                <span className="text-muted-foreground">Differences between versions: </span>
                <span className="font-medium">{diffs.join(", ")}</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                The two versions are identical so far — change something on one of them.
              </span>
            )}
          </p>
        </div>
      </section>

      <Separator />

      {/* ── 2. audience split ──────────────────────────────────────── */}
      <section className="grid gap-3">
        <div>
          <Label className="text-sm font-medium">Audience split</Label>
          <p className="text-xs text-muted-foreground">
            Your campaign segment, divided. The audience itself is set in the Audience step.
          </p>
        </div>

        {permanent ? (
          <div className="grid gap-3">
            <div className="flex items-start gap-2 rounded-lg border p-3">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Recurring campaign — split 50/50 as contacts enrol</p>
                <p className="text-muted-foreground">
                  Contacts are assigned a version when they enter, so the split evens out over time
                  rather than all at once. There is no held-back remainder, so nothing rolls out
                  automatically: once you pick a winner, every future contact gets that version and
                  the other is archived.
                </p>
              </div>
            </div>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead className="text-right">Share of enrolments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.variants.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name || v.label}</TableCell>
                      <TableCell className="text-right tabular-nums">50%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="grid gap-1.5 sm:max-w-sm">
              <Label htmlFor="ab-sample" className="text-xs">
                How many recipients should receive the A/B test
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="ab-sample"
                  type="number"
                  min={1}
                  max={100}
                  value={config.samplePercent}
                  disabled={readOnly}
                  onChange={(e) => onChange({ samplePercent: Number(e.target.value) || 0 })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Split evenly between the two versions. The remaining recipients are sent the winning
                version automatically.
              </p>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                    <TableHead className="text-right">Recipients</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row, i) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {config.variants[i]?.name || row.label}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {(config.samplePercent / 2).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.recipients.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/30">
                    <TableCell className="text-muted-foreground">
                      Remainder — automatically sent the winner
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {(100 - config.samplePercent).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {preview.rollout.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </section>

      <Separator />

      {/* ── 3. winning metric + test length + fallback ─────────────── */}
      <section className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-xs">Winning metric</Label>
            <Select
              value={metric}
              onValueChange={(v) => {
                const next = (v as AbWinnerMetric) ?? "open_rate";
                onChange({
                  primaryMetric: next,
                  winnerCriteria: next === "open_rate" ? "open_rate" : "click_rate",
                });
              }}
              disabled={readOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) => WINNER_METRIC_LABELS[v as AbWinnerMetric] ?? "Open rate"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(WINNER_METRIC_LABELS) as AbWinnerMetric[]).map((m) => (
                  <SelectItem key={m} value={m}>
                    {WINNER_METRIC_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{WINNER_METRIC_HELP[metric]}</p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="ab-length" className="text-xs">
              Test length
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="ab-length"
                type="number"
                min={1}
                max={168}
                value={config.testWindowHours ?? 4}
                onChange={(e) => onChange({ testWindowHours: Number(e.target.value) || 0 })}
                disabled={readOnly}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {permanent
                ? "How long before results are ready for you to pick a winner."
                : "How long before the winner is chosen and sent to the remainder."}
            </p>
          </div>
        </div>

        {!permanent && (
          <div className="grid gap-1.5 sm:max-w-sm">
            <Label className="text-xs">Fallback version</Label>
            <Select
              value={config.fallbackVariantId ?? config.variants[0]?.id}
              onValueChange={(v) => onChange({ fallbackVariantId: v ?? undefined })}
              disabled={readOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) =>
                    config.variants.find((x) => x.id === v)?.name ??
                    config.variants[0]?.name ??
                    "Version A"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {config.variants.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name || v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Sent to the remainder if the two versions finish too close to call. We treat a result as
              inconclusive below {Math.round(CONFIDENCE_THRESHOLD * 100)}% confidence.
            </p>
          </div>
        )}

        {permanent && (
          <p className="text-xs text-muted-foreground">
            Recurring campaigns have no remainder, so there is no fallback send — if the result is
            too close to call, you can leave both versions running or pick one yourself.
          </p>
        )}
      </section>

      {/* ── validation ───────────────────────────────────────────── */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="grid gap-2">
          {validation.errors.map((e) => (
            <div
              key={e}
              className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-700 dark:text-red-400"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{e}</span>
            </div>
          ))}
          {validation.warnings.map((w) => (
            <div
              key={w}
              className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400"
            >
              <Info className="mt-0.5 size-4 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
