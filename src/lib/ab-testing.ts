/**
 * A/B testing engine — pure functions, no React, no store.
 *
 * This is the real statistical model from the PRD, not placeholder maths:
 * a two-proportion z-test with Holm-Bonferroni correction, Wilson confidence
 * intervals, and minimum-detectable-effect estimation. It is deliberately
 * framework-free so the same logic can move to the production frontend (or be
 * ported to the service) unchanged.
 */

import type {
  AbComparison,
  AbInconclusiveReason,
  AbTestConfig,
  AbTestVariant,
  AbTestedVariable,
  AbWinnerMetric,
} from "@/lib/types";

/* ── labels ────────────────────────────────────────────────────────────── */

export const TESTED_VARIABLE_LABELS: Record<AbTestedVariable, string> = {
  subject_line: "Subject line",
  content: "Email content",
  sender_name: "Sender name",
};

export const TESTED_VARIABLE_HELP: Record<AbTestedVariable, string> = {
  subject_line: "Best for improving open rates. Fastest results.",
  content: "Best for improving clicks and conversions.",
  sender_name: "Test how the 'from' name affects opens.",
};

/** Labels verbatim from HubSpot's "Winning metric" dropdown. */
export const WINNER_METRIC_LABELS: Record<AbWinnerMetric, string> = {
  open_rate: "Open rate",
  click_rate: "Click rate",
  click_through_rate: "Click through rate",
};

export const WINNER_METRIC_HELP: Record<AbWinnerMetric, string> = {
  open_rate: "Opens ÷ delivered",
  click_rate: "Clicks ÷ delivered",
  click_through_rate: "Clicks ÷ opens",
};

/**
 * Why this metric pairs with this variable. Surfacing the reason is what stops
 * marketers judging a subject-line test on click rate — the single most common
 * way an A/B test reaches a false conclusion.
 */
export const METRIC_RATIONALE: Record<AbTestedVariable, string> = {
  subject_line: "Subject lines mainly affect whether people open.",
  content: "Content mainly affects whether people click.",
  sender_name: "The sender name mainly affects whether people open.",
};

/** The metric a given variable can actually influence. */
export function defaultMetricFor(variable: AbTestedVariable): AbWinnerMetric {
  return variable === "content" ? "click_rate" : "open_rate";
}

/**
 * HubSpot lets you pair any metric with any change and says nothing about it.
 * We still allow every combination, but flag the ones that can't work: a
 * subject line only reaches clicks through opens, and click-through-rate uses
 * opens as its denominator, so the treatment effect sits in the divisor.
 */
export function metricMismatch(
  variable: AbTestedVariable,
  metric: AbWinnerMetric
): string | null {
  if (variable !== "content" && metric === "click_through_rate") {
    return "Click through rate divides by opens, so it can't measure a change that acts on opens.";
  }
  if (variable !== "content" && metric === "click_rate") {
    return `A ${TESTED_VARIABLE_LABELS[variable].toLowerCase()} can't directly affect click rate — this test may be hard to interpret.`;
  }
  return null;
}

/* ── metric extraction ─────────────────────────────────────────────────── */

export function delivered(v: AbTestVariant) {
  return v.delivered ?? v.sent;
}

/** Numerator and denominator for a variant on a given metric. */
export function metricParts(v: AbTestVariant, metric: AbWinnerMetric) {
  switch (metric) {
    case "open_rate":
      return { num: v.opened, den: delivered(v) };
    case "click_rate":
      return { num: v.clicked, den: delivered(v) };
    case "click_through_rate":
      return { num: v.clicked, den: v.opened };
  }
}

export function metricRate(v: AbTestVariant, metric: AbWinnerMetric) {
  const { num, den } = metricParts(v, metric);
  return den > 0 ? num / den : 0;
}

export function pct(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function ratio(num: number, den: number) {
  return den > 0 ? num / den : 0;
}

/* ── statistics ────────────────────────────────────────────────────────── */

/** Standard normal CDF via the Abramowitz-Stegun erf approximation. */
function normalCdf(z: number) {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

/** Two-sided two-proportion z-test. Returns the p-value. */
export function twoProportionPValue(
  xa: number,
  na: number,
  xb: number,
  nb: number
): number {
  if (na <= 0 || nb <= 0) return 1;
  const pa = xa / na;
  const pb = xb / nb;
  const pPool = (xa + xb) / (na + nb);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / na + 1 / nb));
  if (se === 0) return 1;
  const z = (pa - pb) / se;
  return Math.min(1, Math.max(0, 2 * (1 - normalCdf(Math.abs(z)))));
}

