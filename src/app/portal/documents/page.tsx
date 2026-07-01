"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, FolderOpen, Upload } from "lucide-react";
import { toast } from "sonner";
import { DocumentUploadWizard } from "@/components/portal/document-upload-wizard";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DOCUMENT_REQUEST_TEMPLATES } from "@/lib/mock-data";
import { PORTAL_DOCUMENTS } from "@/lib/mock-data/portal";
import { formatDate, formatRelative } from "@/lib/format";
import type { PortalDocument } from "@/lib/types/portal";

const TABS = ["all", "shared", "requested", "uploaded", "signed"] as const;

export default function PortalDocumentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
      <PortalDocumentsContent />
    </Suspense>
  );
}

function PortalDocumentsContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "all";
  const [tab, setTab] = useState<(typeof TABS)[number]>(
    TABS.includes(defaultTab as (typeof TABS)[number]) ? (defaultTab as (typeof TABS)[number]) : "all"
  );
  const [uploadDoc, setUploadDoc] = useState<PortalDocument | null>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    if (tab === "all") return PORTAL_DOCUMENTS;
    return PORTAL_DOCUMENTS.filter((d) => d.category === tab);
  }, [tab]);

  const pendingRequested = PORTAL_DOCUMENTS.filter(
    (d) => d.category === "requested" && d.status === "pending"
  );

  const checklistItems = useMemo(() => {
    const onboarding = DOCUMENT_REQUEST_TEMPLATES[0];
    return pendingRequested.length > 0
      ? onboarding.items.slice(0, pendingRequested.length)
      : onboarding.items;
  }, [pendingRequested.length]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Files shared with you, your uploads, and items requested by your account team."
        actions={
          <div className="flex flex-wrap gap-2">
            {pendingRequested.length > 1 ? (
              <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
                <Upload className="size-4" />
                Upload all requested
              </Button>
            ) : null}
            <ButtonLink href="/portal/upload/vk-onboard-ananya" variant="outline" target="_blank">
              Open secure upload link
            </ButtonLink>
          </div>
        }
      />

      {pendingRequested.length > 0 ? (
        <Card className="border-foreground/15 bg-muted/30 shadow-none">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                {pendingRequested.length} document{pendingRequested.length > 1 ? "s" : ""} requested
              </p>
              <p className="text-sm text-muted-foreground">
                {pendingRequested[0].requestedBy} requested these for vendor onboarding. Due{" "}
                {pendingRequested[0].dueAt ? formatRelative(pendingRequested[0].dueAt) : "soon"}.
              </p>
            </div>
            <Button onClick={() => setBulkUploadOpen(true)}>Start upload</Button>
          </CardContent>
        </Card>
      ) : null}

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="requested">
            Requested
            {pendingRequested.length > 0 ? (
              <Badge variant="destructive" className="ml-2">
                {pendingRequested.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
          <TabsTrigger value="signed">Signed</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="grid gap-3">
            {filtered.map((doc) => (
              <Card key={doc.id} className="shadow-none">
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                      <FolderOpen className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} · {doc.size}
                        {doc.uploadedAt ? ` · ${formatDate(doc.uploadedAt)}` : ""}
                      </p>
                      {doc.instructions ? (
                        <p className="mt-1 text-xs text-muted-foreground">{doc.instructions}</p>
                      ) : null}
                      {doc.dueAt ? (
                        <p className="mt-1 text-xs font-medium">Due {formatRelative(doc.dueAt)}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status ? (
                      <Badge
                        variant={doc.status === "pending" ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {doc.status}
                      </Badge>
                    ) : null}
                    {doc.category === "requested" && doc.status === "pending" ? (
                      <Button size="sm" onClick={() => setUploadDoc(doc)}>
                        <Upload className="size-4" />
                        Upload
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.message("Download started")}
                      >
                        <Download className="size-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="border-dashed shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Photo & ID uploads</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use camera or gallery for KYC photos. Accepted formats: JPG, PNG, PDF. Maximum 5 MB
          per file. Files are encrypted in transit and reviewed by your account team within 1–2
          business days.
        </CardContent>
      </Card>

      <Dialog open={!!uploadDoc} onOpenChange={(o) => !o && setUploadDoc(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload — {uploadDoc?.name}</DialogTitle>
            <DialogDescription>{uploadDoc?.instructions}</DialogDescription>
          </DialogHeader>
          {uploadDoc ? (
            <DocumentUploadWizard
              items={[
                {
                  id: uploadDoc.id,
                  label: uploadDoc.name,
                  description: uploadDoc.instructions,
                  required: true,
                  acceptedFormats: ["PDF", "JPG", "PNG"],
                  maxSizeMb: 5,
                },
              ]}
              onComplete={() => setUploadDoc(null)}
              compact
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor onboarding documents</DialogTitle>
            <DialogDescription>
              Upload all requested items in one session. Progress saves automatically.
            </DialogDescription>
          </DialogHeader>
          <DocumentUploadWizard
            items={checklistItems}
            onComplete={() => setBulkUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
