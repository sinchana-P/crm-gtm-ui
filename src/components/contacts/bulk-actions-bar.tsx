"use client";

import { Trash2, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onAssign?: () => void;
  onDelete?: () => void;
  onConvert?: () => void;
  showConvert?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onClear,
  onAssign,
  onDelete,
  onConvert,
  showConvert,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2">
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {showConvert && onConvert ? (
          <Button size="sm" variant="secondary" onClick={onConvert}>
            <UserCheck className="size-4" />
            Convert
          </Button>
        ) : null}
        {onAssign ? (
          <Button size="sm" variant="secondary" onClick={onAssign}>
            <UserPlus className="size-4" />
            Assign owner
          </Button>
        ) : null}
        {onDelete ? (
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        ) : null}
      </div>
      <Button size="sm" variant="ghost" className="ml-auto" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