/** Wilson score interval — behaves correctly at small n, unlike the normal approximation. */
export function wilsonInterval(x: number, n: number, z = 1.96) {
  if (n <= 0) return { lower: 0, upper: 0 };
  const p = x / n;
  const denom = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return {
    lower: Math.max(0, (centre - spread) / denom),
    upper: Math.min(1, (centre + spread) / denom),
  };
}

/**
 * Holm-Bonferroni correction. With four variants there are three comparisons;
 * at a raw alpha of 0.05 each, the family-wise false-positive rate is ~14%.
 * Skipping this manufactures winners.
 */
export function holmAdjust(pValues: number[]): number[] {
  const indexed = pValues.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  const m = pValues.length;
  const out = new Array<number>(m);
  let running = 0;
  indexed.forEach(({ p, i }, rank) => {
    const adjusted = Math.min(1, p * (m - rank));
    running = Math.max(running, adjusted); // enforce monotonicity
    out[i] = running;
  });
  return out;
}

/**
 * Minimum detectable effect at this sample size (95% confidence, 80% power),
 * expressed in absolute percentage points.
 */
export function minDetectableEffect(baselineRate: number, nPerVariant: number) {
  if (nPerVariant <= 0) return 1;
  const p = baselineRate > 0 ? baselineRate : 0.25;
  return 2.8 * Math.sqrt((2 * p * (1 - p)) / nPerVariant);
}

/** Recipients per variant needed to detect `mde` at the given baseline. */
export function requiredSample(baselineRate: number, mde: number) {
  const p = baselineRate > 0 ? baselineRate : 0.25;
  if (mde <= 0) return Infinity;
  return Math.ceil((15.7 * p * (1 - p)) / (mde * mde));
}

/* ── deterministic assignment ──────────────────────────────────────────── */

