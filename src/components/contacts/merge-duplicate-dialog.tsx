"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { contactName } from "@/lib/format";
import type { DuplicatePair } from "@/lib/types";

interface MergeDuplicateDialogProps {
  pair: DuplicatePair | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMerge?: () => void;
}

function FieldRow({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: string;
  valueB: string;
}) {
  const conflict = valueA !== valueB;
  return (
    <div className="grid grid-cols-[120px_1fr_1fr] gap-3 border-b border-border py-2 text-sm last:border-0">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className={conflict ? "rounded bg-emerald-50 px-1 dark:bg-emerald-950/30" : ""}>
        {valueA}
      </span>
      <span className={conflict ? "text-muted-foreground line-through" : ""}>
        {valueB}
      </span>
    </div>
  );
}

export function MergeDuplicateDialog({
  pair,
  open,
  onOpenChange,
  onMerge,
}: MergeDuplicateDialogProps) {
  if (!pair) return null;

  const { contactA, contactB } = pair;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Merge preview</DialogTitle>
          <DialogDescription>
            Review field conflicts before merging. Primary record is kept on the
            left.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{pair.confidence}% match</Badge>
          <span className="text-sm text-muted-foreground">{pair.matchReason}</span>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 grid grid-cols-[120px_1fr_1fr] gap-3 text-xs font-medium uppercase text-muted-foreground">
            <span>Field</span>
            <span>{contactName(contactA.firstName, contactA.lastName)}</span>
            <span>{contactName(contactB.firstName, contactB.lastName)}</span>
          </div>
          <FieldRow label="Email" valueA={contactA.email} valueB={contactB.email} />
          <FieldRow label="Phone" valueA={contactA.phone} valueB={contactB.phone} />
          <FieldRow label="Company" valueA={contactA.company ?? "—"} valueB={contactB.company ?? "—"} />
          <FieldRow label="Source" valueA={contactA.source} valueB={contactB.source} />
          <FieldRow label="Owner" valueA={contactA.owner} valueB={contactB.owner} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onMerge?.();
              onOpenChange(false);
            }}
          >
            Merge records
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
