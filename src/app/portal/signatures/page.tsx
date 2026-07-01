"use client";

import { toast } from "sonner";
import { Download, PenLine } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PORTAL_SIGNATURES } from "@/lib/mock-data/portal";
import { formatDate } from "@/lib/format";

export default function PortalSignaturesPage() {
  const pending = PORTAL_SIGNATURES.filter((s) => s.status !== "signed");
  const completed = PORTAL_SIGNATURES.filter((s) => s.status === "signed");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Signatures"
        description="Review and sign agreements. Completed documents are stored in your document vault."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Awaiting signature</h2>
        {pending.map((doc) => (
          <Card key={doc.id} className="shadow-none">
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  Sent {formatDate(doc.sentAt)}
                  {doc.expiresAt ? ` · Expires ${formatDate(doc.expiresAt)}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doc.signed}/{doc.signers} signers completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{doc.status}</Badge>
                <Button onClick={() => toast.success("Opening signing session…")}>
                  <PenLine className="size-4" />
                  Sign now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Completed</h2>
        {completed.map((doc) => (
          <Card key={doc.id} className="shadow-none">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  Signed {doc.signedAt ? formatDate(doc.signedAt) : "—"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.message("Download started")}>
                <Download className="size-4" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
