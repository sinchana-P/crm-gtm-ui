"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ListChecks,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type {
  SegmentCondition,
  SegmentConditionGroup,
  SegmentDefinition,
  SegmentRecord,
  SegmentType,
} from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_CONTACTS } from "@/lib/mock-data";
import { contactName } from "@/lib/format";
import {
  CONTACT_BASE,
  SEGMENT_CATEGORY_LABELS,
  SEGMENT_FIELD_CATALOG,
  estimateCount,
  fieldDef,
  matchContacts,
} from "@/lib/segment-eval";
import { createSegmentId, useSegmentStore } from "@/lib/stores/segment-store";
import { cn } from "@/lib/utils";

let uid = 0;
const nextId = (prefix: string) => `${prefix}-${++uid}-${Date.now()}`;

function emptyCondition(): SegmentCondition {
  return { id: nextId("c"), field: "lifecycleStage", operator: "equals", value: "" };
}

function emptyGroup(): SegmentConditionGroup {
  return { id: nextId("g"), match: "all", conditions: [emptyCondition()] };
}

export function SegmentBuilder({ segmentId }: { segmentId?: string }) {
  const router = useRouter();
  const existing = useSegmentStore((s) =>
    segmentId ? s.segments.find((sg) => sg.id === segmentId) : undefined
  );
  const addSegment = useSegmentStore((s) => s.addSegment);
  const updateSegment = useSegmentStore((s) => s.updateSegment);

  const editMode = !!segmentId;
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [type, setType] = useState<SegmentType>(existing?.type ?? "dynamic");
  const [definition, setDefinition] = useState<SegmentDefinition>(
    existing?.definition ?? { match: "all", groups: [emptyGroup()] }
  );
  const [memberIds, setMemberIds] = useState<string[]>(existing?.staticMemberIds ?? []);
  const [memberSearch, setMemberSearch] = useState("");
  const [refreshMode, setRefreshMode] = useState(existing?.refresh.mode ?? "scheduled");
  const [refreshFrequency, setRefreshFrequency] = useState(
    existing?.refresh.frequency ?? "daily"
  );

  const matched = useMemo(
    () => (type === "dynamic" ? matchContacts(MOCK_CONTACTS, definition) : []),
    [type, definition]
  );
  const estimated = estimateCount(matched.length, MOCK_CONTACTS.length);
  const matchPct = MOCK_CONTACTS.length
    ? Math.round((matched.length / MOCK_CONTACTS.length) * 100)
    : 0;

  const filteredContacts = useMemo(() => {
    const q = memberSearch.toLowerCase();
    return MOCK_CONTACTS.filter(
      (c) =>
        !q ||
        contactName(c.firstName, c.lastName).toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company ?? "").toLowerCase().includes(q)
    );
  }, [memberSearch]);

  if (editMode && !existing) {
    return (
      <EmptyState
        title="Segment not found"
        description="This segment may have been deleted."
        action={
          <Button variant="outline" onClick={() => router.push("/marketing/segments")}>
            <ArrowLeft className="size-4" />
            Back to segments
          </Button>
        }
      />
    );
  }

  function patchGroup(groupId: string, patch: Partial<SegmentConditionGroup>) {
    setDefinition((d) => ({
      ...d,
      groups: d.groups.map((g) => (g.id === groupId ? { ...g, ...patch } : g)),
    }));
  }

  function patchCondition(groupId: string, conditionId: string, patch: Partial<SegmentCondition>) {
    setDefinition((d) => ({
      ...d,
      groups: d.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.map((c) =>
                c.id === conditionId ? { ...c, ...patch } : c
              ),
            }
          : g
      ),
    }));
  }

  function save() {
    if (!name.trim()) {
      toast.error("Give the segment a name first");
      return;
    }
    const now = new Date().toISOString();
    if (editMode && existing) {
      updateSegment(existing.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        definition: type === "dynamic" ? definition : undefined,
        staticMemberIds: type === "static" ? memberIds : undefined,
        memberCount:
          type === "dynamic"
            ? estimated
            : Math.max(memberIds.length, existing.memberCount - (existing.staticMemberIds?.length ?? 0) + memberIds.length),
        refresh:
          type === "dynamic"
            ? {
                ...existing.refresh,
                mode: refreshMode,
                frequency: refreshMode === "scheduled" ? refreshFrequency : undefined,
              }
            : existing.refresh,
      });
      toast.success("Segment updated");
      router.push(`/marketing/segments/${existing.id}`);
      return;
    }
    const segment: SegmentRecord = {
      id: createSegmentId(),
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      origin: "manual",
      memberCount: type === "dynamic" ? estimated : memberIds.length,
      weeklyChange: 0,
      definition: type === "dynamic" ? definition : undefined,
      staticMemberIds: type === "static" ? memberIds : undefined,
      owner: "Priya Sharma",
      createdAt: now,
      updatedAt: now,
      refresh:
        type === "dynamic"
          ? {
              mode: refreshMode,
              frequency: refreshMode === "scheduled" ? refreshFrequency : undefined,
              lastRefreshedAt: now,
              history: [],
            }
          : { mode: "manual", history: [] },
      usedIn: [],
    };
    addSegment(segment);
    toast.success("Segment created");
    router.push(`/marketing/segments/${segment.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            onClick={() => router.push("/marketing/segments")}
          >
            <ArrowLeft className="size-4" />
            Segments
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {editMode ? `Edit ${existing?.name}` : "Create segment"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {type === "dynamic"
              ? "Combine filter groups with AND/OR logic. Membership refreshes automatically."
              : "Hand-pick contacts for a fixed list that only changes when you edit it."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/marketing/segments")}>
            Cancel
          </Button>
          <Button onClick={save}>
            <Save className="size-4" />
            {editMode ? "Save changes" : "Create segment"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sb-name">Segment name</Label>
                <Input
                  id="sb-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="High-intent trial users"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sb-desc">Description (optional)</Label>
                <Textarea
                  id="sb-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Who belongs here and what is it for?"
                />
              </div>
              {!editMode && (
                <div className="grid gap-2">
                  <Label>Segment type</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setType("dynamic")}
                      className={cn(
                        "flex flex-1 items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                        type === "dynamic" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      )}
                    >
                      <Zap className={cn("mt-0.5 size-4", type === "dynamic" ? "text-primary" : "text-muted-foreground")} />
                      <span>
                        <span className="block text-sm font-medium">Active (dynamic)</span>
                        <span className="block text-xs text-muted-foreground">
                          Rule-based — membership updates automatically as contacts change.
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("static")}
                      className={cn(
                        "flex flex-1 items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                        type === "static" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      )}
                    >
                      <ListChecks className={cn("mt-0.5 size-4", type === "static" ? "text-primary" : "text-muted-foreground")} />
                      <span>
                        <span className="block text-sm font-medium">Static</span>
                        <span className="block text-xs text-muted-foreground">
                          Curated — a fixed list for one-time or fixed-audience sends.
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {type === "dynamic" ? (
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Filter logic</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Contacts must match</span>
                  <Select
                    value={definition.match}
                    onValueChange={(v) =>
                      setDefinition((d) => ({ ...d, match: (v as "all" | "any") ?? "all" }))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">all groups</SelectItem>
                      <SelectItem value="any">any group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {definition.groups.map((group, gi) => (
                  <div key={group.id}>
                    {gi > 0 && (
                      <div className="flex items-center gap-3 py-1.5">
                        <div className="h-px flex-1 bg-border" />
                        <Badge variant="outline" className="uppercase">
                          {definition.match === "all" ? "and" : "or"}
                        </Badge>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    )}
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Group {gi + 1}</span>
                          <span className="text-muted-foreground">— match</span>
                          <Select
                            value={group.match}
                            onValueChange={(v) =>
                              patchGroup(group.id, { match: (v as "all" | "any") ?? "all" })
                            }
                          >
                            <SelectTrigger className="h-7 w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">all conditions (AND)</SelectItem>
                              <SelectItem value="any">any condition (OR)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={definition.groups.length === 1}
                          onClick={() =>
                            setDefinition((d) => ({
                              ...d,
                              groups: d.groups.filter((g) => g.id !== group.id),
                            }))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {group.conditions.map((condition, ci) => {
                          const def = fieldDef(condition.field);
                          return (
                            <div key={condition.id} className="flex flex-wrap items-center gap-2">
                              <span className="w-12 text-right text-xs font-medium text-muted-foreground uppercase">
                                {ci === 0 ? "where" : group.match === "all" ? "and" : "or"}
                              </span>
                              <Select
                                value={condition.field}
                                onValueChange={(v) => {
                                  const nf = fieldDef(v ?? condition.field);
                                  patchCondition(group.id, condition.id, {
                                    field: v ?? condition.field,
                                    operator: nf?.operators[0]?.value ?? "equals",
                                    value: "",
                                  });
                                }}
                              >
                                <SelectTrigger className="w-52">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(["crm", "behavioral", "custom"] as const).map((cat) => (
                                    <div key={cat}>
                                      <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-muted-foreground uppercase">
                                        {SEGMENT_CATEGORY_LABELS[cat]}
                                      </div>
                                      {SEGMENT_FIELD_CATALOG.filter((f) => f.category === cat).map(
                                        (f) => (
                                          <SelectItem key={f.value} value={f.value}>
                                            {f.label}
                                          </SelectItem>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={condition.operator}
                                onValueChange={(v) =>
                                  patchCondition(group.id, condition.id, {
                                    operator: v ?? condition.operator,
                                  })
                                }
                              >
                                <SelectTrigger className="w-44">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(def?.operators ?? []).map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                      {o.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {def?.input === "select" ? (
                                <Select
                                  value={condition.value}
                                  onValueChange={(v) =>
                                    patchCondition(group.id, condition.id, { value: v ?? "" })
                                  }
                                >
                                  <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Select value" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(def.options ?? []).map((o) => (
                                      <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  type={def?.input === "number" ? "number" : "text"}
                                  className="w-44"
                                  placeholder="Value"
                                  value={condition.value}
                                  onChange={(e) =>
                                    patchCondition(group.id, condition.id, {
                                      value: e.target.value,
                                    })
                                  }
                                />
                              )}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={group.conditions.length === 1}
                                onClick={() =>
                                  patchGroup(group.id, {
                                    conditions: group.conditions.filter(
                                      (c) => c.id !== condition.id
                                    ),
                                  })
                                }
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 ml-12"
                        onClick={() =>
                          patchGroup(group.id, {
                            conditions: [...group.conditions, emptyCondition()],
                          })
                        }
                      >
                        <Plus className="size-4" />
                        Add condition
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDefinition((d) => ({ ...d, groups: [...d.groups, emptyGroup()] }))
                  }
                >
                  <Plus className="size-4" />
                  Add filter group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  Members
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {memberIds.length} selected
                  </span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info("CSV import is simulated in this preview")}
                >
                  <Upload className="size-4" />
                  Import CSV
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search contacts…"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-96 divide-y overflow-y-auto rounded-lg border">
                  {filteredContacts.map((c) => {
                    const checked = memberIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/40"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setMemberIds((ids) =>
                              v ? [...ids, c.id] : ids.filter((id) => id !== c.id)
                            )
                          }
                        />
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {c.firstName[0]}
                          {c.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {contactName(c.firstName, c.lastName)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.email} {c.company ? `· ${c.company}` : ""}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {c.lifecycleStage}
                        </Badge>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="shadow-none lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-muted-foreground" />
                Live member preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {type === "dynamic" ? (
                <>
                  <div>
                    <p className="text-3xl font-semibold tabular-nums">
                      ~{estimated.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of {CONTACT_BASE.toLocaleString()} contacts ({matchPct}% of sample)
                    </p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${matchPct}%` }}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                      Sample matches
                    </p>
                    {matched.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No sample contacts match yet — loosen a condition or switch a group to
                        OR.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {matched.slice(0, 5).map((c) => (
                          <div key={c.id} className="flex items-center gap-2.5">
                            <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[11px] font-medium">
                              {c.firstName[0]}
                              {c.lastName[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm">{contactName(c.firstName, c.lastName)}</p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {c.lifecycleStage}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Counts recalculate instantly as you edit rules. Production estimates query the
                    full database.
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-3xl font-semibold tabular-nums">{memberIds.length}</p>
                    <p className="text-sm text-muted-foreground">contacts selected</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Static segments never change on their own — ideal for one-time or
                    fixed-audience sends.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {type === "dynamic" && (
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Refresh engine</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-2">
                  <Label>Recalculation</Label>
                  <Select
                    value={refreshMode}
                    onValueChange={(v) => setRefreshMode((v as typeof refreshMode) ?? "scheduled")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="manual">On demand only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {refreshMode === "scheduled" && (
                  <div className="grid gap-2">
                    <Label>Frequency</Label>
                    <Select
                      value={refreshFrequency}
                      onValueChange={(v) =>
                        setRefreshFrequency((v as typeof refreshFrequency) ?? "daily")
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
