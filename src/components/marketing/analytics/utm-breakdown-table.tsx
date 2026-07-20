"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Link2Off } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { getSourceMeta, type FormUtmSubmission } from "@/lib/mock-data";
import {
  buildBreakdown,
  type BreakdownRow,
  type UtmDimension,
} from "@/lib/marketing/utm-analytics";
import { Sparkline } from "./sparkline";
import { cn } from "@/lib/utils";

type SortKey = "views" | "submissions" | "conversionRate";

interface Props {
  submissions: FormUtmSubmission[];
  dimension: UtmDimension;
}

const sortRows = (rows: BreakdownRow[], key: SortKey, dir: 1 | -1): BreakdownRow[] =>
  [...rows]
    .sort((a, b) => (a[key] - b[key]) * dir)
    .map((r) => (r.children ? { ...r, children: sortRows(r.children, key, dir) } : r));

function HeaderButton({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: 1 | -1;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "text-foreground", className)}
    >
      {label}
      <span className={cn("text-[10px]", !active && "opacity-0")}>{dir === -1 ? "▼" : "▲"}</span>
    </button>
  );
}

function Row({
  row,
  depth,
  expanded,
  onToggle,
}: {
  row: BreakdownRow;
  depth: number;
  expanded: Set<string>;
  onToggle: (key: string) => void;
}) {
  const hasChildren = !!row.children?.length;
  const isOpen = expanded.has(row.key);
  const color = getSourceMeta(row.source).chart;

  return (
    <>
      <TableRow className={cn(hasChildren && "cursor-pointer")} onClick={() => hasChildren && onToggle(row.key)}>
        <TableCell className="py-2.5">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {hasChildren ? (
              <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
            ) : (
              <span className="inline-block w-4 shrink-0" />
            )}
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <div className="min-w-0 flex-1">
              <span className={cn("block truncate", depth === 0 ? "font-medium" : "text-muted-foreground")}>
                {row.label}
              </span>
              {/* Inline share bar (GA4-style) doubles as the ranked visual. */}
              <div className="mt-1 h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full" style={{ width: `${row.share}%`, backgroundColor: color }} />
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right tabular-nums text-muted-foreground">{row.views.toLocaleString()}</TableCell>
        <TableCell className="text-right">
          <span className="font-medium tabular-nums">{row.submissions}</span>
          <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{row.share}%</span>
        </TableCell>
        <TableCell className="text-right tabular-nums text-muted-foreground">{row.conversionRate}%</TableCell>
        <TableCell className="w-[120px]">
          <Sparkline data={row.trend} width={90} height={26} color={color} />
        </TableCell>
      </TableRow>
      {isOpen &&
        row.children?.map((child) => (
          <Row key={child.key} row={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
        ))}
    </>
  );
}

export function UtmBreakdownTable({ submissions, dimension }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("submissions");
  const [dir, setDir] = useState<1 | -1>(-1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const base = buildBreakdown(submissions, dimension);
    return sortRows(base, sortKey, dir);
  }, [submissions, dimension, sortKey, dir]);

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const sort = (key: SortKey) => {
    if (key === sortKey) setDir((d) => (d === -1 ? 1 : -1));
    else {
      setSortKey(key);
      setDir(-1);
    }
  };

  if (!rows.length) {
    return (
      <div className="p-6">
        <EmptyState icon={Link2Off} title="No channels match" description="Adjust your filters to see the breakdown." />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="capitalize">{dimension}</TableHead>
          <TableHead className="text-right">
            <HeaderButton label="Visits" active={sortKey === "views"} dir={dir} onClick={() => sort("views")} />
          </TableHead>
          <TableHead className="text-right">
            <HeaderButton label="Submissions" active={sortKey === "submissions"} dir={dir} onClick={() => sort("submissions")} />
          </TableHead>
          <TableHead className="text-right">
            <HeaderButton label="Conv. rate" active={sortKey === "conversionRate"} dir={dir} onClick={() => sort("conversionRate")} />
          </TableHead>
          <TableHead>Trend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <Row key={row.key} row={row} depth={0} expanded={expanded} onToggle={toggle} />
        ))}
      </TableBody>
    </Table>
  );
}
