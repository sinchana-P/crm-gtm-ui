"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowRight,
  BarChart3,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  FlaskConical,
  Folder,
  Globe,
  LayoutGrid,
  MousePointerClick,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Table as TableIcon,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import type { LandingPage, LandingPageStatus } from "@/lib/types";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatRelative } from "@/lib/format";
import { LANDING_PAGE_FOLDERS, LANDING_PAGE_TEMPLATES } from "@/lib/mock-data/landing-pages";
import { createPageId, useLandingPageStore } from "@/lib/stores/landing-page-store";
import { LandingAiGenerateDialog } from "@/components/marketing/landing-pages/landing-ai-generate-dialog";
import { LandingPageThumbnail } from "@/components/marketing/landing-pages/landing-page-thumbnail";
import {
  LANDING_TYPE_LABELS,
  LandingStatusBadge,
  LandingTypeBadge,
} from "@/components/marketing/landing-pages/landing-shared";

const TABS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export function LandingPageWorkspace() {
  const router = useRouter();
  const pages = useLandingPageStore((s) => s.pages);
  const duplicatePage = useLandingPageStore((s) => s.duplicatePage);
  const setStatus = useLandingPageStore((s) => s.setStatus);
  const deletePage = useLandingPageStore((s) => s.deletePage);
  const addPage = useLandingPageStore((s) => s.addPage);

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<LandingPage | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pages.filter((p) => {
      if (tab === "archived") {
        if (p.status !== "archived") return false;
      } else {
        if (p.status === "archived") return false;
        if (tab !== "all") {
          if (tab === "draft" && !(p.status === "draft" || p.status === "unpublished")) return false;
          if (tab === "published" && p.status !== "published") return false;
          if (tab === "scheduled" && p.status !== "scheduled") return false;
        }
      }
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (folderFilter !== "all" && p.folderId !== folderFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [pages, tab, search, typeFilter, folderFilter]);

  const live = pages.filter((p) => p.status !== "archived");
  const published = pages.filter((p) => p.status === "published");
  const totalViews = published.reduce((n, p) => n + p.analytics.views, 0);
  const totalSubs = published.reduce((n, p) => n + p.analytics.submissions, 0);
  const avgConv = totalViews > 0 ? ((totalSubs / totalViews) * 100).toFixed(1) : "0.0";

  const allChecked = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(filtered.map((p) => p.id)));
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleStatus(p: LandingPage, status: LandingPageStatus) {
    setStatus(p.id, status);
    const labels: Record<LandingPageStatus, string> = {
      published: "Page published",
      unpublished: "Page unpublished",
      draft: "Moved to drafts",
      scheduled: "Scheduled",
      archived: "Page archived",
    };
    toast.success(labels[status]);
  }

  function saveAsTemplate(p: LandingPage) {
    toast.success(`“${p.name}” saved to your templates`);
  }

  function bulk(action: "archive" | "delete" | "unpublish") {
    const ids = Array.from(selected);
    if (action === "delete") {
      ids.forEach((id) => deletePage(id));
      toast.success(`${ids.length} page${ids.length > 1 ? "s" : ""} deleted`);
    } else {
      ids.forEach((id) => setStatus(id, action === "archive" ? "archived" : "unpublished"));
      toast.success(`${ids.length} page${ids.length > 1 ? "s" : ""} ${action === "archive" ? "archived" : "unpublished"}`);
    }
    setSelected(new Set());
    setBulkDelete(false);
  }

  const rowActions = {
    onOpen: (p: LandingPage) => router.push(`/marketing/landing-pages/${p.id}`),
    onEdit: (p: LandingPage) => router.push(`/marketing/landing-pages/${p.id}/edit`),
    onDuplicate: (p: LandingPage) => { duplicatePage(p.id); toast.success("Page duplicated"); },
    onStatus: handleStatus,
    onTemplate: saveAsTemplate,
    onDelete: (p: LandingPage) => setDeleteTarget(p),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landing pages"
        description="Design, publish, and A/B-test conversion-optimized pages with the drag-and-drop builder — no code required."
        actions={
          <>
            <Button variant="outline" onClick={() => setAiOpen(true)}>
              <Sparkles className="size-4" /> Generate with AI
            </Button>
            <Button onClick={() => router.push("/marketing/landing-pages/new")}>
              <Plus className="size-4" /> New page
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pages" value={live.length} subtitle={`${pages.filter((p) => p.status === "archived").length} archived`} icon={FileText} />
        <StatCard title="Published" value={published.length} subtitle="Live now" icon={Globe} />
        <StatCard title="Total views" value={totalViews.toLocaleString()} subtitle="Across published pages" icon={Eye} />
        <StatCard title="Avg conversion" value={`${avgConv}%`} subtitle={`${totalSubs.toLocaleString()} submissions`} icon={MousePointerClick} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab((v as Tab) ?? "all")}>
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
            <Input className="pl-8" placeholder="Search pages…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All goals</SelectItem>
              {(Object.keys(LANDING_TYPE_LABELS) as LandingPage["type"][]).map((t) => (
                <SelectItem key={t} value={t}>{LANDING_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={folderFilter} onValueChange={(v) => setFolderFilter(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All folders</SelectItem>
              {LANDING_PAGE_FOLDERS.map((f) => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2.5">
          <p className="text-sm font-medium">{selected.size} selected</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => bulk("unpublish")}><Undo2 className="size-4" /> Unpublish</Button>
            <Button variant="outline" size="sm" onClick={() => bulk("archive")}><Archive className="size-4" /> Archive</Button>
            <Button variant="outline" size="sm" onClick={() => setBulkDelete(true)}><Trash2 className="size-4" /> Delete</Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No landing pages here"
          description="Create a page from scratch, generate one with AI, or start from a template below."
          action={<Button onClick={() => router.push("/marketing/landing-pages/new")}><Plus className="size-4" /> New page</Button>}
        />
      ) : layout === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PageCard key={p.id} page={p} checked={selected.has(p.id)} onCheck={() => toggleOne(p.id)} actions={rowActions} />
          ))}
        </div>
      ) : (
        <Card className="shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => rowActions.onOpen(p)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleOne(p.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: p.accent }} />
                        <div>
                          <p className="flex items-center gap-1.5 font-medium">
                            {p.name}
                            {p.abTest?.enabled && <Badge variant="outline" className="border-0 bg-violet-500/10 text-[10px] text-violet-600"><FlaskConical className="size-2.5" /> A/B</Badge>}
                          </p>
                          <p className="max-w-72 truncate text-xs text-muted-foreground">/{p.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><LandingTypeBadge type={p.type} /></TableCell>
                    <TableCell><LandingStatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-right tabular-nums">{p.analytics.views.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.analytics.conversionRate}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatRelative(p.updatedAt)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <RowMenu page={p} actions={rowActions} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Templates gallery */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Start from a template</h2>
          <p className="text-sm text-muted-foreground">Conversion-optimized, responsive layouts you can customize in the builder.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_PAGE_TEMPLATES.map((t) => (
            <Card key={t.id} className="flex flex-col overflow-hidden pt-0 shadow-none transition-shadow hover:shadow-md">
              <button
                type="button"
                onClick={() => router.push(`/marketing/landing-pages/new?template=${t.id}`)}
                className="relative block h-32 overflow-hidden border-b bg-neutral-50 text-left"
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: t.accent }} />
                <div className="pointer-events-none origin-top scale-[0.34] pt-1">
                  {t.sections.length > 0 ? (
                    <LandingPageThumbnail page={{ sections: t.sections.slice(0, 2), theme: { primaryColor: t.accent, fontFamily: "sans", buttonRadius: "md", contentWidth: "normal" } }} />
                  ) : (
                    <p className="px-6 py-8 text-xs text-neutral-400">Blank canvas</p>
                  )}
                </div>
              </button>
              <CardContent className="flex flex-1 flex-col pt-3">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="mt-0.5 line-clamp-2 flex-1 text-xs text-muted-foreground">{t.description}</p>
                <Button variant="ghost" size="sm" className="mt-2 justify-start px-0" onClick={() => router.push(`/marketing/landing-pages/new?template=${t.id}`)}>
                  Use template <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <LandingAiGenerateDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        onGenerate={({ name, type, sections }) => {
          const now = new Date().toISOString();
          const newPage: LandingPage = {
            id: createPageId(),
            name,
            status: "draft",
            type,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ai-page",
            domain: "go.connect-nx.com",
            owner: "Priya Sharma",
            accent: "#6366f1",
            sections,
            theme: { primaryColor: "#6366f1", fontFamily: "sans", buttonRadius: "md", contentWidth: "normal" },
            seo: { slug: "ai-page", title: name, metaDescription: "", language: "en" },
            tracking: { cookieBanner: true },
            analytics: { views: 0, uniqueVisitors: 0, submissions: 0, conversionRate: 0, bounceRate: 0, avgTimeSeconds: 0, daily: [], sources: [], devices: [], submissionsList: [] },
            createdAt: now,
            updatedAt: now,
          };
          addPage(newPage);
          toast.success("AI drafted your page — opening the builder");
          router.push(`/marketing/landing-pages/${newPage.id}/edit`);
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          {deleteTarget && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{deleteTarget.name}”?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the page and its builder content. Historical analytics are retained in reports.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                <Button variant="destructive" onClick={() => { deletePage(deleteTarget.id); setDeleteTarget(null); toast.success("Page deleted"); }}>
                  <Trash2 className="size-4" /> Delete
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDelete} onOpenChange={setBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} pages?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the selected pages. This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={() => bulk("delete")}><Trash2 className="size-4" /> Delete all</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type RowActions = {
  onOpen: (p: LandingPage) => void;
  onEdit: (p: LandingPage) => void;
  onDuplicate: (p: LandingPage) => void;
  onStatus: (p: LandingPage, s: LandingPageStatus) => void;
  onTemplate: (p: LandingPage) => void;
  onDelete: (p: LandingPage) => void;
};

function PageCard({ page, checked, onCheck, actions }: { page: LandingPage; checked: boolean; onCheck: () => void; actions: RowActions }) {
  const folder = LANDING_PAGE_FOLDERS.find((f) => f.id === page.folderId);
  return (
    <Card className="group flex flex-col overflow-hidden pt-0 shadow-none transition-shadow hover:shadow-md">
      <div className="relative h-44 overflow-hidden border-b bg-neutral-50">
        <button type="button" onClick={() => actions.onOpen(page)} className="block size-full text-left">
          <div className="h-1.5 w-full" style={{ backgroundColor: page.accent }} />
          <div className="pointer-events-none origin-top scale-[0.44] pt-1">
            <LandingPageThumbnail page={page} />
          </div>
        </button>
        <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
          <span className={checked ? "opacity-100" : "opacity-0 transition-opacity group-hover:opacity-100"}>
            <Checkbox checked={checked} onCheckedChange={onCheck} className="bg-background" />
          </span>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {page.abTest?.enabled && <Badge variant="outline" className="border-0 bg-violet-500/90 text-[10px] text-white"><FlaskConical className="size-2.5" /> A/B</Badge>}
          <LandingStatusBadge status={page.status} />
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{page.name}</p>
            <p className="truncate text-xs text-muted-foreground">/{page.slug}</p>
          </div>
          <RowMenu page={page} actions={actions} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <LandingTypeBadge type={page.type} />
          {folder && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Folder className="size-3" /> {folder.name}</span>}
        </div>
        {page.status === "published" && page.analytics.views > 0 && (
          <div className="mt-3 flex items-center gap-4 border-t pt-2 text-xs text-muted-foreground tabular-nums">
            <span>{page.analytics.views.toLocaleString()} views</span>
            <span>{page.analytics.submissions.toLocaleString()} leads</span>
            <span>{page.analytics.conversionRate}% conv.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RowMenu({ page, actions }: { page: LandingPage; actions: RowActions }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>} />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => actions.onOpen(page)}><BarChart3 className="size-4" /> Analytics</DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onEdit(page)}><Pencil className="size-4" /> Edit</DropdownMenuItem>
        {page.status === "published" && (
          <DropdownMenuItem onClick={() => window.open(`https://${page.domain}/${page.slug}`, "_blank")}><ExternalLink className="size-4" /> View live</DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => actions.onDuplicate(page)}><Copy className="size-4" /> Duplicate</DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onEdit(page)}><FlaskConical className="size-4" /> A/B test</DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onTemplate(page)}><FileText className="size-4" /> Save as template</DropdownMenuItem>
        <DropdownMenuSeparator />
        {page.status !== "published" ? (
          <DropdownMenuItem onClick={() => actions.onStatus(page, "published")}><Send className="size-4" /> Publish</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => actions.onStatus(page, "unpublished")}><Undo2 className="size-4" /> Unpublish</DropdownMenuItem>
        )}
        {page.status !== "archived" ? (
          <DropdownMenuItem onClick={() => actions.onStatus(page, "archived")}><Archive className="size-4" /> Archive</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => actions.onStatus(page, "draft")}><Undo2 className="size-4" /> Restore</DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => actions.onDelete(page)}><Trash2 className="size-4 text-destructive" /><span className="text-destructive">Delete</span></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
