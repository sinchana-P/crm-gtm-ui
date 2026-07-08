"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowRight,
  Copy,
  Eye,
  LayoutGrid,
  Mail,
  MailCheck,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldOff,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { EmailTemplate } from "@/lib/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_EMAIL_STARTERS } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import { useEmailTemplateStore } from "@/lib/stores/email-template-store";
import { EmailBlockRender } from "@/components/marketing/email/email-block-render";
import { EmailStatusBadge, EmailTypeBadge } from "@/components/marketing/email/email-shared";

const TABS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
] as const;

export function EmailTemplateWorkspace() {
  const router = useRouter();
  const templates = useEmailTemplateStore((s) => s.templates);
  const duplicateTemplate = useEmailTemplateStore((s) => s.duplicateTemplate);
  const setStatus = useEmailTemplateStore((s) => s.setStatus);
  const deleteTemplate = useEmailTemplateStore((s) => s.deleteTemplate);

  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return templates.filter((t) => {
      const status = t.status ?? "draft";
      if (tab === "archived") {
        if (status !== "archived") return false;
      } else {
        if (status === "archived") return false;
        if (tab !== "all" && status !== tab) return false;
      }
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (q && !t.name.toLowerCase().includes(q) && !t.subject.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [templates, tab, search, typeFilter]);

  const live = templates.filter((t) => t.status !== "archived");
  const published = live.filter((t) => t.status === "published");
  const withSends = published.filter((t) => t.sent > 0);
  const avgOpen = withSends.length ? (withSends.reduce((n, t) => n + t.openRate, 0) / withSends.length).toFixed(1) : "0.0";
  const avgClick = withSends.length ? (withSends.reduce((n, t) => n + t.clickRate, 0) / withSends.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email templates"
        description="Design reusable emails with the drag-and-drop builder, personalization, and open/click tracking."
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/marketing/unsubscribe")}>
              <ShieldOff className="size-4" /> Unsubscribes
            </Button>
            <Button onClick={() => router.push("/marketing/templates/new")}>
              <Plus className="size-4" /> New email
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Templates" value={live.length} subtitle={`${templates.filter((t) => t.status === "archived").length} archived`} icon={Mail} />
        <StatCard title="Published" value={published.length} subtitle="Ready to send" icon={Send} />
        <StatCard title="Avg open rate" value={`${avgOpen}%`} subtitle="Across sent emails" icon={MailCheck} />
        <StatCard title="Avg click rate" value={`${avgClick}%`} subtitle="Across sent emails" icon={MousePointerClick} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab((v as typeof tab) ?? "all")}>
            <TabsList>{TABS.map((t) => (<TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>))}</TabsList>
          </Tabs>
          <div className="flex items-center rounded-lg border p-0.5">
            <Button variant={layout === "grid" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setLayout("grid")}><LayoutGrid className="size-4" /></Button>
            <Button variant={layout === "list" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setLayout("list")}><TableIcon className="size-4" /></Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search emails…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(["newsletter", "promotional", "announcement", "welcome", "event", "transactional"] as const).map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No emails found"
          description="Create an email from scratch or start from a template below."
          action={<Button onClick={() => router.push("/marketing/templates/new")}><Plus className="size-4" /> New email</Button>}
        />
      ) : layout === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onOpen={() => router.push(`/marketing/templates/${t.id}`)}
              onEdit={() => router.push(`/marketing/templates/${t.id}/edit`)}
              onDuplicate={() => { duplicateTemplate(t.id); toast.success("Template duplicated"); }}
              onStatus={(s) => { setStatus(t.id, s); toast.success(s === "archived" ? "Archived" : s === "published" ? "Published" : "Moved to drafts"); }}
              onDelete={() => setDeleteTarget(t)}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Open %</TableHead>
                  <TableHead className="text-right">Click %</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id} className="cursor-pointer" onClick={() => router.push(`/marketing/templates/${t.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: t.accent ?? "#94a3b8" }} />
                        <div>
                          <p className="font-medium">{t.name}</p>
                          <p className="max-w-72 truncate text-xs text-muted-foreground">{t.subject}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><EmailTypeBadge type={t.type} /></TableCell>
                    <TableCell><EmailStatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-right tabular-nums">{t.sent.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{t.openRate}%</TableCell>
                    <TableCell className="text-right tabular-nums">{t.clickRate}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatRelative(t.updatedAt)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <RowMenu
                        template={t}
                        onOpen={() => router.push(`/marketing/templates/${t.id}`)}
                        onEdit={() => router.push(`/marketing/templates/${t.id}/edit`)}
                        onDuplicate={() => { duplicateTemplate(t.id); toast.success("Template duplicated"); }}
                        onStatus={(s) => { setStatus(t.id, s); toast.success(s === "archived" ? "Archived" : s === "published" ? "Published" : "Moved to drafts"); }}
                        onDelete={() => setDeleteTarget(t)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Starters */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Start from a template</h2>
          <p className="text-sm text-muted-foreground">Pre-built, responsive layouts you can customize in the editor.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {MOCK_EMAIL_STARTERS.map((s) => (
            <Card key={s.id} className="flex flex-col overflow-hidden shadow-none">
              <div className="h-1.5" style={{ backgroundColor: s.accent }} />
              <CardContent className="flex flex-1 flex-col pt-4">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="mt-0.5 line-clamp-2 flex-1 text-xs text-muted-foreground">{s.description}</p>
                <Button variant="ghost" size="sm" className="mt-3 justify-start px-0" onClick={() => router.push(`/marketing/templates/new?starter=${s.id}`)}>
                  Use <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          {deleteTarget && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{deleteTarget.name}”?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the template. Campaigns and sequences that already sent it keep their history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                <Button variant="destructive" onClick={() => { deleteTemplate(deleteTarget.id); setDeleteTarget(null); toast.success("Template deleted"); }}>
                  <Trash2 className="size-4" /> Delete
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TemplateCard({
  template,
  onOpen,
  onEdit,
  onDuplicate,
  onStatus,
  onDelete,
}: {
  template: EmailTemplate;
  onOpen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onStatus: (s: NonNullable<EmailTemplate["status"]>) => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group flex flex-col overflow-hidden pt-0 shadow-none transition-shadow hover:shadow-md">
      {/* thumbnail preview */}
      <button
        type="button"
        onClick={onOpen}
        className="relative block h-40 overflow-hidden border-b bg-neutral-50 text-left"
      >
        <div className="h-1.5 w-full" style={{ backgroundColor: template.accent ?? "#94a3b8" }} />
        <div className="pointer-events-none origin-top scale-[0.62] space-y-1.5 p-4">
          {(template.blocks ?? []).slice(0, 4).map((b) => (
            <EmailBlockRender key={b.id} block={b} />
          ))}
          {(template.blocks ?? []).length === 0 && (
            <p className="text-xs text-neutral-400">Empty template</p>
          )}
        </div>
      </button>
      <CardContent className="flex flex-1 flex-col pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{template.name}</p>
            <p className="truncate text-xs text-muted-foreground">{template.subject}</p>
          </div>
          <RowMenu template={template} onOpen={onOpen} onEdit={onEdit} onDuplicate={onDuplicate} onStatus={onStatus} onDelete={onDelete} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <EmailStatusBadge status={template.status} />
          <EmailTypeBadge type={template.type} />
        </div>
        {template.sent > 0 && (
          <div className="mt-3 flex items-center gap-4 border-t pt-2 text-xs text-muted-foreground tabular-nums">
            <span>{template.sent.toLocaleString()} sent</span>
            <span>{template.openRate}% open</span>
            <span>{template.clickRate}% click</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RowMenu({
  template,
  onOpen,
  onEdit,
  onDuplicate,
  onStatus,
  onDelete,
}: {
  template: EmailTemplate;
  onOpen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onStatus: (s: NonNullable<EmailTemplate["status"]>) => void;
  onDelete: () => void;
}) {
  const status = template.status ?? "draft";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>} />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onOpen}><Eye className="size-4" /> Open</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}><Pencil className="size-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}><Copy className="size-4" /> Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        {status !== "published" && <DropdownMenuItem onClick={() => onStatus("published")}><Send className="size-4" /> Publish</DropdownMenuItem>}
        {status === "published" && <DropdownMenuItem onClick={() => onStatus("draft")}><Pencil className="size-4" /> Unpublish</DropdownMenuItem>}
        {status !== "archived" ? (
          <DropdownMenuItem onClick={() => onStatus("archived")}><Archive className="size-4" /> Archive</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onStatus("draft")}><Archive className="size-4" /> Restore</DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDelete}><Trash2 className="size-4 text-destructive" /><span className="text-destructive">Delete</span></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
