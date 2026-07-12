"use client";

import { create } from "zustand";
import type { LandingAbTest, LandingPage, LandingPageStatus, LandingVariant } from "@/lib/types";
import { MOCK_LANDING_PAGES } from "@/lib/mock-data/landing-pages";

export function createPageId() {
  return `page-${Date.now()}`;
}

interface LandingPageState {
  pages: LandingPage[];
  addPage: (page: LandingPage) => void;
  updatePage: (id: string, patch: Partial<LandingPage>) => void;
  duplicatePage: (id: string) => LandingPage | undefined;
  setStatus: (id: string, status: LandingPageStatus) => void;
  deletePage: (id: string) => void;
  /** Spins up an A/B test with a duplicated variant B. */
  startAbTest: (id: string, goal: LandingAbTest["goal"]) => void;
  endAbTest: (id: string, winnerVariantId?: string) => void;
}

export const useLandingPageStore = create<LandingPageState>()((set, get) => ({
  pages: MOCK_LANDING_PAGES,

  addPage: (page) => set((s) => ({ pages: [page, ...s.pages] })),

  updatePage: (id, patch) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
    })),

  duplicatePage: (id) => {
    const source = get().pages.find((p) => p.id === id);
    if (!source) return undefined;
    const copy: LandingPage = {
      ...source,
      id: createPageId(),
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy`,
      status: "draft",
      publishedAt: undefined,
      scheduledFor: undefined,
      abTest: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ pages: [copy, ...s.pages] }));
    return copy;
  },

  setStatus: (id, status) => get().updatePage(id, { status }),
  deletePage: (id) => set((s) => ({ pages: s.pages.filter((p) => p.id !== id) })),

  startAbTest: (id, goal) => {
    const page = get().pages.find((p) => p.id === id);
    if (!page) return;
    const variants: LandingVariant[] = [
      { id: "var-a", label: "A — Control", weight: 50, isControl: true, views: 0, conversions: 0, sections: page.sections },
      { id: "var-b", label: "B — Variant", weight: 50, views: 0, conversions: 0, sections: page.sections },
    ];
    get().updatePage(id, { abTest: { enabled: true, goal, status: "running", variants } });
  },

  endAbTest: (id, winnerVariantId) => {
    const page = get().pages.find((p) => p.id === id);
    if (!page?.abTest) return;
    get().updatePage(id, { abTest: { ...page.abTest, status: "ended", winnerVariantId } });
  },
}));
