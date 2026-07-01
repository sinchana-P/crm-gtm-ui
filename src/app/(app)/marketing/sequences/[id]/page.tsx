"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  GitBranch,
  Mail,
  MessageCircle,
  Plus,
  SquareCheck,
} from "lucide-react";
import type { SequenceStepType } from "@/lib/types";
import {
  SequenceStatusBadge,
  SequenceTypeBadge,
} from "@/components/marketing/status-badges";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MOCK_SEQUENCES, MOCK_SEQUENCE_STEPS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<SequenceStepType, typeof Mail> = {
  email: Mail,
  wait: Clock,
  task: SquareCheck,
  whatsapp: MessageCircle,
  branch: GitBranch,
};

const STEP_COLORS: Record<SequenceStepType, string> = {
  email: "border-l-sky-500",
  wait: "border-l-amber-500",
  task: "border-l-violet-500",
  whatsapp: "border-l-emerald-500",
  branch: "border-l-orange-500",
};

export default function SequenceBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const sequence = MOCK_SEQUENCES.find((s) => s.id === id) ?? MOCK_SEQUENCES[0];
  const steps = MOCK_SEQUENCE_STEPS[sequence.id] ?? MOCK_SEQUENCE_STEPS.s1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ButtonLink href="/marketing/sequences" variant="ghost" size="icon-sm">
          <ArrowLeft className="size-4" />
        </ButtonLink>
        <PageHeader
          title={sequence.name}
          description="Visual sequence builder with enrollment and exit rules."
          actions={
            <Button variant="outline" size="sm">
              <Plus className="mr-2 size-4" />
              Add step
            </Button>
          }
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <SequenceTypeBadge type={sequence.type} />
        <SequenceStatusBadge status={sequence.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-medium text-muted-foreground">Steps</h2>
          <div className="relative space-y-0">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[step.type];
              return (
                <div key={step.id} className="relative flex gap-4 pb-6">
                  {index < steps.length - 1 && (
                    <div className="absolute top-10 left-[18px] h-[calc(100%-24px)] w-px bg-border" />
                  )}
                  <div className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border bg-background">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <Card
                    className={cn(
                      "flex-1 border-l-4 shadow-none",
                      STEP_COLORS[step.type]
                    )}
                  >
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{step.label}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {step.type} · {step.config}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Step {step.order}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Enrollment stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatRow label="Enrolled" value={sequence.enrolled} />
              <StatRow label="Completed" value={sequence.completed} />
              <StatRow label="Replied" value={sequence.replied} />
              <StatRow
                label="Completion rate"
                value={
                  sequence.enrolled > 0
                    ? `${((sequence.completed / sequence.enrolled) * 100).toFixed(1)}%`
                    : "—"
                }
              />
            </CardContent>
          </Card>

          {sequence.type === "sales" && (
            <Card className="shadow-none">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium">Pause on reply</p>
                  <p className="text-xs text-muted-foreground">
                    Stop sequence when contact responds
                  </p>
                </div>
                <Switch defaultChecked={sequence.pauseOnReply} />
              </CardContent>
            </Card>
          )}

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Goal exit settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Exit when</Label>
                <Select defaultValue="meeting">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting booked</SelectItem>
                    <SelectItem value="reply">Contact replies</SelectItem>
                    <SelectItem value="deal">Deal created</SelectItem>
                    <SelectItem value="unsubscribe">Unsubscribes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Re-enrollment</Label>
                <Select defaultValue="never">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Do not allow</SelectItem>
                    <SelectItem value="completed">After completion only</SelectItem>
                    <SelectItem value="always">Always allow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
