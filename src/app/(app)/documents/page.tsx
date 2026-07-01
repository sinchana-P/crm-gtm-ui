"use client";

import { useMemo, useState } from "react";
import { FolderOpen, Search, Send, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SendDocumentRequestDialog } from "@/components/outreach/send-document-request-dialog";
import { useOpenRecord } from "@/hooks/use-open-record";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { MOCK_CONTACTS, MOCK_DOCUMENTS } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { useViewScope } from "@/hooks/use-view-scope";

export default function DocumentsPage() {
  const { filterDocuments, isRep, title, rep } = useViewScope();
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const openRecord = useOpenRecord();

  const scopedDocs = useMemo(() => filterDocuments(MOCK_DOCUMENTS), [filterDocuments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return scopedDocs.filter(
      (d) =>
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.contactName.toLowerCase().includes(q)
    );
  }, [search, scopedDocs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={title("Documents")}
        description={
          isRep
            ? `Files for contacts owned by ${rep.name}.`
            : "Search and manage documents linked to contact records."
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setRequestOpen(true)}>
              <Send className="size-4" />
              Request from customer
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="size-4" />
              Upload
            </Button>
          </>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents or contacts..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents found"
          description="Upload files or adjust your search to find documents."
        />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>By</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.contactName}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(doc.uploadedAt)}
                  </TableCell>
                  <TableCell>{doc.uploadedBy}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRecord(doc.contactId)}
                    >
                      View contact
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Link to contact</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CONTACTS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8">
              <Upload className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop file here or click to browse
              </p>
              <Button variant="outline" size="sm">
                Choose file
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setUploadOpen(false)}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SendDocumentRequestDialog open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}
