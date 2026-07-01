"use client";

import { useCallback, useState } from "react";
import {
  AlertCircle,
  Camera,
  Check,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DocumentChecklistItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export type UploadItemState = "pending" | "uploading" | "done" | "error";

export interface UploadWizardItem extends DocumentChecklistItem {
  state: UploadItemState;
  fileName?: string;
}

interface DocumentUploadWizardProps {
  items: DocumentChecklistItem[];
  completedItemIds?: string[];
  onComplete?: () => void;
  compact?: boolean;
}

export function DocumentUploadWizard({
  items,
  completedItemIds = [],
  onComplete,
  compact,
}: DocumentUploadWizardProps) {
  const [uploads, setUploads] = useState<UploadWizardItem[]>(() =>
    items.map((item) => ({
      ...item,
      state: completedItemIds.includes(item.id) ? "done" : "pending",
      fileName: completedItemIds.includes(item.id) ? "Previously uploaded" : undefined,
    }))
  );
  const [activeId, setActiveId] = useState<string | null>(
    items.find((i) => !completedItemIds.includes(i.id))?.id ?? items[0]?.id ?? null
  );

  const requiredTotal = uploads.filter((u) => u.required).length;
  const requiredDone = uploads.filter((u) => u.required && u.state === "done").length;
  const allRequiredDone = requiredDone === requiredTotal;
  const progressPct = requiredTotal ? (requiredDone / requiredTotal) * 100 : 0;

  const simulateUpload = useCallback((itemId: string, fileName: string) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === itemId ? { ...u, state: "uploading", fileName } : u))
    );
    setTimeout(() => {
      setUploads((prev) =>
        prev.map((u) => (u.id === itemId ? { ...u, state: "done" } : u))
      );
      toast.success("File uploaded", { description: fileName });
      setActiveId((current) => {
        const next = uploads.find(
          (u) => u.id !== itemId && u.state !== "done" && u.required
        );
        return next?.id ?? current;
      });
    }, 1200);
  }, [uploads]);

  const handleFilePick = (itemId: string) => {
    const item = uploads.find((u) => u.id === itemId);
    if (!item) return;
    const ext = item.acceptedFormats[0]?.toLowerCase() ?? "pdf";
    simulateUpload(itemId, `${item.label.replace(/\s+/g, "_")}.${ext}`);
  };

  const handleSubmit = () => {
    if (!allRequiredDone) {
      toast.error("Upload all required documents first");
      return;
    }
    toast.success("All documents submitted for review");
    onComplete?.();
  };

  const active = uploads.find((u) => u.id === activeId);

  return (
    <div className={cn("space-y-4", compact ? "" : "max-w-2xl")}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Upload progress</span>
          <span className="text-muted-foreground">
            {requiredDone} of {requiredTotal} required
          </span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {uploads.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              activeId === item.id ? "border-foreground ring-1 ring-foreground" : "hover:bg-muted/40",
              item.state === "done" && "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                {item.required ? (
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    Required
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    Optional
                  </Badge>
                )}
              </div>
              {item.state === "done" ? (
                <Check className="size-4 shrink-0 text-emerald-600" />
              ) : item.state === "uploading" ? (
                <span className="text-xs text-muted-foreground">Uploading…</span>
              ) : null}
            </div>
            {item.fileName ? (
              <p className="mt-2 truncate text-xs text-muted-foreground">{item.fileName}</p>
            ) : null}
          </button>
        ))}
      </div>

      {active ? (
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{active.label}</CardTitle>
            {active.description ? (
              <p className="text-sm text-muted-foreground">{active.description}</p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Accepted: {active.acceptedFormats.join(", ")} · Max {active.maxSizeMb} MB
            </p>

            {active.state === "done" ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/20">
                <Check className="size-4 text-emerald-600" />
                <span>{active.fileName} — received</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() =>
                    setUploads((prev) =>
                      prev.map((u) =>
                        u.id === active.id ? { ...u, state: "pending", fileName: undefined } : u
                      )
                    )
                  }
                >
                  Replace
                </Button>
              </div>
            ) : active.state === "uploading" ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10">
                <Upload className="size-8 animate-pulse text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading {active.fileName}…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10">
                <FileText className="size-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop or choose a file
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={() => handleFilePick(active.id)}>
                    <Upload className="size-4" />
                    Choose file
                  </Button>
                  <Button variant="outline" onClick={() => handleFilePick(active.id)}>
                    <Camera className="size-4" />
                    Take photo
                  </Button>
                </div>
              </div>
            )}

            {!allRequiredDone ? (
              <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                Complete all required uploads before submitting. Your account team will be
                notified automatically.
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={!allRequiredDone}>
          Save draft
        </Button>
        <Button onClick={handleSubmit} disabled={!allRequiredDone}>
          Submit all documents
        </Button>
      </div>
    </div>
  );
}
