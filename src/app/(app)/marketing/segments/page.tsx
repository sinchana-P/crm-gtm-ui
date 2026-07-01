"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MOCK_CONTACTS,
  SEGMENT_FIELDS,
  SEGMENT_OPERATORS,
} from "@/lib/mock-data";
import type { SegmentCriterion } from "@/lib/types";

function evaluateCriterion(contact: (typeof MOCK_CONTACTS)[0], c: SegmentCriterion) {
  const raw = contact[c.field as keyof typeof contact];
  const val = String(raw ?? "").toLowerCase();
  const target = c.value.toLowerCase();
  switch (c.operator) {
    case "equals":
      return val === target;
    case "not_equals":
      return val !== target;
    case "contains":
      return val.includes(target);
    case "greater_than":
      return Number(raw) > Number(c.value);
    case "less_than":
      return Number(raw) < Number(c.value);
    default:
      return false;
  }
}

export default function SegmentsPage() {
  const [segmentName, setSegmentName] = useState("Active leads — South");
  const [criteria, setCriteria] = useState<SegmentCriterion[]>([
    { field: "lifecycleStage", operator: "equals", value: "lead" },
    { field: "territory", operator: "equals", value: "South" },
  ]);

  const liveCount = useMemo(() => {
    return MOCK_CONTACTS.filter((contact) =>
      criteria.every((c) => evaluateCriterion(contact, c))
    ).length;
  }, [criteria]);

  function addRow() {
    setCriteria((prev) => [
      ...prev,
      { field: "lifecycleStage", operator: "equals", value: "" },
    ]);
  }

  function updateRow(index: number, patch: Partial<SegmentCriterion>) {
    setCriteria((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function removeRow(index: number) {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Segments"
        description="Build dynamic audiences with live preview against your contact database."
        actions={<Button>Save segment</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Segment builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Segment name</label>
              <Input
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Criteria</p>
              {criteria.map((row, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2">
                  {index > 0 && (
                    <span className="w-10 text-center text-xs font-medium text-muted-foreground">
                      AND
                    </span>
                  )}
                  {index === 0 && <span className="w-10" />}
                  <Select
                    value={row.field}
                    onValueChange={(v) => updateRow(index, { field: v ?? row.field })}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENT_FIELDS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={row.operator}
                    onValueChange={(v) => updateRow(index, { operator: v ?? row.operator })}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENT_OPERATORS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="w-[140px]"
                    value={row.value}
                    onChange={(e) => updateRow(index, { value: e.target.value })}
                    placeholder="Value"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRow(index)}
                    disabled={criteria.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="mr-2 size-4" />
                Add criteria
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Live preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-background">
                <Users className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-3xl font-semibold tabular-nums">{liveCount}</p>
                <p className="text-sm text-muted-foreground">
                  contacts match (of {MOCK_CONTACTS.length} sample)
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Preview uses sample contact data. Production counts query your full database.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
