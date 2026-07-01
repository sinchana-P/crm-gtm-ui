"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useViewScope } from "@/hooks/use-view-scope";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { HealthBadge } from "@/components/shared/health-badge";
import { StageBadge } from "@/components/shared/stage-badge";
import { BulkActionsBar } from "@/components/contacts/bulk-actions-bar";
import { ConvertLeadDialog } from "@/components/contacts/convert-lead-dialog";
import { contactName } from "@/lib/format";
import { getRecordHref } from "@/lib/record-routes";
import type { ContactRecord } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ContactListViewProps {
  title: string;
  description: string;
  contacts: ContactRecord[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  headerActions?: ReactNode;
  showConvert?: boolean;
  /** Base resource name for page title, e.g. "Leads" */
  resourceName?: string;
}

export function ContactListView({
  title,
  description,
  contacts,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  headerActions,
  showConvert,
  resourceName,
}: ContactListViewProps) {
  const router = useRouter();
  const { filterContacts, isRep, title: scopedTitle, rep } = useViewScope();
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [convertContact, setConvertContact] = useState<ContactRecord | null>(
    null
  );
  const [convertOpen, setConvertOpen] = useState(false);

  const owners = useMemo(
    () => [...new Set(filterContacts(contacts).map((c) => c.owner))],
    [contacts, filterContacts]
  );

  const scopedContacts = useMemo(
    () => filterContacts(contacts),
    [contacts, filterContacts]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return scopedContacts.filter((c) => {
      const name = contactName(c.firstName, c.lastName).toLowerCase();
      const matchSearch =
        !q ||
        name.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false);
      const matchOwner =
        isRep || ownerFilter === "all" || c.owner === ownerFilter;
      return matchSearch && matchOwner;
    });
  }, [scopedContacts, search, ownerFilter, isRep]);

  const displayTitle = resourceName ? scopedTitle(resourceName) : title;
  const displayDescription = isRep
    ? `${description} Showing records assigned to ${rep.name}.`
    : description;

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(filtered.map((c) => c.id)) : new Set());
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const openRecord = (contact: ContactRecord) => {
    router.push(getRecordHref(contact));
  };

  const EmptyIcon = emptyIcon;

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayTitle}
        description={displayDescription}
        actions={headerActions}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, or company..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {!isRep && (
          <Select
            value={ownerFilter}
            onValueChange={(v) => setOwnerFilter(v ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owners</SelectItem>
              {owners.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <BulkActionsBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        onAssign={() => {}}
        onDelete={() => setSelected(new Set())}
        showConvert={showConvert}
        onConvert={() => {
          const first = contacts.find((c) => selected.has(c.id));
          if (first) {
            setConvertContact(first);
            setConvertOpen(true);
          }
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={EmptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      filtered.length > 0 &&
                      filtered.every((c) => selected.has(c.id))
                    }
                    onCheckedChange={(v) => toggleAll(!!v)}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Last activity</TableHead>
                <TableHead>Next activity</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} data-state={selected.has(c.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={(v) => toggleOne(c.id, !!v)}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="font-medium hover:underline"
                      onClick={() => openRecord(c)}
                    >
                      {contactName(c.firstName, c.lastName)}
                    </button>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </TableCell>
                  <TableCell>{c.company ?? "—"}</TableCell>
                  <TableCell>
                    <HealthBadge score={c.leadScore} />
                  </TableCell>
                  <TableCell>{c.owner}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-muted-foreground">
                    {c.lastActivity}
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-muted-foreground">
                    {c.nextActivity ?? "—"}
                  </TableCell>
                  <TableCell>{c.source}</TableCell>
                  <TableCell>
                    <StageBadge stage={c.lifecycleStage} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRecord(c)}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showConvert ? (
        <ConvertLeadDialog
          contact={convertContact}
          open={convertOpen}
          onOpenChange={setConvertOpen}
        />
      ) : null}
    </div>
  );
}
