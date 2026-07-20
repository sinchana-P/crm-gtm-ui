// UI-only derivations for per-form UTM analytics. Pure functions over the mock
// submission set so charts/tables/filters stay in sync. Swap the data source
// for the analytics API later without touching these shapes.

import { getSourceMeta, type FormUtmSubmission } from "@/lib/mock-data";

export type UtmDimension = "source" | "medium" | "campaign" | "content";

const DIM_ORDER: UtmDimension[] = ["source", "medium", "campaign", "content"];

export interface BreakdownRow {
  key: string;
  label: string;
  dimension: UtmDimension;
  /** Representative source for colour/icon (row's first member). */
  source: string | null;
  medium: string | null;
  views: number;
  submissions: number;
  conversionRate: number;
  share: number;
  trend: number[];
  children?: BreakdownRow[];
}

export interface SourceShare {
  source: string;
  label: string;
  submissions: number;
  color: string;
}

const viewsFor = (s: FormUtmSubmission): number =>
  getSourceMeta(s.source).viewsPerSubmission;

const dimValue = (s: FormUtmSubmission, dim: UtmDimension): string => {
  if (dim === "source") return s.source ?? "direct";
  const raw = s[dim];
  return raw && raw.trim() !== "" ? raw : "(none)";
};

const dimLabel = (value: string, dim: UtmDimension): string =>
  dim === "source" ? getSourceMeta(value === "direct" ? null : value).label : value;

const roundRate = (submissions: number, views: number): number =>
  views > 0 ? Math.round((submissions / views) * 1000) / 10 : 0;

/** Buckets a member set into a small submissions-count sparkline series. */
const sparkFromSubs = (subs: FormUtmSubmission[], buckets = 8): number[] => {
  if (!subs.length) return new Array(buckets).fill(0);
  const times = subs.map((s) => new Date(s.submittedAt).getTime());
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = Math.max(max - min, 1);
  const series = new Array(buckets).fill(0);
  subs.forEach((s) => {
    const idx = Math.min(
      buckets - 1,
      Math.floor(((new Date(s.submittedAt).getTime() - min) / span) * buckets)
    );
    series[idx] += 1;
  });
  return series;
};

const groupBy = (
  subs: FormUtmSubmission[],
  dim: UtmDimension
): Map<string, FormUtmSubmission[]> => {
  const map = new Map<string, FormUtmSubmission[]>();
  subs.forEach((s) => {
    const key = dimValue(s, dim);
    const bucket = map.get(key);
    if (bucket) bucket.push(s);
    else map.set(key, [s]);
  });
  return map;
};

const buildRows = (
  subs: FormUtmSubmission[],
  dim: UtmDimension,
  total: number,
  parentKey = ""
): BreakdownRow[] => {
  const childDim = DIM_ORDER[DIM_ORDER.indexOf(dim) + 1];
  const groups = groupBy(subs, dim);
  const rows: BreakdownRow[] = [];

  groups.forEach((members, value) => {
    const submissions = members.length;
    const views = members.reduce((acc, s) => acc + viewsFor(s), 0);
    const key = parentKey ? `${parentKey}>${dim}:${value}` : `${dim}:${value}`;
    const distinctChildren =
      childDim && new Set(members.map((m) => dimValue(m, childDim))).size;

    rows.push({
      key,
      label: dimLabel(value, dim),
      dimension: dim,
      source: members[0].source,
      medium: members[0].medium,
      views,
      submissions,
      conversionRate: roundRate(submissions, views),
      share: total > 0 ? Math.round((submissions / total) * 1000) / 10 : 0,
      trend: sparkFromSubs(members),
      children:
        childDim && distinctChildren && distinctChildren > 1
          ? buildRows(members, childDim, total, key)
          : undefined,
    });
  });

  return rows.sort((a, b) => b.submissions - a.submissions);
};

/** Drill-down breakdown grouped by the chosen dimension (one nested level). */
export const buildBreakdown = (
  subs: FormUtmSubmission[],
  dimension: UtmDimension
): BreakdownRow[] => buildRows(subs, dimension, subs.length);

/** Share of submissions by source (for the donut), sorted desc. */
export const buildSourceShare = (subs: FormUtmSubmission[]): SourceShare[] => {
  const groups = groupBy(subs, "source");
  const slices: SourceShare[] = [];
  groups.forEach((members, source) => {
    const meta = getSourceMeta(source === "direct" ? null : source);
    slices.push({
      source,
      label: meta.label,
      submissions: members.length,
      color: meta.chart,
    });
  });
  return slices.sort((a, b) => b.submissions - a.submissions);
};

/** Total synthetic views across a submission set. */
export const totalViews = (subs: FormUtmSubmission[]): number =>
  subs.reduce((acc, s) => acc + viewsFor(s), 0);

/** Formats seconds into a compact `m s` / `s` string. */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};
