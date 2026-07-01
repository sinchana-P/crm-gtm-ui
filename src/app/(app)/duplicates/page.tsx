"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MergeDuplicateDialog } from "@/components/contacts/merge-duplicate-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_DUPLICATES } from "@/lib/mock-data";
import { contactName } from "@/lib/format";
import type { DuplicatePair } from "@/lib/types";

export default function DuplicatesPage() {
  const [pairs, setPairs] = useState(MOCK_DUPLICATES);
  const [mergePair, setMergePair] = useState<DuplicatePair | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);

  const dismiss = (id: string) => {
    setPairs((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Duplicates"
        description="Review potential duplicate contacts and merge or dismiss matches."
      />

      {pairs.length === 0 ? (
        <EmptyState
          icon={Copy}
          title="No duplicates pending"
          description="All duplicate pairs have been reviewed. New matches will appear here."
        />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record A</TableHead>
                <TableHead>Record B</TableHead>
                <TableHead>Match reason</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairs.map((pair) => (
                <TableRow key={pair.id}>
                  <TableCell>
                    <p className="font-medium">
                      {contactName(
                        pair.contactA.firstName,
                        pair.contactA.lastName
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pair.contactA.email}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {contactName(
                        pair.contactB.firstName,
                        pair.contactB.lastName
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pair.contactB.email}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-xs text-muted-foreground">
                    {pair.matchReason}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{pair.confidence}%</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setMergePair(pair);
                        setMergeOpen(true);
                      }}
                    >
                      Merge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismiss(pair.id)}
                    >
                      Dismiss
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <MergeDuplicateDialog
        pair={mergePair}
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        onMerge={() => {
          if (mergePair) dismiss(mergePair.id);
        }}
      />
    </div>
  );
}
