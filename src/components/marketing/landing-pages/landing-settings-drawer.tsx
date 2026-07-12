"use client";

import { Code2, Globe, Palette, Search, Share2, ShieldCheck } from "lucide-react";
import type { LandingSeo, LandingTheme, LandingTracking } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { LANDING_PAGE_FOLDERS } from "@/lib/mock-data/landing-pages";

interface Draft {
  name: string;
  slug: string;
  domain: string;
  folderId?: string;
  seo: LandingSeo;
  tracking: LandingTracking;
  theme: LandingTheme;
  passwordProtected?: boolean;
  expiresAt?: string;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Full page-settings drawer: SEO, social, tracking, code, access, and theme. */
export function LandingSettingsDrawer({
  open,
  onOpenChange,
  page,
  onChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  page: Draft;
  onChange: (patch: Partial<Draft>) => void;
}) {
  const setSeo = (p: Partial<LandingSeo>) => onChange({ seo: { ...page.seo, ...p } });
  const setTracking = (p: Partial<LandingTracking>) => onChange({ tracking: { ...page.tracking, ...p } });
  const setTheme = (p: Partial<LandingTheme>) => onChange({ theme: { ...page.theme, ...p } });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Page settings</SheetTitle>
          <SheetDescription>SEO, sharing, tracking, access, and global styles for this page.</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="seo" className="px-4 pb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="seo"><Search className="size-4" /></TabsTrigger>
            <TabsTrigger value="social"><Share2 className="size-4" /></TabsTrigger>
            <TabsTrigger value="tracking"><Globe className="size-4" /></TabsTrigger>
            <TabsTrigger value="access"><ShieldCheck className="size-4" /></TabsTrigger>
            <TabsTrigger value="theme"><Palette className="size-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="seo" className="mt-4 space-y-4">
            <Field label="Page name (internal)"><Input value={page.name} onChange={(e) => onChange({ name: e.target.value })} /></Field>
            <Field label="Folder">
              <Select value={page.folderId ?? "none"} onValueChange={(v) => onChange({ folderId: v && v !== "none" ? v : undefined })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {LANDING_PAGE_FOLDERS.map((f) => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="SEO title" hint="Shown in the browser tab and search results."><Input value={page.seo.title ?? ""} onChange={(e) => setSeo({ title: e.target.value })} /></Field>
            <Field label="Meta description" hint={`${(page.seo.metaDescription ?? "").length}/160 characters`}>
              <Textarea rows={3} value={page.seo.metaDescription ?? ""} onChange={(e) => setSeo({ metaDescription: e.target.value })} />
            </Field>
            <Field label="Keywords"><Input value={page.seo.keywords ?? ""} onChange={(e) => setSeo({ keywords: e.target.value })} placeholder="crm, marketing, leads" /></Field>
            <Field label="Canonical URL"><Input value={page.seo.canonicalUrl ?? ""} onChange={(e) => setSeo({ canonicalUrl: e.target.value })} placeholder="https://…" /></Field>
            <Field label="Language">
              <Select value={page.seo.language ?? "en"} onValueChange={(v) => setSeo({ language: v ?? "en" })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["en", "es", "fr", "de", "pt"].map((l) => (<SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>))}
                </SelectContent>
              </Select>
            </Field>
            <label className="flex items-center justify-between text-sm">
              <span>Hide from search engines (noindex)</span>
              <Switch checked={!!page.seo.noIndex} onCheckedChange={(v) => setSeo({ noIndex: v })} />
            </label>
          </TabsContent>

          <TabsContent value="social" className="mt-4 space-y-4">
            <Field label="Social share image (OG)" hint="Recommended 1200×630px. Shown when the page is shared.">
              <Input value={page.seo.ogImageUrl ?? ""} onChange={(e) => setSeo({ ogImageUrl: e.target.value })} placeholder="https://…" />
            </Field>
            <div className="overflow-hidden rounded-lg border">
              <div className="flex aspect-[1200/630] items-center justify-center bg-neutral-100 text-xs text-neutral-400">
                {page.seo.ogImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={page.seo.ogImageUrl} alt="OG preview" className="size-full object-cover" />
                ) : (
                  "Share image preview"
                )}
              </div>
              <div className="border-t p-3">
                <p className="text-sm font-medium">{page.seo.title || page.name}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{page.seo.metaDescription || "Add a meta description to control this preview."}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{page.domain}/{page.slug}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="mt-4 space-y-4">
            <Field label="Analytics measurement ID"><Input value={page.tracking.gaMeasurementId ?? ""} onChange={(e) => setTracking({ gaMeasurementId: e.target.value })} placeholder="G-XXXXXXX" /></Field>
            <Field label="Ad pixel ID"><Input value={page.tracking.metaPixelId ?? ""} onChange={(e) => setTracking({ metaPixelId: e.target.value })} placeholder="Pixel ID" /></Field>
            <Field label="Professional network partner ID"><Input value={page.tracking.linkedInPartnerId ?? ""} onChange={(e) => setTracking({ linkedInPartnerId: e.target.value })} placeholder="Partner ID" /></Field>
            <Field label="Custom head code" hint="Injected before </head>.">
              <Textarea rows={3} className="font-mono text-xs" value={page.tracking.customHeadCode ?? ""} onChange={(e) => setTracking({ customHeadCode: e.target.value })} placeholder="<script>…</script>" />
            </Field>
            <Field label="Custom footer code" hint="Injected before </body>.">
              <Textarea rows={3} className="font-mono text-xs" value={page.tracking.customFooterCode ?? ""} onChange={(e) => setTracking({ customFooterCode: e.target.value })} placeholder="<script>…</script>" />
            </Field>
            <label className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><Code2 className="size-4 text-muted-foreground" /> Show cookie consent banner</span>
              <Switch checked={!!page.tracking.cookieBanner} onCheckedChange={(v) => setTracking({ cookieBanner: v })} />
            </label>
          </TabsContent>

          <TabsContent value="access" className="mt-4 space-y-4">
            <Field label="Domain">
              <Select value={page.domain} onValueChange={(v) => onChange({ domain: v ?? page.domain })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="go.connect-nx.com">go.connect-nx.com</SelectItem>
                  <SelectItem value="pages.connect-nx.com">pages.connect-nx.com</SelectItem>
                  <SelectItem value="connect.mybrand.io">connect.mybrand.io (custom)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="URL slug" hint={`Full URL: ${page.domain}/${page.slug || "…"}`}>
              <Input value={page.slug} onChange={(e) => onChange({ slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })} />
            </Field>
            <label className="flex items-center justify-between text-sm">
              <span>Password protect this page</span>
              <Switch checked={!!page.passwordProtected} onCheckedChange={(v) => onChange({ passwordProtected: v })} />
            </label>
            {page.passwordProtected && (
              <Field label="Page password"><Input type="text" placeholder="Enter a password" /></Field>
            )}
            <Field label="Auto-unpublish date" hint="Page is taken down automatically after this date.">
              <Input type="datetime-local" value={page.expiresAt ?? ""} onChange={(e) => onChange({ expiresAt: e.target.value })} />
            </Field>
          </TabsContent>

          <TabsContent value="theme" className="mt-4 space-y-4">
            <Field label="Primary color" hint="Drives buttons, links, and accents.">
              <div className="flex items-center gap-2">
                <input type="color" value={page.theme.primaryColor} onChange={(e) => setTheme({ primaryColor: e.target.value })} className="size-8 cursor-pointer rounded border" />
                <Input value={page.theme.primaryColor} onChange={(e) => setTheme({ primaryColor: e.target.value })} className="w-28" />
              </div>
            </Field>
            <Field label="Font family">
              <Select value={page.theme.fontFamily} onValueChange={(v) => setTheme({ fontFamily: v as LandingTheme["fontFamily"] })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">Sans-serif (modern)</SelectItem>
                  <SelectItem value="serif">Serif (editorial)</SelectItem>
                  <SelectItem value="mono">Monospace (technical)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Button corners">
              <Select value={page.theme.buttonRadius} onValueChange={(v) => setTheme({ buttonRadius: v as LandingTheme["buttonRadius"] })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Square</SelectItem>
                  <SelectItem value="sm">Slightly rounded</SelectItem>
                  <SelectItem value="md">Rounded</SelectItem>
                  <SelectItem value="full">Pill</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Content width">
              <Select value={page.theme.contentWidth} onValueChange={(v) => setTheme({ contentWidth: v as LandingTheme["contentWidth"] })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Narrow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </TabsContent>
        </Tabs>

        <div className="border-t px-4 py-3">
          <Button className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
