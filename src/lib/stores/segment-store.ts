"use client";

import { create } from "zustand";
import type { SegmentRecord, SegmentRefreshEntry } from "@/lib/types";
import { MOCK_SEGMENTS } from "@/lib/mock-data";

/** Generate a unique segment id (kept outside components for React Compiler purity). */
export function createSegmentId() {
  return `sg${Date.now()}`;
}

interface SegmentState {
  segments: SegmentRecord[];
  /** Ids of segments with a simulated refresh in flight. */
  refreshing: string[];
  addSegment: (segment: SegmentRecord) => void;
  updateSegment: (id: string, patch: Partial<SegmentRecord>) => void;
  duplicateSegment: (id: string) => SegmentRecord | undefined;
  setArchived: (id: string, archived: boolean) => void;
  deleteSegment: (id: string) => void;
  /** Snapshot a dynamic segment's current membership as a new static segment. */
  convertToStatic: (id: string) => SegmentRecord | undefined;
  refreshNow: (id: string) => void;
  addStaticMembers: (id: string, contactIds: string[], countDelta: number) => void;
  removeStaticMember: (id: string, contactId: string) => void;
}

export const useSegmentStore = create<SegmentState>()((set, get) => ({
  segments: MOCK_SEGMENTS,
  refreshing: [],

  addSegment: (segment) => set((s) => ({ segments: [segment, ...s.segments] })),

  updateSegment: (id, patch) =>
    set((s) => ({
      segments: s.segments.map((sg) =>
        sg.id === id ? { ...sg, ...patch, updatedAt: new Date().toISOString() } : sg
      ),
    })),

  duplicateSegment: (id) => {
    const source = get().segments.find((sg) => sg.id === id);
    if (!source) return undefined;
    const copy: SegmentRecord = {
      ...source,
      id: `sg${Date.now()}`,
      name: `${source.name} (Copy)`,
      archived: false,
      usedIn: [],
      refresh: { ...source.refresh, history: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ segments: [copy, ...s.segments] }));
    return copy;
  },

  setArchived: (id, archived) => get().updateSegment(id, { archived }),

  deleteSegment: (id) =>
    set((s) => ({ segments: s.segments.filter((sg) => sg.id !== id) })),

  convertToStatic: (id) => {
    const source = get().segments.find((sg) => sg.id === id);
    if (!source || source.type === "static") return undefined;
    const snapshot: SegmentRecord = {
      ...source,
      id: `sg${Date.now()}`,
      name: `${source.name} — snapshot`,
      type: "static",
      definition: undefined,
      staticMemberIds: [],
      usedIn: [],
      refresh: { mode: "manual", history: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ segments: [snapshot, ...s.segments] }));
    return snapshot;
  },

  refreshNow: (id) => {
    set((s) => ({ refreshing: [...s.refreshing, id] }));
    // Simulate the refresh engine recalculating membership.
    setTimeout(() => {
      const seg = get().segments.find((sg) => sg.id === id);
      if (seg) {
        const delta = Math.max(1, Math.round(seg.memberCount * 0.01));
        const entry: SegmentRefreshEntry = {
          id: `r${Date.now()}`,
          at: new Date().toISOString(),
          trigger: "manual",
          delta,
          durationMs: 1200 + seg.memberCount,
        };
        get().updateSegment(id, {
          memberCount: seg.memberCount + delta,
          weeklyChange: seg.weeklyChange + delta,
          refresh: {
            ...seg.refresh,
            lastRefreshedAt: entry.at,
            history: [entry, ...seg.refresh.history].slice(0, 10),
          },
        });
      }
      set((s) => ({ refreshing: s.refreshing.filter((x) => x !== id) }));
    }, 1400);
  },

  addStaticMembers: (id, contactIds, countDelta) => {
    const seg = get().segments.find((sg) => sg.id === id);
    if (!seg) return;
    const merged = [...new Set([...(seg.staticMemberIds ?? []), ...contactIds])];
    get().updateSegment(id, {
      staticMemberIds: merged,
      memberCount: seg.memberCount + countDelta,
    });
  },

  removeStaticMember: (id, contactId) => {
    const seg = get().segments.find((sg) => sg.id === id);
    if (!seg) return;
    get().updateSegment(id, {
      staticMemberIds: (seg.staticMemberIds ?? []).filter((x) => x !== contactId),
      memberCount: Math.max(0, seg.memberCount - 1),
    });
  },
}));
