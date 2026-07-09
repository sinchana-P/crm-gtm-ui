"use client";

import { create } from "zustand";
import type { AiSavedDraft, AiSavedDraftStatus } from "@/lib/types";
import { MOCK_AI_DRAFTS } from "@/lib/mock-data/ai-email";

let draftCounter = 0;
// Component handlers can't call Date.now() under React Compiler's purity rule,
// so IDs are minted from a module-scoped counter here instead.
export function createDraftId() {
  draftCounter += 1;
  return `draft-new-${draftCounter}`;
}

interface AiDraftState {
  drafts: AiSavedDraft[];
  addDraft: (draft: AiSavedDraft) => void;
  updateDraft: (id: string, patch: Partial<AiSavedDraft>) => void;
  setStatus: (id: string, status: AiSavedDraftStatus) => void;
  removeDraft: (id: string) => void;
}

export const useAiDraftStore = create<AiDraftState>()((set) => ({
  drafts: MOCK_AI_DRAFTS,

  addDraft: (draft) => set((s) => ({ drafts: [draft, ...s.drafts] })),

  updateDraft: (id, patch) =>
    set((s) => ({
      drafts: s.drafts.map((d) =>
        d.id === id
          ? { ...d, ...patch, updatedAt: new Date().toISOString() }
          : d
      ),
    })),

  setStatus: (id, status) =>
    set((s) => ({
      drafts: s.drafts.map((d) =>
        d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d
      ),
    })),

  removeDraft: (id) =>
    set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
}));
