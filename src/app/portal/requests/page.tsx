"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { CreateRequestDialog } from "@/components/portal/create-request-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
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
import { PORTAL_REQUESTS } from "@/lib/mock-data/portal";
import { formatDate, formatRelative } from "@/lib/format";
import type { PortalRequestStatus } from "@/lib/types/portal";
import { LifeBuoy } from "lucide-react";

const STATUS_VARIANT: Record<PortalRequestStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new: "default",
  open: "default",
  pending: "secondary",
  resolved: "outline",
  closed: "outline",
};

export default function PortalRequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
      <PortalRequestsContent />
    </Suspense>
  );
}

function PortalRequestsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(searchParams.get("new") === "1");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PORTAL_REQUESTS.filter((r) => {
      const matchSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.number.toLowerCase().includes(q);
      const matchStatus = status === "all" || r.status === status;
      return matchSearch && matchStatus;
    });
  }, [search, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requests"
        description="Track support, billing, and account requests. All activity is logged for your team."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New request
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search requests..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No requests" description="Create a request when you need help from your account team." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.number}</TableCell>
                  <TableCell>
                    <p className="font-medium">{r.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{r.description}</p>
                  </TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.status]} className="capitalize">{r.status}</Badge>
                  </TableCell>
                  <TableCell>{r.assignee}</TableCell>
                  <TableCell className="text-muted-foreground">{formatRelative(r.updatedAt)}</TableCell>
                  <TableCell>
                    <ButtonLink href={`/portal/requests/${r.id}`} variant="ghost" size="sm">
                      View
                    </ButtonLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateRequestDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