/** FNV-1a. Stable across reloads, so a contact always lands in the same variant. */
function hashString(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Bucket a contact into 0-9999. Independent salts keep cohort and variant uncorrelated. */
export function bucket(salt: string, testId: string, contactId: string) {
  return hashString(`${salt}:${testId}:${contactId}`) % 10_000;
}

export function assignCohort(testId: string, contactId: string, samplePercent: number) {
  return bucket("cohort", testId, contactId) < Math.round(samplePercent * 100)
    ? "test"
    : "rollout";
}

/** Map a contact onto cumulative variant weights. */
export function assignVariant(
  testId: string,
  contactId: string,
  variants: { id: string; weight?: number }[]
) {
  const b = bucket("variant", testId, contactId);
  const total = variants.reduce((s, v) => s + (v.weight ?? 100 / variants.length), 0);
  let cursor = 0;
  for (const v of variants) {
    cursor += ((v.weight ?? 100 / variants.length) / total) * 10_000;
    if (b < cursor) return v.id;
  }
  return variants[variants.length - 1]?.id;
}

/* ── split preview ─────────────────────────────────────────────────────── */

export interface SplitPreviewRow {
  id: string;
  label: string;
  isControl: boolean;
  weight: number;
  recipients: number;
}

export interface SplitPreview {
  audience: number;
  testCohort: number;
  rollout: number;
  rows: SplitPreviewRow[];
  /** Smallest variant — the one that constrains the whole test. */
  minVariant: number;
  mdePoints: number;
  belowRecommended: boolean;
  belowFloor: boolean;
}

export const RECIPIENT_FLOOR = 50;
export const RECOMMENDED_SAMPLE = 1000;

export function buildSplitPreview(
  audience: number,
  samplePercent: number,
  splitMode: "sample_and_rollout" | "permanent_5050",
  variants: { id: string; label: string; isControl?: boolean; weight?: number }[],
  baselineRate = 0.25
): SplitPreview {
  // A permanent 50/50 split has no held-back remainder — every enrolling
  // contact is assigned a version, so the whole audience is the test pool.
  const effectivePct = splitMode === "permanent_5050" ? 100 : samplePercent;
  const testCohort = Math.round((audience * effectivePct) / 100);
  const rows = variants.map((v) => {
    const weight = v.weight ?? 100 / variants.length;
    return {
      id: v.id,
      label: v.label,
      isControl: !!v.isControl,
      weight,
      recipients: Math.round((testCohort * weight) / 100),
    };
  });
  const minVariant = rows.length ? Math.min(...rows.map((r) => r.recipients)) : 0;
  return {
    audience,
    testCohort,
    rollout: Math.max(0, audience - testCohort),
    rows,
    minVariant,
    mdePoints: minDetectableEffect(baselineRate, minVariant),
    belowRecommended: minVariant < RECOMMENDED_SAMPLE,
    belowFloor: minVariant < RECIPIENT_FLOOR,
  };
}

/* ── sample ratio mismatch ─────────────────────────────────────────────── */

export interface SampleRatioCheck {
  /** True when the observed split is too far from the configured one. */
  mismatch: boolean;
  pValue: number;
  rows: { id: string; label: string; expected: number; observed: number }[];
}

/**
 * Sample Ratio Mismatch (SRM) check.
 *
 * Randomised assignment is what makes the two groups comparable — if a 50/50
 * split actually delivers 60/40, the groups are no longer representative and
 * the winner is measuring the skew rather than the change. This is the standard
 * health check on every serious experimentation platform, and it catches the
 * failure mode that quietly invalidates results: an assignment bug, a partial
 * dispatch, or one version's recipients being filtered differently.
 *
 * Chi-squared goodness-of-fit against the configured weights. With two versions
 * there is 1 degree of freedom, so the p-value is exact via the normal
 * distribution. The threshold is deliberately strict (0.001, the industry
 * convention) because a false alarm here wastes a whole test.
 */
export function checkSampleRatio(
  variants: AbTestVariant[],
  threshold = 0.001
): SampleRatioCheck {
  const rows = variants.map((v) => ({
    id: v.id,
    label: v.name || v.label,
    weight: v.weight ?? 100 / variants.length,
    observed: v.assigned ?? v.sent,
  }));

  const total = rows.reduce((sum, r) => sum + r.observed, 0);
  const weightTotal = rows.reduce((sum, r) => sum + r.weight, 0) || 1;

  const detailed = rows.map((r) => ({
    id: r.id,
    label: r.label,
    observed: r.observed,
    expected: (total * r.weight) / weightTotal,
  }));

  // Too little data for the check to mean anything either way.
  if (total < 100 || variants.length < 2) {
    return { mismatch: false, pValue: 1, rows: detailed };
  }

  const chiSq = detailed.reduce(
    (sum, r) => (r.expected > 0 ? sum + (r.observed - r.expected) ** 2 / r.expected : sum),
    0
  );

  // df = variants - 1. Exact for df = 1, which is always the case at two versions.
  const pValue =
    variants.length === 2
      ? Math.min(1, Math.max(0, 2 * (1 - normalCdf(Math.sqrt(chiSq)))))
      : 1;

  return { mismatch: pValue < threshold, pValue, rows: detailed };
}

/* ── evaluation ────────────────────────────────────────────────────────── */

export interface EvaluationResult {
  leaderId?: string;
  significant: boolean;
  confidence: number;
  comparisons: AbComparison[];
  inconclusiveReason?: AbInconclusiveReason;
  sampleMet: boolean;
  minObserved: number;
  /** Winner leads on the metric but burns the list — rollout must be confirmed. */
  guardrailBreach: boolean;
  guardrailNote?: string;
  /** Assignment health. A mismatch means the result can't be trusted at all. */
  sampleRatio: SampleRatioCheck;
}

/**
 * The single decision point. Runs once, never continuously — evaluating on a
 * loop and stopping the moment p < 0.05 is peeking, and it inflates false
 * positives badly.
 */
export function evaluate(config: AbTestConfig): EvaluationResult {
  const metric = config.primaryMetric ?? config.winnerCriteria ?? "open_rate";
  const threshold = config.confidenceThreshold ?? 0.95;
  const minSample = config.minSamplePerVariant ?? RECOMMENDED_SAMPLE;
  const variants = config.variants;

  const denominators = variants.map((v) => metricParts(v, metric).den);
  const minObserved = denominators.length ? Math.min(...denominators) : 0;
  const totalNumerator = variants.reduce((s, v) => s + metricParts(v, metric).num, 0);

  const base: EvaluationResult = {
    significant: false,
    confidence: 0,
    comparisons: [],
    sampleMet: minObserved >= minSample,
    minObserved,
    guardrailBreach: false,
    sampleRatio: checkSampleRatio(variants),
  };

  // A skewed split means the groups aren't comparable, so there is nothing
  // meaningful to compare. Stop before declaring anything.
  if (base.sampleRatio.mismatch) {
    return { ...base, inconclusiveReason: "assignment_skew" };
  }

  if (minObserved === 0 || totalNumerator === 0) {
    return { ...base, inconclusiveReason: "no_data" };
  }

  // Rank by the primary metric. On a tie the control wins — the conservative choice.
  const ranked = [...variants].sort((a, b) => {
    const diff = metricRate(b, metric) - metricRate(a, metric);
    if (Math.abs(diff) > 1e-9) return diff;
    return (b.isControl ? 1 : 0) - (a.isControl ? 1 : 0);
  });
  const leader = ranked[0];
  const others = ranked.slice(1);

  const control = variants.find((v) => v.isControl) ?? variants[0];
  const spread = Math.abs(metricRate(leader, metric) - metricRate(control, metric));

  const leaderParts = metricParts(leader, metric);
  const raw = others.map((o) => {
    const p = metricParts(o, metric);
    return twoProportionPValue(leaderParts.num, leaderParts.den, p.num, p.den);
  });
  const adjusted = holmAdjust(raw);

  const comparisons: AbComparison[] = others.map((o, i) => ({
    leaderId: leader.id,
    againstId: o.id,
    rawPValue: raw[i],
    adjustedPValue: adjusted[i],
    significant: adjusted[i] < 1 - threshold,
  }));

  // Guardrail: a variant that wins on clicks while doubling unsubscribes should
  // not silently go to the rest of the list.
  const leaderUnsub = ratio(leader.unsubscribed ?? 0, delivered(leader));
  const controlUnsub = ratio(control.unsubscribed ?? 0, delivered(control));
  const leaderBounce = ratio(leader.bounced ?? 0, delivered(leader));
  const controlBounce = ratio(control.bounced ?? 0, delivered(control));
  const unsubBreach = leader.id !== control.id && controlUnsub > 0 && leaderUnsub > controlUnsub * 2;
  const bounceBreach = leader.id !== control.id && controlBounce > 0 && leaderBounce > controlBounce * 2;

  const guardrail = {
    guardrailBreach: unsubBreach || bounceBreach,
    guardrailNote: unsubBreach
      ? `${leader.label} unsubscribe rate is ${pct(leaderUnsub, 2)} vs ${pct(controlUnsub, 2)} on the control.`
      : bounceBreach
        ? `${leader.label} bounce rate is ${pct(leaderBounce, 2)} vs ${pct(controlBounce, 2)} on the control.`
        : undefined,
  };

  if (!base.sampleMet && config.status !== "stopped") {
    return { ...base, ...guardrail, comparisons, inconclusiveReason: "insufficient_sample" };
  }
  if (spread < 0.005) {
    return { ...base, ...guardrail, comparisons, inconclusiveReason: "effectively_tied" };
  }

  // The leader must beat every other variant after correction.
  const allSignificant = comparisons.length > 0 && comparisons.every((c) => c.significant);
  const confidence = comparisons.length
    ? 1 - Math.max(...comparisons.map((c) => c.adjustedPValue))
    : 0;

  return {
    ...base,
    ...guardrail,
    leaderId: leader.id,
    comparisons,
    significant: allSignificant,
    confidence,
    inconclusiveReason: allSignificant ? undefined : "no_significance",
  };
}

/** Lift of a variant against the control, as a proportion. */
export function liftVsControl(
  variant: AbTestVariant,
  control: AbTestVariant,
  metric: AbWinnerMetric
) {
  const c = metricRate(control, metric);
  if (c === 0) return 0;
  return (metricRate(variant, metric) - c) / c;
}

export const INCONCLUSIVE_COPY: Record<AbInconclusiveReason, { title: string; body: string }> = {
  no_significance: {
    title: "No clear winner",
    body: "The gap between versions is small enough that it could be chance. Running longer or testing a bolder difference would give a firmer answer.",
  },
  effectively_tied: {
    title: "Versions performed the same",
    body: "Both versions landed within half a percentage point of each other. Either is fine — try a bolder difference next time.",
  },
  insufficient_sample: {
    title: "Not enough data",
    body: "Too few recipients engaged to tell the versions apart reliably. A larger test slice or a bigger segment would fix this.",
  },
  no_data: {
    title: "No engagement recorded",
    body: "No opens or clicks came back for any version. Worth checking that tracking is configured before reading anything into this.",
  },
  assignment_skew: {
    title: "The split didn't come out even",
    body: "Recipients didn't land in the versions in the proportions you set, so the two groups aren't comparable and no winner can be read from them. This usually points to a delivery problem rather than a content one — worth re-running the test before drawing any conclusion.",
  },
};
