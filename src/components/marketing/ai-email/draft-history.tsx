"use client";

import { useMemo, useState } from "react";
import { Copy, Eye, FileText, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AiSavedDraft, AiSavedDraftStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AI_TONES } from "@/lib/ai-email";
import { formatRelative } from "@/lib/format";
import { useAiDraftStore } from "@/lib/stores/ai-draft-store";
import { cn } from "@/lib/utils";

const STATUS_META: Record<AiSavedDraftStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  sent: { label: "Sent", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
};

const SOURCE_LABEL: Record<AiSavedDraft["source"], string> = {
  studio: "AI Studio",
  compose: "Compose",
  inbox: "Inbox reply",
  editor: "Email editor",
};

function toneLabel(value: string) {
  return AI_TONES.find((t) => t.value === value)?.label ?? value;
}

export function DraftHistory() {
  const drafts = useAiDraftStore((s) => s.drafts);
  const removeDraft = useAiDraftStore((s) => s.removeDraft);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | AiSavedDraftStatus>("all");
  const [preview, setPreview] = useState<AiSavedDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AiSavedDraft | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drafts.filter((d) => {
      if (status !== "all" && d.status !== status) return false;
      if (!q) return true;
      return `${d.subject} ${d.recipientName ?? ""} ${d.goal}`.toLowerCase().includes(q);
    });
  }, [drafts, query, status]);

  function copyDraft(d: AiSavedDraft) {
    navigator.clipboard?.writeText(`${d.subject}\n\n${d.body}`);
    toast.success("Draft copied to clipboard");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drafts…"
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={drafts.length === 0 ? "No drafts yet" : "No matching drafts"}
          description={
            drafts.length === 0
              ? "Drafts you generate in the composer, compose window, or inbox show up here."
              : "Try a different search or status filter."
          }
        />
      ) : (
        <Card className="shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Tone</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="max-w-[260px]">
                      <button
                        type="button"
                        onClick={() => setPreview(d)}
                        className="truncate text-left font-medium hover:underline"
                      >
                        {d.subject}
                      </button>
                      <p className="truncate text-xs text-muted-foreground">{d.goal}</p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {d.recipientName ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">{toneLabel(d.tone)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{SOURCE_LABEL[d.source]}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0", STATUS_META[d.status].className)}>
                        {STATUS_META[d.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatRelative(d.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreview(d)}>
                            <Eye className="size-4" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyDraft(d)}>
                            <Copy className="size-4" /> Copy
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(d)}>
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      <Dialog open={Boolean(preview)} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{preview?.subject}</DialogTitle>
            <DialogDescription>
              {preview?.recipientName ? `To ${preview.recipientName}` : "No recipient"} ·{" "}
              {preview ? toneLabel(preview.tone) : ""} tone
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm">
            {preview?.body}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => preview && copyDraft(preview)}>
              <Copy className="size-4" /> Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.subject}” will be permanently removed. This can&rsquo;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  removeDraft(deleteTarget.id);
                  toast.success("Draft deleted");
                }
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
