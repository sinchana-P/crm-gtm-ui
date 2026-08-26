"use client";

import { useState } from "react";
import { Waypoints, Workflow } from "lucide-react";
import { toast } from "sonner";
import {
  AUTO_TARGETS,
  SEQ_TARGETS,
  contactById,
  type EnrollKind,
} from "@/lib/mock-data/enrollments";
import { useEnrollmentStore } from "@/lib/stores/enrollment-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EnrollDialog({
  open,
  onOpenChange,
  contactIds,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contactIds: string[];
}) {
  const enroll = useEnrollmentStore((s) => s.enroll);
  const [kind, setKind] = useState<EnrollKind>("sequence");
  const [targetId, setTargetId] = useState<string>("");

  const contacts = contactIds.map(contactById).filter(Boolean);
  const targets = kind === "sequence" ? SEQ_TARGETS : AUTO_TARGETS;

  const submit = () => {
    if (!targetId) return;
    const firstStep = kind === "sequence" ? "Step 1" : "Entered";
    const n = enroll(contactIds, kind, targetId, firstStep);
    const name = targets.find((t) => t.id === targetId)?.name;
    if (n === 0) toast.info("All selected contacts are already enrolled here.");
    else toast.success(`Enrolled ${n} ${n === 1 ? "contact" : "contacts"} into “${name}”`);
    onOpenChange(false);
    setTargetId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enroll {contactIds.length} {contactIds.length === 1 ? "contact" : "contacts"}</DialogTitle>
          <DialogDescription>
            Choose where to enroll {contactIds.length === 1 ? "this record" : "these records"} — a rep sequence or an automation.
          </DialogDescription>
        </DialogHeader>

        {/* contacts chips */}
        <div className="flex flex-wrap gap-1.5">
          {contacts.slice(0, 6).map((c) => (
            <Badge key={c!.id} variant="secondary" className="font-normal">{c!.name}</Badge>
          ))}
          {contacts.length > 6 && <Badge variant="secondary">+{contacts.length - 6} more</Badge>}
        </div>

        {/* kind toggle */}
        <div className="grid grid-cols-2 gap-2">
          {([
            { k: "sequence" as const, label: "Sequence", desc: "Rep 1:1 cadence · pause on reply", Icon: Waypoints, tone: "violet" },
            { k: "automation" as const, label: "Automation", desc: "System workflow · rule-based", Icon: Workflow, tone: "indigo" },
          ]).map(({ k, label, desc, Icon, tone }) => (
            <button
              key={k}
              onClick={() => { setKind(k); setTargetId(""); }}
              className={cn(
                "flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors",
                kind === k ? (tone === "violet" ? "border-violet-500 bg-violet-500/5" : "border-indigo-500 bg-indigo-500/5") : "hover:bg-muted/50",
              )}
            >
              <span className={cn("flex size-8 items-center justify-center rounded-lg", tone === "violet" ? "bg-violet-500/10 text-violet-600" : "bg-indigo-500/10 text-indigo-600")}><Icon className="size-4" /></span>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-[11px] text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* target list */}
        <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg border p-2">
          {targets.map((t) => {
            const meta = kind === "sequence" ? (t as (typeof SEQ_TARGETS)[number]) : undefined;
            const auto = kind === "automation" ? (t as (typeof AUTO_TARGETS)[number]) : undefined;
            return (
              <button
                key={t.id}
                onClick={() => setTargetId(t.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border p-2.5 text-left transition-colors",
                  targetId === t.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {meta ? `${meta.type} · ${meta.steps} steps · goal: ${meta.goal}` : `${auto?.object} · when ${auto?.triggerLabel}`}
                  </p>
                </div>
                {meta && <Badge variant="outline" className="capitalize">{meta.type}</Badge>}
                {auto && <Badge variant="outline" className="capitalize">{auto.object}</Badge>}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!targetId} onClick={submit}>Enroll</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
