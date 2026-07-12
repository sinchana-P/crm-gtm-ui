"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Columns2,
  Columns3,
  Copy,
  Eye,
  FlaskConical,
  GripVertical,
  Layers,
  LayoutTemplate,
  Monitor,
  Plus,
  Redo2,
  Rocket,
  Save,
  Settings2,
  Smartphone,
  SquarePen,
  Tablet,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import type {
  LandingBackground,
  LandingBlock,
  LandingBlockType,
  LandingDevice,
  LandingPage,
  LandingSection,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { createPageId, useLandingPageStore } from "@/lib/stores/landing-page-store";
import { LANDING_PAGE_TEMPLATES, OPTIMIZATION_CHECKS } from "@/lib/mock-data/landing-pages";
import { EmptyState } from "@/components/shared/empty-state";
import { LandingBlockConfig } from "@/components/marketing/landing-pages/landing-block-config";
import { LandingBlockRender } from "@/components/marketing/landing-pages/landing-block-render";
import { LandingSettingsDrawer } from "@/components/marketing/landing-pages/landing-settings-drawer";
import { LandingAbTestDialog, LandingPublishDialog } from "@/components/marketing/landing-pages/landing-dialogs";
import {
  LANDING_BLOCK_META,
  LandingStatusBadge,
  PADDING_Y_CLASS,
  createLandingId,
  makeLandingBlock,
  makeLandingSection,
} from "@/components/marketing/landing-pages/landing-shared";

type Selection =
  | { type: "block"; sectionId: string; col: number; blockId: string }
  | { type: "section"; sectionId: string }
  | null;

const DEVICE_WIDTH: Record<LandingDevice, string> = {
  desktop: "max-w-[1024px]",
  tablet: "max-w-[768px]",
  mobile: "max-w-[380px]",
};

type PaletteGroup = "content" | "media" | "conversion" | "layout" | "advanced";
const PALETTE_GROUPS: { label: string; group: PaletteGroup }[] = [
  { label: "Content", group: "content" },
  { label: "Media", group: "media" },
  { label: "Conversion", group: "conversion" },
  { label: "Layout", group: "layout" },
  { label: "Advanced", group: "advanced" },
];

function sectionBgStyle(bg: LandingBackground): React.CSSProperties | undefined {
  if (bg.type === "color") return { backgroundColor: bg.color };
  if (bg.type === "gradient") return { backgroundImage: `linear-gradient(135deg, ${bg.gradientFrom ?? "#fff"}, ${bg.gradientTo ?? "#fff"})` };
  if (bg.type === "image" && bg.imageUrl) return { backgroundImage: `url(${bg.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  return undefined;
}

export function LandingPageBuilder({ pageId, templateId }: { pageId?: string; templateId?: string }) {
  const router = useRouter();
  const existing = useLandingPageStore((s) => (pageId ? s.pages.find((p) => p.id === pageId) : undefined));
  const template = templateId ? LANDING_PAGE_TEMPLATES.find((t) => t.id === templateId) : undefined;
  const addPage = useLandingPageStore((s) => s.addPage);
  const updatePage = useLandingPageStore((s) => s.updatePage);
  const startAbTest = useLandingPageStore((s) => s.startAbTest);

  const editMode = !!pageId;

  // ── page-level draft state ──
  const seed = existing ?? undefined;
  const [name, setName] = useState(seed?.name ?? template?.name ?? "Untitled landing page");
  const [slug, setSlug] = useState(seed?.slug ?? "new-page");
  const [domain, setDomain] = useState(seed?.domain ?? "go.connect-nx.com");
  const [folderId, setFolderId] = useState<string | undefined>(seed?.folderId);
  const [type, setType] = useState<LandingPage["type"]>(seed?.type ?? template?.category ?? "lead-gen");
  const [theme, setTheme] = useState(seed?.theme ?? { primaryColor: template?.accent ?? "#6366f1", fontFamily: "sans" as const, buttonRadius: "md" as const, contentWidth: "normal" as const });
  const [seo, setSeo] = useState(seed?.seo ?? { slug: "new-page", title: name, metaDescription: "", language: "en" });
  const [tracking, setTracking] = useState(seed?.tracking ?? { cookieBanner: true });
  const [passwordProtected, setPasswordProtected] = useState(seed?.passwordProtected);
  const [expiresAt, setExpiresAt] = useState(seed?.expiresAt);

  // ── canvas state with undo/redo ──
  const [sections, setSectionsRaw] = useState<LandingSection[]>(
    seed?.sections ?? (template ? (JSON.parse(JSON.stringify(template.sections)) as LandingSection[]) : [])
  );
  const [past, setPast] = useState<LandingSection[][]>([]);
  const [future, setFuture] = useState<LandingSection[][]>([]);

  const [selection, setSelection] = useState<Selection>(null);
  const [device, setDevice] = useState<LandingDevice>("desktop");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [leftTab, setLeftTab] = useState<"blocks" | "layers">("blocks");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [abOpen, setAbOpen] = useState(false);
  const [dragSection, setDragSection] = useState<number | null>(null);

  function commit(next: LandingSection[]) {
    setPast((p) => [...p.slice(-49), sections]);
    setFuture([]);
    setSectionsRaw(next);
  }
  function undo() {
    if (!past.length) return;
    setFuture((f) => [sections, ...f]);
    setSectionsRaw(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
  }
  function redo() {
    if (!future.length) return;
    setPast((p) => [...p, sections]);
    setSectionsRaw(future[0]);
    setFuture((f) => f.slice(1));
  }

  // ── section ops ──
  const patchSection = (id: string, patch: Partial<LandingSection>) =>
    commit(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  function addSection(columns: 1 | 2 | 3) {
    const s = makeLandingSection(columns);
    commit([...sections, s]);
    setSelection({ type: "section", sectionId: s.id });
    setLeftTab("blocks");
  }
  function removeSection(id: string) {
    commit(sections.filter((s) => s.id !== id));
    setSelection(null);
  }
  function duplicateSection(id: string) {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const clone = JSON.parse(JSON.stringify(sections[idx])) as LandingSection;
    clone.id = createLandingId("sec");
    clone.content = clone.content.map((col) => col.map((b) => ({ ...b, id: createLandingId("blk") })));
    const next = [...sections];
    next.splice(idx + 1, 0, clone);
    commit(next);
  }
  function moveSection(from: number, to: number) {
    if (to < 0 || to >= sections.length) return;
    const next = [...sections];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commit(next);
  }
  function setColumns(id: string, cols: 1 | 2 | 3) {
    commit(
      sections.map((s) => {
        if (s.id !== id) return s;
        const content = Array.from({ length: cols }, (_, i) => s.content[i] ?? []);
        // merge overflow columns into the last kept column
        if (s.content.length > cols) {
          const overflow = s.content.slice(cols).flat();
          content[cols - 1] = [...content[cols - 1], ...overflow];
        }
        return { ...s, columns: cols, content };
      })
    );
  }

  // ── block ops ──
  function addBlock(t: LandingBlockType) {
    const block = makeLandingBlock(t);
    let target = selection;
    // Ensure there is a section to drop into.
    if (!target || (target.type === "section" && !sections.find((s) => s.id === target!.sectionId))) {
      if (sections.length === 0) {
        const s = makeLandingSection(1);
        s.content[0] = [block];
        commit([...sections, s]);
        setSelection({ type: "block", sectionId: s.id, col: 0, blockId: block.id });
        return;
      }
      target = { type: "section", sectionId: sections[sections.length - 1].id };
    }
    const sectionId = target.sectionId;
    const col = target.type === "block" ? target.col : 0;
    commit(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        const content = s.content.map((c) => [...c]);
        if (target!.type === "block") {
          const i = content[col].findIndex((b) => b.id === target!.blockId);
          content[col].splice(i + 1, 0, block);
        } else {
          content[col].push(block);
        }
        return { ...s, content };
      })
    );
    setSelection({ type: "block", sectionId, col, blockId: block.id });
  }
  function updateBlock(sectionId: string, col: number, blockId: string, patch: Partial<LandingBlock>) {
    commit(
      sections.map((s) =>
        s.id !== sectionId ? s : { ...s, content: s.content.map((c, ci) => (ci !== col ? c : c.map((b) => (b.id === blockId ? { ...b, ...patch } : b)))) }
      )
    );
  }
  function removeBlock(sectionId: string, col: number, blockId: string) {
    commit(sections.map((s) => (s.id !== sectionId ? s : { ...s, content: s.content.map((c, ci) => (ci !== col ? c : c.filter((b) => b.id !== blockId))) })));
    setSelection(null);
  }
  function duplicateBlock(sectionId: string, col: number, blockId: string) {
    commit(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        const content = s.content.map((c) => [...c]);
        const i = content[col].findIndex((b) => b.id === blockId);
        if (i === -1) return s;
        content[col].splice(i + 1, 0, { ...JSON.parse(JSON.stringify(content[col][i])), id: createLandingId("blk") });
        return { ...s, content };
      })
    );
  }
  function moveBlock(sectionId: string, col: number, from: number, dir: number) {
    const to = from + dir;
    commit(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        const content = s.content.map((c) => [...c]);
        if (to < 0 || to >= content[col].length) return s;
        const [item] = content[col].splice(from, 1);
        content[col].splice(to, 0, item);
        return { ...s, content };
      })
    );
  }

  // ── optimization score ──
  const score = useMemo(() => {
    const all = sections.flatMap((s) => s.content.flat());
    const has = (t: LandingBlockType) => all.some((b) => b.type === t);
    const passed: Record<string, boolean> = {
      headline: all.some((b) => b.type === "heading" && b.level === 1),
      cta: has("button") || has("form"),
      form: has("form"),
      proof: has("logos") || has("stats") || has("testimonial"),
      media: has("image") || has("video"),
      length: all.filter((b) => b.type === "text").length <= 6,
      seo: !!seo.title && !!seo.metaDescription,
      ogimage: !!seo.ogImageUrl,
    };
    const count = Object.values(passed).filter(Boolean).length;
    return { passed, pct: Math.round((count / OPTIMIZATION_CHECKS.length) * 100) };
  }, [sections, seo]);

  const selectedBlock =
    selection?.type === "block"
      ? sections.find((s) => s.id === selection.sectionId)?.content[selection.col]?.find((b) => b.id === selection.blockId)
      : undefined;
  const selectedSection = selection ? sections.find((s) => s.id === selection.sectionId) : undefined;

  const draftPage: LandingPage = {
    id: pageId ?? "preview",
    name,
    status: existing?.status ?? "draft",
    type,
    slug,
    domain,
    folderId,
    owner: existing?.owner ?? "Priya Sharma",
    accent: theme.primaryColor,
    sections,
    theme,
    seo,
    tracking,
    passwordProtected,
    expiresAt,
    abTest: existing?.abTest,
    analytics: existing?.analytics ?? { views: 0, uniqueVisitors: 0, submissions: 0, conversionRate: 0, bounceRate: 0, avgTimeSeconds: 0, daily: [], sources: [], devices: [], submissionsList: [] },
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  function save(publish: boolean, scheduledFor?: string) {
    if (!name.trim()) return toast.error("Give the page a name");
    const status: LandingPage["status"] = scheduledFor ? "scheduled" : publish ? "published" : editMode ? existing!.status : "draft";
    const shared = { name: name.trim(), slug, domain, folderId, type, sections, theme, seo: { ...seo, slug }, tracking, passwordProtected, expiresAt };
    if (editMode && existing) {
      updatePage(existing.id, { ...shared, status, ...(publish ? { publishedAt: new Date().toISOString() } : {}), ...(scheduledFor ? { scheduledFor } : {}) });
      toast.success(scheduledFor ? "Page scheduled" : publish ? "Page published" : "Draft saved");
      router.push(`/marketing/landing-pages/${existing.id}`);
      return;
    }
    const id = createPageId();
    addPage({ ...draftPage, id, status, ...(scheduledFor ? { scheduledFor } : {}), ...(publish ? { publishedAt: new Date().toISOString() } : {}) });
    toast.success(scheduledFor ? "Page scheduled" : publish ? "Page published" : "Draft saved");
    router.push(`/marketing/landing-pages/${id}`);
  }

  if (editMode && !existing) {
    return (
      <EmptyState
        title="Page not found"
        description="This landing page may have been deleted."
        action={<Button variant="outline" onClick={() => router.push("/marketing/landing-pages")}><ArrowLeft className="size-4" /> Back to pages</Button>}
      />
    );
  }

  const liveUrl = `https://${domain}/${slug}`;

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col">
      {/* ── top bar ── */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/marketing/landing-pages")}><ArrowLeft className="size-4" /></Button>
          <div className="min-w-0">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-56 border-transparent px-1 text-sm font-semibold shadow-none hover:border-border focus:border-border" />
            <div className="mt-0.5 flex items-center gap-2 px-1">
              <LandingStatusBadge status={existing?.status ?? "draft"} />
              <span className="truncate font-mono text-[11px] text-muted-foreground">/{slug}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border p-0.5">
            <Button variant={device === "desktop" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setDevice("desktop")}><Monitor className="size-4" /></Button>
            <Button variant={device === "tablet" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setDevice("tablet")}><Tablet className="size-4" /></Button>
            <Button variant={device === "mobile" ? "secondary" : "ghost"} size="icon-sm" onClick={() => setDevice("mobile")}><Smartphone className="size-4" /></Button>
          </div>
          <div className="flex items-center rounded-lg border p-0.5">
            <Button variant="ghost" size="icon-sm" disabled={!past.length} onClick={undo}><Undo2 className="size-4" /></Button>
            <Button variant="ghost" size="icon-sm" disabled={!future.length} onClick={redo}><Redo2 className="size-4" /></Button>
          </div>
          <Button variant={mode === "preview" ? "secondary" : "outline"} size="sm" onClick={() => setMode((m) => (m === "edit" ? "preview" : "edit"))}>
            {mode === "preview" ? <><SquarePen className="size-4" /> Edit</> : <><Eye className="size-4" /> Preview</>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAbOpen(true)}><FlaskConical className="size-4" /> A/B</Button>
          <Button variant="outline" size="icon-sm" onClick={() => setSettingsOpen(true)}><Settings2 className="size-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => save(false)}><Save className="size-4" /> Save</Button>
          <Button size="sm" onClick={() => setPublishOpen(true)}><Rocket className="size-4" /> Publish</Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* ── left rail ── */}
        {mode === "edit" && (
          <div className="flex w-60 shrink-0 flex-col border-r">
            <div className="flex items-center gap-1 border-b p-2">
              <Button variant={leftTab === "blocks" ? "secondary" : "ghost"} size="sm" className="flex-1" onClick={() => setLeftTab("blocks")}><LayoutTemplate className="size-4" /> Blocks</Button>
              <Button variant={leftTab === "layers" ? "secondary" : "ghost"} size="sm" className="flex-1" onClick={() => setLeftTab("layers")}><Layers className="size-4" /> Layers</Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {leftTab === "blocks" ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Add section</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button type="button" onClick={() => addSection(1)} className="flex flex-col items-center gap-1 rounded-lg border py-2 text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"><div className="h-4 w-8 rounded-sm bg-muted" />1 col</button>
                      <button type="button" onClick={() => addSection(2)} className="flex flex-col items-center gap-1 rounded-lg border py-2 text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"><Columns2 className="size-4" />2 col</button>
                      <button type="button" onClick={() => addSection(3)} className="flex flex-col items-center gap-1 rounded-lg border py-2 text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"><Columns3 className="size-4" />3 col</button>
                    </div>
                  </div>
                  {PALETTE_GROUPS.map((g) => {
                    const blocks = (Object.keys(LANDING_BLOCK_META) as LandingBlockType[]).filter((t) => LANDING_BLOCK_META[t].group === g.group);
                    return (
                      <div key={g.group} className="space-y-1.5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{g.label}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {blocks.map((t) => {
                            const Meta = LANDING_BLOCK_META[t];
                            return (
                              <button key={t} type="button" onClick={() => addBlock(t)} className="flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-xs transition-colors hover:border-primary hover:bg-primary/5">
                                <Meta.icon className="size-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{Meta.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <LayersTree sections={sections} selection={selection} onSelect={setSelection} />
              )}
            </div>
          </div>
        )}

        {/* ── canvas ── */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-6" onClick={() => setSelection(null)}>
          <div className={cn("mx-auto overflow-hidden bg-white shadow-sm transition-all", DEVICE_WIDTH[device], mode === "edit" ? "rounded-lg" : "rounded-xl")}>
            {sections.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-24 text-center text-sm text-neutral-400">
                <LayoutTemplate className="size-8" />
                <p>Add a section from the left to start building.</p>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); addSection(1); }}><Plus className="size-4" /> Add section</Button>
              </div>
            ) : (
              sections.map((section, si) => (
                <SectionBlock
                  key={section.id}
                  section={section}
                  index={si}
                  total={sections.length}
                  mode={mode}
                  theme={theme}
                  selection={selection}
                  dragging={dragSection === si}
                  onSelect={setSelection}
                  onSelectSection={() => setSelection({ type: "section", sectionId: section.id })}
                  onMove={(dir) => moveSection(si, si + dir)}
                  onDuplicate={() => duplicateSection(section.id)}
                  onDelete={() => removeSection(section.id)}
                  onSetColumns={(c) => setColumns(section.id, c)}
                  onBlockMove={(col, from, dir) => moveBlock(section.id, col, from, dir)}
                  onBlockDuplicate={(col, id) => duplicateBlock(section.id, col, id)}
                  onBlockDelete={(col, id) => removeBlock(section.id, col, id)}
                  onDragStart={() => setDragSection(si)}
                  onDrop={() => { if (dragSection !== null && dragSection !== si) moveSection(dragSection, si); setDragSection(null); }}
                  onDragEnd={() => setDragSection(null)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── right inspector ── */}
        {mode === "edit" && (
          <div className="w-72 shrink-0 overflow-y-auto border-l p-4">
            {selectedBlock && selection?.type === "block" ? (
              <LandingBlockConfig block={selectedBlock} onChange={(p) => updateBlock(selection.sectionId, selection.col, selection.blockId, p)} />
            ) : selectedSection ? (
              <SectionInspector section={selectedSection} onChange={(p) => patchSection(selectedSection.id, p)} />
            ) : (
              <PageInspector score={score} type={type} onType={setType} onOpenSettings={() => setSettingsOpen(true)} />
            )}
          </div>
        )}
      </div>

      <LandingSettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        page={{ name, slug, domain, folderId, seo, tracking, theme, passwordProtected, expiresAt }}
        onChange={(p) => {
          if (p.name !== undefined) setName(p.name);
          if (p.slug !== undefined) setSlug(p.slug);
          if (p.domain !== undefined) setDomain(p.domain);
          if ("folderId" in p) setFolderId(p.folderId);
          if (p.seo) setSeo(p.seo);
          if (p.tracking) setTracking(p.tracking);
          if (p.theme) setTheme(p.theme);
          if ("passwordProtected" in p) setPasswordProtected(p.passwordProtected);
          if ("expiresAt" in p) setExpiresAt(p.expiresAt);
        }}
      />
      <LandingPublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        pageName={name}
        url={liveUrl}
        onPublish={() => save(true)}
        onSchedule={(when) => save(false, when)}
      />
      <LandingAbTestDialog
        open={abOpen}
        onOpenChange={setAbOpen}
        hasTest={!!existing?.abTest?.enabled}
        onStart={(goal) => {
          if (!editMode) { toast.error("Save the page before starting a test"); return; }
          startAbTest(existing!.id, goal);
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function SectionBlock({
  section, index, total, mode, theme, selection, dragging,
  onSelect, onSelectSection, onMove, onDuplicate, onDelete, onSetColumns,
  onBlockMove, onBlockDuplicate, onBlockDelete, onDragStart, onDrop, onDragEnd,
}: {
  section: LandingSection;
  index: number;
  total: number;
  mode: "edit" | "preview";
  theme: LandingPage["theme"];
  selection: Selection;
  dragging: boolean;
  onSelect: (s: Selection) => void;
  onSelectSection: () => void;
  onMove: (dir: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetColumns: (c: 1 | 2 | 3) => void;
  onBlockMove: (col: number, from: number, dir: number) => void;
  onBlockDuplicate: (col: number, id: string) => void;
  onBlockDelete: (col: number, id: string) => void;
  onDragStart: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const selected = selection?.type === "section" && selection.sectionId === section.id;
  const preview = mode === "preview";
  const colClass = section.columns === 2 ? "sm:grid-cols-2" : section.columns === 3 ? "sm:grid-cols-3" : "grid-cols-1";
  const valign = section.verticalAlign === "center" ? "items-center" : section.verticalAlign === "bottom" ? "items-end" : "items-start";

  return (
    <div
      draggable={!preview}
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={sectionBgStyle(section.background)}
      onClick={(e) => { if (preview) return; e.stopPropagation(); onSelectSection(); }}
      className={cn("group/section relative", PADDING_Y_CLASS[section.paddingY ?? "lg"], !preview && "cursor-pointer", !preview && selected && "outline outline-2 outline-primary", dragging && "opacity-40")}
    >
      {section.background.type === "image" && (section.background.overlay ?? 0) > 0 && (
        <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: (section.background.overlay ?? 0) / 100 }} />
      )}
      {!preview && (
        <div className="absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-md border bg-background p-0.5 opacity-0 shadow-sm transition-opacity group-hover/section:opacity-100" onClick={(e) => e.stopPropagation()}>
          <span className="flex size-6 cursor-grab items-center justify-center text-muted-foreground"><GripVertical className="size-3.5" /></span>
          <Button variant="ghost" size="icon-sm" className="size-6" disabled={index === 0} onClick={() => onMove(-1)}><ChevronUp className="size-3.5" /></Button>
          <Button variant="ghost" size="icon-sm" className="size-6" disabled={index === total - 1} onClick={() => onMove(1)}><ChevronDown className="size-3.5" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="size-6"><Columns2 className="size-3.5" /></Button>} />
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => onSetColumns(1)}>1 column</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetColumns(2)}>2 columns</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetColumns(3)}>3 columns</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon-sm" className="size-6" onClick={onDuplicate}><Copy className="size-3.5" /></Button>
          <Button variant="ghost" size="icon-sm" className="size-6" onClick={onDelete}><Trash2 className="size-3.5" /></Button>
        </div>
      )}
      <div className={cn("relative mx-auto grid gap-6 px-6", section.width === "full" ? "max-w-none" : "max-w-4xl", colClass, valign)}>
        {section.content.map((col, ci) => (
          <div key={ci} className="space-y-4">
            {col.length === 0 && !preview ? (
              <div className="flex min-h-24 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-xs text-neutral-400">
                Empty column — add a block
              </div>
            ) : (
              col.map((block, bi) => {
                const blockSelected = selection?.type === "block" && selection.blockId === block.id;
                return (
                  <div
                    key={block.id}
                    onClick={(e) => { if (preview) return; e.stopPropagation(); onSelect({ type: "block", sectionId: section.id, col: ci, blockId: block.id }); }}
                    className={cn("group/block relative", !preview && "cursor-pointer rounded-md p-1 transition-colors", !preview && (blockSelected ? "outline outline-2 outline-primary" : "hover:outline hover:outline-1 hover:outline-primary/40"))}
                  >
                    <LandingBlockRender block={block} theme={theme} />
                    {!preview && (
                      <div className="absolute -top-3 right-1 z-10 flex items-center gap-0.5 rounded-md border bg-background p-0.5 opacity-0 shadow-sm transition-opacity group-hover/block:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon-sm" className="size-6" disabled={bi === 0} onClick={() => onBlockMove(ci, bi, -1)}><ChevronUp className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon-sm" className="size-6" disabled={bi === col.length - 1} onClick={() => onBlockMove(ci, bi, 1)}><ChevronDown className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon-sm" className="size-6" onClick={() => onBlockDuplicate(ci, block.id)}><Copy className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon-sm" className="size-6" onClick={() => onBlockDelete(ci, block.id)}><Trash2 className="size-3.5" /></Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LayersTree({ sections, selection, onSelect }: { sections: LandingSection[]; selection: Selection; onSelect: (s: Selection) => void }) {
  if (sections.length === 0) return <p className="text-xs text-muted-foreground">No sections yet.</p>;
  return (
    <div className="space-y-1">
      {sections.map((s, i) => (
        <div key={s.id}>
          <button
            type="button"
            onClick={() => onSelect({ type: "section", sectionId: s.id })}
            className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs", selection?.type === "section" && selection.sectionId === s.id ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted")}
          >
            <LayoutTemplate className="size-3.5" /> Section {i + 1} <span className="ml-auto text-[10px]">{s.columns} col</span>
          </button>
          <div className="ml-4 space-y-0.5 border-l pl-2">
            {s.content.flatMap((col, ci) =>
              col.map((b) => {
                const Meta = LANDING_BLOCK_META[b.type];
                const active = selection?.type === "block" && selection.blockId === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelect({ type: "block", sectionId: s.id, col: ci, blockId: b.id })}
                    className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs", active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted")}
                  >
                    <Meta.icon className="size-3.5" /> <span className="truncate">{Meta.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionInspector({ section, onChange }: { section: LandingSection; onChange: (p: Partial<LandingSection>) => void }) {
  const bg = section.background;
  const setBg = (p: Partial<LandingBackground>) => onChange({ background: { ...bg, ...p } });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-muted"><LayoutTemplate className="size-4 text-muted-foreground" /></span>
        <div><p className="text-sm font-medium">Section</p><p className="text-xs text-muted-foreground">Layout & background</p></div>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Columns</Label>
        <Select value={String(section.columns)} onValueChange={(v) => {
          const cols = Number(v) as 1 | 2 | 3;
          const content = Array.from({ length: cols }, (_, i) => section.content[i] ?? []);
          onChange({ columns: cols, content });
        }}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="1">1 column</SelectItem><SelectItem value="2">2 columns</SelectItem><SelectItem value="3">3 columns</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Background</Label>
        <Select value={bg.type} onValueChange={(v) => setBg({ type: v as LandingBackground["type"] })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="color">Solid color</SelectItem><SelectItem value="gradient">Gradient</SelectItem><SelectItem value="image">Image</SelectItem></SelectContent>
        </Select>
      </div>
      {bg.type === "color" && (
        <div className="flex items-center gap-2">
          <input type="color" value={bg.color ?? "#f8fafc"} onChange={(e) => setBg({ color: e.target.value })} className="size-8 cursor-pointer rounded border" />
          <Input value={bg.color ?? "#f8fafc"} onChange={(e) => setBg({ color: e.target.value })} className="w-28" />
        </div>
      )}
      {bg.type === "gradient" && (
        <div className="flex items-center gap-2">
          <input type="color" value={bg.gradientFrom ?? "#eef2ff"} onChange={(e) => setBg({ gradientFrom: e.target.value })} className="size-8 cursor-pointer rounded border" />
          <span className="text-xs text-muted-foreground">→</span>
          <input type="color" value={bg.gradientTo ?? "#ffffff"} onChange={(e) => setBg({ gradientTo: e.target.value })} className="size-8 cursor-pointer rounded border" />
        </div>
      )}
      {bg.type === "image" && (
        <>
          <Input value={bg.imageUrl ?? ""} onChange={(e) => setBg({ imageUrl: e.target.value })} placeholder="Image URL" />
          <div className="grid gap-1.5">
            <Label className="text-xs">Dark overlay — {bg.overlay ?? 0}%</Label>
            <Input type="range" min={0} max={80} value={bg.overlay ?? 0} onChange={(e) => setBg({ overlay: Number(e.target.value) })} />
          </div>
        </>
      )}
      <div className="grid gap-1.5">
        <Label className="text-xs">Vertical padding</Label>
        <Select value={section.paddingY ?? "lg"} onValueChange={(v) => onChange({ paddingY: v as LandingSection["paddingY"] })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{(["none", "sm", "md", "lg", "xl"] as const).map((p) => (<SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Width</Label>
        <Select value={section.width ?? "boxed"} onValueChange={(v) => onChange({ width: v as LandingSection["width"] })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="boxed">Boxed</SelectItem><SelectItem value="full">Full width</SelectItem></SelectContent>
        </Select>
      </div>
      {section.columns > 1 && (
        <div className="grid gap-1.5">
          <Label className="text-xs">Column alignment</Label>
          <Select value={section.verticalAlign ?? "top"} onValueChange={(v) => onChange({ verticalAlign: v as LandingSection["verticalAlign"] })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="top">Top</SelectItem><SelectItem value="center">Center</SelectItem><SelectItem value="bottom">Bottom</SelectItem></SelectContent>
          </Select>
        </div>
      )}
      <label className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="flex flex-col"><span>Global section</span><span className="text-xs text-muted-foreground">Reuse across pages</span></span>
        <Switch checked={!!section.global} onCheckedChange={(v) => onChange({ global: v })} />
      </label>
    </div>
  );
}

function PageInspector({
  score, type, onType, onOpenSettings,
}: {
  score: { passed: Record<string, boolean>; pct: number };
  type: LandingPage["type"];
  onType: (t: LandingPage["type"]) => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium">Page</p>
        <p className="text-xs text-muted-foreground">Select a section or block to edit it.</p>
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Goal</Label>
        <Select value={type} onValueChange={(v) => onType(v as LandingPage["type"])}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(["lead-gen", "event", "webinar", "ebook", "product", "coming-soon", "thank-you"] as const).map((t) => (<SelectItem key={t} value={t} className="capitalize">{t.replace("-", " ")}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* optimization score */}
      <Card className="shadow-none">
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Optimization score</p>
            <Badge variant="outline" className={cn("border-0", score.pct >= 75 ? "bg-emerald-500/10 text-emerald-600" : score.pct >= 50 ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600")}>{score.pct}%</Badge>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", score.pct >= 75 ? "bg-emerald-500" : score.pct >= 50 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${score.pct}%` }} />
          </div>
          <ul className="space-y-1.5">
            {OPTIMIZATION_CHECKS.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-xs">
                <span className={cn("mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full text-[9px] text-white", score.passed[c.id] ? "bg-emerald-500" : "bg-neutral-300")}>{score.passed[c.id] ? "✓" : ""}</span>
                <span className={cn(score.passed[c.id] ? "text-muted-foreground line-through" : "text-foreground")}>{c.label}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button variant="outline" size="sm" className="w-full" onClick={onOpenSettings}><Settings2 className="size-4" /> Page settings & SEO</Button>
    </div>
  );
}
